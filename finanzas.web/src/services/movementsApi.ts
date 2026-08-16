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

export async function obtenerMovimientos(signal?: AbortSignal): Promise<Movement[]> {
  const response = await fetch(MOVIMIENTOS_URL, { signal })

  // fetch solo rechaza problemas de red; los estados 4xx y 5xx deben comprobarse.
  if (!response.ok) {
    throw new Error(`La API respondió con el código ${response.status}.`)
  }

  const data = (await response.json()) as MovimientoRespuesta[]

  // Esta adaptación mantiene el contrato HTTP separado del modelo visual de React.
  return data.map((item) => ({
    id: item.ID_Movimiento,
    description: item.Descripcion,
    amount: item.Importe,
    date: item.Fecha,
    type: item.TipoMovimiento === 'Ingreso' ? 'income' : 'expense',
    category: item.Categoria,
    account: item.Cuenta,
    note: item.Nota ?? undefined,
  }))
}
