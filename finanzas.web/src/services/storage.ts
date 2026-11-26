import type { Account, Category, Movement } from '../types/finance'
import type { Usuario, RespuestaAuth, EstadoUsuario } from '../types/auth'

export interface StorageConfig {
  mode: 'local' | 'api'
  apiUrl: string
}

const CONFIG_KEY = 'fp_config_v1'
const MOVEMENTS_KEY = 'fp_movements_v1'
const CATEGORIES_KEY = 'fp_categories_v1'
const ACCOUNTS_KEY = 'fp_accounts_v1'
const USERS_KEY = 'fp_users_v1'
const SESSION_KEY = 'fp_session_v1'

export function getConfig(): StorageConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return {
    mode: 'local',
    apiUrl: 'https://finanzaspersonales-api-h8c0ckhwdmd9ckgm.westus3-01.azurewebsites.net/api',
  }
}

export function saveConfig(config: StorageConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch (err) {
    console.error('Error saving config', err)
  }
}

export function generateLocalId(existingIds: string[]): string {
  const numericMax = existingIds.reduce((max, id) => {
    const parsed = Number(id)
    return !Number.isNaN(parsed) && Number.isFinite(parsed) ? Math.max(max, parsed) : max
  }, 0)
  return String(numericMax + 1)
}

// -------------------------------------------------------------
// USUARIOS Y SESIÓN (CU01, CU02, CU03, CU17, CU18)
// -------------------------------------------------------------

export const INITIAL_USERS: Usuario[] = [
  {
    id_usuario: '1',
    nombre: 'Matías',
    apellido: 'Soria',
    correo_electronico: 'matias.soria@email.com',
    contrasenia: 'Matias123!',
    estado: 'Activo',
    id_tipo_usuario: 1,
    tipo_descripcion: 'Común',
  },
  {
    id_usuario: '2',
    nombre: 'Benjamín',
    apellido: 'Orusa',
    correo_electronico: 'benjamin.orusa@email.com',
    contrasenia: 'Benjamin123!',
    estado: 'Activo',
    id_tipo_usuario: 1,
    tipo_descripcion: 'Común',
  },
  {
    id_usuario: '3',
    nombre: 'Administrador',
    apellido: 'General',
    correo_electronico: 'admin@finanzas.com',
    contrasenia: 'Admin123!',
    estado: 'Activo',
    id_tipo_usuario: 2,
    tipo_descripcion: 'Administrador',
  },
  {
    id_usuario: '4',
    nombre: 'Juan',
    apellido: 'Inactivo',
    correo_electronico: 'inactivo@email.com',
    contrasenia: 'Inactivo123!',
    estado: 'Inactivo',
    id_tipo_usuario: 1,
    tipo_descripcion: 'Común',
  },
  {
    id_usuario: '5',
    nombre: 'Pedro',
    apellido: 'Bloqueado',
    correo_electronico: 'bloqueado@email.com',
    contrasenia: 'Bloqueado123!',
    estado: 'Bloqueado',
    id_tipo_usuario: 1,
    tipo_descripcion: 'Común',
  },
]

function normalizeUser(u: Usuario): Usuario {
  return {
    ...u,
    id_usuario: String(u.id_usuario),
  }
}

export function loadLocalUsers(): Usuario[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) {
      const parsed: Usuario[] = JSON.parse(raw)
      return parsed.map(normalizeUser)
    }
  } catch (e) {
    console.error(e)
  }
  saveLocalUsers(INITIAL_USERS)
  return INITIAL_USERS
}

export function saveLocalUsers(users: Usuario[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map(normalizeUser)))
  } catch (e) {
    console.error(e)
  }
}

export function getCurrentSession(): RespuestaAuth | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed: RespuestaAuth = JSON.parse(raw)
      if (parsed?.usuario) {
        return {
          ...parsed,
          usuario: normalizeUser(parsed.usuario),
        }
      }
      return parsed
    }
  } catch (e) {
    console.error(e)
  }
  return null
}

export function saveCurrentSession(session: RespuestaAuth) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        ...session,
        usuario: normalizeUser(session.usuario),
      })
    )
  } catch (e) {
    console.error(e)
  }
}

export function clearCurrentSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (e) {
    console.error(e)
  }
}

