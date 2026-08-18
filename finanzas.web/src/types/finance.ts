export type MovementType = 'income' | 'expense'

export interface Movement {
  id: number
  description: string
  category: string
  account: string
  date: string
  amount: number
  type: MovementType
  categoryId: number
  accountId: number
  note?: string
}

export interface Category {
  id: number
  name: string
  type: MovementType
}

export interface Account {
  id: number
  name: string
  type: 'cash' | 'bank' | 'wallet'
}
