import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Usuario, LoginDatos, RegistroDatos } from '../types/auth'
import {
  getCurrentSession,
  clearCurrentSession,
} from '../services/storage'
import {
  loginUsuario,
  registrarUsuario,
  cerrarSesionUsuario,
} from '../services/authApi'

interface AuthContextType {
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (datos: LoginDatos) => Promise<Usuario>
  registrar: (datos: RegistroDatos) => Promise<Usuario>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Al cargar la app, verificar si existe sesión persistida
    const sesion = getCurrentSession()
    if (sesion && sesion.usuario) {
      setUsuario(sesion.usuario)
    }
    setIsLoading(false)
  }, [])

  const login = async (datos: LoginDatos): Promise<Usuario> => {
    const respuesta = await loginUsuario(datos)
    setUsuario(respuesta.usuario)
    return respuesta.usuario
  }

  const registrar = async (datos: RegistroDatos): Promise<Usuario> => {
    const nuevoUsuario = await registrarUsuario(datos)
    return nuevoUsuario
  }

  const logout = () => {
    cerrarSesionUsuario()
    clearCurrentSession()
    setUsuario(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        isLoading,
        login,
        registrar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider')
  }
  return context
}
