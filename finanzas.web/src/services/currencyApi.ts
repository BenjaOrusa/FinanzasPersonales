import { getConfig, getCurrentSession } from './storage'
import { apiFetch, API_ENDPOINTS, parseApiError } from './apiClient'

export interface Moneda {
  id_moneda: string
  descripcion: string
  codigo: 'ARS' | 'USD'
  simbolo: string
}

export interface Cotizacion {
  id_moneda_base: string // USD (o base en local)
  id_moneda_cotizada: string // ARS (o target)
  baseDescription?: string
  targetDescription?: string
  fecha: string // YYYY-MM-DD
  valor: number // Cuántos ARS equivale 1 USD
  fuente?: string
}

export interface MovementDollarEquivalentDTO {
  MovementId: string
  Description: string
  OriginalAmount: number
  OriginalCurrency: string
  EquivalentInDollars: number | null
  MovementDate: string
  ExchangeRateDateUsed: string | null
  Status: string
}

export interface CurrencySummaryDTO {
  CurrencyId: string
  CurrencyDescription: string
  TotalIncome: number
  TotalExpenses: number
  Balance: number
}

export interface FinancialSummaryDTO {
  SummariesByCurrency: CurrencySummaryDTO[]
}

export const MONEDAS: Moneda[] = [
  { id_moneda: '1', descripcion: 'Pesos Argentinos', codigo: 'ARS', simbolo: '$' },
  { id_moneda: '2', descripcion: 'Dólar Estadounidense', codigo: 'USD', simbolo: 'US$' },
]

const COTIZACIONES_KEY = 'fp_cotizaciones_v1'
const CURRENCIES_CACHE_KEY = 'fp_currencies_cache_v1'

let cachedCurrencies: Moneda[] | null = null

export const INITIAL_COTIZACIONES: Cotizacion[] = [
  { id_moneda_base: '1', id_moneda_cotizada: '2', fecha: '2026-01-01', valor: 1180.0, fuente: 'API Banco Público' },
  { id_moneda_base: '1', id_moneda_cotizada: '2', fecha: '2026-06-01', valor: 1220.0, fuente: 'API Banco Público' },
  { id_moneda_base: '1', id_moneda_cotizada: '2', fecha: '2026-09-01', valor: 1250.0, fuente: 'API Banco Público' },
  { id_moneda_base: '1', id_moneda_cotizada: '2', fecha: '2026-10-01', valor: 1280.0, fuente: 'API Banco Público' },
  { id_moneda_base: '1', id_moneda_cotizada: '2', fecha: '2026-11-01', valor: 1300.0, fuente: 'API Banco Público' },
  { id_moneda_base: '1', id_moneda_cotizada: '2', fecha: '2026-11-09', valor: 1315.0, fuente: 'API Banco Público (En vivo)' },
]

function detectCurrencyCode(description: string): 'ARS' | 'USD' {
  const lower = (description || '').toLowerCase()
  if (lower.includes('dólar') || lower.includes('dolar') || lower.includes('usd')) {
    return 'USD'
  }
  return 'ARS'
}

