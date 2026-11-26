import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn, UserPlus, Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Por favor completá el correo electrónico y la contraseña.')
      return
    }

    try {
      setIsSubmitting(true)
      // CU02: Iniciar sesión
      await login({
        correo_electronico: email.trim(),
        contrasenia: password.trim(),
      })
      navigate('/')
    } catch (err) {
      // Maneja alternativas 4.a (Credenciales inválidas) y 4.b (Inactivo o Bloqueado)
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleFillCredentials(testEmail: string, testPass: string) {
    setEmail(testEmail)
    setPassword(testPass)
    setError(null)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <span className="brand-mark" aria-hidden="true">
              FP
            </span>
            <div>
              <h2>Sistema de Finanzas Personales</h2>
              <p>Tecnicatura Universitaria en Programación - TIF 2026</p>
            </div>
          </div>
          <h1>Iniciar sesión (CU02)</h1>
          <p className="auth-subtitle">
            Ingresá tus credenciales para acceder a tus cuentas y movimientos.
          </p>
        </div>

        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <strong>Error de autenticación:</strong>
              <p style={{ margin: '4px 0 0 0' }}>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="login-password">
                Contraseña <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Tu contraseña protegida"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="primary-button auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Verificando credenciales...'
            ) : (
              <>
                <LogIn size={18} /> Iniciar sesión
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tenés una cuenta de usuario?{' '}
            <Link to="/registro" className="auth-link">
              <UserPlus size={16} /> Registrarse en el sistema (CU01)
            </Link>
          </p>
        </div>

        {/* Panel para evaluación y pruebas de casos de uso */}
        <div className="test-accounts-panel">
          <div className="test-accounts-header">
            <ShieldCheck size={16} />
            <span>Accesos rápidos de prueba (TIF Casos de Uso):</span>
          </div>
          <div className="test-buttons-grid">
            <button
              type="button"
              className="test-account-badge"
              onClick={() => handleFillCredentials('matias.soria@email.com', 'Matias123!')}
              title="Usuario común activo con movimientos cargados"
            >
              <strong>Matías Soria</strong>
              <span>Común · Activo</span>
            </button>
            <button
              type="button"
              className="test-account-badge"
              onClick={() => handleFillCredentials('benjamin.orusa@email.com', 'Benjamin123!')}
              title="Usuario común activo"
            >
              <strong>Benjamín Orusa</strong>
              <span>Común · Activo</span>
            </button>
            <button
              type="button"
              className="test-account-badge test-account-badge--admin"
              onClick={() => handleFillCredentials('admin@email.com', 'Admin123')}
              title="Usuario Administrador con permisos especiales"
            >
              <strong>Administrador</strong>
              <span>Admin · Activo</span>
            </button>
            <button
              type="button"
              className="test-account-badge test-account-badge--warning"
              onClick={() => handleFillCredentials('inactivo@email.com', 'Inactivo123!')}
              title="Probar Caso Alternativo 4.b: Usuario Inactivo"
            >
              <strong>Prueba Inactivo</strong>
              <span>CU02 4.b</span>
            </button>
            <button
              type="button"
              className="test-account-badge test-account-badge--danger"
              onClick={() => handleFillCredentials('bloqueado@email.com', 'Bloqueado123!')}
              title="Probar Caso Alternativo 4.b: Usuario Bloqueado"
            >
              <strong>Prueba Bloqueado</strong>
              <span>CU02 4.b</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
