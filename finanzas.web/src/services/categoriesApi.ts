import type { Category } from '../types/finance'
import { apiRequest } from './apiClient'

interface CategoryResponse { CategoryId: string; Description: string; CategoryType: 'Ingreso' | 'Gasto'; Active: boolean }
const PATH = '/api/Category'
const adapt = (item: CategoryResponse): Category => ({ id: item.CategoryId, name: item.Description, type: item.CategoryType === 'Ingreso' ? 'income' : 'expense' })

export async function obtenerCategorias(signal?: AbortSignal): Promise<Category[]> {
  const response = await apiRequest<CategoryResponse[]>(PATH, { signal })
  return response.map(adapt)
}

export async function crearCategoria(category: Omit<Category, 'id'>): Promise<Category> {
  const response = await apiRequest<CategoryResponse>(PATH, { method: 'POST', body: JSON.stringify({ Description: category.name, CategoryType: category.type === 'income' ? 'Ingreso' : 'Gasto' }) })
  return adapt(response)
}

export async function eliminarCategoria(id: string): Promise<void> {
  await apiRequest<void>(`${PATH}/${id}`, { method: 'DELETE' })
}
