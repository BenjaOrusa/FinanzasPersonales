import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Movement } from '../types/finance'
import {
  sincronizarCotizacionDesdeBanco,
  convertirArsADolar,
  esMonedaUsd,
  obtenerResumenFinancieroApi,
  obtenerUltimaCotizacionDolarApi,
  obtenerEquivalenciasDolaresApi,
  type Cotizacion,
  type CurrencySummaryDTO,
  type MovementDollarEquivalentDTO,
} from '../services/currencyApi'
import { getConfig } from '../services/storage'
import {
  Scale,
  RefreshCw,
  Landmark,
  Layers,
  Info,
} from 'lucide-react'

interface SummaryPageProps {
  movements: Movement[]
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

function formatMoneyByCurrency(
  amount: number,
  idMoneda?: string,
  currencyDescription?: string
): string {
  if (esMonedaUsd(idMoneda, currencyDescription)) {
    return usdFormatter.format(amount)
  }
  return arsFormatter.format(amount)
}

function SummaryPage({ movements }: SummaryPageProps) {
  const [period, setPeriod] = useState<'current' | 'previous' | 'all'>('current')
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'ars' | 'usd'>('all')
  const [apiSummaries, setApiSummaries] = useState<CurrencySummaryDTO[] | null>(null)

  const [apiEquivalents, setApiEquivalents] = useState<
    Record<string, MovementDollarEquivalentDTO>
  >({})

  // Estado de la cotización bancaria en vivo (Llamada externa a API pública de Banco)
  const [bancoRate, setBancoRate] = useState<Cotizacion | null>(null)
  const [isSyncingBank, setIsSyncingBank] = useState(false)
  const [bankSyncMessage, setBankSyncMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    obtenerUltimaCotizacionDolarApi(controller.signal)
      .then(({ cotizacion }) => {
        setBancoRate(cotizacion)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setBancoRate(null)
        }
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (getConfig().mode !== 'api') {
      setApiSummaries(null)
      setApiEquivalents({})
      return
    }
    const controller = new AbortController()

    const nowDate = new Date()
    let startDate: string | undefined
    let endDate: string | undefined

    if (period === 'current') {
      const start = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1)
      const end = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0)
      startDate = start.toISOString().slice(0, 10)
      endDate = end.toISOString().slice(0, 10)
    } else if (period === 'previous') {
      const start = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1)
      const end = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0)
      startDate = start.toISOString().slice(0, 10)
      endDate = end.toISOString().slice(0, 10)
    }

    obtenerResumenFinancieroApi(startDate, endDate, controller.signal)
      .then((res) => {
        setApiSummaries(res?.SummariesByCurrency ?? null)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiSummaries(null)
        }
      })

    obtenerEquivalenciasDolaresApi(controller.signal)
      .then((map) => {
        setApiEquivalents(map)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiEquivalents({})
        }
      })

    return () => controller.abort()
  }, [period, movements])

  async function handleSyncBankRate() {
    try {
      setIsSyncingBank(true)
      setBankSyncMessage('Consultando cotización en vivo desde API bancaria...')
      const result = await sincronizarCotizacionDesdeBanco()
      setBancoRate(result.cotizacion)
      setBankSyncMessage(result.mensaje)
      setTimeout(() => setBankSyncMessage(null), 5000)
    } catch (err) {
      setBankSyncMessage(
        err instanceof Error
          ? err.message
          : 'No se pudo contactar a la API del banco en este momento.'
      )
    } finally {
      setIsSyncingBank(false)
    }
  }

  // Filtrado de movimientos por período
  const now = new Date()
  const targetRefDate = new Date(
    now.getFullYear(),
    now.getMonth() - (period === 'previous' ? 1 : 0),
    1
  )
  const visibleMovements = movements.filter((item) => {
    if (period === 'all') return true
    const date = new Date(`${item.date}T00:00:00`)
    return (
      date.getFullYear() === targetRefDate.getFullYear() &&
      date.getMonth() === targetRefDate.getMonth()
    )
  })

  // CU15: Separar importes estrictamente por moneda (Regla de negocio: No sumar directamente monedas distintas)
  const movementsArs = visibleMovements.filter(
    (m) => !esMonedaUsd(m.id_moneda, m.currencyDescription)
  )
  const movementsUsd = visibleMovements.filter((m) =>
    esMonedaUsd(m.id_moneda, m.currencyDescription)
  )

  const apiArsSummary = apiSummaries
    ? apiSummaries.find((s) => !esMonedaUsd(s.CurrencyId, s.CurrencyDescription))
    : undefined
  const apiUsdSummary = apiSummaries
    ? apiSummaries.find((s) => esMonedaUsd(s.CurrencyId, s.CurrencyDescription))
    : undefined

  // Totales en Pesos (ARS)
  const localIncomeArs = movementsArs
    .filter((m) => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0)
  const localExpenseArs = movementsArs
    .filter((m) => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0)
  const incomeArs = apiArsSummary ? Number(apiArsSummary.TotalIncome) : localIncomeArs
  const expenseArs = apiArsSummary ? Number(apiArsSummary.TotalExpenses) : localExpenseArs
  const balanceArs = apiArsSummary ? Number(apiArsSummary.Balance) : incomeArs - expenseArs

  // Totales en Dólares (USD)
  const localIncomeUsd = movementsUsd
    .filter((m) => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0)
  const localExpenseUsd = movementsUsd
    .filter((m) => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0)
  const incomeUsd = apiUsdSummary ? Number(apiUsdSummary.TotalIncome) : localIncomeUsd
  const expenseUsd = apiUsdSummary ? Number(apiUsdSummary.TotalExpenses) : localExpenseUsd
  const balanceUsd = apiUsdSummary ? Number(apiUsdSummary.Balance) : incomeUsd - expenseUsd

  // CU16: Consolidado total equivalente en USD utilizando cotización del día
  const rateToday = bancoRate?.valor ?? 0
  const balanceArsInUsd = rateToday > 0 ? balanceArs / rateToday : 0
  const totalNetWorthUsdConsolidated = balanceUsd + balanceArsInUsd

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Estado Financiero</p>
          <h1>Resumen Financiero (CU15)</h1>
          <p className="page-description">
            Totales de ingresos, gastos y balance separados estrictamente por moneda, con equivalencia en dólares (CU16).
          </p>
        </div>

        <div className="header-actions">
          <label className="period-selector">
            Período
            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as 'current' | 'previous' | 'all')
              }
            >
              <option value="current">Este mes en curso</option>
              <option value="previous">Mes anterior</option>
              <option value="all">Todo el historial</option>
            </select>
          </label>

          <Link className="primary-button" to="/movimientos/nuevo">
            + Nuevo movimiento
          </Link>
        </div>
      </header>

      {/* ============================================================ */}
      {/* BANNER EN VIVO: COTIZACIÓN BANCARIA (API PÚBLICA DE BANCO)  */}
      {/* ============================================================ */}
      <div
        className="bank-rate-banner"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 12,
          padding: '16px 20px',
          color: '#ffffff',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
          border: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#2563eb',
              display: 'grid',
              placeItems: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <Landmark size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                Cotización Dólar Oficial / Banco
              </strong>
              <span
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  textTransform: 'uppercase',
                }}
              >
                API Bancaria en Línea
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                {rateToday > 0 ? `1 USD = $${rateToday.toFixed(2)} ARS` : 'Sin cotización guardada'}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                • Fecha de referencia: {bancoRate?.fecha || 'Pendiente de sincronización'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={handleSyncBankRate}
            disabled={isSyncingBank}
            style={{
              background: '#1e293b',
              border: '1px solid #475569',
              color: '#f8fafc',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: '0.825rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
            title="Invoca el endpoint del backend que consulta la API externa del banco para actualizar la cotización"
          >
            <RefreshCw
              size={15}
              style={{
                animation: isSyncingBank ? 'spin 1s linear infinite' : 'none',
              }}
            />
            {isSyncingBank ? 'Actualizando...' : 'Actualizar vía API Banco'}
          </button>
        </div>
      </div>

      {bankSyncMessage && (
        <div
          className="connection-status"
          style={{
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
          }}
        >
          <Info size={16} />
          <span>{bankSyncMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* SELECTOR DE MONEDA PARA EL RESUMEN                          */}
      {/* ============================================================ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={16} color="#64748b" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
            Visualización Monetaria (CU15):
          </span>
        </div>

        <div className="view-mode-tabs" style={{ margin: 0 }}>
          <button
            type="button"
            className={`view-mode-tab-btn ${currencyFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCurrencyFilter('all')}
          >
            Bimonetario (ARS + USD)
          </button>
          <button
            type="button"
            className={`view-mode-tab-btn ${currencyFilter === 'ars' ? 'active' : ''}`}
            onClick={() => setCurrencyFilter('ars')}
          >
            Solo Pesos ($ ARS)
          </button>
          <button
            type="button"
            className={`view-mode-tab-btn ${currencyFilter === 'usd' ? 'active' : ''}`}
            onClick={() => setCurrencyFilter('usd')}
          >
            Solo Dólares (US$ USD)
          </button>
        </div>
      </div>

      {/* Estado si el usuario no tiene movimientos (CU15 Camino Alternativo 2.a) */}
      {visibleMovements.length === 0 && !(apiSummaries && apiSummaries.length > 0) ? (
        <div className="empty-panel" style={{ padding: 48, marginBottom: 24 }}>
          <h2>Todavía no hay movimientos registrados</h2>
          <p>
            No se encontraron ingresos ni gastos en el período seleccionado. Podés registrar uno nuevo para ver el balance.
          </p>
          <Link className="primary-button" to="/movimientos/nuevo" style={{ display: 'inline-block', marginTop: 12 }}>
            + Registrar primer movimiento
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
          {/* ============================================================ */}
          {/* SECCIÓN 1: RESUMEN EN PESOS ARGENTINOS (ARS $)              */}
          {/* ============================================================ */}
          {(currencyFilter === 'all' || currencyFilter === 'ars') && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                  paddingBottom: 12,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                    Resumen en Pesos Argentinos (ARS $)
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {movementsArs.length} movimiento{movementsArs.length !== 1 ? 's' : ''} en moneda local
                  </span>
                </div>

                <span
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  Moneda: ARS ($)
                </span>
              </div>

              <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {/* Balance ARS */}
                <div
                  className="summary-card"
                  style={{
                    borderLeft: `4px solid ${balanceArs >= 0 ? '#16a34a' : '#dc2626'}`,
                  }}
                >
                  <p className="summary-card__title">Balance Neto ARS</p>
                  <p
                    className="summary-card__amount"
                    style={{
                      color: balanceArs >= 0 ? '#15803d' : '#b91c1c',
                      fontSize: '1.85rem',
                    }}
                  >
                    {arsFormatter.format(balanceArs)}
                  </p>
                  <p className="summary-card__description">Ingresos menos gastos en Pesos</p>
                </div>

                {/* Ingresos ARS */}
                <div className="summary-card" style={{ borderLeft: '4px solid #16a34a' }}>
                  <p className="summary-card__title">Total Ingresos ARS</p>
                  <p className="summary-card__amount" style={{ color: '#15803d', fontSize: '1.85rem' }}>
                    +{arsFormatter.format(incomeArs)}
                  </p>
                  <p className="summary-card__description">Total percibido en ARS</p>
                </div>

                {/* Gastos ARS */}
                <div className="summary-card" style={{ borderLeft: '4px solid #dc2626' }}>
                  <p className="summary-card__title">Total Gastos ARS</p>
                  <p className="summary-card__amount" style={{ color: '#b91c1c', fontSize: '1.85rem' }}>
                    −{arsFormatter.format(expenseArs)}
                  </p>
                  <p className="summary-card__description">Total desembolsado en ARS</p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECCIÓN 2: RESUMEN EN DÓLARES ESTADOUNIDENSES (USD US$)      */}
          {/* ============================================================ */}
          {(currencyFilter === 'all' || currencyFilter === 'usd') && (
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                  paddingBottom: 12,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                    Resumen en Dólares Estadounidenses (US$ USD)
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {movementsUsd.length} movimiento{movementsUsd.length !== 1 ? 's' : ''} en moneda extranjera
                  </span>
                </div>

                <span
                  style={{
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  Moneda: USD (US$)
                </span>
              </div>

              {!apiUsdSummary && movementsUsd.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: 8 }}>
                  No tenés movimientos registrados en Dólares (USD) para este período.
                </div>
              ) : (
                <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  {/* Balance USD */}
                  <div
                    className="summary-card"
                    style={{
                      borderLeft: `4px solid ${balanceUsd >= 0 ? '#16a34a' : '#dc2626'}`,
                    }}
                  >
                    <p className="summary-card__title">Balance Neto USD</p>
                    <p
                      className="summary-card__amount"
                      style={{
                        color: balanceUsd >= 0 ? '#15803d' : '#b91c1c',
                        fontSize: '1.85rem',
                      }}
                    >
                      {usdFormatter.format(balanceUsd)}
                    </p>
                    <p className="summary-card__description">Ingresos menos gastos en USD</p>
                  </div>

                  {/* Ingresos USD */}
                  <div className="summary-card" style={{ borderLeft: '4px solid #16a34a' }}>
                    <p className="summary-card__title">Total Ingresos USD</p>
                    <p className="summary-card__amount" style={{ color: '#15803d', fontSize: '1.85rem' }}>
                      +{usdFormatter.format(incomeUsd)}
                    </p>
                    <p className="summary-card__description">Total percibido en USD</p>
                  </div>

                  {/* Gastos USD */}
                  <div className="summary-card" style={{ borderLeft: '4px solid #dc2626' }}>
                    <p className="summary-card__title">Total Gastos USD</p>
                    <p className="summary-card__amount" style={{ color: '#b91c1c', fontSize: '1.85rem' }}>
                      −{usdFormatter.format(expenseUsd)}
                    </p>
                    <p className="summary-card__description">Total desembolsado en USD</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* CU16: BALANCE CONSOLIDADO ESTIMADO EN DÓLARES               */}
          {/* ============================================================ */}
          {currencyFilter === 'all' && (
            <div
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: 12,
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Scale size={20} color="#1d4ed8" />
                  <strong style={{ fontSize: '1.05rem', color: '#1e3a8a' }}>
                    Patrimonio Consolidado Estimado en USD (CU16)
                  </strong>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#3b82f6' }}>
                  {rateToday > 0
                    ? `Convierte el balance neto en Pesos a tipo de cambio bancario oficial ($${rateToday.toFixed(2)}) y lo suma al balance en Dólares.`
                    : 'No hay cotización del dólar disponible para convertir el balance en Pesos.'}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    color:
                      rateToday > 0 || balanceArs === 0
                        ? totalNetWorthUsdConsolidated >= 0
                          ? '#15803d'
                          : '#b91c1c'
                        : '#64748b',
                  }}
                >
                  {rateToday > 0 || balanceArs === 0
                    ? usdFormatter.format(totalNetWorthUsdConsolidated)
                    : 'Sin cotización aplicable'}
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                  Sin modificar importes originales (Regla de negocio)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* LISTA DE MOVIMIENTOS RECIENTES CON EQUIVALENCIA (CU16)      */}
      {/* ============================================================ */}
      <section className="panel" aria-labelledby="recent-movements-title" style={{ marginTop: 24 }}>
        <div className="section-header">
          <div>
            <h2 id="recent-movements-title">Movimientos Recientes del Período</h2>
            <p>Con distinción de moneda original y equivalencia en dólares (CU16)</p>
          </div>
          <Link className="text-button" to="/movimientos">
            Ver listado completo con filtros (CU14) →
          </Link>
        </div>

        {visibleMovements.length === 0 ? (
          <div className="empty-state">
            <p>No hay movimientos registrados para el período seleccionado.</p>
          </div>
        ) : (
          <ul className="movement-list">
            {visibleMovements.slice(0, 6).map((movement) => {
              const isIncome = movement.type === 'income'
              const esDolar = esMonedaUsd(movement.id_moneda, movement.currencyDescription)

              // CU16: Cálculo de equivalencia (prioriza servidor en Modo API)
              let equivalenciaTexto = ''
              const serverEq = apiEquivalents[movement.id]
              if (serverEq) {
                if (serverEq.EquivalentInDollars !== null && serverEq.EquivalentInDollars !== undefined) {
                  const eqDate = serverEq.ExchangeRateDateUsed
                    ? String(serverEq.ExchangeRateDateUsed).slice(0, 10)
                    : movement.date
                  equivalenciaTexto = esDolar
                    ? 'Moneda original USD (CU16 3.a)'
                    : `≈ ${usdFormatter.format(Number(serverEq.EquivalentInDollars))} (Cotiz. ${eqDate})`
                } else {
                  equivalenciaTexto = serverEq.Status || 'Sin cotización aplicable (CU16 3.c)'
                }
              } else if (esDolar) {
                equivalenciaTexto = 'Moneda original USD (CU16 3.a)'
              } else if (getConfig().mode === 'api') {
                equivalenciaTexto =
                  rateToday > 0
                    ? `≈ ${usdFormatter.format(movement.amount / rateToday)} (Ref. $${rateToday.toFixed(2)})`
                    : 'Sin cotización aplicable'
              } else {
                const { montoUsd, cotizacionUtilizada, fechaCotizacion } = convertirArsADolar(
                  movement.amount,
                  movement.date
                )
                equivalenciaTexto = `≈ ${usdFormatter.format(montoUsd)} (Cotiz. ${fechaCotizacion}: $${cotizacionUtilizada})`
              }

              return (
                <li className="movement-item" key={movement.id}>
                  <div
                    className={`movement-symbol movement-symbol--${movement.type}`}
                    aria-hidden="true"
                  >
                    {isIncome ? '+' : '−'}
                  </div>

                  <div className="movement-information">
                    <p className="movement-description">{movement.description}</p>
                    <p className="movement-details">
                      <span>{movement.category}</span>
                      <span> · </span>
                      <span>{movement.account}</span>
                      <span> · </span>
                      <time dateTime={movement.date}>
                        {new Date(`${movement.date}T00:00:00`).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p className={`movement-amount movement-amount--${movement.type}`}>
                      {isIncome ? '+ ' : '− '}
                      {formatMoneyByCurrency(
                        movement.amount,
                        movement.id_moneda,
                        movement.currencyDescription
                      )}
                    </p>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: '#64748b',
                        marginTop: 2,
                      }}
                    >
                      {equivalenciaTexto}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}

export default SummaryPage
