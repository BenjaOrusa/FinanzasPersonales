const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!configuredBaseUrl) {
  throw new Error('Falta configurar VITE_API_BASE_URL.')
}

// Se quita la barra final para poder concatenar rutas de forma consistente.
const apiBaseUrl = configuredBaseUrl.replace(/\/$/, '')

/** Error HTTP conocido, con el estado devuelto por nuestra API. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await response.json() as { detail?: string; title?: string }
    return body.detail ?? body.title ?? `La API respondió con el código ${response.status}.`
  }

  const message = await response.text()
  return message || `La API respondió con el código ${response.status}.`
}

/**
 * Centraliza las peticiones HTTP para que los servicios no repitan URL, headers
 * ni tratamiento de errores. El tipo T representa el JSON esperado.
 */
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers })

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return await response.json() as T
}
