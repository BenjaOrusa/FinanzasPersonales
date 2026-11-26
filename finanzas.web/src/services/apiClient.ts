import { getConfig, getCurrentSession } from './storage'

/**
 * Mapeo centralizado de endpoints reales de la API ASP.NET Core (.NET 10).
 * Base esperada: https://<host>/api
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/Auth/login',
    registro: '/Auth/register',
    logout: '/Auth/logout',
    me: '/Auth/me',
  },
  monedas: {
    base: '/Currency',
  },
  usuarios: {
    base: '/User',
    estado: (id: string) => `/User/${id}/status`,
  },
  cuentas: {
    base: '/Account',
    detalle: (id: string) => `/Account/${id}`,
    desactivar: (id: string) => `/Account/${id}/deactivate`,
    activar: (id: string) => `/Account/${id}/activate`,
  },
  categorias: {
    base: '/Category',
    detalle: (id: string) => `/Category/${id}`,
    desactivar: (id: string) => `/Category/${id}/deactivate`,
    activar: (id: string) => `/Category/${id}/activate`,
  },
  movimientos: {
    base: '/Movement',
    filter: '/Movement/filter',
    detalle: (id: string) => `/Movement/${id}`,
  },
  resumenFinanciero: {
    base: '/FinancialSummary',
  },
  cotizaciones: {
    base: '/ExchangeRate',
    importarDolar: '/ExchangeRate/import-latest-dollar',
    ultimoDolar: '/ExchangeRate/latest-dollar',
    disponibilidad: '/ExchangeRate/availability',
    equivalenciasMovimientos: '/ExchangeRate/movements-dollar-equivalent',
  },
  admin: {
    analiticasMovimientos: '/Admin/analytics/movements',
  },
}

/**
 * Normaliza la URL base evitando barras finales duplicadas o /api duplicado.
 */
export function buildApiUrl(baseUrl: string, path: string): string {
  const cleanBase = (baseUrl || '').trim().replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${cleanBase}${cleanPath}`
}

/**
 * Cliente HTTP centralizado que maneja:
 * 1. Concatenación de URL Base configurada (local o Azure) con el endpoint.
 * 2. Inyección automática del Token JWT Bearer si el usuario está autenticado.
 * 3. Cabeceras estándar JSON.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const config = getConfig()
  const fullUrl = buildApiUrl(config.apiUrl, path)

  const session = getCurrentSession()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  if (session?.token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${session.token}`)
  }

  return fetch(fullUrl, {
    ...options,
    headers,
  })
}

/**
 * Extrae un mensaje legible desde respuestas de error en texto plano, JSON o ProblemDetails.
 */
export async function parseApiError(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const rawText = (await response.text()).trim()
    if (!rawText) {
      if (response.status === 401) return 'Sesión expirada o credenciales no válidas (HTTP 401).'
      if (response.status === 403) return 'No tenés permisos para realizar esta acción (HTTP 403).'
      return `${fallbackMessage} (HTTP ${response.status}).`
    }

    try {
      const json = JSON.parse(rawText)
      if (typeof json === 'string') return json
      return json.detail || json.message || json.mensaje || json.title || rawText
    } catch {
      return rawText
    }
  } catch {
    return `${fallbackMessage} (HTTP ${response.status}).`
  }
}

/**
 * Prueba la conectividad hacia la URL base especificada (por ejemplo en Azure).
 */
export async function testConnection(baseUrl: string): Promise<{ ok: boolean; status: number; message: string }> {
  const base = (baseUrl || '').trim().replace(/\/+$/, '')
  if (!base) {
    return { ok: false, status: 0, message: 'La URL no puede estar vacía.' }
  }

  try {
    const session = getCurrentSession()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`
    }

    const res = await fetch(`${base}${API_ENDPOINTS.monedas.base}`, {
      method: 'GET',
      headers,
    })

    if (res.ok) {
      return {
        ok: true,
        status: res.status,
        message: `Conexión exitosa con la API ASP.NET Core (HTTP ${res.status}).`,
      }
    }

    // 401/403 significa que el servidor Azure está en línea y protegiendo los endpoints con JWT
    if (res.status === 401 || res.status === 403) {
      return {
        ok: true,
        status: res.status,
        message: `Servidor ASP.NET Core accesible y respondiendo (HTTP ${res.status}: requiere autenticación JWT válida).`,
      }
    }

    return {
      ok: false,
      status: res.status,
      message: `El servidor respondió con código HTTP ${res.status}. Verificá la ruta base (debe terminar en /api).`,
    }
  } catch {
    return {
      ok: false,
      status: 0,
      message: `No se pudo alcanzar el backend (${base}). Verificá CORS en Program.cs y que el App Service en Azure esté activo.`,
    }
  }
}