// CU18: Activar, desactivar o bloquear usuario
export function updateLocalUserStatus(id_usuario: string, nuevoEstado: EstadoUsuario): Usuario {
  const users = loadLocalUsers()
  const user = users.find((u) => u.id_usuario === String(id_usuario))
  if (!user) {
    throw new Error('Usuario no encontrado.')
  }
  user.estado = nuevoEstado
  saveLocalUsers(users)

  const currentSession = getCurrentSession()
  if (currentSession && currentSession.usuario.id_usuario === String(id_usuario)) {
    currentSession.usuario.estado = nuevoEstado
    saveCurrentSession(currentSession)
  }

  const { contrasenia: _, ...userSafe } = user
  return userSafe
}

// -------------------------------------------------------------
// CUENTAS, CATEGORÍAS Y MOVIMIENTOS CON AISLAMIENTO DE USUARIO
// -------------------------------------------------------------

function getDateInMonth(monthOffset: number, day: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + monthOffset)
  d.setDate(day)
  return d.toISOString().slice(0, 10)
}

export const INITIAL_ACCOUNTS: Account[] = [
  // Cuentas de Matías (id_usuario: '1')
  { id: '1', name: 'Efectivo', type: 'cash', activa: true, id_usuario: '1', id_moneda: '1', currencyDescription: 'Pesos Argentinos' },
  { id: '2', name: 'Banco Santander', type: 'bank', activa: true, id_usuario: '1', id_moneda: '1', currencyDescription: 'Pesos Argentinos' },
  { id: '3', name: 'Mercado Pago', type: 'wallet', activa: true, id_usuario: '1', id_moneda: '1', currencyDescription: 'Pesos Argentinos' },
  { id: '15', name: 'Caja de Ahorro en Dólares', type: 'bank', activa: true, id_usuario: '1', id_moneda: '2', currencyDescription: 'Dólar Estadounidense' },

  // Cuentas de Benjamín (id_usuario: '2')
  { id: '4', name: 'Efectivo Personal', type: 'cash', activa: true, id_usuario: '2', id_moneda: '1', currencyDescription: 'Pesos Argentinos' },
  { id: '5', name: 'Banco BBVA', type: 'bank', activa: true, id_usuario: '2', id_moneda: '1', currencyDescription: 'Pesos Argentinos' },
  { id: '6', name: 'Ualá Billetera', type: 'wallet', activa: true, id_usuario: '2', id_moneda: '1', currencyDescription: 'Pesos Argentinos' },
]

export const INITIAL_CATEGORIES: Category[] = [
  // Categorías de Matías (id_usuario: '1')
  { id: '1', name: 'Sueldo', type: 'income', activa: true, id_usuario: '1' },
  { id: '2', name: 'Honorarios / Freelance', type: 'income', activa: true, id_usuario: '1' },
  { id: '3', name: 'Rendimientos / Inversiones', type: 'income', activa: true, id_usuario: '1' },
  { id: '4', name: 'Supermercado', type: 'expense', activa: true, id_usuario: '1' },
  { id: '5', name: 'Alquiler y Expensas', type: 'expense', activa: true, id_usuario: '1' },
  { id: '6', name: 'Servicios (Luz, Internet, Gas)', type: 'expense', activa: true, id_usuario: '1' },
  { id: '7', name: 'Restaurantes y Salidas', type: 'expense', activa: true, id_usuario: '1' },
  { id: '8', name: 'Transporte y Combustible', type: 'expense', activa: true, id_usuario: '1' },
  { id: '9', name: 'Salud y Farmacia', type: 'expense', activa: true, id_usuario: '1' },

  // Categorías de Benjamín (id_usuario: '2')
  { id: '10', name: 'Salario Fijo', type: 'income', activa: true, id_usuario: '2' },
  { id: '11', name: 'Desarrollo de Software', type: 'income', activa: true, id_usuario: '2' },
  { id: '12', name: 'Alimentos y Supermercado', type: 'expense', activa: true, id_usuario: '2' },
  { id: '13', name: 'Vivienda y Alquiler', type: 'expense', activa: true, id_usuario: '2' },
  { id: '14', name: 'Transporte y SUBE', type: 'expense', activa: true, id_usuario: '2' },
]

