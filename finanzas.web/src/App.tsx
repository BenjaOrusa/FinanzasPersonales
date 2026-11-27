import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SummaryPage from './pages/SummaryPage'
import AccountsPage from './pages/AccountsPage'
import CategoriesPage from './pages/CategoriesPage'
import MovementFormPage from './pages/MovementFormPage'
import MovementsPage from './pages/MovementsPage'
import UsersAdminPage from './pages/UsersAdminPage'
import AdminAnalyticsPage from './pages/AdminAnalyticsPage'
import AdminCotizacionesPage from './pages/AdminCotizacionesPage'
import type { Account, Category, Movement } from './types/finance'
import {
  actualizarMovimiento,
  crearMovimiento,
  eliminarMovimiento,
  obtenerMovimientos,
  type GuardarMovimiento,
} from './services/movementsApi'
import {
  crearCategoria,
  actualizarCategoria,
  cambiarEstadoCategoria,
  eliminarCategoria,
  obtenerCategorias,
} from './services/categoriesApi'
import {
  crearCuenta,
  actualizarCuenta,
  cambiarEstadoCuenta,
  eliminarCuenta,
  obtenerCuentas,
} from './services/accountsApi'
import {
  obtenerMonedas,
  MONEDAS,
  type Moneda,
} from './services/currencyApi'
import { getConfig, saveConfig, resetToDemoData } from './services/storage'
import { testConnection } from './services/apiClient'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Landmark,
  Settings as SettingsIcon,
  RotateCcw,
  CheckCircle,
  Database,
  Radio,
  X,
  LogOut,
  Shield,
  UserCheck,
  Users,
  BarChart3,
  DollarSign,
} from 'lucide-react'
import './App.css'

