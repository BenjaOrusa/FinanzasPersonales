import { type FormEvent, useState } from 'react'
import type { Category, Movement, MovementType } from '../types/finance'
import {
  Tags,
  PlusCircle,
  Pencil,
  Power,
  Trash2,
  Info,
  X,
  Search,
} from 'lucide-react'

interface CategoriesPageProps {
  categories: Category[]
  movements: Movement[]
  onAdd: (category: Omit<Category, 'id' | 'id_usuario'>) => Promise<void>
  onUpdate: (id: string, data: Partial<Omit<Category, 'id' | 'id_usuario'>>) => Promise<void>
  onToggleStatus: (id: string, activa: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function CategoriesPage({
  categories,
  movements,
  onAdd,
  onUpdate,
  onToggleStatus,
  onDelete,
}: CategoriesPageProps) {
  // Estado para crear nueva categoría (CU08)
  const [name, setName] = useState('')
  const [type, setType] = useState<MovementType>('expense')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Estado para editar categoría (CU09)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<MovementType>('expense')
  const [isUpdating, setIsUpdating] = useState(false)
  const [editError, setEditError] = useState('')

  // Estado para baja lógica / desactivación (CU10)
  const [categoryToToggle, setCategoryToToggle] = useState<{
    category: Category
    targetStatus: boolean
  } | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  // Estado para eliminación física (solo si no tiene movimientos)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // CU08: Alta de categoría
  async function submit(event: FormEvent) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) return

    // Validar nombre único para el mismo tipo y usuario
    if (
      categories.some(
        (c) => c.type === type && c.name.toLowerCase() === cleanName.toLowerCase()
      )
    ) {
      setError(`Ya existe una categoría de tipo ${type === 'income' ? 'Ingreso' : 'Gasto'} llamada "${cleanName}".`)
      return
    }

    try {
      setIsSaving(true)
      setError('')
      await onAdd({ name: cleanName, type, activa: true })
      setName('')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la categoría.')
    } finally {
      setIsSaving(false)
    }
  }

  // CU09: Abrir modal de edición
  function handleOpenEdit(cat: Category) {
    setEditingCategory(cat)
    setEditName(cat.name)
    setEditType(cat.type)
    setEditError('')
  }

  // CU09: Guardar cambios de edición
  async function handleConfirmEdit(event: FormEvent) {
    event.preventDefault()
    if (!editingCategory) return
    const cleanName = editName.trim()
    if (!cleanName) {
      setEditError('El nombre no puede estar vacío.')
      return
    }

    // Regla de negocio CU09.4: Validar unicidad (que no colisione con otra del mismo tipo)
    const duplicate = categories.find(
      (c) =>
        c.id !== editingCategory.id &&
        c.type === editType &&
        c.name.toLowerCase() === cleanName.toLowerCase()
    )
    if (duplicate) {
      setEditError(`Ya existe otra categoría de tipo ${editType === 'income' ? 'Ingreso' : 'Gasto'} llamada "${cleanName}".`)
      return
    }

    try {
      setIsUpdating(true)
      setEditError('')
      await onUpdate(editingCategory.id, {
        name: cleanName,
        type: editType,
      })
      setEditingCategory(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al actualizar la categoría.')
    } finally {
      setIsUpdating(false)
    }
  }

  // CU10: Confirmar cambio de estado (Baja lógica / Reactivación)
  async function handleConfirmToggleStatus() {
    if (!categoryToToggle) return
    try {
      setIsToggling(true)
      setError('')
      await onToggleStatus(categoryToToggle.category.id, categoryToToggle.targetStatus)
      setCategoryToToggle(null)
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : 'No se pudo cambiar el estado de la categoría.'
      )
    } finally {
      setIsToggling(false)
    }
  }

