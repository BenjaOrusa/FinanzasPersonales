export type MovementType = 'income' | 'expense'

export interface Movement {
  id: string
  description: string
  category: string
  account: string
  date: string
  amount: number
  type: MovementType
  categoryId: string
  accountId: string
  note?: string
  id_usuario: string
  id_moneda?: string
  currencyDescription?: string
}

export interface Category {
  id: string
  name: string
  type: MovementType
  activa?: boolean
  id_usuario: string
}

export interface Account {
  id: string
  name: string
  type: 'cash' | 'bank' | 'wallet'
  activa: boolean
  id_usuario: string
  id_moneda: string
  currencyDescription?: string
  saldo?: number
}
