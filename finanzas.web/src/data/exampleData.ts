import type { Account, Category, Movement } from '../types/finance'

// Estos datos solo permiten probar el frontend; más adelante llegarán desde la API.
export const initialMovements: Movement[] = [
  { id: 1, description: 'Supermercado', category: 'Alimentación', account: 'Efectivo', date: '2026-08-15', amount: 25000, type: 'expense' },
  { id: 2, description: 'Sueldo', category: 'Sueldo', account: 'Cuenta bancaria', date: '2026-08-10', amount: 400000, type: 'income' },
  { id: 3, description: 'Transporte', category: 'Transporte', account: 'Billetera virtual', date: '2026-08-08', amount: 5000, type: 'expense' },
]

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
