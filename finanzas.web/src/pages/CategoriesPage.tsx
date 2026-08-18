import { type FormEvent, useState } from 'react'
import type { Category, MovementType } from '../types/finance'

interface CategoriesPageProps { categories: Category[]; onAdd: (category: Omit<Category, 'id'>) => Promise<void>; onDelete: (id: number) => Promise<void> }

function CategoriesPage({ categories, onAdd, onDelete }: CategoriesPageProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<MovementType>('expense')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!name.trim()) return
    try { setIsSaving(true); setError(''); await onAdd({ name: name.trim(), type }); setName('') }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la categoría.') }
    finally { setIsSaving(false) }
  }
  async function remove(id: number) {
    try { setError(''); await onDelete(id) }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la categoría.') }
  }

  return (
    <><header className="page-header"><div><p className="page-eyebrow">Organización</p><h1>Categorías</h1><p className="page-description">Clasificá tus ingresos y gastos.</p></div></header>
      {error && <p className="connection-status connection-status--error" role="alert">{error}</p>}
      <div className="management-grid"><form className="form-panel compact-form" onSubmit={submit}><h2>Nueva categoría</h2><label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Se utiliza para<select value={type} onChange={(event) => setType(event.target.value as MovementType)}><option value="expense">Gastos</option><option value="income">Ingresos</option></select></label><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar categoría'}</button></form>
        <section className="panel"><h2>Categorías disponibles</h2><ul className="management-list">{categories.map((item) => <li key={item.id}><div><strong>{item.name}</strong><span>{item.type === 'income' ? 'Ingreso' : 'Gasto'}</span></div><button type="button" onClick={() => remove(item.id)}>Eliminar</button></li>)}</ul></section></div>
    </>
  )
}
export default CategoriesPage
