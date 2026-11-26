import type { Usuario, EstadoUsuario } from '../types/auth'
import {
  getConfig,
  loadLocalUsers,
  updateLocalUserStatus,
} from './storage'
import { apiFetch, API_ENDPOINTS, parseApiError } from './apiClient'

interface UsuarioApiRespuesta {
  Id: string
  Email: string
  Name: string
  Surname: string
  Status: EstadoUsuario
  Role: string // 'Administrator' | 'Customer'
}

function adaptarUsuario(item: UsuarioApiRespuesta): Usuario {
  const esAdmin = (item.Role || '').toLowerCase() === 'administrator'
  return {
    id_usuario: String(item.Id),
    nombre: item.Name,
    apellido: item.Surname,
    correo_electronico: item.Email,
    estado: item.Status,
    id_tipo_usuario: esAdmin ? 2 : 1,
    tipo_descripcion: esAdmin ? 'Administrador' : 'Común',
  }
}

// CU17: Consultar el listado de usuarios del sistema
export async function obtenerUsuariosSistema(signal?: AbortSignal): Promise<Usuario[]> {
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.usuarios.base, {
      signal,
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(
        await parseApiError(response, 'No se pudo obtener el listado de usuarios del sistema')
      )
    }
    const data = (await response.json()) as UsuarioApiRespuesta[]
    return data.map(adaptarUsuario)
  }

  return getLocalUsersSafe()
}

function getLocalUsersSafe(): Usuario[] {
  const users = loadLocalUsers()
  return users.map(({ contrasenia: _, ...u }) => u)
}

// CU18: Activar, desactivar o bloquear un usuario
export async function cambiarEstadoUsuario(
  id_usuario: string,
  nuevoEstado: EstadoUsuario,
  currentUser?: Usuario
): Promise<Usuario> {
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.usuarios.estado(id_usuario), {
      method: 'PATCH',
      body: JSON.stringify({ Status: nuevoEstado }),
    })
    if (!response.ok) {
      throw new Error(
        await parseApiError(response, 'No se pudo actualizar el estado del usuario')
      )
    }
    if (response.status === 204) {
      return currentUser
        ? { ...currentUser, estado: nuevoEstado }
        : {
            id_usuario,
            nombre: '',
            apellido: '',
            correo_electronico: '',
            estado: nuevoEstado,
            id_tipo_usuario: 1,
            tipo_descripcion: 'Común',
          }
    }
    const data = (await response.json()) as UsuarioApiRespuesta
    return adaptarUsuario(data)
  }

  return updateLocalUserStatus(id_usuario, nuevoEstado)
}
