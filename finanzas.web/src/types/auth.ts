export type EstadoUsuario = 'Activo' | 'Inactivo' | 'Bloqueado'
export type TipoUsuarioDescripcion = 'Común' | 'Administrador'

export interface TipoUsuario {
  id_tipo_usuario: number
  descripcion: TipoUsuarioDescripcion
}

export interface Usuario {
  id_usuario: string
  nombre: string
  apellido: string
  correo_electronico: string
  contrasenia?: string // Hash en backend / protegido
  estado: EstadoUsuario
  id_tipo_usuario: number // 1 = Customer/Común, 2 = Administrator/Administrador
  tipo_descripcion?: TipoUsuarioDescripcion
}

export interface RegistroDatos {
  nombre: string
  apellido: string
  correo_electronico: string
  contrasenia: string
}

export interface LoginDatos {
  correo_electronico: string
  contrasenia: string
}

export interface RespuestaAuth {
  token: string
  usuario: Usuario
}
