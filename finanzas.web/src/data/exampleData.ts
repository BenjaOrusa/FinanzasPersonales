import type { Account, Category } from '../types/finance'

export const initialCategories: Category[] = [
  { id: 1, name: 'Alimentación', type: 'expense' },
  { id: 2, name: 'Transporte', type: 'expense' },
  { id: 3, name: 'Sueldo', type: 'income' },
]

export const initialAccounts: Account[] = [
  { id: 1, name: 'Efectivo', type: 'cash' },
  { id: 2, name: 'Cuenta bancaria', type: 'bank' },
  { id: 3, name: 'Billetera virtual', type: 'wallet' },
]
