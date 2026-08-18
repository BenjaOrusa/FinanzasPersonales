import type { Account } from '../types/finance'

interface CuentaRespuesta { ID_Cuenta: number; Descripcion: string; TipoCuenta: 'Efectivo' | 'CuentaBancaria' | 'BilleteraVirtual'; Activa: boolean }
const URL = 'https://localhost:7097/api/cuentas'
const tipos = { Efectivo: 'cash', CuentaBancaria: 'bank', BilleteraVirtual: 'wallet' } as const
const adaptar = (item: CuentaRespuesta): Account => ({ id: item.ID_Cuenta, name: item.Descripcion, type: tipos[item.TipoCuenta] })

export async function obtenerCuentas(signal?: AbortSignal): Promise<Account[]> {
  const response = await fetch(URL, { signal })
  if (!response.ok) throw new Error(`No se pudieron cargar las cuentas (${response.status}).`)
  return ((await response.json()) as CuentaRespuesta[]).map(adaptar)
}

export async function crearCuenta(account: Omit<Account, 'id'>): Promise<Account> {
  const tiposApi = { cash: 'Efectivo', bank: 'CuentaBancaria', wallet: 'BilleteraVirtual' }
  const response = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ Descripcion: account.name, TipoCuenta: tiposApi[account.type] }) })
  if (!response.ok) throw new Error(`No se pudo crear la cuenta (${response.status}).`)
  return adaptar((await response.json()) as CuentaRespuesta)
}

export async function eliminarCuenta(id: number): Promise<void> {
  const response = await fetch(`${URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(response.status === 409 ? 'La cuenta tiene movimientos asociados.' : `No se pudo eliminar la cuenta (${response.status}).`)
}
