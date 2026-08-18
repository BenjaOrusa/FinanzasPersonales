import type { Movement } from '../types/finance'

// Este tipo reproduce exactamente el contrato JSON publicado por ASP.NET Core.
interface MovimientoRespuesta {
  ID_Movimiento: number
  Descripcion: string
  Importe: number
  Fecha: string
  TipoMovimiento: 'Ingreso' | 'Gasto'
  ID_Categoria: number
  Categoria: string
  ID_Cuenta: number
  Cuenta: string
  Nota: string | null
}

const MOVIMIENTOS_URL = 'https://localhost:7097/api/movimientos'

export interface GuardarMovimiento {
  description: string
  amount: number
  date: string
  type: Movement['type']
  categoryId: number
  accountId: number
  note?: string
}

function adaptarMovimiento(item: MovimientoRespuesta): Movement {
  return {
    id: item.ID_Movimiento,
    description: item.Descripcion,
    amount: item.Importe,
    date: item.Fecha,
    type: item.TipoMovimiento === 'Ingreso' ? 'income' : 'expense',
    categoryId: item.ID_Categoria,
    category: item.Categoria,
    accountId: item.ID_Cuenta,
    account: item.Cuenta,
    note: item.Nota ?? undefined,
  }
}

function crearCuerpo(movimiento: GuardarMovimiento) {
  return JSON.stringify({
    Descripcion: movimiento.description,
    Importe: movimiento.amount,
    Fecha: movimiento.date,
    TipoMovimiento: movimiento.type === 'income' ? 'Ingreso' : 'Gasto',
    ID_Categoria: movimiento.categoryId,
    ID_Cuenta: movimiento.accountId,
    Nota: movimiento.note ?? null,
  })
}

export async function obtenerMovimientos(signal?: AbortSignal): Promise<Movement[]> {
  const response = await fetch(MOVIMIENTOS_URL, { signal })

  // fetch solo rechaza problemas de red; los estados 4xx y 5xx deben comprobarse.
  if (!response.ok) {
    throw new Error(`La API respondió con el código ${response.status}.`)
  }

  const data = (await response.json()) as MovimientoRespuesta[]

  // Esta adaptación mantiene el contrato HTTP separado del modelo visual de React.
  return data.map(adaptarMovimiento)
}

export async function crearMovimiento(movimiento: GuardarMovimiento): Promise<Movement> {
  const response = await fetch(MOVIMIENTOS_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: crearCuerpo(movimiento),
  })
  if (!response.ok) throw new Error(`No se pudo crear el movimiento (${response.status}).`)
  return adaptarMovimiento((await response.json()) as MovimientoRespuesta)
}

export async function actualizarMovimiento(id: number, movimiento: GuardarMovimiento): Promise<Movement> {
  const response = await fetch(`${MOVIMIENTOS_URL}/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: crearCuerpo(movimiento),
  })
  if (!response.ok) throw new Error(`No se pudo actualizar el movimiento (${response.status}).`)
  return adaptarMovimiento((await response.json()) as MovimientoRespuesta)
}

export async function eliminarMovimiento(id: number): Promise<void> {
  const response = await fetch(`${MOVIMIENTOS_URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(`No se pudo eliminar el movimiento (${response.status}).`)
}
