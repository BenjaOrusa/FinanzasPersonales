import type { Account } from '../types/finance'
import { apiRequest } from './apiClient'

interface AccountResponse { AccountId: string; Description: string; AccountType: 'Efectivo' | 'CuentaBancaria' | 'BilleteraVirtual'; Active: boolean }
const PATH = '/api/Account'
const types = { Efectivo: 'cash', CuentaBancaria: 'bank', BilleteraVirtual: 'wallet' } as const
const adapt = (item: AccountResponse): Account => ({ id: item.AccountId, name: item.Description, type: types[item.AccountType] })

export async function obtenerCuentas(signal?: AbortSignal): Promise<Account[]> {
  const response = await apiRequest<AccountResponse[]>(PATH, { signal })
  return response.map(adapt)
}

export async function crearCuenta(account: Omit<Account, 'id'>): Promise<Account> {
  const apiTypes = { cash: 'Efectivo', bank: 'CuentaBancaria', wallet: 'BilleteraVirtual' }
  const response = await apiRequest<AccountResponse>(PATH, { method: 'POST', body: JSON.stringify({ Description: account.name, AccountType: apiTypes[account.type] }) })
  return adapt(response)
}

export async function eliminarCuenta(id: string): Promise<void> {
  await apiRequest<void>(`${PATH}/${id}`, { method: 'DELETE' })
}
