import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Account, Category, Movement, MovementType } from '../types/finance'

interface MovementFormPageProps { movements: Movement[]; categories: Category[]; accounts: Account[]; onSave: (movement: Movement) => void }

function MovementFormPage({ movements, categories, accounts, onSave }: MovementFormPageProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = movements.find((item) => item.id === Number(id))
  const [type, setType] = useState<MovementType>(existing?.type ?? 'expense')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [amount, setAmount] = useState(existing?.amount.toString() ?? '')
  const [date, setDate] = useState(existing?.date ?? new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState(existing?.category ?? '')
  const [account, setAccount] = useState(existing?.account ?? '')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!description.trim() || numericAmount <= 0 || !category || !account) { setError('Completá todos los campos obligatorios con valores válidos.'); return }
    onSave({ id: existing?.id ?? Date.now(), description: description.trim(), amount: numericAmount, date, category, account, type })
    navigate('/movimientos')
  }

  const matchingCategories = categories.filter((item) => item.type === type)
  return (
    <>
      <Link className="back-link" to="/movimientos">← Volver a movimientos</Link>
      <header className="page-header"><div><p className="page-eyebrow">Movimientos</p><h1>{existing ? 'Editar movimiento' : 'Nuevo movimiento'}</h1><p className="page-description">Los datos se conservarán durante esta ejecución.</p></div></header>
      <form className="form-panel" onSubmit={handleSubmit} noValidate>
        {error && <p className="form-error" role="alert">{error}</p>}
        <fieldset><legend>Tipo</legend><div className="segmented-control"><label><input type="radio" checked={type === 'expense'} onChange={() => { setType('expense'); setCategory('') }} /> Gasto</label><label><input type="radio" checked={type === 'income'} onChange={() => { setType('income'); setCategory('') }} /> Ingreso</label></div></fieldset>
        <label>Descripción<input required value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <div className="form-row"><label>Importe<input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label>Fecha<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div>
        <div className="form-row"><label>Categoría<select required value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Seleccionar</option>{matchingCategories.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><label>Cuenta<select required value={account} onChange={(event) => setAccount(event.target.value)}><option value="">Seleccionar</option>{accounts.map((item) => <option key={item.id}>{item.name}</option>)}</select></label></div>
        <div className="form-actions"><Link className="secondary-button" to="/movimientos">Cancelar</Link><button className="primary-button" type="submit">Guardar movimiento</button></div>
      </form>
    </>
  )
}

export default MovementFormPage
