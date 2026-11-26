import { useEffect, useState } from 'react'
import type { Usuario, EstadoUsuario } from '../types/auth'
import { obtenerUsuariosSistema, cambiarEstadoUsuario } from '../services/adminApi'
import {
  Users,
  ShieldAlert,
  UserCheck,
  UserX,
  Lock,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react'

export default function UsersAdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoUsuario | 'todos'>('todos')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // Estado para el modal de confirmación de CU18
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [nuevoEstadoPropuesto, setNuevoEstadoPropuesto] = useState<EstadoUsuario | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    cargarUsuarios(false, controller.signal)
    return () => controller.abort()
  }, [])

  async function cargarUsuarios(manual = false, signal?: AbortSignal) {
    try {
      if (manual) {
        setIsRefreshing(true)
        setMensajeExito(null)
      } else {
        setIsLoading(true)
      }
      setError(null)
      // CU17: Consultar el listado de usuarios del sistema
      const listado = await obtenerUsuariosSistema(signal)
      setUsuarios(listado)
      if (manual) {
        setMensajeExito(
          `Listado actualizado: ${listado.length} ${listado.length === 1 ? 'usuario registrado' : 'usuarios registrados'}.`
        )
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado de usuarios.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  function handleSolicitarCambio(user: Usuario, targetEstado: EstadoUsuario) {
    setError(null)
    setMensajeExito(null)

    // Camino alternativo 4.a: El usuario ya tiene el estado solicitado
    if (user.estado === targetEstado) {
      setError(`El usuario ${user.nombre} ${user.apellido} ya se encuentra con estado "${targetEstado}". No es necesario realizar cambios.`)
      return
    }

    setUsuarioSeleccionado(user)
    setNuevoEstadoPropuesto(targetEstado)
  }

  // Paso 5 / 6 de CU18: Confirmar y cambiar estado
  async function handleConfirmarCambio() {
    if (!usuarioSeleccionado || !nuevoEstadoPropuesto) return

    try {
      setIsUpdating(true)
      setError(null)
      // CU18: Activar, desactivar o bloquear un usuario
      const usuarioActualizado = await cambiarEstadoUsuario(
        usuarioSeleccionado.id_usuario,
        nuevoEstadoPropuesto,
        usuarioSeleccionado
      )

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === usuarioActualizado.id_usuario ? usuarioActualizado : u
        )
      )

      setMensajeExito(
        `Estado del usuario ${usuarioActualizado.nombre} ${usuarioActualizado.apellido} actualizado a "${nuevoEstadoPropuesto}".`
      )
      setUsuarioSeleccionado(null)
      setNuevoEstadoPropuesto(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado del usuario.')
    } finally {
      setIsUpdating(false)
    }
  }

  // Camino alternativo 5.a: El administrador no confirma
  function handleCancelarCambio() {
    setUsuarioSeleccionado(null)
    setNuevoEstadoPropuesto(null)
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = `${u.nombre} ${u.apellido} ${u.correo_electronico}`.toLowerCase()
    const coincideTexto = texto.includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'todos' || u.estado === filtroEstado
    return coincideTexto && coincideEstado
  })

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Panel de Administración</p>
          <h1>Gestión de Usuarios (CU17 · CU18)</h1>
          <p className="page-description">
            Supervisión y control de estados de usuarios registrados en el sistema.
          </p>
        </div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => cargarUsuarios(true)}
          disabled={isLoading || isRefreshing}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0 }}
        >
          <RefreshCw size={16} className={isLoading || isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar lista'}
        </button>
      </header>

      {error && (
        <div className="connection-status connection-status--error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {mensajeExito && (
        <div
          className="connection-status"
          role="status"
          style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <CheckCircle size={18} className="shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      <div className="filter-bar">
        <label className="search-field">
          Buscar usuario
          <div className="input-with-icon" style={{ marginTop: 4 }}>
            <Search size={18} className="input-icon" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, apellido o correo..."
            />
          </div>
        </label>
        <label>
          Filtrar por estado
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoUsuario | 'todos')}
            style={{ marginTop: 4 }}
          >
            <option value="todos">Todos los estados</option>
            <option value="Activo">Solo Activos</option>
            <option value="Inactivo">Solo Inactivos</option>
            <option value="Bloqueado">Solo Bloqueados</option>
          </select>
        </label>
      </div>

      <section className="panel" aria-live="polite">
        {isLoading ? (
          <div className="empty-state">
            <p>Cargando usuarios del sistema...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="empty-state">
            <h2>No se encontraron usuarios (CU17 2.a)</h2>
            <p>Probá modificando los criterios de búsqueda.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre y Apellido</th>
                  <th>Correo Electrónico</th>
                  <th>Tipo de Usuario</th>
                  <th>Estado Actual</th>
                  <th>
                    <span className="sr-only">Acciones de administración</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((item) => {
                  const esAdmin = item.id_tipo_usuario === 2
                  return (
                    <tr key={item.id_usuario}>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: '#64748b' }}>
                          #{item.id_usuario}
                        </span>
                      </td>
                      <td>
                        <strong>
                          {item.nombre} {item.apellido}
                        </strong>
                      </td>
                      <td>
                        <span style={{ color: '#334155' }}>{item.correo_electronico}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            esAdmin ? 'badge--account' : 'badge--category'
                          }`}
                          style={{
                            background: esAdmin ? '#f5f3ff' : '#f1f5f9',
                            color: esAdmin ? '#6d28d9' : '#334155',
                            borderColor: esAdmin ? '#ddd6fe' : '#e2e8f0',
                          }}
                        >
                          {item.tipo_descripcion || (esAdmin ? 'Administrador' : 'Común')}
                        </span>
                      </td>
                      <td>
                        <span
                          className="tag-type"
                          style={{
                            background:
                              item.estado === 'Activo'
                                ? '#dcfce7'
                                : item.estado === 'Inactivo'
                                ? '#fef3c7'
                                : '#fee2e2',
                            color:
                              item.estado === 'Activo'
                                ? '#15803d'
                                : item.estado === 'Inactivo'
                                ? '#b45309'
                                : '#b91c1c',
                            fontWeight: 700,
                            padding: '4px 8px',
                          }}
                        >
                          {item.estado === 'Activo' && '✓ '}
                          {item.estado === 'Inactivo' && '⏸ '}
                          {item.estado === 'Bloqueado' && '🚫 '}
                          {item.estado}
                        </span>
                      </td>
                      <td className="row-actions">
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleSolicitarCambio(item, 'Activo')}
                            disabled={item.estado === 'Activo'}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: '1px solid #bbf7d0',
                              background: item.estado === 'Activo' ? '#f0fdf4' : '#ffffff',
                              color: item.estado === 'Activo' ? '#94a3b8' : '#15803d',
                              fontWeight: 600,
                              cursor: item.estado === 'Activo' ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Establecer estado Activo (CU18)"
                          >
                            <UserCheck size={12} /> Activar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSolicitarCambio(item, 'Inactivo')}
                            disabled={item.estado === 'Inactivo'}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: '1px solid #fde68a',
                              background: item.estado === 'Inactivo' ? '#fffbeb' : '#ffffff',
                              color: item.estado === 'Inactivo' ? '#94a3b8' : '#b45309',
                              fontWeight: 600,
                              cursor: item.estado === 'Inactivo' ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Desactivar usuario (CU18 3.a)"
                          >
                            <UserX size={12} /> Desactivar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSolicitarCambio(item, 'Bloqueado')}
                            disabled={item.estado === 'Bloqueado'}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: '1px solid #fecaca',
                              background: item.estado === 'Bloqueado' ? '#fef2f2' : '#ffffff',
                              color: item.estado === 'Bloqueado' ? '#94a3b8' : '#b91c1c',
                              fontWeight: 600,
                              cursor: item.estado === 'Bloqueado' ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Bloquear usuario (CU18 3.b)"
                          >
                            <Lock size={12} /> Bloquear
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de confirmación CU18 (Pasos 2, 4 y 5) */}
      {usuarioSeleccionado && nuevoEstadoPropuesto && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-user-state-title"
        >
          <div className="modal-dialog">
            <h3 id="modal-user-state-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={20} color="#b45309" />
              ¿Confirmar cambio de estado de usuario? (CU18)
            </h3>
            <p>
              Estás por cambiar el estado del usuario{' '}
              <strong>
                "{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}"
              </strong>{' '}
              ({usuarioSeleccionado.correo_electronico}).
            </p>
            <div
              style={{
                background: '#f8fafc',
                padding: '12px 14px',
                borderRadius: 8,
                marginBottom: 20,
                border: '1px solid #e2e8f0',
                fontSize: '0.875rem',
              }}
            >
              <div>
                Estado actual: <strong>{usuarioSeleccionado.estado}</strong>
              </div>
              <div style={{ marginTop: 4 }}>
                Nuevo estado:{' '}
                <strong
                  style={{
                    color:
                      nuevoEstadoPropuesto === 'Activo'
                        ? '#15803d'
                        : nuevoEstadoPropuesto === 'Inactivo'
                        ? '#b45309'
                        : '#b91c1c',
                  }}
                >
                  {nuevoEstadoPropuesto}
                </strong>
              </div>
              <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                {nuevoEstadoPropuesto === 'Activo'
                  ? 'El usuario podrá iniciar sesión y operar con normalidad.'
                  : 'Este estado impedirá que el usuario inicie sesión según la regla de negocio y caso de uso CU02.'}
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancelarCambio}
                disabled={isUpdating}
              >
                Cancelar (CU18 5.a)
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleConfirmarCambio}
                disabled={isUpdating}
                style={{
                  background:
                    nuevoEstadoPropuesto === 'Bloqueado'
                      ? '#dc2626'
                      : nuevoEstadoPropuesto === 'Inactivo'
                      ? '#d97706'
                      : '#2563eb',
                }}
              >
                {isUpdating ? 'Actualizando...' : 'Confirmar operación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
