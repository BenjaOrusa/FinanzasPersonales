import type {
  Usuario,
  RegistroDatos,
  LoginDatos,
  RespuestaAuth,
  EstadoUsuario,
} from '../types/auth'
import {
  getConfig,
  loadLocalUsers,
  saveLocalUsers,
  saveCurrentSession,
  clearCurrentSession,
  generateLocalId,
} from './storage'
import { apiFetch, API_ENDPOINTS, parseApiError } from './apiClient'

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return {}
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return {}
  }
}

function deriveNamesFromEmail(email: string): { nombre: string; apellido: string } {
  const localPart = (email.split('@')[0] || 'Usuario').replace(/[._-]+/g, ' ').trim()
  const parts = localPart.split(/\s+/).filter(Boolean)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  if (parts.length >= 2) {
    return { nombre: cap(parts[0]), apellido: cap(parts.slice(1).join(' ')) }
  }
  return { nombre: cap(parts[0] || 'Usuario'), apellido: 'Finanzas' }
}

export async function loginUsuario(datos: LoginDatos): Promise<RespuestaAuth> {
  const correoLimpio = datos.correo_electronico.trim().toLowerCase()
  const contraseniaLimpia = datos.contrasenia.trim()

  if (!correoLimpio || !contraseniaLimpia) {
    throw new Error('Por favor, ingresá el correo electrónico y la contraseña.')
  }

  const config = getConfig()

  if (config.mode === 'api') {
    let response: Response
    try {
      response = await apiFetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        body: JSON.stringify({
          Email: correoLimpio,
          Password: contraseniaLimpia,
        }),
      })
    } catch {
      throw new Error(
        'No se pudo conectar con el servidor ASP.NET Core. Verificá que la API esté en línea y que CORS permita el origen actual.'
      )
    }

    if (!response.ok) {
      throw new Error(
        await parseApiError(response, 'Credenciales inválidas. No se pudo iniciar sesión.')
      )
    }

    const data = await response.json()
    const token: string = data.Token || data.token || ''
    if (!token) {
      throw new Error('El servidor no devolvió un token JWT válido.')
    }

    const claims = decodeJwtPayload(token)
    const claimEmail = String(
      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        claims.unique_name ||
        claims.sub ||
        correoLimpio
    )
    const claimRole = String(
      claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        claims.role ||
        'Customer'
    )
    const esAdmin = claimRole.toLowerCase() === 'administrator'
    const fallbackNames = deriveNamesFromEmail(claimEmail)

    let usuario: Usuario = {
      id_usuario: String(data.User?.Id || data.UserId || claimEmail),
      nombre: data.User?.Name || data.Name || fallbackNames.nombre,
      apellido: data.User?.Surname || data.Surname || fallbackNames.apellido,
      correo_electronico: claimEmail,
      estado: (data.User?.Status || 'Activo') as EstadoUsuario,
      id_tipo_usuario: esAdmin ? 2 : 1,
      tipo_descripcion: esAdmin ? 'Administrador' : 'Común',
    }

    // Guardar sesión provisional para autenticar consultas de perfil opcionales
    const resAuth: RespuestaAuth = { token, usuario }
    saveCurrentSession(resAuth)

    // Intentar enriquecer con GET /api/Auth/me si existe, o GET /api/User si es Admin
    try {
      const meRes = await apiFetch(API_ENDPOINTS.auth.me)
      if (meRes.ok) {
        const me = await meRes.json()
        usuario = {
          id_usuario: String(me.Id || usuario.id_usuario),
          nombre: me.Name || usuario.nombre,
          apellido: me.Surname || usuario.apellido,
          correo_electronico: me.Email || usuario.correo_electronico,
          estado: (me.Status || usuario.estado) as EstadoUsuario,
          id_tipo_usuario:
            String(me.Role || claimRole).toLowerCase() === 'administrator' ? 2 : 1,
          tipo_descripcion:
            String(me.Role || claimRole).toLowerCase() === 'administrator'
              ? 'Administrador'
              : 'Común',
        }
      } else if (esAdmin) {
        const usersRes = await apiFetch(API_ENDPOINTS.usuarios.base)
        if (usersRes.ok) {
          const users = (await usersRes.json()) as Array<{
            Id: string
            Email: string
            Name: string
            Surname: string
            Status: EstadoUsuario
          }>
          const found = users.find((u) => u.Email.toLowerCase() === claimEmail.toLowerCase())
          if (found) {
            usuario = {
              ...usuario,
              id_usuario: String(found.Id),
              nombre: found.Name,
              apellido: found.Surname,
              estado: found.Status,
            }
          }
        }
      }
    } catch {
      // Perfil base desde JWT es suficiente para operar
    }

    if (usuario.estado !== 'Activo') {
      clearCurrentSession()
      throw new Error(
        usuario.estado === 'Bloqueado'
          ? 'El acceso no está habilitado (usuario bloqueado).'
          : 'El acceso no está habilitado (usuario inactivo).'
      )
    }

    const finalAuth: RespuestaAuth = { token, usuario }
    saveCurrentSession(finalAuth)
    return finalAuth
  }

  // Modo Local (Demo / Offline)
  const usuarios = loadLocalUsers()
  const usuarioEncontrado = usuarios.find(
    (u) => u.correo_electronico.toLowerCase() === correoLimpio
  )

  if (!usuarioEncontrado || usuarioEncontrado.contrasenia !== contraseniaLimpia) {
    throw new Error('Credenciales inválidas. No se pudo iniciar sesión.')
  }

  if (usuarioEncontrado.estado === 'Inactivo') {
    throw new Error('El acceso no está habilitado (usuario inactivo).')
  }

  if (usuarioEncontrado.estado === 'Bloqueado') {
    throw new Error('El acceso no está habilitado (usuario bloqueado).')
  }

  const { contrasenia: _, ...usuarioSinContrasenia } = usuarioEncontrado
  const respuesta: RespuestaAuth = {
    token: `local-token-${usuarioEncontrado.id_usuario}-${Date.now()}`,
    usuario: usuarioSinContrasenia,
  }

  saveCurrentSession(respuesta)
  return respuesta
}

