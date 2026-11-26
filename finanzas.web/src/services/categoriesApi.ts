import type { Category } from '../types/finance'
import {
  getConfig,
  loadLocalCategories,
  loadAllLocalCategories,
  saveAllLocalCategories,
  getCurrentSession,
  generateLocalId,
} from './storage'
import { apiFetch, API_ENDPOINTS, parseApiError } from './apiClient'

interface CategoriaRespuesta {
  CategoryId: string
  Description: string
  CategoryType: 'Ingreso' | 'Gasto'
  Active: boolean
}

const adaptar = (item: CategoriaRespuesta): Category => ({
  id: String(item.CategoryId),
  name: item.Description,
  type: item.CategoryType === 'Ingreso' ? 'income' : 'expense',
  activa: item.Active,
  id_usuario: getCurrentSession()?.usuario?.id_usuario || '1',
})

export async function obtenerCategorias(signal?: AbortSignal, userId?: string): Promise<Category[]> {
  const currentUserId = userId ?? getCurrentSession()?.usuario?.id_usuario
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.categorias.base, { signal })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudieron cargar las categorías'))
    }
    return ((await response.json()) as CategoriaRespuesta[]).map(adaptar)
  }

  return loadLocalCategories(currentUserId)
}

export async function crearCategoria(category: Omit<Category, 'id'>): Promise<Category> {
  const session = getCurrentSession()
  if (session?.usuario?.id_tipo_usuario === 2) {
    throw new Error('Los usuarios administradores no tienen permisos para crear categorías según el TIF (CU08).')
  }

  const currentUserId = category.id_usuario || session?.usuario?.id_usuario || '1'
  const config = getConfig()

  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.categorias.base, {
      method: 'POST',
      body: JSON.stringify({
        Description: category.name.trim(),
        CategoryType: category.type === 'income' ? 'Ingreso' : 'Gasto',
      }),
    })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudo crear la categoría'))
    }
    return adaptar((await response.json()) as CategoriaRespuesta)
  }

  const allCategories = loadAllLocalCategories()
  const newCat: Category = {
    ...category,
    id: generateLocalId(allCategories.map((c) => c.id)),
    activa: true,
    id_usuario: currentUserId,
  }
  saveAllLocalCategories([...allCategories, newCat])
  return newCat
}

export async function actualizarCategoria(
  id: string,
  data: Partial<Omit<Category, 'id' | 'id_usuario'>>,
  currentCategory?: Category
): Promise<Category> {
  const config = getConfig()

  if (config.mode === 'api') {
    const resolvedType = data.type ?? currentCategory?.type ?? 'expense'
    const response = await apiFetch(API_ENDPOINTS.categorias.detalle(id), {
      method: 'PUT',
      body: JSON.stringify({
        Description: (data.name ?? currentCategory?.name ?? '').trim(),
        CategoryType: resolvedType === 'income' ? 'Ingreso' : 'Gasto',
      }),
    })
    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudo actualizar la categoría'))
    }
    return adaptar((await response.json()) as CategoriaRespuesta)
  }

  const allCategories = loadAllLocalCategories()
  const existingIndex = allCategories.findIndex((c) => c.id === id)
  if (existingIndex === -1) {
    throw new Error('Categoría no encontrada.')
  }

  const updated: Category = {
    ...allCategories[existingIndex],
    ...data,
  }
  allCategories[existingIndex] = updated
  saveAllLocalCategories(allCategories)

  if (data.name) {
    const { loadAllLocalMovements, saveAllLocalMovements } = await import('./storage')
    const allMovements = loadAllLocalMovements()
    let changed = false
    const updatedMovements = allMovements.map((m) => {
      if (m.categoryId === id) {
        changed = true
        return { ...m, category: data.name! }
      }
      return m
    })
    if (changed) {
      saveAllLocalMovements(updatedMovements)
    }
  }

  return updated
}

// CU10: Desactivar categoría (Baja lógica con preservación de movimientos históricos)
export async function cambiarEstadoCategoria(
  id: string,
  activa: boolean,
  currentCategory?: Category
): Promise<Category> {
  const config = getConfig()

  if (config.mode === 'api') {
    const endpoint = activa
      ? API_ENDPOINTS.categorias.activar(id)
      : API_ENDPOINTS.categorias.desactivar(id)

    const response = await apiFetch(endpoint, { method: 'PATCH' })
    if (!response.ok) {
      if (activa && (response.status === 404 || response.status === 405)) {
        throw new Error(
          'El backend aún no implementa la reactivación de categorías (PATCH /api/Category/{id}/activate). Solo soporta desactivación (CU10).'
        )
      }
      throw new Error(await parseApiError(response, 'No se pudo cambiar el estado de la categoría'))
    }

    if (response.status === 204) {
      return currentCategory
        ? { ...currentCategory, activa }
        : {
            id,
            name: 'Categoría',
            type: 'expense',
            activa,
            id_usuario: getCurrentSession()?.usuario?.id_usuario || '1',
          }
    }

    return adaptar((await response.json()) as CategoriaRespuesta)
  }

  const allCategories = loadAllLocalCategories()
  const category = allCategories.find((c) => c.id === id)
  if (!category) {
    throw new Error('Categoría no encontrada.')
  }

  category.activa = activa
  saveAllLocalCategories(allCategories)
  return category
}

export async function eliminarCategoria(id: string): Promise<void> {
  const config = getConfig()
  if (config.mode === 'api') {
    const response = await apiFetch(API_ENDPOINTS.categorias.detalle(id), { method: 'DELETE' })
    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        throw new Error(
          'El backend no permite eliminar categorías físicamente (DELETE /api/Category/{id}). Usá la desactivación lógica (CU10).'
        )
      }
      throw new Error(await parseApiError(response, 'No se pudo eliminar la categoría'))
    }
    return
  }

  const allCategories = loadAllLocalCategories()
  saveAllLocalCategories(allCategories.filter((c) => c.id !== id))
}
