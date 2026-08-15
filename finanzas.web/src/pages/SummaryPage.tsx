import { Link } from 'react-router-dom'
import { useState } from 'react'
import RecentMovements from '../components/RecentMovements'
import SummaryCard from '../components/SummaryCard'
import type { Movement } from '../types/finance'

interface SummaryPageProps { movements: Movement[] }

function SummaryPage({ movements }: SummaryPageProps) {
  const [period, setPeriod] = useState<'current' | 'previous'>('current')
  const now = new Date()
  const selectedDate = new Date(now.getFullYear(), now.getMonth() - (period === 'previous' ? 1 : 0), 1)
  const visibleMovements = movements.filter((item) => {
    const date = new Date(`${item.date}T00:00:00`)
    return date.getFullYear() === selectedDate.getFullYear() && date.getMonth() === selectedDate.getMonth()
  })

  // Estos cálculos son temporales; el backend será la fuente autoritativa.
  const income = visibleMovements.filter((item) => item.type === 'income').reduce((total, item) => total + item.amount, 0)
  const expense = visibleMovements.filter((item) => item.type === 'expense').reduce((total, item) => total + item.amount, 0)

  return (
    <>
      <header className="page-header">
        <div><p className="page-eyebrow">Vista general</p><h1>Resumen</h1><p className="page-description">Consultá de forma rápida el estado de tus finanzas.</p></div>
        <div className="header-actions">
          <label className="period-selector">Período<span className="sr-only"> seleccionado</span><select value={period} onChange={(event) => setPeriod(event.target.value as 'current' | 'previous')}><option value="current">Este mes</option><option value="previous">Mes anterior</option></select></label>
          <Link className="primary-button" to="/movimientos/nuevo">+ Nuevo movimiento</Link>
        </div>
      </header>
      <section className="summary-grid" aria-label="Resumen financiero del mes">
        <SummaryCard title="Balance actual" amount={income - expense} variant="balance" description="Ingresos menos gastos del período" prominent />
        <SummaryCard title="Ingresos" amount={income} variant="income" description="Total recibido este mes" />
        <SummaryCard title="Gastos" amount={expense} variant="expense" description="Total utilizado este mes" />
      </section>
      <RecentMovements movements={visibleMovements} />
    </>
  )
}

export default SummaryPage
