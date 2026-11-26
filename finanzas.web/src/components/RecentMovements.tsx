import type { Movement } from '../types/finance'
import { Link } from 'react-router-dom'
import { convertirArsADolar, esMonedaUsd } from '../services/currencyApi'

interface RecentMovementsProps {
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

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
})

function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <section className="panel" aria-labelledby="recent-movements-title">
      <div className="section-header">
        <div>
          <h2 id="recent-movements-title">Movimientos recientes</h2>
          <p>Últimas operaciones registradas (con equivalencia CU16)</p>
        </div>
        <Link className="text-button" to="/movimientos">
          Ver todos con filtros (CU14) →
        </Link>
      </div>

      {movements.length === 0 ? (
        <div className="empty-state">
          <p>No hay movimientos para el período seleccionado.</p>
        </div>
      ) : (
        <ul className="movement-list">
          {movements.slice(0, 5).map((movement) => {
            const isIncome = movement.type === 'income'
            const esDolar = esMonedaUsd(movement.id_moneda, movement.currencyDescription)

            // CU16: Cálculo de equivalencia
            let equivalenciaTexto = ''
            if (esDolar) {
              equivalenciaTexto = 'Moneda USD'
            } else {
              const { montoUsd } = convertirArsADolar(movement.amount, movement.date)
              equivalenciaTexto = `≈ ${usdFormatter.format(montoUsd)} (CU16)`
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
                      {dateFormatter.format(new Date(`${movement.date}T00:00:00`))}
                    </time>
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p className={`movement-amount movement-amount--${movement.type}`}>
                    {isIncome ? '+ ' : '− '}
                    {esDolar
                      ? usdFormatter.format(movement.amount)
                      : arsFormatter.format(movement.amount)}
                  </p>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.725rem',
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
  )
}

export default RecentMovements
