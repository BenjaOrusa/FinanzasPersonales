import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus, User, Mail, Lock, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { registrar } = useAuth()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Camino alternativo 4.a: Validación de campos incompletos o inválidos
    if (!nombre.trim()) {
      setError('Por favor, ingresá tu nombre.')
      return
    }
    if (!apellido.trim()) {
      setError('Por favor, ingresá tu apellido.')
      return
    }
    if (!correo.trim()) {
      setError('Por favor, ingresá tu correo electrónico.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(correo.trim())) {
      setError('El formato del correo electrónico es inválido (ejemplo: usuario@correo.com).')
      return
    }

    if (!contrasenia.trim() || contrasenia.trim().length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.')
      return
    }

    if (contrasenia !== confirmarContrasenia) {
      setError('Las contraseñas ingresadas no coinciden. Por favor, verificalas.')
      return
    }

    try {
      setIsSubmitting(true)
      // CU01: Registrarse en el sistema
      const nuevoUsuario = await registrar({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo_electronico: correo.trim().toLowerCase(),
        contrasenia: contrasenia.trim(),
      })

      // Camino básico paso 5: Informa que el registro se completó con éxito
      setSuccessMessage(
        `¡Registro completado con éxito! Se ha creado la cuenta para ${nuevoUsuario.nombre} ${nuevoUsuario.apellido} con estado Activo y tipo Común.`
      )

      // Redirigir al login luego de una breve pausa para que lea la confirmación
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err) {
      // Maneja alternativa 4.b: Correo ya registrado u otros errores
      setError(err instanceof Error ? err.message : 'No se pudo completar el registro.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Camino alternativo 3.a: El visitante cancela el registro
  function handleCancel() {
    navigate('/login')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <button
            type="button"
            className="auth-back-btn"
            onClick={handleCancel}
            title="Cancelar y volver"
          >
            <ArrowLeft size={16} /> Volver al inicio de sesión
          </button>
          <div className="auth-brand" style={{ marginTop: 12 }}>
            <span className="brand-mark" aria-hidden="true">
              FP
            </span>
            <div>
              <h2>Sistema de Finanzas Personales</h2>
              <p>Tecnicatura Universitaria en Programación - TIF 2026</p>
            </div>
          </div>
          <h1>Registrarse en el sistema (CU01)</h1>
          <p className="auth-subtitle">
            Creá tu cuenta de usuario para gestionar tus cuentas, categorías y movimientos.
          </p>
        </div>

        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <strong>No se pudo completar el registro (CU01 4.a / 4.b):</strong>
              <p style={{ margin: '4px 0 0 0' }}>{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert auth-alert--success" role="status">
            <CheckCircle size={20} className="shrink-0" />
            <div>
              <strong>Registro exitoso (CU01 Paso 5):</strong>
              <p style={{ margin: '4px 0 0 0' }}>{successMessage}</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                Redirigiendo a la pantalla de inicio de sesión...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-nombre">
                Nombre <span className="text-red-500">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="reg-nombre"
                  type="text"
                  required
                  placeholder="Ej.: Juan"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isSubmitting || !!successMessage}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-apellido">
                Apellido <span className="text-red-500">*</span>
              </label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="reg-apellido"
                  type="text"
                  required
                  placeholder="Ej.: Pérez"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  disabled={isSubmitting || !!successMessage}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                placeholder="juan.perez@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={isSubmitting || !!successMessage}
              />
            </div>
            <span className="field-hint">
              Regla de negocio: El correo debe ser único en el sistema.
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-pass">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="reg-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={contrasenia}
                  onChange={(e) => setContrasenia(e.target.value)}
                  disabled={isSubmitting || !!successMessage}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm-pass">
                Confirmar contraseña <span className="text-red-500">*</span>
              </label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="reg-confirm-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repetí tu contraseña"
                  value={confirmarContrasenia}
                  onChange={(e) => setConfirmarContrasenia(e.target.value)}
                  disabled={isSubmitting || !!successMessage}
                />
              </div>
            </div>
          </div>

          <div className="auth-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar (CU01 3.a)
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting || !!successMessage}
            >
              {isSubmitting ? (
                'Registrando usuario...'
              ) : (
                <>
                  <UserPlus size={18} /> Registrarse (CU01)
                </>
              )}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tenés una cuenta registrada?{' '}
            <Link to="/login" className="auth-link">
              Iniciar sesión (CU02)
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