export function getInitialMovements(): Movement[] {
  return [
    {
      id: '1',
      description: 'Sueldo mensual',
      category: 'Sueldo',
      account: 'Banco Santander',
      date: getDateInMonth(0, 5),
      amount: 1450000,
      type: 'income',
      categoryId: '1',
      accountId: '2',
      note: 'Haberes en cuenta sueldo',
      id_usuario: '1',
      id_moneda: '1',
    },
    {
      id: '2',
      description: 'Cobro proyecto web frontend',
      category: 'Honorarios / Freelance',
      account: 'Mercado Pago',
      date: getDateInMonth(0, 8),
      amount: 320000,
      type: 'income',
      categoryId: '2',
      accountId: '3',
      note: 'Factura C cliente freelance',
      id_usuario: '1',
      id_moneda: '1',
    },
    {
      id: '3',
      description: 'Alquiler y expensas del departamento',
      category: 'Alquiler y Expensas',
      account: 'Banco Santander',
      date: getDateInMonth(0, 10),
      amount: 420000,
      type: 'expense',
      categoryId: '5',
      accountId: '2',
      note: 'Transferencia directa al propietario',
      id_usuario: '1',
      id_moneda: '1',
    },
    {
      id: '4',
      description: 'Compra semanal Coto',
      category: 'Supermercado',
      account: 'Mercado Pago',
      date: getDateInMonth(0, 12),
      amount: 135400,
      type: 'expense',
      categoryId: '4',
      accountId: '3',
      note: 'Descuento con QR aplicado',
      id_usuario: '1',
      id_moneda: '1',
    },
    {
      id: '5',
      description: 'Fibertel / Personal Flow',
      category: 'Servicios (Luz, Internet, Gas)',
      account: 'Mercado Pago',
      date: getDateInMonth(0, 14),
      amount: 28500,
      type: 'expense',
      categoryId: '6',
      accountId: '3',
      id_usuario: '1',
      id_moneda: '1',
    },
    {
      id: '6',
      description: 'Cena con amigos en bodegón',
      category: 'Restaurantes y Salidas',
      account: 'Efectivo',
      date: getDateInMonth(0, 15),
      amount: 42000,
      type: 'expense',
      categoryId: '7',
      accountId: '1',
      id_usuario: '1',
      id_moneda: '1',
    },
    {
      id: '7',
      description: 'Sueldo mes anterior',
      category: 'Sueldo',
      account: 'Banco Santander',
      date: getDateInMonth(-1, 5),
      amount: 1350000,
      type: 'income',
      categoryId: '1',
      accountId: '2',
      id_usuario: '1',
      id_moneda: '1',
    },
    {
      id: '11',
      description: 'Cobro cliente exterior freelance',
      category: 'Honorarios / Freelance',
      account: 'Caja de Ahorro en Dólares',
      date: getDateInMonth(0, 7),
      amount: 450,
      type: 'income',
      categoryId: '2',
      accountId: '15',
      note: 'Transferencia bancaria internacional USD',
      id_usuario: '1',
      id_moneda: '2',
    },
    {
      id: '12',
      description: 'Suscripción servicios Cloud',
      category: 'Servicios (Luz, Internet, Gas)',
      account: 'Caja de Ahorro en Dólares',
      date: getDateInMonth(0, 13),
      amount: 40,
      type: 'expense',
      categoryId: '6',
      accountId: '15',
      note: 'Débito mensual hosting',
      id_usuario: '1',
      id_moneda: '2',
    },
    // Movimientos de Benjamín (id_usuario: '2')
    {
      id: '8',
      description: 'Salario de programación',
      category: 'Salario Fijo',
      account: 'Banco BBVA',
      date: getDateInMonth(0, 6),
      amount: 1200000,
      type: 'income',
      categoryId: '10',
      accountId: '5',
      note: 'Cobro de haberes',
      id_usuario: '2',
      id_moneda: '1',
    },
    {
      id: '9',
      description: 'Compra supermercado Día',
      category: 'Alimentos y Supermercado',
      account: 'Ualá Billetera',
      date: getDateInMonth(0, 11),
      amount: 95000,
      type: 'expense',
      categoryId: '12',
      accountId: '6',
      id_usuario: '2',
      id_moneda: '1',
    },
    {
      id: '10',
      description: 'Pago alquiler mensual',
      category: 'Vivienda y Alquiler',
      account: 'Banco BBVA',
      date: getDateInMonth(0, 10),
      amount: 350000,
      type: 'expense',
      categoryId: '13',
      accountId: '5',
      id_usuario: '2',
      id_moneda: '1',
    },
  ]
}

export function loadAllLocalAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (raw) {
      const parsed: Account[] = JSON.parse(raw)
      return parsed
        .filter((a) => String(a.id_usuario) !== '3')
        .map((a) => ({
          ...a,
          id: String(a.id),
          id_usuario: String(a.id_usuario),
          id_moneda: String(a.id_moneda || '1'),
          activa: a.activa !== false,
        }))
    }
  } catch (e) {
    console.error(e)
  }
  saveAllLocalAccounts(INITIAL_ACCOUNTS)
  return INITIAL_ACCOUNTS
}

