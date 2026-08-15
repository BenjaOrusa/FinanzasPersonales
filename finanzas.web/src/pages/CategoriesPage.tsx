import { type FormEvent, useState } from 'react'
import type { Category, MovementType } from '../types/finance'

interface CategoriesPageProps { categories: Category[]; onAdd: (category: Category) => void; onDelete: (id: number) => void }

function CategoriesPage({ categories, onAdd, onDelete }: CategoriesPageProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<MovementType>('expense')
  function submit(event: FormEvent) { event.preventDefault(); if (!name.trim()) return; onAdd({ id: Date.now(), name: name.trim(), type }); setName('') }

  return (
    <><header className="page-header"><div><p className="page-eyebrow">Organización</p><h1>Categorías</h1><p className="page-description">Clasificá tus ingresos y gastos.</p></div></header>
      <div className="management-grid"><form className="form-panel compact-form" onSubmit={submit}><h2>Nueva categoría</h2><label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Se utiliza para<select value={type} onChange={(event) => setType(event.target.value as MovementType)}><option value="expense">Gastos</option><option value="income">Ingresos</option></select></label><button className="primary-button" type="submit">Guardar categoría</button></form>
        <section className="panel"><h2>Categorías disponibles</h2><ul className="management-list">{categories.map((item) => <li key={item.id}><div><strong>{item.name}</strong><span>{item.type === 'income' ? 'Ingreso' : 'Gasto'}</span></div><button type="button" onClick={() => onDelete(item.id)}>Eliminar</button></li>)}</ul></section></div>
    </>
  )
}
export default CategoriesPage
