import './App.css'

function App() {
  return (
    <div className="app-layout">
      {/* aside separa la navegación del contenido propio de cada página. */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            FP
          </span>
          <span>Finanzas Personales</span>
        </div>

        {/* aria-label permite identificar el menú mediante tecnologías de asistencia. */}
        <nav className="main-navigation" aria-label="Navegación principal">
          <a className="navigation-link active" href="#resumen" aria-current="page">
            Resumen
          </a>
          <a className="navigation-link" href="#movimientos">
            Movimientos
          </a>
          <a className="navigation-link" href="#categorias">
            Categorías
          </a>
          <a className="navigation-link" href="#cuentas">
            Cuentas
          </a>
        </nav>
      </aside>

      {/* main contiene la información principal de la página seleccionada. */}
      <main className="main-content" id="resumen">
        <header className="page-header">
          <div>
            <p className="page-eyebrow">Vista general</p>
            <h1>Resumen</h1>
            <p className="page-description">
              Consultá de forma rápida el estado de tus finanzas.
            </p>
          </div>

          <button className="primary-button" type="button">
            <span aria-hidden="true">+</span> Nuevo movimiento
          </button>
        </header>

        {/* Este espacio recibirá las tarjetas financieras en el próximo paso. */}
        <section className="content-placeholder" aria-labelledby="summary-title">
          <div className="placeholder-icon" aria-hidden="true">
            $
          </div>
          <h2 id="summary-title">Tu resumen financiero</h2>
          <p>
            Aquí mostraremos el balance, los ingresos, los gastos y los movimientos
            recientes.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
