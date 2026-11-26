import type { Movement } from '../types/finance'
import {
  getConfig,
  loadLocalMovements,
  loadAllLocalMovements,
  saveAllLocalMovements,
  loadAllLocalAccounts,
  getCurrentSession,
  generateLocalId,
} from './storage'
import { apiFetch, API_ENDPOINTS, parseApiError } from './apiClient'
import { getCachedCurrencies } from './currencyApi'

interface MovimientoRespuesta {
  MovementId: string
  Description: string
  Amount: number
  Date: string
  MovementType: 'Ingreso' | 'Gasto'
  CategoryId: string
  CategoryDescription: string
  AccountId: string
  AccountDescription: string
  CurrencyId: string
  Note: string | null
  CreationDate: string
}

export interface GuardarMovimiento {
  description: string
  amount: number
  date: string
  type: Movement['type']
  categoryId: string
  accountId: string
  note?: string
  id_usuario?: string
}

function adaptarMovimiento(item: MovimientoRespuesta): Movement {
  const currencyId = String(item.CurrencyId)
  const currencyObj = getCachedCurrencies().find((c) => c.id_moneda === currencyId)
  return {
    id: String(item.MovementId),
    description: item.Description,
    amount: Number(item.Amount),
    date: item.Date ? String(item.Date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    type: item.MovementType === 'Ingreso' ? 'income' : 'expense',
    categoryId: String(item.CategoryId),
    category: item.CategoryDescription,
    accountId: String(item.AccountId),
    account: item.AccountDescription,
    id_moneda: currencyId,
    currencyDescription: currencyObj?.descripcion,
    note: item.Note ?? undefined,
    id_usuario: getCurrentSession()?.usuario?.id_usuario || '1',
  }
}

function crearCuerpo(movimiento: GuardarMovimiento) {
  return JSON.stringify({
    Description: movimiento.description,
    Amount: movimiento.amount,
    Date: movimiento.date,
    MovementType: movimiento.type === 'income' ? 'Ingreso' : 'Gasto',
    CategoryId: movimiento.categoryId,
    AccountId: movimiento.accountId,
    Note: movimiento.note ?? null,
  })
}

export async function obtenerMovimientos(signal?: AbortSignal, userId?: string): Promise<Movement[]> {
  const currentUserId = userId ?? getCurrentSession()?.usuario?.id_usuario
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.movimientos.filter, { signal })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudieron cargar los movimientos'))
    }
    const data = (await response.json()) as MovimientoRespuesta[]
    return data.map(adaptarMovimiento)
  }

  return loadLocalMovements(currentUserId)
}

export async function crearMovimiento(
  movimiento: GuardarMovimiento,
  categoryName?: string,
  accountName?: string
): Promise<Movement> {
  const session = getCurrentSession()
  if (session?.usuario?.id_tipo_usuario === 2) {
    throw new Error('Los usuarios administradores no tienen permisos para registrar movimientos según el TIF (CU11).')
  }

  const currentUserId = movimiento.id_usuario || session?.usuario?.id_usuario || '1'
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.movimientos.base, {
      method: 'POST',
      body: crearCuerpo(movimiento),
    })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudo registrar el movimiento'))
    }
    return adaptarMovimiento((await response.json()) as MovimientoRespuesta)
  }

  const allMovements = loadAllLocalMovements()
  const accountObj = loadAllLocalAccounts().find((a) => a.id === movimiento.accountId)
  const newMovement: Movement = {
    id: generateLocalId(allMovements.map((m) => m.id)),
    description: movimiento.description,
    amount: movimiento.amount,
    date: movimiento.date,
    type: movimiento.type,
    categoryId: movimiento.categoryId,
    category: categoryName || 'Sin categoría',
    accountId: movimiento.accountId,
    account: accountName || 'Cuenta principal',
    note: movimiento.note,
    id_usuario: currentUserId,
    id_moneda: accountObj?.id_moneda || '1',
    currencyDescription: accountObj?.currencyDescription,
  }
  saveAllLocalMovements([newMovement, ...allMovements])
  return newMovement
}

export async function actualizarMovimiento(
  id: string,
  movimiento: GuardarMovimiento,
  categoryName?: string,
  accountName?: string
): Promise<Movement> {
  const currentUserId = movimiento.id_usuario || getCurrentSession()?.usuario?.id_usuario || '1'
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.movimientos.detalle(id), {
      method: 'PUT',
      body: crearCuerpo(movimiento),
    })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudo actualizar el movimiento'))
    }
    return adaptarMovimiento((await response.json()) as MovimientoRespuesta)
  }

  const allMovements = loadAllLocalMovements()
  const existing = allMovements.find((m) => m.id === id)
  const accountObj = loadAllLocalAccounts().find((a) => a.id === movimiento.accountId)
  const updatedMovement: Movement = {
    id,
    description: movimiento.description,
    amount: movimiento.amount,
    date: movimiento.date,
    type: movimiento.type,
    categoryId: movimiento.categoryId,
    category: categoryName || existing?.category || 'Sin categoría',
    accountId: movimiento.accountId,
    account: accountName || existing?.account || 'Cuenta principal',
    note: movimiento.note,
    id_usuario: existing?.id_usuario || currentUserId,
    id_moneda: accountObj?.id_moneda || existing?.id_moneda || '1',
    currencyDescription: accountObj?.currencyDescription || existing?.currencyDescription,
  }
  const updated = allMovements.map((m) => (m.id === id ? updatedMovement : m))
  saveAllLocalMovements(updated)
  return updatedMovement
}

export async function eliminarMovimiento(id: string): Promise<void> {
  const config = getConfig()
  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.movimientos.detalle(id), { method: 'DELETE' })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudo eliminar el movimiento'))
    }
    return
  }

  const allMovements = loadAllLocalMovements()
  saveAllLocalMovements(allMovements.filter((m) => m.id !== id))
}
