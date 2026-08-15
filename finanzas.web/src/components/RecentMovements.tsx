import type { Movement } from '../types/finance'
import { Link } from 'react-router-dom'

interface RecentMovementsProps {
  movements: Movement[]
}

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' })

function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <section className="panel" aria-labelledby="recent-movements-title">
      <div className="section-header">
        <div><h2 id="recent-movements-title">Movimientos recientes</h2><p>Últimas operaciones registradas</p></div>
        <Link className="text-button" to="/movimientos">Ver todos</Link>
      </div>
      {movements.length === 0 ? (
        <div className="empty-state"><p>No hay movimientos para el período seleccionado.</p></div>
      ) : <ul className="movement-list">
        {movements.slice(0, 5).map((movement) => {
          const isIncome = movement.type === 'income'
          return (
            <li className="movement-item" key={movement.id}>
              <div className={`movement-symbol movement-symbol--${movement.type}`} aria-hidden="true">{isIncome ? '+' : '−'}</div>
              <div className="movement-information">
                <p className="movement-description">{movement.description}</p>
                <p className="movement-details">{movement.category} · <time dateTime={movement.date}>{dateFormatter.format(new Date(`${movement.date}T00:00:00`))}</time></p>
              </div>
              <p className={`movement-amount movement-amount--${movement.type}`}>{isIncome ? '+' : '−'} {currencyFormatter.format(movement.amount)}</p>
            </li>
          )
        })}
      </ul>}
    </section>
  )
}

export default RecentMovements
