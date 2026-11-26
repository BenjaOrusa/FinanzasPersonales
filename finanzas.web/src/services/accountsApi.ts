import type { Account } from '../types/finance'
import {
  getConfig,
  loadLocalAccounts,
  loadAllLocalAccounts,
  saveAllLocalAccounts,
  loadAllLocalMovements,
  saveAllLocalMovements,
  getCurrentSession,
  generateLocalId,
} from './storage'
import { apiFetch, API_ENDPOINTS, parseApiError } from './apiClient'

interface CuentaRespuesta {
  AccountId: string
  Description: string
  AccountType: string
  Active: boolean
  Balance: number
  CurrencyId: string
  CurrencyDescription: string
}

function mapAccountTypeFromApi(accountType: string): Account['type'] {
  const clean = (accountType || '').replace(/\s+/g, '').toLowerCase()
  if (clean === 'cuentabancaria') return 'bank'
  if (clean === 'billeteravirtual') return 'wallet'
  return 'cash'
}

const tiposApi: Record<Account['type'], string> = {
  cash: 'Efectivo',
  bank: 'CuentaBancaria',
  wallet: 'BilleteraVirtual',
}

const adaptar = (item: CuentaRespuesta): Account => ({
  id: String(item.AccountId),
  name: item.Description,
  type: mapAccountTypeFromApi(item.AccountType),
  activa: item.Active,
  saldo: Number(item.Balance ?? 0),
  id_usuario: getCurrentSession()?.usuario?.id_usuario || '1',
  id_moneda: String(item.CurrencyId),
  currencyDescription: item.CurrencyDescription,
})

// CU07: Consultar cuentas y saldos
export async function obtenerCuentas(signal?: AbortSignal, userId?: string): Promise<Account[]> {
  const currentUserId = userId ?? getCurrentSession()?.usuario?.id_usuario
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.cuentas.base, { signal })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudieron cargar las cuentas'))
    }
    const list = ((await response.json()) as CuentaRespuesta[]).map(adaptar)
    return list
  }

  return loadLocalAccounts(currentUserId)
}

// CU04: Crear una cuenta financiera
export async function crearCuenta(account: Omit<Account, 'id'>): Promise<Account> {
  const session = getCurrentSession()
  if (session?.usuario?.id_tipo_usuario === 2) {
    throw new Error('Los usuarios administradores no tienen permisos para crear cuentas financieras según el TIF (CU04).')
  }

  const currentUserId = account.id_usuario || session?.usuario?.id_usuario || '1'
  const config = getConfig()

  if (!account.name || !account.name.trim()) {
    throw new Error('El nombre de la cuenta es obligatorio.')
  }

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.cuentas.base, {
      method: 'POST',
      body: JSON.stringify({
        Description: account.name.trim(),
        AccountType: tiposApi[account.type],
        CurrencyId: account.id_moneda,
      }),
    })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudo crear la cuenta'))
    }
    return adaptar((await response.json()) as CuentaRespuesta)
  }

  const allAccounts = loadAllLocalAccounts()
  const existe = allAccounts.some(
    (a) => a.id_usuario === currentUserId && a.name.trim().toLowerCase() === account.name.trim().toLowerCase()
  )
  if (existe) {
    throw new Error(`Ya tenés una cuenta registrada con el nombre "${account.name.trim()}".`)
  }

  const newAccount: Account = {
    ...account,
    name: account.name.trim(),
    id: generateLocalId(allAccounts.map((a) => a.id)),
    activa: true,
    id_usuario: currentUserId,
    id_moneda: account.id_moneda || '1',
  }

  saveAllLocalAccounts([...allAccounts, newAccount])
  return newAccount
}