  // Eliminación física (solo sin movimientos)
  async function handleConfirmDelete() {
    if (!categoryToDelete) return
    try {
      setIsDeleting(true)
      setError('')
      await onDelete(categoryToDelete.id)
      setCategoryToDelete(null)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la categoría.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  // Obtener cantidad de movimientos asociados a cada categoría
  function getMovementsCount(cat: Category): number {
    return movements.filter((m) => m.categoryId === cat.id || m.category === cat.name).length
  }

  // Filtrado de la lista
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || cat.type === typeFilter
    const isActive = cat.activa !== false
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive)
    return matchesSearch && matchesType && matchesStatus
  })

  const totalActivas = categories.filter((c) => c.activa !== false).length
  const totalInactivas = categories.filter((c) => c.activa === false).length
  const totalGastos = categories.filter((c) => c.type === 'expense').length
  const totalIngresos = categories.filter((c) => c.type === 'income').length

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Organización Financiera</p>
          <h1>Módulo de Categorías</h1>
          <p className="page-description">
            Administrá tus categorías para clasificar gastos e ingresos. Cumple con los casos de uso{' '}
            <strong>CU08</strong> (Crear), <strong>CU09</strong> (Editar) y <strong>CU10</strong> (Baja lógica).
          </p>
        </div>
      </header>

      {/* Tarjetas informativas de categorías - Responsive */}
      <div className="categories-summary-grid">
        <div className="summary-card" style={{ padding: 18 }}>
          <p className="summary-card__title">Total Categorías</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 750, color: '#0f172a' }}>{categories.length}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({totalActivas} activas)</span>
          </div>
        </div>

        <div className="summary-card" style={{ padding: 18 }}>
          <p className="summary-card__title">Gastos</p>
          <span style={{ fontSize: '1.75rem', fontWeight: 750, color: '#dc2626', display: 'block', marginTop: 4 }}>
            {totalGastos}
          </span>
        </div>

        <div className="summary-card" style={{ padding: 18 }}>
          <p className="summary-card__title">Ingresos</p>
          <span style={{ fontSize: '1.75rem', fontWeight: 750, color: '#16a34a', display: 'block', marginTop: 4 }}>
            {totalIngresos}
          </span>
        </div>

        <div className="summary-card" style={{ padding: 18 }}>
          <p className="summary-card__title">Baja Lógica (Inactivas)</p>
          <span style={{ fontSize: '1.75rem', fontWeight: 750, color: '#94a3b8', display: 'block', marginTop: 4 }}>
            {totalInactivas}
          </span>
        </div>
      </div>

      {error && (
        <div className="connection-status connection-status--error" role="alert" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="management-grid">
        {/* FORMULARIO DE ALTA (CU08) */}
        <form className="form-panel compact-form" onSubmit={submit}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.15rem' }}>
            <PlusCircle size={20} color="#2563eb" /> Nueva categoría (CU08)
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: -8, marginBottom: 8 }}>
            El nombre debe ser único por usuario y tipo.
          </p>

          <label>
            Nombre de la categoría
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej.: Gimnasio, Netflix, Supermercado..."
              required
            />
          </label>

          <label>
            Tipo de movimiento (Regla de negocio 8)
            <select
              value={type}
              onChange={(event) => setType(event.target.value as MovementType)}
            >
              <option value="expense"> Gasto (Salida de dinero)</option>
              <option value="income"> Ingreso (Entrada de dinero)</option>
            </select>
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={isSaving}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}
          >
            <Tags size={16} />
            {isSaving ? 'Guardando...' : 'Crear categoría (CU08)'}
          </button>
        </form>

        {/* LISTADO Y GESTIÓN DE CATEGORÍAS (CU08, CU09, CU10) */}
        <section className="panel" style={{ marginTop: 0 }}>
          <div className="categories-panel-header">
            <div className="categories-title-area">
              <h2>Categorías del Usuario ({filteredCategories.length})</h2>
              <p>Aislamiento estricto: solo vos podés consultar y gestionar tus categorías.</p>
            </div>

            {/* Barra de filtros rápidos - Responsive */}
            <div className="categories-filters-bar">
              <div className="categories-search-box">
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  placeholder="Buscar categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="categories-filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                aria-label="Filtrar por tipo"
              >
                <option value="all">Todos los tipos</option>
                <option value="expense">Solo Gastos</option>
                <option value="income">Solo Ingresos</option>
              </select>

              <select
                className="categories-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Filtrar por estado"
              >
                <option value="all">Todas</option>
                <option value="active">Solo Activas</option>
                <option value="inactive">Solo Inactivas (Baja Lógica)</option>
              </select>
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: 8 }}>
              No se encontraron categorías con los filtros seleccionados.
            </div>
          ) : (
            <ul className="categories-cards-list">
              {filteredCategories.map((item) => {
                const isActive = item.activa !== false
                const countMov = getMovementsCount(item)

                return (
                  <li
                    key={item.id}
                    className={`category-card-item ${!isActive ? 'category-card-item--inactive' : ''}`}
                  >
                    <div className="category-card-main">
                      <div
                        className={`category-type-icon ${
                          item.type === 'income'
                            ? 'category-type-icon--income'
                            : 'category-type-icon--expense'
                        }`}
                        title={item.type === 'income' ? 'Ingreso' : 'Gasto'}
                      >
                        {item.type === 'income' ? '↗' : '↘'}
                      </div>

                      <div className="category-info-col">
                        <div className="category-title-tags-row">
                          <strong
                            className="category-item-name"
                            style={{
                              color: isActive ? '#0f172a' : '#64748b',
                              textDecoration: isActive ? 'none' : 'line-through',
                            }}
                          >
                            {item.name}
                          </strong>

                          <span className={`tag-type tag-type--${item.type}`}>
                            {item.type === 'income' ? 'Ingreso' : 'Gasto'}
                          </span>

                          {!isActive && (
                            <span
                              style={{
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #cbd5e1',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: '0.72rem',
                                fontWeight: 650,
                              }}
                            >
                              Inactiva (Baja lógica)
                            </span>
                          )}
                        </div>

                        <div className="category-card-meta">
                          <span>
                            {countMov === 0
                              ? 'Sin movimientos'
                              : `${countMov} movimiento${countMov > 1 ? 's' : ''}`}
                          </span>
                          <span>•</span>
                          <span>ID: {item.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones de la categoría: CU09, CU10 y eliminación */}
                    <div className="category-card-actions">
                      {/* CU09: Botón Editar */}
                      <button
                        type="button"
                        className="cat-btn cat-btn--edit"
                        onClick={() => handleOpenEdit(item)}
                        title="Modificar nombre o tipo (CU09)"
                      >
                        <Pencil size={13} />
                        <span>Editar</span>
                      </button>

                      {/* CU10: Desactivar / Reactivar (Baja Lógica) */}
                      <button
                        type="button"
                        className={`cat-btn ${
                          isActive ? 'cat-btn--deactivate' : 'cat-btn--reactivate'
                        }`}
                        onClick={() =>
                          setCategoryToToggle({
                            category: item,
                            targetStatus: !isActive,
                          })
                        }
                        title={
                          isActive
                            ? 'Desactivar categoría sin borrar historial (CU10)'
                            : 'Reactivar categoría para nuevos movimientos (CU10)'
                        }
                      >
                        <Power size={13} />
                        <span>{isActive ? 'Desactivar (CU10)' : 'Reactivar'}</span>
                      </button>

                      {/* Eliminación física (solo si countMov === 0) */}
                      {countMov === 0 ? (
                        <button
                          type="button"
                          className="cat-btn cat-btn--delete"
                          onClick={() => setCategoryToDelete(item)}
                          title="Eliminar permanentemente (sin movimientos)"
                        >
                          <Trash2 size={13} />
                          <span className="sr-only">Eliminar</span>
                        </button>
                      ) : (
                        <span
                          title="No se puede eliminar físicamente porque posee movimientos registrados. Para ocultarla, use 'Desactivar' (Baja Lógica CU10)."
                          style={{
                            color: '#94a3b8',
                            fontSize: '0.75rem',
                            padding: '4px 6px',
                            cursor: 'help',
                            alignSelf: 'center',
                          }}
                        >
                          (En uso)
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ============================================================ */}
      {/* MODAL PARA EDITAR CATEGORÍA (CU09)                          */}
      {/* ============================================================ */}
      {editingCategory && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-edit-title">
          <div className="modal-dialog" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 id="modal-edit-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pencil size={18} color="#2563eb" /> Editar Categoría (CU09)
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 16 }}>
              Modificá la descripción o el tipo. Los movimientos históricos conservarán la asociación con esta categoría.
            </p>

            {editError && (
              <div className="connection-status connection-status--error" style={{ marginBottom: 16 }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleConfirmEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: '0.875rem' }}>
                Nombre / Descripción:
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nombre de la categoría"
                  required
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 600, fontSize: '0.875rem' }}>
                Tipo de movimiento:
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as MovementType)}
                >
                  <option value="expense">Gasto (Salida)</option>
                  <option value="income">Ingreso (Entrada)</option>
                </select>
              </label>

              {getMovementsCount(editingCategory) > 0 && (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: 10,
                    borderRadius: 6,
                    fontSize: '0.8rem',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Info size={16} style={{ flexShrink: 0 }} />
                  <span>
                    Esta categoría tiene <strong>{getMovementsCount(editingCategory)} movimientos</strong> asociados. Al guardar, el nombre se sincronizará automáticamente para mantener la consistencia histórica.
                  </span>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditingCategory(null)}
                  disabled={isUpdating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isUpdating}
                  style={{ minWidth: 140 }}
                >
                  {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PARA BAJA LÓGICA / DESACTIVAR (CU10)                  */}
      {/* ============================================================ */}
      {categoryToToggle && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-toggle-title">
          <div className="modal-dialog" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 id="modal-toggle-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Power size={18} color={categoryToToggle.targetStatus ? '#16a34a' : '#d97706'} />
                {categoryToToggle.targetStatus ? 'Reactivar Categoría' : 'Desactivar Categoría (Baja Lógica CU10)'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryToToggle(null)}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 16 }}>
              {categoryToToggle.targetStatus ? (
                <>
                  ¿Deseás reactivar la categoría <strong>"{categoryToToggle.category.name}"</strong>? Volverá a estar disponible de inmediato al crear nuevos ingresos o gastos.
                </>
              ) : (
                <>
                  ¿Seguro que deseás desactivar la categoría <strong>"{categoryToToggle.category.name}"</strong>?
                  <br />
                  <br />
                  <strong style={{ color: '#0f172a' }}>Regla de Negocio 9 (Preservación Histórica):</strong>
                  <br />
                  Los movimientos previamente registrados asociados a esta categoría{' '}
                  <span style={{ color: '#15803d', fontWeight: 700 }}>NO se borrarán</span> ni perderán su clasificación. La categoría simplemente dejará de estar disponible para registrar futuros movimientos.
                </>
              )}
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setCategoryToToggle(null)}
                disabled={isToggling}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={categoryToToggle.targetStatus ? 'primary-button' : 'delete-button'}
                style={{
                  background: categoryToToggle.targetStatus ? '#16a34a' : '#d97706',
                  color: '#ffffff',
                }}
                onClick={handleConfirmToggleStatus}
                disabled={isToggling}
              >
                {isToggling
                  ? 'Procesando...'
                  : categoryToToggle.targetStatus
                  ? 'Sí, reactivar categoría'
                  : 'Sí, desactivar categoría (Baja Lógica)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PARA ELIMINACIÓN FÍSICA (SIN MOVIMIENTOS)              */}
      {/* ============================================================ */}
      {categoryToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-category-title">
          <div className="modal-dialog">
            <h3 id="modal-category-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
              <Trash2 size={20} /> ¿Eliminar categoría permanentemente?
            </h3>
            <p>
              ¿Seguro que deseás eliminar permanentemente la categoría <strong>"{categoryToDelete.name}"</strong>?
              <br />
              <br />
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Esta categoría no tiene ningún movimiento asociado, por lo que puede eliminarse de forma segura sin afectar saldos ni reportes.
              </span>
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CategoriesPage
