import { type FormEvent, useState } from 'react'
import type { Account, Movement } from '../types/finance'

interface AccountsPageProps { accounts: Account[]; movements: Movement[]; onAdd: (account: Omit<Account, 'id'>) => Promise<void>; onDelete: (id: number) => Promise<void> }
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const accountLabels = { cash: 'Efectivo', bank: 'Cuenta bancaria', wallet: 'Billetera virtual' }

function AccountsPage({ accounts, movements, onAdd, onDelete }: AccountsPageProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<Account['type']>('cash')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!name.trim()) return
    try { setIsSaving(true); setError(''); await onAdd({ name: name.trim(), type }); setName('') }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la cuenta.') }
    finally { setIsSaving(false) }
  }
  async function remove(id: number) {
    try { setError(''); await onDelete(id) }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la cuenta.') }
  }
  // El saldo siempre se deriva de movimientos; no existe un campo editable de saldo.
  function balance(account: Account) { return movements.filter((item) => item.account === account.name).reduce((total, item) => total + (item.type === 'income' ? item.amount : -item.amount), 0) }

  return (
    <><header className="page-header"><div><p className="page-eyebrow">Organización</p><h1>Cuentas</h1><p className="page-description">Administrá dónde guardás tu dinero.</p></div></header>
      {error && <p className="connection-status connection-status--error" role="alert">{error}</p>}
      <div className="management-grid"><form className="form-panel compact-form" onSubmit={submit}><h2>Nueva cuenta</h2><label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} required /></label><label>Tipo<select value={type} onChange={(event) => setType(event.target.value as Account['type'])}><option value="cash">Efectivo</option><option value="bank">Cuenta bancaria</option><option value="wallet">Billetera virtual</option></select></label><button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cuenta'}</button></form>
        <section className="account-list" aria-label="Cuentas disponibles">{accounts.map((item) => <article className="account-card" key={item.id}><div><p>{accountLabels[item.type]}</p><h2>{item.name}</h2></div><strong>{money.format(balance(item))}</strong><button type="button" onClick={() => remove(item.id)}>Eliminar</button></article>)}</section></div>
    </>
  )
}
export default AccountsPage