// CU05: Editar una cuenta financiera
export async function actualizarCuenta(
  id: string,
  datos: Partial<Omit<Account, 'id' | 'id_usuario'>>
): Promise<Account> {
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.cuentas.detalle(id), {
      method: 'PUT',
      body: JSON.stringify({
        Description: datos.name?.trim() || '',
        AccountType: datos.type ? tiposApi[datos.type] : 'Efectivo',
        CurrencyId: datos.id_moneda,
      }),
    })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudo actualizar la cuenta'))
    }
    return adaptar((await response.json()) as CuentaRespuesta)
  }

  const allAccounts = loadAllLocalAccounts()
  const accountIndex = allAccounts.findIndex((a) => a.id === id)
  if (accountIndex === -1) {
    throw new Error('La cuenta que intentás editar no existe.')
  }

  const current = allAccounts[accountIndex]
  const currentUserId = current.id_usuario

  if (datos.name && datos.name.trim().toLowerCase() !== current.name.toLowerCase()) {
    const existe = allAccounts.some(
      (a) =>
        a.id !== id &&
        a.id_usuario === currentUserId &&
        a.name.trim().toLowerCase() === datos.name!.trim().toLowerCase()
    )
    if (existe) {
      throw new Error(`Ya existe otra cuenta con el nombre "${datos.name.trim()}".`)
    }
  }

  const oldName = current.name
  const updatedAccount: Account = {
    ...current,
    ...datos,
    name: datos.name ? datos.name.trim() : current.name,
    type: datos.type || current.type,
    id_moneda: datos.id_moneda || current.id_moneda,
  }

  allAccounts[accountIndex] = updatedAccount
  saveAllLocalAccounts(allAccounts)

  if (datos.name && datos.name.trim() !== oldName) {
    const allMovements = loadAllLocalMovements()
    const updatedMovements = allMovements.map((m) => {
      if (m.accountId === id || (m.id_usuario === currentUserId && m.account === oldName)) {
        return { ...m, account: datos.name!.trim() }
      }
      return m
    })
    saveAllLocalMovements(updatedMovements)
  }

  return updatedAccount
}

// CU06: Desactivar una cuenta financiera (Baja Lógica y Reactivación)
export async function cambiarEstadoCuenta(
  id: string,
  activa: boolean,
  currentAccount?: Account
): Promise<Account> {
  const config = getConfig()

  if (config.mode === 'api') {
    const endpoint = activa
      ? API_ENDPOINTS.cuentas.activar(id)
      : API_ENDPOINTS.cuentas.desactivar(id)

    const response = await apiFetch(endpoint, { method: 'PATCH' })
    if (!response.ok) {
      if (activa && (response.status === 404 || response.status === 405)) {
        throw new Error(
          'El backend aún no implementa la reactivación de cuentas (PATCH /api/Account/{id}/activate). Solo soporta desactivación (CU06).'
        )
      }
      throw new Error(await parseApiError(response, 'No se pudo cambiar el estado de la cuenta'))
    }

    if (response.status === 204) {
      if (currentAccount) return { ...currentAccount, activa }
      const refreshed = await apiFetch(API_ENDPOINTS.cuentas.detalle(id))
      if (refreshed.ok) {
        return adaptar((await refreshed.json()) as CuentaRespuesta)
      }
      return {
        id,
        name: 'Cuenta',
        type: 'cash',
        activa,
        id_usuario: getCurrentSession()?.usuario?.id_usuario || '1',
        id_moneda: '1',
      }
    }

    return adaptar((await response.json()) as CuentaRespuesta)
  }

  const allAccounts = loadAllLocalAccounts()
  const account = allAccounts.find((a) => a.id === id)
  if (!account) {
    throw new Error('La cuenta no fue encontrada.')
  }

  account.activa = activa
  saveAllLocalAccounts(allAccounts)
  return account
}

// Eliminación física (solo permitida si no tiene movimientos asociados)
export async function eliminarCuenta(id: string): Promise<void> {
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.cuentas.detalle(id), { method: 'DELETE' })
    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        throw new Error(
          'El backend no permite eliminar cuentas físicamente (DELETE /api/Account/{id}). Usá la desactivación lógica (CU06).'
        )
      }
      throw new Error(await parseApiError(response, 'No se pudo eliminar la cuenta'))
    }
    return
  }

  const allMovements = loadAllLocalMovements()
  const account = loadAllLocalAccounts().find((a) => a.id === id)

  if (account) {
    const tieneMovimientos = allMovements.some(
      (m) => m.accountId === id || (m.id_usuario === account.id_usuario && m.account === account.name)
    )
    if (tieneMovimientos) {
      throw new Error(
        'La cuenta tiene movimientos históricos asociados. Para preservar el historial según la regla de negocio, debés usar "Desactivar cuenta" (Baja Lógica).'
      )
    }
  }

  const allAccounts = loadAllLocalAccounts()
  saveAllLocalAccounts(allAccounts.filter((a) => a.id !== id))
}
