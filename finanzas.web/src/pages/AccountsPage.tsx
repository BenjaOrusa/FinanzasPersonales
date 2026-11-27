import { type FormEvent, useState, useMemo } from 'react'
import type { Account, Movement } from '../types/finance'
import {
  MONEDAS,
  esMonedaUsd,
  obtenerCodigoMoneda,
  type Moneda,
} from '../services/currencyApi'
import {
  Landmark,
  Wallet,
  Banknote,
  PlusCircle,
  Edit2,
  PowerOff,
  Power,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react'

interface AccountsPageProps {
  accounts: Account[]
  movements: Movement[]
  currencies?: Moneda[]
  onAdd: (account: Omit<Account, 'id' | 'id_usuario'>) => Promise<void>
  onUpdate: (id: string, data: Partial<Omit<Account, 'id' | 'id_usuario'>>) => Promise<void>
  onToggleStatus: (id: string, activa: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const accountLabels: Record<Account['type'], string> = {
  cash: 'Efectivo',
  bank: 'Cuenta bancaria',
  wallet: 'Billetera virtual',
}

const accountIcons: Record<Account['type'], typeof Banknote> = {
  cash: Banknote,
  bank: Landmark,
  wallet: Wallet,
}

export default function AccountsPage({
  accounts,
  movements,
  currencies = MONEDAS,
  onAdd,
  onUpdate,
  onToggleStatus,
  onDelete,
}: AccountsPageProps) {
  const defaultArsCurrencyId =
    currencies.find((c) => c.codigo === 'ARS')?.id_moneda || currencies[0]?.id_moneda || '1'

  // Filtros de visualización
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'ARS' | 'USD'>('all')

  // Estado del formulario de Alta / Edición (CU04 / CU05)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<Account['type']>('bank')
  const [formMonedaId, setFormMonedaId] = useState<string>(defaultArsCurrencyId)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Estado del modal de Desactivación / Baja Lógica (CU06)
  const [accountToToggle, setAccountToToggle] = useState<Account | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  // Estado del modal de Eliminación física (solo sin movimientos)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estado del modal de Consulta de Saldo y Detalle (CU07)
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<Account | null>(null)

  // Mensaje general de estado / error
  const [pageMessage, setPageMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  function showMessage(text: string, type: 'success' | 'error' = 'success') {
    setPageMessage({ text, type })
    setTimeout(() => setPageMessage(null), 4500)
  }

  // CU07: Cálculo del saldo de una cuenta (Ingresos menos gastos en esa cuenta)
  function getAccountBalance(account: Account): {
    balance: number
    incomes: number
    expenses: number
    movementCount: number
  } {
    const accountMovements = movements.filter(
      (m) => m.accountId === account.id || m.account === account.name
    )
    const incomes = accountMovements
      .filter((m) => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0)
    const expenses = accountMovements
      .filter((m) => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0)

    const calculated = incomes - expenses
    return {
      balance: accountMovements.length > 0 ? calculated : account.saldo ?? calculated,
      incomes,
      expenses,
      movementCount: accountMovements.length,
    }
  }

  // Formato monetario según la moneda de la cuenta
  function formatMoney(amount: number, monedaId?: string, currencyDescription?: string) {
    if (esMonedaUsd(monedaId, currencyDescription)) {
      return `US$ ${amount.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }
    return `$ ${Math.round(amount).toLocaleString('es-AR')}`
  }

  // Filtrado de cuentas
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Filtro de estado
      if (statusFilter === 'active' && !acc.activa) return false
      if (statusFilter === 'inactive' && acc.activa) return false

      // Filtro de tipo
      if (typeFilter !== 'all' && acc.type !== typeFilter) return false

      // Filtro de moneda
      if (
        currencyFilter !== 'all' &&
        obtenerCodigoMoneda(acc.id_moneda, acc.currencyDescription) !== currencyFilter
      ) {
        return false
      }

      // Búsqueda por texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          acc.name.toLowerCase().includes(query) ||
          accountLabels[acc.type].toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [accounts, statusFilter, typeFilter, currencyFilter, searchQuery])

  // Totales de saldo consolidados por moneda (CU15 regla de no mezclar monedas directamente)
  const totalsByCurrency = useMemo(() => {
    let totalArs = 0
    let totalUsd = 0
    let countActive = 0
    let countInactive = 0

    accounts.forEach((acc) => {
      const { balance } = getAccountBalance(acc)
      if (acc.activa) countActive++
      else countInactive++

      if (esMonedaUsd(acc.id_moneda, acc.currencyDescription)) {
        totalUsd += balance
      } else {
        totalArs += balance
      }
    })

    return { totalArs, totalUsd, countActive, countInactive }
  }, [accounts, movements])

  // Abrir formulario para Nueva Cuenta (CU04)
  function handleOpenCreateForm() {
    setEditingAccount(null)
    setFormName('')
    setFormType('bank')
    setFormMonedaId(defaultArsCurrencyId)
    setFormError('')
    setIsFormOpen(true)
  }

  // Abrir formulario para Editar Cuenta (CU05)
  function handleOpenEditForm(account: Account) {
    setEditingAccount(account)
    setFormName(account.name)
    setFormType(account.type)
    setFormMonedaId(account.id_moneda || defaultArsCurrencyId)
    setFormError('')
    setIsFormOpen(true)
  }

  // Cancelar formulario (3.a en CU04 y CU05)
  function handleCancelForm() {
    setIsFormOpen(false)
    setEditingAccount(null)
    setFormError('')
  }

  // Envío del formulario (CU04 / CU05)
  async function handleSaveAccount(event: FormEvent) {
    event.preventDefault()
    if (!formName.trim()) {
      setFormError('El nombre de la cuenta es obligatorio.')
      return
    }

    try {
      setIsSaving(true)
      setFormError('')

      if (editingAccount) {
        // CU05: Editar cuenta existente
        await onUpdate(editingAccount.id, {
          name: formName.trim(),
          type: formType,
          id_moneda: formMonedaId,
        })
        showMessage(`Cuenta "${formName.trim()}" actualizada con éxito (CU05).`, 'success')
      } else {
        // CU04: Crear nueva cuenta
        await onAdd({
          name: formName.trim(),
          type: formType,
          activa: true,
          id_moneda: formMonedaId,
        })
        showMessage(`Cuenta "${formName.trim()}" registrada y habilitada con éxito (CU04).`, 'success')
      }

      setIsFormOpen(false)
      setEditingAccount(null)
      setFormName('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar la cuenta.')
    } finally {
      setIsSaving(false)
    }
  }

  // CU06: Confirmar Baja Lógica (Desactivar o Reactivar)
  async function handleConfirmToggleStatus() {
    if (!accountToToggle) return
    try {
      setIsToggling(true)
      const nuevoEstado = !accountToToggle.activa
      await onToggleStatus(accountToToggle.id, nuevoEstado)
      showMessage(
        nuevoEstado
          ? `La cuenta "${accountToToggle.name}" ha sido reactivada.`
          : `La cuenta "${accountToToggle.name}" ha sido desactivada (Baja lógica CU06). Sus movimientos históricos se conservan.`,
        'success'
      )
      setAccountToToggle(null)
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Error al cambiar estado.', 'error')
    } finally {
      setIsToggling(false)
    }
  }

  // Confirmar Eliminación física (solo si no tiene movimientos)
  async function handleConfirmDelete() {
    if (!accountToDelete) return
    try {
      setIsDeleting(true)
      await onDelete(accountToDelete.id)
      showMessage(`Cuenta "${accountToDelete.name}" eliminada correctamente.`, 'success')
      setAccountToDelete(null)
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'No se pudo eliminar la cuenta.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="accounts-page">
      {/* Header Principal */}
      <header className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <p className="page-eyebrow">Módulo de Cuentas Financieras</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>Cuentas Financieras</h1>
            <span
              style={{
                background: '#1e293b',
                color: '#93c5fd',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Landmark size={14} /> CU04 · CU05 · CU06 · CU07
            </span>
          </div>
          <p className="page-description">
            Alta, edición, baja lógica y consulta de saldo de cuentas financieras en pesos y dólares.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="primary-button"
            onClick={handleOpenCreateForm}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <PlusCircle size={18} /> + Crear Cuenta (CU04)
          </button>
        </div>
      </header>

      {/* Notificaciones */}
      {pageMessage && (
        <div
          className={`connection-status ${
            pageMessage.type === 'error' ? 'connection-status--error' : ''
          }`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            background: pageMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: pageMessage.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pageMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{pageMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setPageMessage(null)}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tarjetas KPI de Saldos Totales por Moneda (CU15 / CU07) */}
      <section className="summary-grid" style={{ marginBottom: 28 }} aria-label="Saldos consolidados">
        <div className="summary-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="summary-card__title">Saldo Total en Cuentas (ARS)</p>
            <Banknote size={20} color="#2563eb" />
          </div>
          <div
            className={`summary-card__amount ${
              totalsByCurrency.totalArs < 0 ? 'text-negative' : 'text-positive'
            }`}
            style={{ fontSize: '1.75rem', fontWeight: 700 }}
          >
            {formatMoney(totalsByCurrency.totalArs, '1', 'Pesos Argentinos')}
          </div>
          <p className="summary-card__description">
            Moneda oficial Peso Argentino en cuentas operativas
          </p>
        </div>

        <div className="summary-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="summary-card__title">Saldo Total en Cuentas (USD)</p>
            <DollarSign size={20} color="#059669" />
          </div>
          <div
            className={`summary-card__amount ${
              totalsByCurrency.totalUsd < 0 ? 'text-negative' : 'text-positive'
            }`}
            style={{ fontSize: '1.75rem', fontWeight: 700 }}
          >
            {formatMoney(totalsByCurrency.totalUsd, '2', 'Dólar Estadounidense')}
          </div>
          <p className="summary-card__description">
            Moneda extranjera Dólar Estadounidense
          </p>
        </div>

        <div className="summary-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="summary-card__title">Estado de Cuentas</p>
            <Layers size={20} color="#7c3aed" />
          </div>
          <div className="summary-card__amount" style={{ fontSize: '1.75rem', color: '#0f172a' }}>
            {totalsByCurrency.countActive} Activas
          </div>
          <p className="summary-card__description">
            {totalsByCurrency.countInactive} inactivas (baja lógica conservada)
          </p>
        </div>
      </section>

      {/* Barra de Filtros y Búsqueda */}
      <div className="admin-controls-card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 14,
            alignItems: 'end',
          }}
        >
          {/* Búsqueda */}
          <div className="admin-control-group">
            <label htmlFor="account-search" className="admin-control-label">
              <Search size={15} /> Buscar Cuenta
            </label>
            <input
              id="account-search"
              type="text"
              className="admin-select"
              placeholder="Ej.: Galicia, Mercado Pago, Efectivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filtro de Estado (CU06 / CU07) */}
          <div className="admin-control-group">
            <label htmlFor="status-filter" className="admin-control-label">
              <Filter size={15} /> Estado de Habilitación
            </label>
            <select
              id="status-filter"
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">Todas las cuentas</option>
              <option value="active">Solo Cuentas Activas</option>
              <option value="inactive">Solo Cuentas Inactivas (Baja Lógica)</option>
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div className="admin-control-group">
            <label htmlFor="type-filter" className="admin-control-label">
              Tipo de Fondo
            </label>
            <select
              id="type-filter"
              className="admin-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="cash">Efectivo</option>
              <option value="bank">Cuenta bancaria</option>
              <option value="wallet">Billetera virtual</option>
            </select>
          </div>

          {/* Filtro de Moneda */}
          <div className="admin-control-group">
            <label htmlFor="currency-filter" className="admin-control-label">
              Moneda de Operación
            </label>
            <select
              id="currency-filter"
              className="admin-select"
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value as 'all' | 'ARS' | 'USD')}
            >
              <option value="all">Todas las monedas</option>
              <option value="ARS">Pesos Argentinos (ARS)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE ALTA / EDICIÓN MODAL O EN PANEL (CU04 / CU05) */}
      {isFormOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                {editingAccount ? `Editar Cuenta "${editingAccount.name}" (CU05)` : 'Nueva Cuenta Financiera (CU04)'}
              </h3>
              <button
                type="button"
                onClick={handleCancelForm}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                title="Cerrar formulario (3.a)"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <p className="connection-status connection-status--error" style={{ marginBottom: 16 }}>
                {formError}
              </p>
            )}

            <form onSubmit={handleSaveAccount}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label>
                  <span style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.875rem' }}>
                    Nombre de la cuenta *
                  </span>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej.: Banco Galicia, Billetera MP, Caja Fuerte..."
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: '0.9rem',
                    }}
                  />
                </label>

                <label>
                  <span style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.875rem' }}>
                    Tipo de cuenta *
                  </span>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as Account['type'])}
                    className="admin-select"
                  >
                    <option value="cash">💵 Efectivo (Billetes físicos, caja chica)</option>
                    <option value="bank">🏦 Cuenta bancaria (Caja de ahorro, Cta corriente)</option>
                    <option value="wallet">📱 Billetera virtual (Mercado Pago, Ualá, etc.)</option>
                  </select>
                </label>

                <label>
                  <span style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.875rem' }}>
                    Moneda de la cuenta * (TIF: id_moneda)
                  </span>
                  <select
                    value={formMonedaId}
                    onChange={(e) => setFormMonedaId(e.target.value)}
                    className="admin-select"
                  >
                    {currencies.map((c) => (
                      <option key={c.id_moneda} value={c.id_moneda}>
                        {c.codigo === 'USD' ? '🇺🇸' : '🇦🇷'} {c.descripcion} ({c.codigo} - {c.simbolo})
                      </option>
                    ))}
                  </select>
                  <small style={{ color: '#64748b', display: 'block', marginTop: 4, fontSize: '0.75rem' }}>
                    Regla de Negocio: Los movimientos de esta cuenta operarán en la moneda seleccionada.
                  </small>
                </label>

                {editingAccount && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: 12,
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      color: '#475569',
                    }}
                  >
                    Aviso: Si modificás el nombre de la cuenta, los movimientos históricos existentes se sincronizarán automáticamente para mantener la coherencia.
                  </div>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancelForm}
                  disabled={isSaving}
                >
                  Cancelar (3.a)
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSaving}
                >
                  {isSaving ? 'Guardando...' : editingAccount ? 'Guardar Cambios (CU05)' : 'Crear Cuenta (CU04)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LISTADO DE CUENTAS (CU07: Consulta de saldo de cuentas) */}
      <section aria-label="Listado de Cuentas Financieras">
        {filteredAccounts.length === 0 ? (
          <div className="empty-panel" style={{ padding: 48 }}>
            <Landmark size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>No se encontraron cuentas</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b' }}>
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || currencyFilter !== 'all'
                ? 'No hay cuentas que coincidan con los filtros aplicados.'
                : 'Todavía no tenés cuentas registradas. Creá tu primera cuenta para empezar.'}
            </p>
            <button type="button" className="primary-button" onClick={handleOpenCreateForm}>
              <PlusCircle size={16} style={{ display: 'inline', marginRight: 6 }} /> Crear Primera Cuenta
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 18,
            }}
          >
            {filteredAccounts.map((account) => {
              const IconComponent = accountIcons[account.type] || Landmark
              const { balance, movementCount } = getAccountBalance(account)
              const isInactive = !account.activa

              return (
                <article
                  key={account.id}
                  className={`account-card-enhanced ${isInactive ? 'account-card-enhanced--inactive' : ''}`}
                  style={{
                    background: '#ffffff',
                    border: isInactive ? '1px dashed #cbd5e1' : '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: isInactive ? '#f1f5f9' : '#eff6ff',
                            color: isInactive ? '#94a3b8' : '#2563eb',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <IconComponent size={22} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                            {accountLabels[account.type]}
                          </span>
                          <h3 style={{ margin: '2px 0 0', fontSize: '1.1rem', color: isInactive ? '#64748b' : '#0f172a' }}>
                            {account.name}
                          </h3>
                        </div>
                      </div>

                      {/* Badges de Estado y Moneda */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span
                          className={`badge ${account.activa ? 'badge--success' : 'badge--neutral'}`}
                          style={{ fontSize: '0.725rem' }}
                        >
                          {account.activa ? '● Activa' : '○ Inactiva (Baja)'}
                        </span>
                        <span className="cotizacion-tag" style={{ fontSize: '0.7rem' }}>
                          {esMonedaUsd(account.id_moneda, account.currencyDescription)
                            ? 'USD (US$)'
                            : 'ARS ($)'}
                        </span>
                      </div>
                    </div>

                    {/* Área de Saldo (CU07: Consultar saldo) */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: 8,
                        padding: '12px 14px',
                        margin: '12px 0',
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>
                          Saldo actual calculado (CU07)
                        </span>
                        <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                          {movementCount} {movementCount === 1 ? 'movimiento' : 'movimientos'}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: balance < 0 ? '#dc2626' : '#0f172a',
                        }}
                      >
                        {formatMoney(balance, account.id_moneda, account.currencyDescription)}
                      </div>

                      {/* Alternativa 4.a: Aviso si está inactiva */}
                      {isInactive && (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: '0.725rem',
                            color: '#b45309',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <AlertTriangle size={12} /> Cuenta inactiva: historial conservado, sin nuevas operaciones.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones de la Cuenta (CU05, CU06, CU07) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: 12,
                      marginTop: 6,
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setSelectedAccountForDetail(account)}
                      style={{ fontSize: '0.8rem', fontWeight: 600 }}
                      title="Ver desglose completo de saldo y movimientos (CU07)"
                    >
                      🔍 Ver Saldo y Detalle
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* CU05: Editar */}
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '6px 10px', fontSize: '0.775rem' }}
                        onClick={() => handleOpenEditForm(account)}
                        title="Editar nombre, tipo o moneda (CU05)"
                      >
                        <Edit2 size={13} /> Editar
                      </button>

                      {/* CU06: Desactivar / Reactivar (Baja lógica) */}
                      <button
                        type="button"
                        className="secondary-button"
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.775rem',
                          color: account.activa ? '#b45309' : '#15803d',
                          borderColor: account.activa ? '#fde68a' : '#bbf7d0',
                          background: account.activa ? '#fffbeb' : '#f0fdf4',
                        }}
                        onClick={() => setAccountToToggle(account)}
                        title={
                          account.activa
                            ? 'Desactivar cuenta conservando el historial (CU06 Baja Lógica)'
                            : 'Reactivar cuenta para volver a usarla'
                        }
                      >
                        {account.activa ? <PowerOff size={13} /> : <Power size={13} />}
                        {account.activa ? 'Desactivar' : 'Reactivar'}
                      </button>

                      {/* Eliminación física (solo si movementCount === 0) */}
                      {movementCount === 0 && (
                        <button
                          type="button"
                          className="delete-link"
                          style={{ fontSize: '0.775rem', color: '#991b1b', padding: '4px' }}
                          onClick={() => setAccountToDelete(account)}
                          title="Eliminar cuenta sin movimientos"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* MODAL DE CONFIRMACIÓN DE BAJA LÓGICA / REACTIVACIÓN (CU06) */}
      {accountToToggle && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog" style={{ maxWidth: 480 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.2rem', color: '#0f172a' }}>
              {accountToToggle.activa
                ? '¿Desactivar cuenta financiera (Baja Lógica CU06)?'
                : '¿Reactivar cuenta financiera?'}
            </h3>

            {accountToToggle.activa ? (
              <div>
                <p style={{ color: '#334155', lineHeight: 1.5, margin: '0 0 12px' }}>
                  Vas a desactivar la cuenta <strong>"{accountToToggle.name}"</strong>.
                </p>
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: 12,
                    borderRadius: 8,
                    fontSize: '0.825rem',
                    color: '#1e40af',
                    marginBottom: 16,
                  }}
                >
                  <strong>Regla de negocio garantizada:</strong> Todo el historial de movimientos de esta cuenta se conservará de forma íntegra. La cuenta no aparecerá disponible para nuevos registros, pero sus saldos e informes pasados permanecerán inalterados.
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Saldo actual a conservar:{' '}
                  <strong>
                    {formatMoney(
                      getAccountBalance(accountToToggle).balance,
                      accountToToggle.id_moneda,
                      accountToToggle.currencyDescription
                    )}
                  </strong>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#334155', lineHeight: 1.5, margin: '0 0 12px' }}>
                  ¿Deseás reactivar la cuenta <strong>"{accountToToggle.name}"</strong>? Volverá a estar disponible para registrar nuevos ingresos y gastos.
                </p>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setAccountToToggle(null)}
                disabled={isToggling}
              >
                Cancelar (5.a)
              </button>
              <button
                type="button"
                className={accountToToggle.activa ? 'delete-button' : 'primary-button'}
                onClick={handleConfirmToggleStatus}
                disabled={isToggling}
              >
                {isToggling
                  ? 'Procesando...'
                  : accountToToggle.activa
                  ? 'Confirmar Desactivación (Baja Lógica)'
                  : 'Confirmar Reactivación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONSULTA DE SALDO Y DETALLE (CU07) */}
      {selectedAccountForDetail && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Landmark size={24} color="#2563eb" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
                    {selectedAccountForDetail.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Consulta de Saldo y Composición (CU07)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccountForDetail(null)}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tarjeta de Saldo */}
            <div
              style={{
                background: selectedAccountForDetail.activa ? '#f8fafc' : '#fffbeb',
                border: selectedAccountForDetail.activa ? '1px solid #e2e8f0' : '1px solid #fef3c7',
                borderRadius: 10,
                padding: 18,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Saldo Actual Calculado</span>
                <span
                  className={`badge ${
                    selectedAccountForDetail.activa ? 'badge--success' : 'badge--neutral'
                  }`}
                >
                  {selectedAccountForDetail.activa ? 'Activa' : 'Inactiva (CU07 4.a)'}
                </span>
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  margin: '8px 0',
                  color: getAccountBalance(selectedAccountForDetail).balance < 0 ? '#dc2626' : '#0f172a',
                }}
              >
                {formatMoney(
                  getAccountBalance(selectedAccountForDetail).balance,
                  selectedAccountForDetail.id_moneda,
                  selectedAccountForDetail.currencyDescription
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Moneda:{' '}
                <strong>
                  {esMonedaUsd(
                    selectedAccountForDetail.id_moneda,
                    selectedAccountForDetail.currencyDescription
                  )
                    ? 'Dólares Estadounidenses (USD)'
                    : 'Pesos Argentinos (ARS)'}
                </strong>{' '}
                · Tipo: <strong>{accountLabels[selectedAccountForDetail.type]}</strong>
              </div>
            </div>

            {/* Desglose de Ingresos y Gastos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={14} /> Total Ingresos
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#15803d', display: 'block', marginTop: 4 }}>
                  +
                  {formatMoney(
                    getAccountBalance(selectedAccountForDetail).incomes,
                    selectedAccountForDetail.id_moneda,
                    selectedAccountForDetail.currencyDescription
                  )}
                </strong>
              </div>

              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingDown size={14} /> Total Gastos
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#dc2626', display: 'block', marginTop: 4 }}>
                  -
                  {formatMoney(
                    getAccountBalance(selectedAccountForDetail).expenses,
                    selectedAccountForDetail.id_moneda,
                    selectedAccountForDetail.currencyDescription
                  )}
                </strong>
              </div>
            </div>

            {/* Movimientos recientes asociados a esta cuenta */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#334155', margin: '0 0 8px' }}>
                Últimos movimientos en esta cuenta
              </h4>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                {movements.filter(
                  (m) =>
                    m.accountId === selectedAccountForDetail.id ||
                    m.account === selectedAccountForDetail.name
                ).length === 0 ? (
                  <p style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                    Sin movimientos registrados en esta cuenta.
                  </p>
                ) : (
                  <table className="data-table" style={{ fontSize: '0.8rem', margin: 0 }}>
                    <tbody>
                      {movements
                        .filter(
                          (m) =>
                            m.accountId === selectedAccountForDetail.id ||
                            m.account === selectedAccountForDetail.name
                        )
                        .slice(0, 5)
                        .map((m) => (
                          <tr key={m.id}>
                            <td>{m.date}</td>
                            <td style={{ fontWeight: 600 }}>{m.description}</td>
                            <td>{m.category}</td>
                            <td
                              style={{
                                textAlign: 'right',
                                fontWeight: 700,
                                color: m.type === 'income' ? '#16a34a' : '#dc2626',
                              }}
                            >
                              {m.type === 'income' ? '+' : '-'}
                              {formatMoney(
                                m.amount,
                                selectedAccountForDetail.id_moneda,
                                selectedAccountForDetail.currencyDescription
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSelectedAccountForDetail(null)}
              >
                Cerrar consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN FÍSICA (CUENTAS SIN MOVIMIENTOS) */}
      {accountToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <h3 style={{ margin: '0 0 12px', color: '#991b1b' }}>¿Eliminar cuenta permanentemente?</h3>
            <p>
              ¿Estás seguro de que deseás eliminar la cuenta <strong>"{accountToDelete.name}"</strong>?
              Esta cuenta no tiene movimientos asociados y será removida de tus registros.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setAccountToDelete(null)}
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
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
