import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { initialAccounts, initialCategories } from './data/exampleData'
import SummaryPage from './pages/SummaryPage'
import AccountsPage from './pages/AccountsPage'
import CategoriesPage from './pages/CategoriesPage'
import MovementFormPage from './pages/MovementFormPage'
import MovementsPage from './pages/MovementsPage'
import type { Account, Category, Movement } from './types/finance'
import { obtenerMovimientos } from './services/movementsApi'
import './App.css'

function App() {
  // El estado vive arriba para poder compartirlo entre todas las páginas.
  const [movements, setMovements] = useState<Movement[]>([])
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadMovements() {
      try {
        setIsLoading(true)
        setLoadError(null)
        const apiMovements = await obtenerMovimientos(controller.signal)
        setMovements(apiMovements)
      } catch (error) {
        // AbortError ocurre normalmente cuando React desmonta el componente.
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLoadError(error instanceof Error ? error.message : 'No fue posible cargar los movimientos.')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadMovements()
    return () => controller.abort()
  }, [])

  function saveMovement(movement: Movement) {
    setMovements((current) => current.some((item) => item.id === movement.id) ? current.map((item) => item.id === movement.id ? movement : item) : [movement, ...current])
  }

  function addCategory(category: Category) {
    if (categories.some((item) => item.type === category.type && item.name.toLowerCase() === category.name.toLowerCase())) { window.alert('Ya existe una categoría con ese nombre y tipo.'); return }
    setCategories((items) => [...items, category])
  }

  function deleteCategory(id: number) {
    const category = categories.find((item) => item.id === id)
    if (!category) return
    if (movements.some((item) => item.category === category.name)) { window.alert('La categoría tiene movimientos asociados y no puede eliminarse.'); return }
    if (window.confirm(`¿Eliminar la categoría ${category.name}?`)) setCategories((items) => items.filter((item) => item.id !== id))
  }

  function addAccount(account: Account) {
    if (accounts.some((item) => item.name.toLowerCase() === account.name.toLowerCase())) { window.alert('Ya existe una cuenta con ese nombre.'); return }
    setAccounts((items) => [...items, account])
  }

  function deleteAccount(id: number) {
    const account = accounts.find((item) => item.id === id)
    if (!account) return
    if (movements.some((item) => item.account === account.name)) { window.alert('La cuenta tiene movimientos asociados y no puede eliminarse.'); return }
    if (window.confirm(`¿Eliminar la cuenta ${account.name}?`)) setAccounts((items) => items.filter((item) => item.id !== id))
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">FP</span><span>Finanzas Personales</span></div>
        <nav className="main-navigation" aria-label="Navegación principal">
          <NavLink className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`} to="/" end>Resumen</NavLink>
          <NavLink className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`} to="/movimientos">Movimientos</NavLink>
          <NavLink className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`} to="/categorias">Categorías</NavLink>
          <NavLink className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`} to="/cuentas">Cuentas</NavLink>
        </nav>
      </aside>
      <main className="main-content">
        {isLoading && <p className="connection-status" role="status">Cargando movimientos desde la API...</p>}
        {loadError && <p className="connection-status connection-status--error" role="alert">{loadError}</p>}
        <Routes>
          <Route path="/" element={<SummaryPage movements={movements} />} />
          <Route path="/movimientos" element={<MovementsPage movements={movements} onDelete={(id) => setMovements((items) => items.filter((item) => item.id !== id))} />} />
          <Route path="/movimientos/nuevo" element={<MovementFormPage movements={movements} categories={categories} accounts={accounts} onSave={saveMovement} />} />
          <Route path="/movimientos/:id/editar" element={<MovementFormPage movements={movements} categories={categories} accounts={accounts} onSave={saveMovement} />} />
          <Route path="/categorias" element={<CategoriesPage categories={categories} onAdd={addCategory} onDelete={deleteCategory} />} />
          <Route path="/cuentas" element={<AccountsPage accounts={accounts} movements={movements} onAdd={addAccount} onDelete={deleteAccount} />} />
          <Route path="*" element={<div className="empty-state"><h1>Página no encontrada</h1><NavLink to="/">Volver al resumen</NavLink></div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