export async function registrarUsuario(datos: RegistroDatos): Promise<Usuario> {
  const nombre = datos.nombre.trim()
  const apellido = datos.apellido.trim()
  const correo = datos.correo_electronico.trim().toLowerCase()
  const contrasenia = datos.contrasenia.trim()

  if (!nombre) throw new Error('El nombre es obligatorio.')
  if (!apellido) throw new Error('El apellido es obligatorio.')
  if (!correo) throw new Error('El correo electrónico es obligatorio.')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(correo)) {
    throw new Error('El formato del correo electrónico es inválido.')
  }
  if (!contrasenia || contrasenia.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.')
  }

  const config = getConfig()

  if (config.mode === 'api') {
    let response: Response
    try {
      response = await apiFetch(API_ENDPOINTS.auth.registro, {
        method: 'POST',
        body: JSON.stringify({
          Email: correo,
          Password: contrasenia,
          Name: nombre,
          Surname: apellido,
        }),
      })
    } catch {
      throw new Error(
        'No se pudo conectar con el servidor ASP.NET Core para completar el registro.'
      )
    }

    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudo registrar el usuario'))
    }

    // El backend devuelve texto plano "Usuario registrado correctamente." o un JSON opcional
    const raw = await response.text()
    try {
      const data = JSON.parse(raw)
      return {
        id_usuario: String(data.Id || data.id_usuario || correo),
        nombre: data.Name || data.nombre || nombre,
        apellido: data.Surname || data.apellido || apellido,
        correo_electronico: data.Email || data.correo_electronico || correo,
        estado: 'Activo',
        id_tipo_usuario: 1,
        tipo_descripcion: 'Común',
      }
    } catch {
      return {
        id_usuario: correo,
        nombre,
        apellido,
        correo_electronico: correo,
        estado: 'Activo',
        id_tipo_usuario: 1,
        tipo_descripcion: 'Común',
      }
    }
  }

  const usuarios = loadLocalUsers()
  const existe = usuarios.some((u) => u.correo_electronico.toLowerCase() === correo)
  if (existe) {
    throw new Error('El correo electrónico ya está registrado.')
  }

  const nuevoId = generateLocalId(usuarios.map((u) => u.id_usuario))
  const nuevoUsuario: Usuario = {
    id_usuario: nuevoId,
    nombre,
    apellido,
    correo_electronico: correo,
    contrasenia,
    estado: 'Activo' as EstadoUsuario,
    id_tipo_usuario: 1,
    tipo_descripcion: 'Común',
  }

  usuarios.push(nuevoUsuario)
  saveLocalUsers(usuarios)

  const { contrasenia: _, ...usuarioCreado } = nuevoUsuario
  return usuarioCreado
}

export function cerrarSesionUsuario(): void {
  const config = getConfig()
  if (config.mode === 'api') {
    apiFetch(API_ENDPOINTS.auth.logout, { method: 'POST' }).catch(() => {
      // Logout del lado cliente continúa aunque el endpoint opcional no exista
    })
  }
  clearCurrentSession()
}
