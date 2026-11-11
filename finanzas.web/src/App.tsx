import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import SummaryPage from './pages/SummaryPage'
import AccountsPage from './pages/AccountsPage'
import CategoriesPage from './pages/CategoriesPage'
import MovementFormPage from './pages/MovementFormPage'
import MovementsPage from './pages/MovementsPage'
import type { Account, Category, Movement } from './types/finance'
import { actualizarMovimiento, crearMovimiento, eliminarMovimiento, obtenerMovimientos, type GuardarMovimiento } from './services/movementsApi'
import { crearCategoria, eliminarCategoria, obtenerCategorias } from './services/categoriesApi'
import { crearCuenta, eliminarCuenta, obtenerCuentas } from './services/accountsApi'
import './App.css'

function App() {
  // El estado vive arriba para poder compartirlo entre todas las páginas.
  const [movements, setMovements] = useState<Movement[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadData() {
      try {
        setIsLoading(true)
        setLoadError(null)
        // Las tres consultas son independientes, por eso se realizan en paralelo.
        const [apiMovements, apiCategories, apiAccounts] = await Promise.all([
          obtenerMovimientos(controller.signal), obtenerCategorias(controller.signal), obtenerCuentas(controller.signal),
        ])
        setMovements(apiMovements)
        setCategories(apiCategories)
        setAccounts(apiAccounts)
      } catch (error) {
        // AbortError ocurre normalmente cuando React desmonta el componente.
        if (error instanceof DOMException && error.name === 'AbortError') return
        setLoadError(error instanceof Error ? error.message : 'No fue posible cargar los datos.')
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadData()
    return () => controller.abort()
  }, [])

  async function saveMovement(movement: GuardarMovimiento, id?: string) {
    const saved = id ? await actualizarMovimiento(id, movement) : await crearMovimiento(movement)
    setMovements((current) => id ? current.map((item) => item.id === id ? saved : item) : [saved, ...current])
  }

  async function addCategory(category: Omit<Category, 'id'>) {
    if (categories.some((item) => item.type === category.type && item.name.toLowerCase() === category.name.toLowerCase())) { window.alert('Ya existe una categoría con ese nombre y tipo.'); return }
    const saved = await crearCategoria(category)
    setCategories((items) => [...items, saved].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function deleteCategory(id: string) {
    const category = categories.find((item) => item.id === id)
    if (!category) return
    if (movements.some((item) => item.category === category.name)) { window.alert('La categoría tiene movimientos asociados y no puede eliminarse.'); return }
    if (window.confirm(`¿Eliminar la categoría ${category.name}?`)) { await eliminarCategoria(id); setCategories((items) => items.filter((item) => item.id !== id)) }
  }

  async function addAccount(account: Omit<Account, 'id'>) {
    if (accounts.some((item) => item.name.toLowerCase() === account.name.toLowerCase())) { window.alert('Ya existe una cuenta con ese nombre.'); return }
    const saved = await crearCuenta(account)
    setAccounts((items) => [...items, saved].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function deleteAccount(id: string) {
    const account = accounts.find((item) => item.id === id)
    if (!account) return
    if (movements.some((item) => item.account === account.name)) { window.alert('La cuenta tiene movimientos asociados y no puede eliminarse.'); return }
    if (window.confirm(`¿Eliminar la cuenta ${account.name}?`)) { await eliminarCuenta(id); setAccounts((items) => items.filter((item) => item.id !== id)) }
  }

  async function deleteMovement(id: string) {
    await eliminarMovimiento(id)
    setMovements((items) => items.filter((item) => item.id !== id))
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
        {isLoading && <p className="connection-status" role="status">Cargando datos desde la API...</p>}
        {loadError && <p className="connection-status connection-status--error" role="alert">{loadError}</p>}
        <Routes>
          <Route path="/" element={<SummaryPage movements={movements} />} />
          <Route path="/movimientos" element={<MovementsPage movements={movements} onDelete={deleteMovement} />} />
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
