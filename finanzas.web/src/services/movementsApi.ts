import type { Movement } from '../types/finance'
import { apiRequest } from './apiClient'

// Este tipo reproduce el contrato público de MovementResponseDTO.
interface MovementResponse {
  MovementId: string
  Description: string
  Amount: number
  Date: string
  MovementType: 'Ingreso' | 'Gasto'
  CategoryId: string
  Category: string
  AccountId: string
  Account: string
  AdditionalInformation: string | null
}

const MOVEMENTS_PATH = '/api/Movement'

export interface GuardarMovimiento {
  description: string
  amount: number
  date: string
  type: Movement['type']
  categoryId: string
  accountId: string
  note?: string
}

function adaptMovement(item: MovementResponse): Movement {
  return {
    id: item.MovementId,
    description: item.Description,
    amount: item.Amount,
    date: item.Date.slice(0, 10),
    type: item.MovementType === 'Ingreso' ? 'income' : 'expense',
    categoryId: item.CategoryId,
    category: item.Category,
    accountId: item.AccountId,
    account: item.Account,
    note: item.AdditionalInformation ?? undefined,
  }
}

function createBody(movement: GuardarMovimiento) {
  return JSON.stringify({
    Description: movement.description,
    Amount: movement.amount,
    Date: movement.date,
    MovementType: movement.type === 'income' ? 'Ingreso' : 'Gasto',
    CategoryId: movement.categoryId,
    AccountId: movement.accountId,
    AdditionalInformation: movement.note ?? null,
  })
}

export async function obtenerMovimientos(signal?: AbortSignal): Promise<Movement[]> {
  const response = await apiRequest<MovementResponse[]>(MOVEMENTS_PATH, { signal })
  return response.map(adaptMovement)
}

export async function crearMovimiento(movement: GuardarMovimiento): Promise<Movement> {
  const response = await apiRequest<MovementResponse>(MOVEMENTS_PATH, {
    method: 'POST', body: createBody(movement),
  })
  return adaptMovement(response)
}

export async function actualizarMovimiento(id: string, movement: GuardarMovimiento): Promise<Movement> {
  const response = await apiRequest<MovementResponse>(`${MOVEMENTS_PATH}/${id}`, {
    method: 'PUT', body: createBody(movement),
  })
  return adaptMovement(response)
}

export async function eliminarMovimiento(id: string): Promise<void> {
  await apiRequest<void>(`${MOVEMENTS_PATH}/${id}`, { method: 'DELETE' })
}
