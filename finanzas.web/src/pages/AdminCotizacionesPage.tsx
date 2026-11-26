import { useState, useEffect, useCallback } from 'react'
import {
  supervisarDisponibilidadCotizacionAsync,
  obtenerHistorialCotizacionesApi,
  obtenerMonedas,
  registrarCotizacionManual,
  sincronizarCotizacionDesdeBanco,
  type Cotizacion,
  type Moneda,
  type ResultadoSupervisionCotizacion,
} from '../services/currencyApi'
import {
  Search,
  RefreshCw,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
} from 'lucide-react'

function AdminCotizacionesPage() {
  const [fechaConsulta, setFechaConsulta] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [monedas, setMonedas] = useState<Moneda[]>([])
  const [idMonedaBase, setIdMonedaBase] = useState('2') // USD
  const [idMonedaCotizada, setIdMonedaCotizada] = useState('1') // ARS
  const [resultadoSupervision, setResultadoSupervision] =
    useState<ResultadoSupervisionCotizacion | null>(null)

  // Lista de cotizaciones registradas
  const [cotizacionesList, setCotizacionesList] = useState<Cotizacion[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)

  // Sincronización en vivo con API del banco
  const [isSyncingBank, setIsSyncingBank] = useState(false)
  const [syncStatusMsg, setSyncStatusMsg] = useState<{
    text: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  // Formulario para agregar cotización manual
  const [nuevaFecha, setNuevaFecha] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [nuevoValor, setNuevoValor] = useState('')
  const [isSavingManual, setIsSavingManual] = useState(false)

  const cargarCotizaciones = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoadingList(true)
      const list = await obtenerHistorialCotizacionesApi(signal)
      setCotizacionesList(list)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setSyncStatusMsg({
        text:
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el historial de cotizaciones.',
        type: 'error',
      })
    } finally {
      setIsLoadingList(false)
    }
  }, [])

  const ejecutarSupervision = useCallback(
    async (fecha: string, baseId?: string, targetId?: string) => {
      const res = await supervisarDisponibilidadCotizacionAsync(fecha, baseId, targetId)
      setResultadoSupervision(res)
    },
    []
  )

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    async function init() {
      let defaultBase = '2'
      let defaultTarget = '1'
      try {
        const loadedMonedas = await obtenerMonedas(controller.signal)
        if (!active) return
        setMonedas(loadedMonedas)
        const usd = loadedMonedas.find((m) => m.codigo === 'USD')
        const ars = loadedMonedas.find((m) => m.codigo === 'ARS')
        if (usd && ars) {
          defaultBase = usd.id_moneda
          defaultTarget = ars.id_moneda
          setIdMonedaBase(defaultBase)
          setIdMonedaCotizada(defaultTarget)
        }
      } catch {
        // Fallback a valores base
      }

      await Promise.all([
        cargarCotizaciones(controller.signal),
        ejecutarSupervision(fechaConsulta, defaultBase, defaultTarget),
      ])
    }

    init()
    return () => {
      active = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleConsultarDisponibilidad(e: React.FormEvent) {
    e.preventDefault()
    ejecutarSupervision(fechaConsulta, idMonedaBase, idMonedaCotizada)
  }

  async function handleSincronizarBanco() {
    try {
      setIsSyncingBank(true)
      setSyncStatusMsg({
        text: 'Invocando endpoint de conexión con la API pública del banco...',
        type: 'info',
      })
      const result = await sincronizarCotizacionDesdeBanco()
      await cargarCotizaciones()
      await ejecutarSupervision(fechaConsulta, idMonedaBase, idMonedaCotizada)
      setSyncStatusMsg({
        text: `Sincronización exitosa: ${result.mensaje} [Origen: ${result.origen}]`,
        type: 'success',
      })
      setTimeout(() => setSyncStatusMsg(null), 6000)
    } catch (err) {
      setSyncStatusMsg({
        text:
          err instanceof Error
            ? err.message
            : 'Error al conectar con la API externa del banco.',
        type: 'error',
      })
    } finally {
      setIsSyncingBank(false)
    }
  }

  async function handleGuardarManual(e: React.FormEvent) {
    e.preventDefault()
    const val = parseFloat(nuevoValor)
    if (isNaN(val) || val <= 0 || !nuevaFecha) {
      setSyncStatusMsg({
        text: 'Ingresá un valor numérico mayor a 0 y una fecha válida.',
        type: 'error',
      })
      return
    }

    try {
      setIsSavingManual(true)
      await registrarCotizacionManual(nuevaFecha, val, idMonedaBase, idMonedaCotizada)
      await cargarCotizaciones()
      await ejecutarSupervision(fechaConsulta, idMonedaBase, idMonedaCotizada)
      setNuevoValor('')
      setSyncStatusMsg({
        text: `Cotización de $${val.toFixed(2)} para la fecha ${nuevaFecha} registrada con éxito.`,
        type: 'success',
      })
      setTimeout(() => setSyncStatusMsg(null), 4000)
    } catch (err) {
      setSyncStatusMsg({
        text: err instanceof Error ? err.message : 'No se pudo registrar la cotización manual.',
        type: 'error',
      })
    } finally {
      setIsSavingManual(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Supervisión del Sistema</p>
          <h1>Supervisar Cotizaciones (CU19)</h1>
          <p className="page-description">
            Herramienta exclusiva del administrador para auditar la disponibilidad de tipos de cambio históricos y sincronizar con la API pública bancaria.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleSincronizarBanco}
          disabled={isSyncingBank}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <RefreshCw
            size={16}
            style={{ animation: isSyncingBank ? 'spin 1s linear infinite' : 'none' }}
          />
          <span>{isSyncingBank ? 'Sincronizando...' : 'Consultar API Banco en Vivo'}</span>
        </button>
      </header>

      {syncStatusMsg && (
        <div
          className={`connection-status ${
            syncStatusMsg.type === 'error' ? 'connection-status--error' : ''
          }`}
          style={{
            marginBottom: 20,
            background:
              syncStatusMsg.type === 'success'
                ? '#f0fdf4'
                : syncStatusMsg.type === 'error'
                ? '#fef2f2'
                : '#eff6ff',
            border: `1px solid ${
              syncStatusMsg.type === 'success'
                ? '#bbf7d0'
                : syncStatusMsg.type === 'error'
                ? '#fecaca'
                : '#bfdbfe'
            }`,
            color:
              syncStatusMsg.type === 'success'
                ? '#166534'
                : syncStatusMsg.type === 'error'
                ? '#991b1b'
                : '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {syncStatusMsg.type === 'success' ? (
            <CheckCircle size={18} />
          ) : syncStatusMsg.type === 'error' ? (
            <XCircle size={18} />
          ) : (
            <Info size={18} />
          )}
          <span>{syncStatusMsg.text}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* CU19: FORMULARIO DE CONSULTA DE DISPONIBILIDAD              */}
      {/* ============================================================ */}
      <div className="management-grid" style={{ marginBottom: 28 }}>
        <form className="form-panel compact-form" onSubmit={handleConsultarDisponibilidad}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.15rem' }}>
            <Search size={18} color="#2563eb" /> Consultar Disponibilidad (CU19)
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: -8, marginBottom: 12 }}>
            Verificá si existe cotización exacta o anterior para una fecha determinada.
          </p>

          <label>
            Par de monedas
            <select
              value={`${idMonedaBase}|${idMonedaCotizada}`}
              onChange={(e) => {
                const [b, c] = e.target.value.split('|')
                setIdMonedaBase(b)
                setIdMonedaCotizada(c)
              }}
            >
              <option value={`${idMonedaBase}|${idMonedaCotizada}`}>
                USD / ARS (Dólar Estadounidense a Pesos Argentinos)
              </option>
              {monedas
                .filter((m) => m.codigo === 'ARS')
                .map((arsM) => {
                  const usdM = monedas.find((m) => m.codigo === 'USD')
                  if (!usdM || `${usdM.id_moneda}|${arsM.id_moneda}` === `${idMonedaBase}|${idMonedaCotizada}`) {
                    return null
                  }
                  return (
                    <option key={`${usdM.id_moneda}-${arsM.id_moneda}`} value={`${usdM.id_moneda}|${arsM.id_moneda}`}>
                      USD / ARS ({usdM.descripcion} → {arsM.descripcion})
                    </option>
                  )
                })}
            </select>
          </label>

          <label>
            Fecha de referencia
            <input
              type="date"
              value={fechaConsulta}
              onChange={(e) => setFechaConsulta(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="primary-button"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Search size={16} /> Verificar Disponibilidad (CU19)
          </button>
        </form>

        {/* RESULTADO DE LA SUPERVISIÓN (CU19 Paso 5, Alt 4.b, Alt 4.c) */}
        <section className="panel" style={{ marginTop: 0 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', marginBottom: 16 }}>
            Resultado de la Supervisión (CU19)
          </h2>

          {resultadoSupervision ? (
            <div
              style={{
                borderRadius: 10,
                padding: 20,
                border: '1px solid',
                borderColor:
                  resultadoSupervision.estado === 'exacta'
                    ? '#bbf7d0'
                    : resultadoSupervision.estado === 'anterior'
                    ? '#fde68a'
                    : '#fecaca',
                background:
                  resultadoSupervision.estado === 'exacta'
                    ? '#f0fdf4'
                    : resultadoSupervision.estado === 'anterior'
                    ? '#fffbeb'
                    : '#fef2f2',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {resultadoSupervision.estado === 'exacta' && (
                  <span
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <CheckCircle size={14} /> Cotización Exacta Disponible (Camino Básico)
                  </span>
                )}

                {resultadoSupervision.estado === 'anterior' && (
                  <span
                    style={{
                      background: '#d97706',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <AlertTriangle size={14} /> Fecha Anterior Aplicada (CU19 Alt 4.b / Regla 12)
                  </span>
                )}

                {resultadoSupervision.estado === 'no_disponible' && (
                  <span
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <XCircle size={14} /> Sin Cotización Aplicable (CU19 Alt 4.c)
                  </span>
                )}
              </div>

              {resultadoSupervision.valor !== undefined ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a' }}>
                      ${resultadoSupervision.valor.toFixed(2)} ARS
                    </span>
                    <span style={{ fontSize: '1rem', color: '#64748b' }}>por 1 USD</span>
                  </div>

                  <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                    {resultadoSupervision.mensaje}
                  </p>

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 16, fontSize: '0.8rem', color: '#64748b' }}>
                    <span>
                      <strong>Fecha de la cotización:</strong> {resultadoSupervision.fechaCotizacion}
                    </span>
                    <span>
                      <strong>Fuente:</strong> {resultadoSupervision.fuente}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>
                  {resultadoSupervision.mensaje}
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>Cargando supervisión...</p>
          )}

          {/* Formulario para agregar una cotización manual si hiciera falta */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#0f172a' }}>
              Registrar Nueva Cotización Manual
            </h3>
            <form onSubmit={handleGuardarManual} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
              <label style={{ flex: '1 1 140px', fontSize: '0.825rem', fontWeight: 600 }}>
                Fecha
                <input
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  style={{ minHeight: 38, height: 38 }}
                  required
                />
              </label>

              <label style={{ flex: '1 1 140px', fontSize: '0.825rem', fontWeight: 600 }}>
                Valor ($ ARS / 1 USD)
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 1320.00"
                  value={nuevoValor}
                  onChange={(e) => setNuevoValor(e.target.value)}
                  style={{ minHeight: 38, height: 38 }}
                  required
                />
              </label>

              <button
                type="submit"
                className="secondary-button"
                disabled={isSavingManual}
                style={{ minHeight: 38, height: 38, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <PlusCircle size={15} /> Guardar Cotización
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* HISTORIAL COMPLETO DE COTIZACIONES BANCARIAS                */}
      {/* ============================================================ */}
      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
              Registro Histórico de Cotizaciones ({cotizacionesList.length})
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Alimentadas automáticamente por la llamada externa al Banco y supervisadas por el administrador.
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Par de Monedas</th>
                <th>Cotización ($ ARS / USD)</th>
                <th>Origen / Fuente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingList && cotizacionesList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>
                    Cargando historial de cotizaciones...
                  </td>
                </tr>
              ) : cotizacionesList.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>
                    Todavía no hay cotizaciones registradas en el sistema.
                  </td>
                </tr>
              ) : (
                cotizacionesList.map((cot, idx) => {
                  const pairLabel =
                    cot.baseDescription && cot.targetDescription
                      ? `${cot.baseDescription.includes('Dólar') ? 'USD' : cot.baseDescription} / ${
                          cot.targetDescription.includes('Peso') ? 'ARS' : cot.targetDescription
                        }`
                      : 'USD / ARS'

                  return (
                    <tr key={`${cot.fecha}-${idx}`}>
                      <td>
                        <strong>{cot.fecha}</strong>
                      </td>
                      <td>
                        <span className="badge badge--account">{pairLabel}</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                          ${cot.valor.toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                          {cot.fuente || 'API Banco Público'}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#f0fdf4',
                            color: '#166534',
                            border: '1px solid #bbf7d0',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: '0.75rem',
                            fontWeight: 650,
                          }}
                        >
                          Disponible
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default AdminCotizacionesPage