export function saveAllLocalAccounts(accounts: Account[]) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch (e) {
    console.error(e)
  }
}

export function loadLocalAccounts(userId?: string): Account[] {
  const currentUserId = userId ?? getCurrentSession()?.usuario?.id_usuario
  const allAccounts = loadAllLocalAccounts()
  if (!currentUserId) return allAccounts
  return allAccounts.filter((a) => a.id_usuario === String(currentUserId))
}

export function loadAllLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (raw) {
      const parsed: Category[] = JSON.parse(raw)
      return parsed.map((c) => ({
        ...c,
        id: String(c.id),
        id_usuario: String(c.id_usuario),
      }))
    }
  } catch (e) {
    console.error(e)
  }
  saveAllLocalCategories(INITIAL_CATEGORIES)
  return INITIAL_CATEGORIES
}

export function saveAllLocalCategories(categories: Category[]) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  } catch (e) {
    console.error(e)
  }
}

export function loadLocalCategories(userId?: string): Category[] {
  const currentUserId = userId ?? getCurrentSession()?.usuario?.id_usuario
  const allCategories = loadAllLocalCategories()
  if (!currentUserId) return allCategories
  return allCategories.filter((c) => c.id_usuario === String(currentUserId))
}

export function loadAllLocalMovements(): Movement[] {
  try {
    const raw = localStorage.getItem(MOVEMENTS_KEY)
    if (raw) {
      const parsed: Movement[] = JSON.parse(raw)
      const accounts = loadAllLocalAccounts()
      return parsed.map((m) => {
        const accountId = String(m.accountId)
        return {
          ...m,
          id: String(m.id),
          categoryId: String(m.categoryId),
          accountId,
          id_usuario: String(m.id_usuario),
          id_moneda: String(m.id_moneda || accounts.find((a) => a.id === accountId)?.id_moneda || '1'),
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
  const initial = getInitialMovements()
  saveAllLocalMovements(initial)
  return initial
}

export function saveAllLocalMovements(movements: Movement[]) {
  try {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements))
  } catch (e) {
    console.error(e)
  }
}

export function loadLocalMovements(userId?: string): Movement[] {
  const currentUserId = userId ?? getCurrentSession()?.usuario?.id_usuario
  const allMovements = loadAllLocalMovements()
  if (!currentUserId) return allMovements
  return allMovements.filter((m) => m.id_usuario === String(currentUserId))
}

export function initStarterDataForNewUser(userId: string) {
  const allAccounts = loadAllLocalAccounts()
  const allCategories = loadAllLocalCategories()

  const nextAccNum = Number(generateLocalId(allAccounts.map((a) => a.id)))
  const starterAccounts: Account[] = [
    { id: String(nextAccNum), name: 'Efectivo', type: 'cash', activa: true, id_usuario: userId, id_moneda: '1' },
    { id: String(nextAccNum + 1), name: 'Cuenta Bancaria Principal', type: 'bank', activa: true, id_usuario: userId, id_moneda: '1' },
    { id: String(nextAccNum + 2), name: 'Billetera Virtual', type: 'wallet', activa: true, id_usuario: userId, id_moneda: '1' },
  ]

  const nextCatNum = Number(generateLocalId(allCategories.map((c) => c.id)))
  const starterCategories: Category[] = [
    { id: String(nextCatNum), name: 'Sueldo / Ingreso Principal', type: 'income', activa: true, id_usuario: userId },
    { id: String(nextCatNum + 1), name: 'Honorarios / Otros Ingresos', type: 'income', activa: true, id_usuario: userId },
    { id: String(nextCatNum + 2), name: 'Supermercado y Alimentos', type: 'expense', activa: true, id_usuario: userId },
    { id: String(nextCatNum + 3), name: 'Servicios e Impuestos', type: 'expense', activa: true, id_usuario: userId },
    { id: String(nextCatNum + 4), name: 'Transporte', type: 'expense', activa: true, id_usuario: userId },
    { id: String(nextCatNum + 5), name: 'Varios / Salidas', type: 'expense', activa: true, id_usuario: userId },
  ]

  saveAllLocalAccounts([...allAccounts, ...starterAccounts])
  saveAllLocalCategories([...allCategories, ...starterCategories])
}

export function resetToDemoData() {
  saveAllLocalAccounts(INITIAL_ACCOUNTS)
  saveAllLocalCategories(INITIAL_CATEGORIES)
  saveAllLocalMovements(getInitialMovements())
  saveLocalUsers(INITIAL_USERS)
}