export default function App() {
  const { usuario, isAuthenticated, isLoading: authLoading, logout } = useAuth()

  const [movements, setMovements] = useState<Movement[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currencies, setCurrencies] = useState<Moneda[]>(MONEDAS)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [configState, setConfigState] = useState(getConfig())
  const [testApiStatus, setTestApiStatus] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && usuario) {
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, usuario?.id_usuario, usuario?.id_tipo_usuario])

  async function loadData() {
    if (!usuario) return
    try {
      setIsLoading(true)
      setLoadError(null)

      const loadedCurrencies = await obtenerMonedas().catch(() => MONEDAS)
      setCurrencies(loadedCurrencies)

      // El Administrador no consulta cuentas, categorías ni movimientos personales (regla TIF)
      if (usuario.id_tipo_usuario === 2) {
        setMovements([])
        setCategories([])
        setAccounts([])
        return
      }

      const currentUserId = usuario.id_usuario
      const [apiMovements, apiCategories, apiAccounts] = await Promise.all([
        obtenerMovimientos(undefined, currentUserId),
        obtenerCategorias(undefined, currentUserId),
        obtenerCuentas(undefined, currentUserId),
      ])
      setMovements(apiMovements)
      setCategories(apiCategories)
      setAccounts(apiAccounts)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setLoadError(error instanceof Error ? error.message : 'No fue posible cargar los datos.')
    } finally {
      setIsLoading(false)
    }
  }

  function showNotification(message: string, type: 'info' | 'success' | 'error' = 'info') {
    setNotice({ message, type })
    setTimeout(() => {
      setNotice(null)
    }, 4500)
  }

  async function saveMovement(movement: GuardarMovimiento, id?: string) {
    const categoryName = categories.find((c) => c.id === movement.categoryId)?.name
    const accountName = accounts.find((a) => a.id === movement.accountId)?.name
    const currentUserId = usuario?.id_usuario || '1'
    const movementWithUser: GuardarMovimiento = {
      ...movement,
      id_usuario: currentUserId,
    }
    const saved = id
      ? await actualizarMovimiento(id, movementWithUser, categoryName, accountName)
      : await crearMovimiento(movementWithUser, categoryName, accountName)

    setMovements((current) =>
      id ? current.map((item) => (item.id === id ? saved : item)) : [saved, ...current]
    )
    if (usuario?.id_usuario) {
      // Refrescar cuentas para reflejar el saldo recalculado por el backend
      obtenerCuentas(undefined, usuario.id_usuario).then(setAccounts).catch(() => {})
    }
    showNotification(
      id ? 'Movimiento actualizado correctamente' : 'Movimiento registrado correctamente',
      'success'
    )
  }

  async function addCategory(category: Omit<Category, 'id' | 'id_usuario'>) {
    if (
      categories.some(
        (item) => item.type === category.type && item.name.toLowerCase() === category.name.toLowerCase()
      )
    ) {
      showNotification('Ya existe una categoría con ese nombre y tipo.', 'error')
      throw new Error('Ya existe una categoría con ese nombre y tipo.')
    }
    const currentUserId = usuario?.id_usuario || '1'
    const saved = await crearCategoria({ ...category, id_usuario: currentUserId })
    setCategories((items) => [...items, saved].sort((a, b) => a.name.localeCompare(b.name)))
    showNotification(`Categoría "${saved.name}" agregada con éxito`, 'success')
  }

  async function deleteCategory(id: string) {
    const category = categories.find((item) => item.id === id)
    if (!category) return
    if (movements.some((item) => item.categoryId === id || item.category === category.name)) {
      showNotification('La categoría tiene movimientos asociados y no puede eliminarse físicamente. Use baja lógica.', 'error')
      throw new Error('La categoría tiene movimientos asociados y no puede eliminarse físicamente. Use baja lógica.')
    }
    await eliminarCategoria(id)
    setCategories((items) => items.filter((item) => item.id !== id))
    showNotification(`Categoría "${category.name}" eliminada`, 'success')
  }

  async function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'id_usuario'>>) {
    const existing = categories.find((c) => c.id === id)
    const updated = await actualizarCategoria(id, data, existing)
    setCategories((items) => items.map((c) => (c.id === id ? updated : c)))
    if (usuario?.id_usuario) {
      const apiMovements = await obtenerMovimientos(undefined, usuario.id_usuario)
      setMovements(apiMovements)
    }
    showNotification(`Categoría "${updated.name}" actualizada con éxito (CU09)`, 'success')
  }

  async function toggleCategoryStatus(id: string, activa: boolean) {
    const existing = categories.find((c) => c.id === id)
    const updated = await cambiarEstadoCategoria(id, activa, existing)
    setCategories((items) => items.map((c) => (c.id === id ? updated : c)))
    showNotification(
      activa
        ? `Categoría "${updated.name}" reactivada.`
        : `Categoría "${updated.name}" desactivada (baja lógica CU10).`,
      'info'
    )
  }

  async function addAccount(account: Omit<Account, 'id' | 'id_usuario'>) {
    if (accounts.some((item) => item.name.toLowerCase() === account.name.toLowerCase())) {
      showNotification('Ya existe una cuenta con ese nombre.', 'error')
      throw new Error('Ya existe una cuenta con ese nombre.')
    }
    const currentUserId = usuario?.id_usuario || '1'
    const saved = await crearCuenta({ ...account, id_usuario: currentUserId })
    setAccounts((items) => [...items, saved].sort((a, b) => a.name.localeCompare(b.name)))
    showNotification(`Cuenta "${saved.name}" creada`, 'success')
  }

  async function deleteAccount(id: string) {
    const account = accounts.find((item) => item.id === id)
    if (!account) return
    if (movements.some((item) => item.accountId === id || item.account === account.name)) {
      showNotification('La cuenta tiene movimientos asociados y no puede eliminarse.', 'error')
      throw new Error('La cuenta tiene movimientos asociados y no puede eliminarse.')
    }
    await eliminarCuenta(id)
    setAccounts((items) => items.filter((item) => item.id !== id))
    showNotification(`Cuenta "${account.name}" eliminada`, 'success')
  }

  async function updateAccount(id: string, data: Partial<Omit<Account, 'id' | 'id_usuario'>>) {
    const updated = await actualizarCuenta(id, data)
    setAccounts((items) => items.map((a) => (a.id === id ? updated : a)))
    if (usuario?.id_usuario) {
      const apiMovements = await obtenerMovimientos(undefined, usuario.id_usuario)
      setMovements(apiMovements)
    }
    showNotification(`Cuenta "${updated.name}" actualizada con éxito (CU05)`, 'success')
  }

  async function toggleAccountStatus(id: string, activa: boolean) {
    const existing = accounts.find((a) => a.id === id)
    const updated = await cambiarEstadoCuenta(id, activa, existing)
    setAccounts((items) => items.map((a) => (a.id === id ? updated : a)))
    showNotification(
      activa
        ? `Cuenta "${updated.name}" reactivada.`
        : `Cuenta "${updated.name}" desactivada (baja lógica CU06).`,
      'info'
    )
  }

  async function deleteMovement(id: string) {
    await eliminarMovimiento(id)
    setMovements((items) => items.filter((item) => item.id !== id))
    if (usuario?.id_usuario) {
      obtenerCuentas(undefined, usuario.id_usuario).then(setAccounts).catch(() => {})
    }
    showNotification('Movimiento eliminado correctamente', 'success')
  }

  // CU03: Cerrar sesión
  function handleLogout() {
    logout()
    showNotification('Sesión finalizada con éxito (CU03).', 'info')
  }

  async function handleTestApi() {
    setTestApiStatus('Probando conexión con ' + configState.apiUrl + '...')
    const result = await testConnection(configState.apiUrl)
    if (result.ok) {
      setTestApiStatus(`✅ ${result.message}`)
    } else {
      setTestApiStatus(`⚠️ ${result.message}`)
    }
  }

  function handleSaveSettings() {
    const prevMode = getConfig().mode
    saveConfig(configState)
    setShowSettings(false)
    if (prevMode !== configState.mode && isAuthenticated) {
      logout()
      showNotification(
        `Modo cambiado a ${configState.mode === 'api' ? 'API ASP.NET Core' : 'Almacenamiento Local'}. Iniciá sesión en el nuevo entorno.`,
        'info'
      )
      return
    }
    showNotification('Configuración guardada. Recargando datos...', 'info')
    if (isAuthenticated) loadData()
  }

  function handleResetDemo() {
    resetToDemoData()
    showNotification('Datos de demostración restablecidos.', 'success')
    setShowSettings(false)
    if (isAuthenticated) loadData()
  }

  if (authLoading) {
    return (
      <div className="auth-container">
        <div style={{ color: '#ffffff', textAlign: 'center' }}>
          <div className="brand-mark" style={{ margin: '0 auto 16px' }}>
            FP
          </div>
          <p>Cargando sistema de finanzas personales...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, solo permite /login y /registro
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const userInitials = usuario
    ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase()
    : 'FP'

  const esAdmin = usuario?.id_tipo_usuario === 2

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            FP
          </span>
          <div>
            <div style={{ lineHeight: 1.2 }}>Finanzas</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
              Personales
            </div>
          </div>
        </div>

        <nav className="main-navigation" aria-label="Navegación principal">
          {esAdmin ? (
            <div className="admin-nav-group" style={{ marginTop: 0 }}>
              <span className="admin-nav-heading" style={{ paddingTop: 0 }}>
                Módulo de Administración (Exclusivo)
              </span>
              <NavLink
                className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`}
                to="/usuarios"
              >
                <Users size={18} />
                <span>Usuarios (CU17·18)</span>
              </NavLink>
              <NavLink
                className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`}
                to="/admin/graficos"
              >
                <BarChart3 size={18} />
                <span>Consumos y Gráficos</span>
              </NavLink>
              <NavLink
                className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`}
                to="/admin/cotizaciones"
              >
                <DollarSign size={18} />
                <span>Supervisión Cotizaciones (CU19)</span>
              </NavLink>
            </div>
          ) : (
            <>
              <NavLink
                className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`}
                to="/"
                end
              >
                <LayoutDashboard size={18} />
                <span>Resumen</span>
              </NavLink>
              <NavLink
                className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`}
                to="/movimientos"
              >
                <ArrowLeftRight size={18} />
                <span>Movimientos</span>
              </NavLink>
              <NavLink
                className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`}
                to="/categorias"
              >
                <Tags size={18} />
                <span>Categorías</span>
              </NavLink>
              <NavLink
                className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`}
                to="/cuentas"
              >
                <Landmark size={18} />
                <span>Cuentas</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          {/* Información del usuario integrada de forma nativa al diseño del sidebar */}
          {usuario && (
            <div className="sidebar-user-section">
              <div className="sidebar-user-main">
                <div className="sidebar-user-avatar" title={`Usuario ID: ${usuario.id_usuario}`}>
                  {userInitials}
                </div>
                <div className="sidebar-user-details">
                  <div className="sidebar-user-name">
                    {usuario.nombre} {usuario.apellido}
                  </div>
                  <div className="sidebar-user-sub">
                    <span
                      className={`sidebar-user-role-dot ${
                        esAdmin ? 'sidebar-user-role-dot--admin' : 'sidebar-user-role-dot--comun'
                      }`}
                    />
                    <span className="sidebar-user-role-text">
                      {esAdmin ? 'Administrador' : 'Usuario Común'}
                    </span>
                  </div>
                  <div className="sidebar-user-email" title={usuario.correo_electronico}>
                    {usuario.correo_electronico}
                  </div>
                </div>
                <button
                  type="button"
                  className="sidebar-logout-icon-btn"
                  onClick={handleLogout}
                  title="Cerrar la sesión actual (CU03)"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="mode-badge" title="Almacenamiento activo">
            <span
              className={`mode-dot ${configState.mode === 'api' ? 'mode-dot--api' : 'mode-dot--local'}`}
            />
            <span>
              {configState.mode === 'api' ? 'API ASP.NET Core' : 'Almacenamiento Local'}
            </span>
          </div>
          <button
            type="button"
            className="settings-button"
            onClick={() => setShowSettings(true)}
          >
            <SettingsIcon size={16} /> Configurar Datos / API
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* Barra superior de usuario (Header moderno con avatar arriba a la derecha) */}
        <div className="top-app-header">
          <div className="top-app-greeting">
            <span className="greeting-pill">
              {esAdmin ? 'Panel de Control Administrativo' : 'Espacio Personal de Finanzas'}
            </span>
          </div>

          {usuario && (
            <div className="top-user-pill">
              <div className="top-user-avatar" title={`ID: ${usuario.id_usuario}`}>
                {userInitials}
              </div>
              <div className="top-user-info">
                <strong>{usuario.nombre} {usuario.apellido}</strong>
                <span>{esAdmin ? 'Administrador' : 'Usuario Común'}</span>
              </div>
              <button
                type="button"
                className="top-logout-btn"
                onClick={handleLogout}
                title="Cerrar sesión (CU03)"
              >
                <LogOut size={15} />
                <span>Salir</span>
              </button>
            </div>
          )}
        </div>
        {notice && (
          <div
            className={`connection-status ${
              notice.type === 'error'
                ? 'connection-status--error'
                : notice.type === 'success'
                ? 'connection-status'
                : 'connection-status'
            }`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              background:
                notice.type === 'success'
                  ? '#dcfce7'
                  : notice.type === 'error'
                  ? '#fee2e2'
                  : '#dbeafe',
              color:
                notice.type === 'success'
                  ? '#166534'
                  : notice.type === 'error'
                  ? '#991b1b'
                  : '#1e40af',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {notice.type === 'success' && <CheckCircle size={18} />}
              {notice.message}
            </span>
            <button
              onClick={() => setNotice(null)}
              style={{
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {isLoading && (
          <p className="connection-status" role="status">
            Cargando datos...
          </p>
        )}
        {loadError && (
          <p className="connection-status connection-status--error" role="alert">
            {loadError}
          </p>
        )}

        <Routes>
          <Route
            path="/"
            element={
              esAdmin ? (
                <Navigate to="/usuarios" replace />
              ) : (
                <SummaryPage movements={movements} />
              )
            }
          />
          <Route
            path="/movimientos"
            element={
              !esAdmin ? (
                <MovementsPage movements={movements} onDelete={deleteMovement} />
              ) : (
                <Navigate to="/usuarios" replace />
              )
            }
          />
          <Route
            path="/movimientos/nuevo"
            element={
              !esAdmin ? (
                <MovementFormPage
                  movements={movements}
                  categories={categories}
                  accounts={accounts}
                  onSave={saveMovement}
                />
              ) : (
                <Navigate to="/usuarios" replace />
              )
            }
          />
          <Route
            path="/movimientos/:id/editar"
            element={
              !esAdmin ? (
                <MovementFormPage
                  movements={movements}
                  categories={categories}
                  accounts={accounts}
                  onSave={saveMovement}
                />
              ) : (
                <Navigate to="/usuarios" replace />
              )
            }
          />
          <Route
            path="/categorias"
            element={
              !esAdmin ? (
                <CategoriesPage
                  categories={categories}
                  movements={movements}
                  onAdd={addCategory}
                  onUpdate={updateCategory}
                  onToggleStatus={toggleCategoryStatus}
                  onDelete={deleteCategory}
                />
              ) : (
                <Navigate to="/usuarios" replace />
              )
            }
          />
          <Route
            path="/cuentas"
            element={
              !esAdmin ? (
                <AccountsPage
                  accounts={accounts}
                  movements={movements}
                  currencies={currencies}
                  onAdd={addAccount}
                  onUpdate={updateAccount}
                  onToggleStatus={toggleAccountStatus}
                  onDelete={deleteAccount}
                />
              ) : (
                <Navigate to="/usuarios" replace />
              )
            }
          />
          <Route
            path="/usuarios"
            element={esAdmin ? <UsersAdminPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin/graficos"
            element={esAdmin ? <AdminAnalyticsPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin/cotizaciones"
            element={esAdmin ? <AdminCotizacionesPage /> : <Navigate to="/" replace />}
          />
          <Route path="/login" element={<Navigate to={esAdmin ? '/usuarios' : '/'} replace />} />
          <Route path="/registro" element={<Navigate to={esAdmin ? '/usuarios' : '/'} replace />} />
          <Route
            path="*"
            element={
              <div className="empty-state">
                <h1>Página no encontrada</h1>
                <NavLink
                  className="primary-button"
                  to={esAdmin ? '/usuarios' : '/'}
                  style={{ display: 'inline-block', marginTop: 16 }}
                >
                  {esAdmin ? 'Ir a Usuarios' : 'Volver al resumen'}
                </NavLink>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div
            className="modal-dialog"
            style={{
              maxWidth: 560,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100dvh - 32px)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                flexShrink: 0,
              }}
            >
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={20} /> Origen de Datos y Configuración
              </h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Cerrar configuración"
                style={{
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748b',
                  flexShrink: 0,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                minHeight: 0,
                paddingRight: 4,
              }}
            >
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0, marginBottom: 16 }}>
                Esta aplicación implementa los casos de uso del Trabajo Integrador Final (TIF).
                Puede operar con almacenamiento local en el navegador o conectarse a tu backend en
                ASP.NET Core.
              </p>

              <div style={{ display: 'grid', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
                    Modo de operación:
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setConfigState({ ...configState, mode: 'local' })}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border:
                          configState.mode === 'local'
                            ? '2px solid #2563eb'
                            : '1px solid #cbd5e1',
                        background: configState.mode === 'local' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <strong style={{ display: 'block', color: '#0f172a' }}>
                        ⚡ Modo Local (Recomendado)
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Datos y usuarios persistentes en navegador. No requiere backend externo.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfigState({ ...configState, mode: 'api' })}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        border:
                          configState.mode === 'api'
                            ? '2px solid #2563eb'
                            : '1px solid #cbd5e1',
                        background: configState.mode === 'api' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <strong style={{ display: 'block', color: '#0f172a' }}>
                        🔌 API ASP.NET Core
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Conecta a tus controladores .NET (/api/Auth, /api/Account, /api/Movement, etc.).
                      </span>
                    </button>
                  </div>
                </div>

                {configState.mode === 'api' && (
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: 14,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <label
                      style={{
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: 6,
                        fontSize: '0.875rem',
                      }}
                    >
                      URL base de la API ASP.NET Core (Local o Azure):
                    </label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        style={{ flex: '1 1 220px', minWidth: 0 }}
                        value={configState.apiUrl}
                        onChange={(e) =>
                          setConfigState({ ...configState, apiUrl: e.target.value })
                        }
                        placeholder="https://mi-backend.azurewebsites.net/api o https://localhost:7097/api"
                      />
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={handleTestApi}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                      >
                        <Radio size={16} /> Probar Conexión
                      </button>
                    </div>
                    {testApiStatus && (
                      <div style={{ marginTop: 8, fontSize: '0.825rem', color: '#475569', wordBreak: 'break-word' }}>
                        {testApiStatus}
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: 10,
                        padding: 10,
                        background: '#f1f5f9',
                        borderRadius: 6,
                        fontSize: '0.785rem',
                        color: '#475569',
                        lineHeight: 1.45,
                      }}
                    >
                      💡 <strong>Conexión centralizada:</strong> Todos los endpoints (<code>/Auth</code>, <code>/Account</code>, <code>/Category</code>, <code>/Movement/filter</code>, <code>/FinancialSummary</code>, <code>/ExchangeRate</code>, <code>/User</code>) se concatenan automáticamente a esta URL base mediante <code>apiClient.ts</code>, inyectando el token JWT Bearer.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: 14,
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={handleResetDemo}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <RotateCcw size={14} /> Restaurar datos y usuarios de ejemplo
              </button>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowSettings(false)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSaveSettings}
                >
                  Guardar y Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