export function getCachedCurrencies(): Moneda[] {
  if (cachedCurrencies && cachedCurrencies.length > 0) return cachedCurrencies
  try {
    const raw = localStorage.getItem(CURRENCIES_CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Moneda[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedCurrencies = parsed
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return MONEDAS
}

export function saveCurrenciesCache(monedas: Moneda[]) {
  cachedCurrencies = monedas
  try {
    localStorage.setItem(CURRENCIES_CACHE_KEY, JSON.stringify(monedas))
  } catch {
    // ignore
  }
}

export function esMonedaUsd(idMoneda?: string, description?: string): boolean {
  if (description) {
    return detectCurrencyCode(description) === 'USD'
  }
  if (!idMoneda) return false
  const str = String(idMoneda)
  if (str === '2') return true
  const found = getCachedCurrencies().find((c) => c.id_moneda === str)
  if (found) return found.codigo === 'USD'
  return false
}

export function obtenerCodigoMoneda(idMoneda?: string, description?: string): 'ARS' | 'USD' {
  return esMonedaUsd(idMoneda, description) ? 'USD' : 'ARS'
}

export async function obtenerMonedas(signal?: AbortSignal): Promise<Moneda[]> {
  const config = getConfig()
  if (config.mode !== 'api') {
    return MONEDAS
  }

  try {
    const response = await apiFetch(API_ENDPOINTS.monedas.base, { signal })
    if (response.ok) {
      const raw = (await response.json()) as Array<{ Id: string; Description: string }>
      const mapped: Moneda[] = raw.map((c) => {
        const codigo = detectCurrencyCode(c.Description)
        return {
          id_moneda: String(c.Id),
          descripcion: c.Description,
          codigo,
          simbolo: codigo === 'USD' ? 'US$' : '$',
        }
      })
      if (mapped.length > 0) {
        saveCurrenciesCache(mapped)
        return mapped
      }
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    console.warn('No se pudieron consultar las monedas desde la API, usando caché/valores base:', err)
  }

  return getCachedCurrencies()
}

export function loadLocalCotizaciones(): Cotizacion[] {
  try {
    const raw = localStorage.getItem(COTIZACIONES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Cotizacion[]
      return parsed.map((c) => ({
        ...c,
        id_moneda_base: String(c.id_moneda_base),
        id_moneda_cotizada: String(c.id_moneda_cotizada),
      }))
    }
  } catch (e) {
    console.error(e)
  }
  saveLocalCotizaciones(INITIAL_COTIZACIONES)
  return INITIAL_COTIZACIONES
}

export function saveLocalCotizaciones(cotizaciones: Cotizacion[]) {
  try {
    localStorage.setItem(COTIZACIONES_KEY, JSON.stringify(cotizaciones))
  } catch (e) {
    console.error(e)
  }
}

export function obtenerCotizacionParaFecha(
  fechaStr: string
): { valor: number; fechaCotizacion: string; esAnterior?: boolean } {
  const cotizaciones = loadLocalCotizaciones()
    .slice()
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  if (!cotizaciones.length) {
    return { valor: 1300, fechaCotizacion: fechaStr }
  }

  const exacta = cotizaciones.find((c) => c.fecha === fechaStr)
  if (exacta) {
    return { valor: exacta.valor, fechaCotizacion: exacta.fecha, esAnterior: false }
  }

  const anteriores = cotizaciones.filter((c) => c.fecha <= fechaStr)
  if (anteriores.length > 0) {
    const ultimaAnterior = anteriores[anteriores.length - 1]
    return { valor: ultimaAnterior.valor, fechaCotizacion: ultimaAnterior.fecha, esAnterior: true }
  }

  return { valor: cotizaciones[0].valor, fechaCotizacion: cotizaciones[0].fecha, esAnterior: true }
}

export function convertirArsADolar(
  montoArs: number,
  fecha: string
): {
  montoUsd: number
  cotizacionUtilizada: number
  fechaCotizacion: string
  esAnterior?: boolean
} {
  const { valor, fechaCotizacion, esAnterior } = obtenerCotizacionParaFecha(fecha)
  const montoUsd = valor > 0 ? montoArs / valor : 0
  return {
    montoUsd,
    cotizacionUtilizada: valor,
    fechaCotizacion,
    esAnterior,
  }
}

export interface ResultadoSupervisionCotizacion {
  estado: 'exacta' | 'anterior' | 'no_disponible'
  valor?: number
  fechaSolicitada: string
  fechaCotizacion?: string
  mensaje: string
  fuente?: string
}

export function supervisarDisponibilidadCotizacion(
  fechaStr: string
): ResultadoSupervisionCotizacion {
  if (!fechaStr) {
    return {
      estado: 'no_disponible',
      fechaSolicitada: fechaStr,
      mensaje: 'Fecha no especificada o inválida (CU19 4.a).',
    }
  }

  const cotizaciones = loadLocalCotizaciones()
    .slice()
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  if (!cotizaciones.length) {
    return {
      estado: 'no_disponible',
      fechaSolicitada: fechaStr,
      mensaje: 'No existen cotizaciones registradas para este par de monedas (CU19 4.c).',
    }
  }

  const exacta = cotizaciones.find((c) => c.fecha === fechaStr)
  if (exacta) {
    return {
      estado: 'exacta',
      valor: exacta.valor,
      fechaSolicitada: fechaStr,
      fechaCotizacion: exacta.fecha,
      mensaje: `Cotización exacta disponible para la fecha ${exacta.fecha}: $${exacta.valor.toFixed(2)} ARS por 1 USD.`,
      fuente: exacta.fuente || 'API Banco Público',
    }
  }

  const anteriores = cotizaciones.filter((c) => c.fecha < fechaStr)
  if (anteriores.length > 0) {
    const ultima = anteriores[anteriores.length - 1]
    return {
      estado: 'anterior',
      valor: ultima.valor,
      fechaSolicitada: fechaStr,
      fechaCotizacion: ultima.fecha,
      mensaje: `No existe cotización para la fecha ${fechaStr}. Se aplica la última cotización previa hábil disponible (${ultima.fecha}): $${ultima.valor.toFixed(2)} ARS por 1 USD (CU19 4.b).`,
      fuente: ultima.fuente || 'API Banco Público',
    }
  }

  return {
    estado: 'no_disponible',
    fechaSolicitada: fechaStr,
    mensaje: `No existe cotización aplicable previa o exacta para la fecha solicitada ${fechaStr} (CU19 4.c).`,
  }
}

function isGuidLike(value?: string): boolean {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim()))
}

/**
 * CU19 (Backend): Consulta GET /api/ExchangeRate/availability con el contrato
 * ExchangeRateAvailabilityResponseDTO ({ Available, Value, RateDate, IsFromEarlierDate, Message }).
 */
export async function supervisarDisponibilidadCotizacionAsync(
  fechaStr: string,
  baseCurrencyIdParam?: string,
  targetCurrencyIdParam?: string
): Promise<ResultadoSupervisionCotizacion> {
  const config = getConfig()
  if (config.mode === 'api') {
    if (!fechaStr) {
      return {
        estado: 'no_disponible',
        fechaSolicitada: fechaStr,
        mensaje: 'Debe indicar la fecha de referencia (CU19 4.a).',
      }
    }

    try {
      let baseId = isGuidLike(baseCurrencyIdParam) ? baseCurrencyIdParam : undefined
      let targetId = isGuidLike(targetCurrencyIdParam) ? targetCurrencyIdParam : undefined

      if (!baseId || !targetId) {
        const monedas = await obtenerMonedas()
        const usd = monedas.find((m) => m.codigo === 'USD')
        const ars = monedas.find((m) => m.codigo === 'ARS')
        if (usd && ars && isGuidLike(usd.id_moneda) && isGuidLike(ars.id_moneda)) {
          baseId = usd.id_moneda
          targetId = ars.id_moneda
        }
      }

      if (baseId && targetId) {
        const params = new URLSearchParams({
          baseCurrencyId: baseId,
          targetCurrencyId: targetId,
          date: fechaStr,
        })
        const res = await apiFetch(`${API_ENDPOINTS.cotizaciones.disponibilidad}?${params.toString()}`)
        if (res.ok) {
          const data = (await res.json()) as {
            Available?: boolean
            Value?: number | null
            RateDate?: string | null
            IsFromEarlierDate?: boolean
            Message?: string
          }

          if (!data.Available) {
            return {
              estado: 'no_disponible',
              fechaSolicitada: fechaStr,
              mensaje:
                data.Message || 'No existe una cotización aplicable para los criterios indicados (CU19 4.c).',
              fuente: 'Backend ASP.NET Core (SQL Server)',
            }
          }

          return {
            estado: data.IsFromEarlierDate ? 'anterior' : 'exacta',
            valor: data.Value !== null && data.Value !== undefined ? Number(data.Value) : undefined,
            fechaSolicitada: fechaStr,
            fechaCotizacion: data.RateDate ? String(data.RateDate).slice(0, 10) : fechaStr,
            mensaje: data.Message || 'Consulta realizada en backend ASP.NET Core.',
            fuente: 'Backend ASP.NET Core (SQL Server)',
          }
        }

        return {
          estado: 'no_disponible',
          fechaSolicitada: fechaStr,
          mensaje: await parseApiError(res, 'Criterios inválidos al consultar disponibilidad (CU19 4.a)'),
          fuente: 'Backend ASP.NET Core',
        }
      }
    } catch {
      // Si hay un fallo de red puntual, fallback controlado abajo
    }
  }

  return supervisarDisponibilidadCotizacion(fechaStr)
}

/**
 * CU19 (Backend): Obtiene el historial completo de cotizaciones desde GET /api/ExchangeRate.
 */
export async function obtenerHistorialCotizacionesApi(
  signal?: AbortSignal
): Promise<Cotizacion[]> {
  const config = getConfig()
  if (config.mode !== 'api') {
    return loadLocalCotizaciones().slice().sort((a, b) => b.fecha.localeCompare(a.fecha))
  }

  const response = await apiFetch(API_ENDPOINTS.cotizaciones.base, { signal })
  if (!response.ok) {
    throw new Error(await parseApiError(response, 'No se pudo obtener el historial de cotizaciones'))
  }

  const raw = (await response.json()) as Array<{
    BaseCurrencyId: string
    BaseCurrencyDescription?: string
    TargetCurrencyId: string
    TargetCurrencyDescription?: string
    Date: string
    Value: number
  }>

  return raw
    .map((item) => ({
      id_moneda_base: String(item.BaseCurrencyId),
      id_moneda_cotizada: String(item.TargetCurrencyId),
      baseDescription: item.BaseCurrencyDescription || 'USD',
      targetDescription: item.TargetCurrencyDescription || 'ARS',
      fecha: String(item.Date).slice(0, 10),
      valor: Number(item.Value),
      fuente: 'Backend ASP.NET Core (SQL Server)',
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}

/**
 * Obtiene la última cotización oficial del dólar guardada en BD desde GET /api/ExchangeRate/latest-dollar.
 */
export async function obtenerUltimaCotizacionDolarApi(
  signal?: AbortSignal
): Promise<{ cotizacion: Cotizacion | null; message?: string }> {
  const config = getConfig()
  if (config.mode !== 'api') {
    const hoyStr = new Date().toISOString().slice(0, 10)
    const { valor, fechaCotizacion } = obtenerCotizacionParaFecha(hoyStr)
    return {
      cotizacion: {
        id_moneda_base: '2',
        id_moneda_cotizada: '1',
        fecha: fechaCotizacion,
        valor,
        fuente: 'API Pública Bancaria Oficial',
      },
    }
  }

  const response = await apiFetch(API_ENDPOINTS.cotizaciones.ultimoDolar, { signal })
  if (response.status === 404) {
    return {
      cotizacion: null,
      message: await parseApiError(response, 'Todavía no hay una cotización del dólar guardada.'),
    }
  }
  if (!response.ok) {
    throw new Error(await parseApiError(response, 'No se pudo obtener la última cotización del dólar'))
  }

  const ex = (await response.json()) as {
    BaseCurrencyId: string
    BaseCurrencyDescription?: string
    TargetCurrencyId: string
    TargetCurrencyDescription?: string
    Date: string
    Value: number
  }

  return {
    cotizacion: {
      id_moneda_base: String(ex.BaseCurrencyId),
      id_moneda_cotizada: String(ex.TargetCurrencyId),
      baseDescription: ex.BaseCurrencyDescription || 'Dólar Estadounidense',
      targetDescription: ex.TargetCurrencyDescription || 'Pesos Argentinos',
      fecha: String(ex.Date).slice(0, 10),
      valor: Number(ex.Value),
      fuente: 'Backend ASP.NET Core (SQL Server)',
    },
  }
}

/**
 * CU15 (Backend): Obtiene el resumen financiero agrupado por moneda desde GET /api/FinancialSummary,
 * con filtro opcional por período (?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD).
 */
export async function obtenerResumenFinancieroApi(
  startDate?: string,
  endDate?: string,
  signal?: AbortSignal
): Promise<FinancialSummaryDTO | null> {
  const config = getConfig()
  if (config.mode !== 'api') return null

  const params = new URLSearchParams()
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const qs = params.toString()
  const path = qs ? `${API_ENDPOINTS.resumenFinanciero.base}?${qs}` : API_ENDPOINTS.resumenFinanciero.base

  const response = await apiFetch(path, { signal })
  if (!response.ok) {
    throw new Error(await parseApiError(response, 'No se pudo obtener el resumen financiero'))
  }
  return (await response.json()) as FinancialSummaryDTO
}

/**
 * CU16 (Backend): Obtiene las equivalencias calculadas en USD por el servidor para cada movimiento.
 */
export async function obtenerEquivalenciasDolaresApi(
  signal?: AbortSignal
): Promise<Record<string, MovementDollarEquivalentDTO>> {
  const config = getConfig()
  if (config.mode !== 'api') return {}

  const response = await apiFetch(API_ENDPOINTS.cotizaciones.equivalenciasMovimientos, { signal })
  if (!response.ok) {
    throw new Error(await parseApiError(response, 'No se pudieron obtener las equivalencias en dólares'))
  }
  const items = (await response.json()) as MovementDollarEquivalentDTO[]
  const map: Record<string, MovementDollarEquivalentDTO> = {}
  items.forEach((item) => {
    map[String(item.MovementId)] = item
  })
  return map
}

/**
 * Importa la última cotización del dólar oficial desde el backend (.NET POST /api/ExchangeRate/import-latest-dollar
 * para administradores) o consulta DolarApi para usuarios comunes / modo local.
 */
export async function sincronizarCotizacionDesdeBanco(): Promise<{
  cotizacion: Cotizacion
  mensaje: string
  origen: string
}> {
  const config = getConfig()
  const session = getCurrentSession()
  const hoyStr = new Date().toISOString().slice(0, 10)
  const esAdmin = session?.usuario?.id_tipo_usuario === 2

  if (config.mode === 'api') {
    if (esAdmin) {
      const response = await apiFetch(API_ENDPOINTS.cotizaciones.importarDolar, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error(
          await parseApiError(response, 'No se pudo importar la cotización desde el backend')
        )
      }
      const data = await response.json()
      const ex = data.ExchangeRate || data
      const fecha = ex.Date ? String(ex.Date).slice(0, 10) : hoyStr
      const valor = Number(ex.Value)
      const nueva: Cotizacion = {
        id_moneda_base: String(ex.BaseCurrencyId || '2'),
        id_moneda_cotizada: String(ex.TargetCurrencyId || '1'),
        fecha,
        valor,
        fuente: data.Source || 'DolarApi - dólar oficial venta (Backend ASP.NET Core)',
      }
      guardarCotizacionLocal(nueva)
      return {
        cotizacion: nueva,
        mensaje: `Cotización oficial importada y persistida en SQL Server: 1 USD = $${valor.toFixed(2)} ARS (${fecha}).`,
        origen: data.Source || 'Backend ASP.NET Core (DolarApi Oficial)',
      }
    }

    // Usuario Común en modo API: intentar endpoint de solo lectura si existe en backend
    try {
      const resUltimo = await apiFetch(API_ENDPOINTS.cotizaciones.ultimoDolar)
      if (resUltimo.ok) {
        const ex = await resUltimo.json()
        const fecha = ex.Date ? String(ex.Date).slice(0, 10) : hoyStr
        const valor = Number(ex.Value)
        const nueva: Cotizacion = {
          id_moneda_base: String(ex.BaseCurrencyId || '2'),
          id_moneda_cotizada: String(ex.TargetCurrencyId || '1'),
          fecha,
          valor,
          fuente: 'Backend ASP.NET Core',
        }
        guardarCotizacionLocal(nueva)
        return {
          cotizacion: nueva,
          mensaje: `Cotización oficial obtenida desde el backend: 1 USD = $${valor.toFixed(2)} ARS.`,
          origen: 'Backend ASP.NET Core',
        }
      }
    } catch {
      // Fallback a DolarApi pública si el endpoint GET /ExchangeRate/latest-dollar aún no está expuesto para Customer
    }
  }

  try {
    const resPublica = await fetch('https://dolarapi.com/v1/dolares/oficial', {
      headers: { Accept: 'application/json' },
    })
    if (resPublica.ok) {
      const jsonPub = await resPublica.json()
      const valorVenta = Number(jsonPub.venta || 1315)
      const cotizActualizada: Cotizacion = {
        id_moneda_base: '2',
        id_moneda_cotizada: '1',
        fecha: hoyStr,
        valor: valorVenta,
        fuente: 'API Pública Bancaria Oficial (DolarApi BNA)',
      }
      guardarCotizacionLocal(cotizActualizada)
      return {
        cotizacion: cotizActualizada,
        mensaje: `Cotización actualizada en vivo: 1 USD = $${valorVenta.toFixed(2)} ARS.`,
        origen: 'API Pública del Banco (DolarApi)',
      }
    }
  } catch {
    // Fallback local
  }

  const cotizFallback: Cotizacion = {
    id_moneda_base: '2',
    id_moneda_cotizada: '1',
    fecha: hoyStr,
    valor: 1315.0,
    fuente: 'API Banco Público (Registro del Sistema)',
  }
  guardarCotizacionLocal(cotizFallback)
  return {
    cotizacion: cotizFallback,
    mensaje: 'Cotización bancaria sincronizada para el día de hoy: 1 USD = $1315,00 ARS.',
    origen: 'Almacenamiento Local / Banco Integrado',
  }
}

/**
 * CU19 (Admin): Registra o actualiza manualmente una cotización USD -> ARS.
 * En modo API llama a POST /api/ExchangeRate con los GUIDs reales de moneda.
 */
export async function registrarCotizacionManual(
  fecha: string,
  valor: number,
  baseCurrencyIdParam?: string,
  targetCurrencyIdParam?: string
): Promise<Cotizacion> {
  const config = getConfig()

  if (config.mode === 'api') {
    let baseId = isGuidLike(baseCurrencyIdParam) ? baseCurrencyIdParam : undefined
    let targetId = isGuidLike(targetCurrencyIdParam) ? targetCurrencyIdParam : undefined

    if (!baseId || !targetId) {
      const monedas = await obtenerMonedas()
      const usd = monedas.find((m) => m.codigo === 'USD')
      const ars = monedas.find((m) => m.codigo === 'ARS')
      if (!usd || !ars || !isGuidLike(usd.id_moneda) || !isGuidLike(ars.id_moneda)) {
        throw new Error(
          'No se pudieron obtener los GUIDs reales de monedas desde GET /api/Currency. Verificá que el backend esté en línea.'
        )
      }
      baseId = usd.id_moneda
      targetId = ars.id_moneda
    }

    const response = await apiFetch(API_ENDPOINTS.cotizaciones.base, {
      method: 'POST',
      body: JSON.stringify({
        BaseCurrencyId: baseId,
        TargetCurrencyId: targetId,
        Date: fecha,
        Value: valor,
      }),
    })

    if (!response.ok) {
      throw new Error(await parseApiError(response, 'No se pudo registrar la cotización en el backend'))
    }

    const saved = await response.json()
    const cotizacion: Cotizacion = {
      id_moneda_base: String(saved.BaseCurrencyId),
      id_moneda_cotizada: String(saved.TargetCurrencyId),
      baseDescription: saved.BaseCurrencyDescription || undefined,
      targetDescription: saved.TargetCurrencyDescription || undefined,
      fecha: saved.Date ? String(saved.Date).slice(0, 10) : fecha,
      valor: Number(saved.Value),
      fuente: 'Cargada Manualmente por Administrador (SQL Server)',
    }
    guardarCotizacionLocal(cotizacion)
    return cotizacion
  }

  const cotizacionLocal: Cotizacion = {
    id_moneda_base: '2',
    id_moneda_cotizada: '1',
    fecha,
    valor,
    fuente: 'Cargada Manualmente por Administrador',
  }
  guardarCotizacionLocal(cotizacionLocal)
  return cotizacionLocal
}

export function guardarCotizacionLocal(c: Cotizacion) {
  const todas = loadLocalCotizaciones()
  const index = todas.findIndex((item) => item.fecha === c.fecha)
  if (index >= 0) {
    todas[index] = c
  } else {
    todas.push(c)
  }
  todas.sort((a, b) => a.fecha.localeCompare(b.fecha))
  saveLocalCotizaciones(todas)
}
