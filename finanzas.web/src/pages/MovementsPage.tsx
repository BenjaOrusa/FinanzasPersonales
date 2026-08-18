import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { Movement, MovementType } from '../types/finance'

interface MovementsPageProps { movements: Movement[]; onDelete: (id: number) => Promise<void> }
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

function MovementsPage({ movements, onDelete }: MovementsPageProps) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<MovementType | 'all'>('all')
  const visible = movements.filter((item) => item.description.toLowerCase().includes(search.toLowerCase()) && (type === 'all' || item.type === type))

  return (
    <>
      <header className="page-header"><div><p className="page-eyebrow">Administración</p><h1>Movimientos</h1><p className="page-description">Consultá y administrá tus ingresos y gastos.</p></div><Link className="primary-button" to="/movimientos/nuevo">+ Nuevo movimiento</Link></header>
      <div className="filter-bar">
        <label className="search-field">Buscar<span className="sr-only"> por descripción</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ej.: supermercado" /></label>
        <label>Tipo<select value={type} onChange={(event) => setType(event.target.value as MovementType | 'all')}><option value="all">Todos</option><option value="income">Ingresos</option><option value="expense">Gastos</option></select></label>
      </div>
      <section className="panel" aria-live="polite">
        {visible.length === 0 ? <div className="empty-state"><h2>No encontramos movimientos</h2><p>Probá limpiar la búsqueda o registrar uno nuevo.</p></div> : (
          <div className="table-wrapper"><table><thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Cuenta</th><th>Importe</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>
            {visible.map((item) => <tr key={item.id}><td>{new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR')}</td><td>{item.description}</td><td>{item.category}</td><td>{item.account}</td><td className={`movement-amount--${item.type}`}>{item.type === 'income' ? '+' : '−'} {money.format(item.amount)}</td><td className="row-actions"><Link to={`/movimientos/${item.id}/editar`}>Editar</Link><button type="button" onClick={async () => { if (window.confirm(`¿Eliminar ${item.description}?`)) { try { await onDelete(item.id) } catch (error) { window.alert(error instanceof Error ? error.message : 'No se pudo eliminar.') } } }}>Eliminar</button></td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </>
  )
}

export default MovementsPage
