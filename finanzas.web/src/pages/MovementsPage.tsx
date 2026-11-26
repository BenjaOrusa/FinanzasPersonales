import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { Movement, MovementType } from '../types/finance'
import {
  convertirArsADolar,
  esMonedaUsd,
  obtenerCodigoMoneda,
  obtenerEquivalenciasDolaresApi,
  type MovementDollarEquivalentDTO,
} from '../services/currencyApi'
import { getConfig } from '../services/storage'
import {
  Search,
  Calendar,
} from 'lucide-react'

interface MovementsPageProps {
  movements: Movement[]
  onDelete: (id: string) => Promise<void>
}

const arsFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function MovementsPage({ movements, onDelete }: MovementsPageProps) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<MovementType | 'all'>('all')
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'ARS' | 'USD'>('all')
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [equivalenciasMap, setEquivalenciasMap] = useState<
    Record<string, MovementDollarEquivalentDTO>
  >({})

  useEffect(() => {
    if (getConfig().mode !== 'api') {
      setEquivalenciasMap({})
      return
    }
    const controller = new AbortController()
    obtenerEquivalenciasDolaresApi(controller.signal)
      .then(setEquivalenciasMap)
      .catch(() => {
        // Fallback silencioso a cálculo local si no hay cotizaciones cargadas o falla temporalmente
      })
    return () => controller.abort()
  }, [movements])

  // Filtro de movimientos
  const visible = movements.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.account.toLowerCase().includes(search.toLowerCase())
    const matchesType = type === 'all' || item.type === type
    const matchesCurrency =
      currencyFilter === 'all' ||
      obtenerCodigoMoneda(item.id_moneda, item.currencyDescription) === currencyFilter
    return matchesSearch && matchesType && matchesCurrency
  })

  async function handleConfirmDelete() {
    if (!movementToDelete) return
    try {
      setIsDeleting(true)
      setDeleteError(null)
      await onDelete(movementToDelete.id)
      setMovementToDelete(null)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'No se pudo eliminar el movimiento.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Historial Operativo</p>
          <h1>Movimientos Financieros</h1>
          <p className="page-description">
            Consultá, filtrá (CU14) y verificá la equivalencia histórica en dólares de tus operaciones (CU16).
          </p>
        </div>
        <Link className="primary-button" to="/movimientos/nuevo">
          + Nuevo movimiento (CU11)
        </Link>
      </header>

      {deleteError && (
        <div className="connection-status connection-status--error" role="alert" style={{ marginBottom: 16 }}>
          {deleteError}
        </div>
      )}

      {/* ============================================================ */}
      {/* BARRA DE FILTROS RESPONSIVE (CU14)                          */}
      {/* ============================================================ */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          alignItems: 'end',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem', fontWeight: 650, color: '#334155' }}>
          Buscar por texto
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              style={{ paddingLeft: 32, width: '100%', boxSizing: 'border-box' }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Descripción, categoría o cuenta..."
            />
          </div>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem', fontWeight: 650, color: '#334155' }}>
          Tipo de movimiento
          <select
            style={{ width: '100%', boxSizing: 'border-box' }}
            value={type}
            onChange={(event) => setType(event.target.value as MovementType | 'all')}
          >
            <option value="all">Todos los tipos (Ingresos y Gastos)</option>
            <option value="income">Solo Ingresos</option>
            <option value="expense">Solo Gastos</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem', fontWeight: 650, color: '#334155' }}>
          Moneda de origen
          <select
            style={{ width: '100%', boxSizing: 'border-box' }}
            value={currencyFilter}
            onChange={(event) => setCurrencyFilter(event.target.value as 'all' | 'ARS' | 'USD')}
          >
            <option value="all">Todas las monedas</option>
            <option value="ARS">Pesos Argentinos (ARS $)</option>
            <option value="USD">Dólares Estadounidenses (USD US$)</option>
          </select>
        </label>
      </div>

      {/* ============================================================ */}
      {/* TABLA DE MOVIMIENTOS CON EQUIVALENCIA EN DÓLARES (CU16)     */}
      {/* ============================================================ */}
      <section className="panel" aria-live="polite" style={{ marginTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
            Resultados ({visible.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Equivalencias calculadas a la cotización histórica del día del movimiento (Regla 12)
          </span>
        </div>

        {visible.length === 0 ? (
          <div className="empty-state">
            <h2>No encontramos movimientos</h2>
            <p>Probá limpiar los filtros o registrar una nueva operación.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Cuenta</th>
                  <th>Importe Original</th>
                  <th>Equivalencia USD (CU16)</th>
                  <th>
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const esDolar = esMonedaUsd(item.id_moneda, item.currencyDescription)
                  const eqApi = equivalenciasMap[item.id]

                  // CU16: Cálculo de equivalencia (usa respuesta oficial del backend en Modo API si está disponible)
                  let equivalenciaMonto: number | null = 0
                  let etiquetaCotiz = ''
                  let esFechaAnterior = false
                  let sinCotizacion = false

                  if (esDolar) {
                    equivalenciaMonto = item.amount
                    etiquetaCotiz = eqApi?.Status || 'Moneda original USD (CU16 3.a)'
                  } else if (eqApi) {
                    if (eqApi.EquivalentInDollars === null || eqApi.EquivalentInDollars === undefined) {
                      equivalenciaMonto = null
                      sinCotizacion = true
                      etiquetaCotiz = eqApi.Status || 'Sin cotización aplicable (CU16 3.c)'
                    } else {
                      equivalenciaMonto = Number(eqApi.EquivalentInDollars)
                      const fechaUsed = eqApi.ExchangeRateDateUsed
                        ? String(eqApi.ExchangeRateDateUsed).slice(0, 10)
                        : item.date
                      esFechaAnterior = (eqApi.Status || '').toLowerCase().includes('anterior')
                      etiquetaCotiz = `${eqApi.Status} (${fechaUsed})`
                    }
                  } else {
                    const conv = convertirArsADolar(item.amount, item.date)
                    equivalenciaMonto = conv.montoUsd
                    etiquetaCotiz = `Cotiz. ${conv.fechaCotizacion} ($${conv.cotizacionUtilizada})`
                    esFechaAnterior = conv.esAnterior || false
                  }

                  return (
                    <tr key={item.id}>
                      {/* Fecha */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} color="#64748b" />
                          <span>
                            {new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Descripción y nota */}
                      <td>
                        <strong>{item.description}</strong>
                        {item.note && <span className="cell-note">{item.note}</span>}
                      </td>

                      {/* Categoría */}
                      <td>
                        <span className="badge badge--category">{item.category}</span>
                      </td>

                      {/* Cuenta */}
                      <td>
                        <span className="badge badge--account">{item.account}</span>
                      </td>

                      {/* Importe Original */}
                      <td className={`movement-amount--${item.type}`}>
                        <strong>
                          {item.type === 'income' ? '+ ' : '− '}
                          {esDolar ? usdFormatter.format(item.amount) : arsFormatter.format(item.amount)}
                        </strong>
                      </td>

                      {/* CU16: Equivalencia en Dólares */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: sinCotizacion
                                ? '#94a3b8'
                                : item.type === 'income'
                                ? '#16a34a'
                                : '#b91c1c',
                              fontSize: '0.925rem',
                            }}
                          >
                            {sinCotizacion || equivalenciaMonto === null
                              ? 'Sin cotización'
                              : `${item.type === 'income' ? '≈ +' : '≈ −'}${usdFormatter.format(
                                  equivalenciaMonto
                                )}`}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: sinCotizacion
                                ? '#dc2626'
                                : esFechaAnterior
                                ? '#d97706'
                                : '#64748b',
                              fontWeight: 500,
                            }}
                            title={
                              esFechaAnterior
                                ? 'Regla 12 / CU16 3.b: Se utilizó la última cotización previa disponible por no haber cotización registrada en la fecha exacta.'
                                : undefined
                            }
                          >
                            {etiquetaCotiz}
                            {esFechaAnterior && ' ⚠️'}
                          </span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="row-actions">
                        <Link to={`/movimientos/${item.id}/editar`} title="Editar movimiento (CU12)">
                          Editar (CU12)
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null)
                            setMovementToDelete(item)
                          }}
                          title="Eliminar movimiento (CU13)"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de confirmación para eliminar movimiento (CU13) */}
      {movementToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-dialog">
            <h3 id="modal-title" style={{ color: '#dc2626' }}>¿Eliminar movimiento (CU13)?</h3>
            <p>
              Estás a punto de eliminar <strong>"{movementToDelete.description}"</strong> por un
              importe de{' '}
              <strong>
                {esMonedaUsd(movementToDelete.id_moneda, movementToDelete.currencyDescription)
                  ? usdFormatter.format(movementToDelete.amount)
                  : arsFormatter.format(movementToDelete.amount)}
              </strong>
              . El saldo de la cuenta se recalculará automáticamente.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setMovementToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar (CU13)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MovementsPage
