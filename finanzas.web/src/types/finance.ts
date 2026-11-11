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
}

export interface Category {
  id: string
  name: string
  type: MovementType
}

export interface Account {
  id: string
  name: string
  type: 'cash' | 'bank' | 'wallet'
}
