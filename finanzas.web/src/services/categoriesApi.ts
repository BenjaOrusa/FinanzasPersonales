import type { Category } from '../types/finance'

interface CategoriaRespuesta { ID_Categoria: number; Descripcion: string; TipoCategoria: 'Ingreso' | 'Gasto'; Activa: boolean }
const URL = 'https://localhost:7097/api/categorias'
const adaptar = (item: CategoriaRespuesta): Category => ({ id: item.ID_Categoria, name: item.Descripcion, type: item.TipoCategoria === 'Ingreso' ? 'income' : 'expense' })

export async function obtenerCategorias(signal?: AbortSignal): Promise<Category[]> {
  const response = await fetch(URL, { signal })
  if (!response.ok) throw new Error(`No se pudieron cargar las categorías (${response.status}).`)
  return ((await response.json()) as CategoriaRespuesta[]).map(adaptar)
}

export async function crearCategoria(category: Omit<Category, 'id'>): Promise<Category> {
  const response = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ Descripcion: category.name, TipoCategoria: category.type === 'income' ? 'Ingreso' : 'Gasto' }) })
  if (!response.ok) throw new Error(`No se pudo crear la categoría (${response.status}).`)
  return adaptar((await response.json()) as CategoriaRespuesta)
}

export async function eliminarCategoria(id: number): Promise<void> {
  const response = await fetch(`${URL}/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(response.status === 409 ? 'La categoría tiene movimientos asociados.' : `No se pudo eliminar la categoría (${response.status}).`)
}
