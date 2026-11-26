import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getConfig, loadAllLocalMovements, loadLocalUsers } from '../services/storage'
import { obtenerUsuariosSistema } from '../services/adminApi'
import { apiFetch, API_ENDPOINTS } from '../services/apiClient'
import {
  convertirArsADolar,
  esMonedaUsd,
  obtenerCotizacionParaFecha,
  obtenerHistorialCotizacionesApi,
  type Cotizacion,
} from '../services/currencyApi'
import type { Movement } from '../types/finance'
import type { Usuario } from '../types/auth'
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Filter,
  Layers,
  ShieldAlert,
  Receipt,
  RotateCcw,
  CheckCircle,
  CalendarRange,
  Info,
} from 'lucide-react'

type ViewMode = 'daily' | 'monthly'
type CurrencyView = 'both' | 'ars' | 'usd'
type DaySortOrder = 'day_asc' | 'day_desc' | 'amount_desc'
type PieGrouping = 'category' | 'user'

const MONTHS = [
  { value: 0, label: 'Enero' },
  { value: 1, label: 'Febrero' },
  { value: 2, label: 'Marzo' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Mayo' },
  { value: 5, label: 'Junio' },
  { value: 6, label: 'Julio' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Septiembre' },
  { value: 9, label: 'Octubre' },
  { value: 10, label: 'Noviembre' },
  { value: 11, label: 'Diciembre' },
]

const WEEK_OPTIONS = [
  { id: 'all', label: 'Todo el Mes (Días 1 al fin de mes)', startDay: 1, endDay: 31 },
  { id: 'w1', label: 'Semana 1 (Días 1 al 7)', startDay: 1, endDay: 7 },
  { id: 'w2', label: 'Semana 2 (Días 8 al 14)', startDay: 8, endDay: 14 },
  { id: 'w3', label: 'Semana 3 (Días 15 al 21)', startDay: 15, endDay: 21 },
  { id: 'w4', label: 'Semana 4 (Días 22 al 28)', startDay: 22, endDay: 28 },
  { id: 'w5', label: 'Semana 5 (Días 29 en adelante)', startDay: 29, endDay: 31 },
]

const PALETTE = [
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#7c3aed', // purple
  '#0891b2', // cyan
  '#db2777', // pink
  '#4f46e5', // indigo
  '#ea580c', // orange
  '#64748b', // slate
]

interface AnalyticsCurrencyTotalDTO {
  CurrencyId: string
  CurrencyDescription: string
  TotalIncome: number
  TotalExpenses: number
  Balance: number
  MovementCount: number
}

interface AnalyticsMonthlyItemDTO {
  Year: number
  Month: number
  CurrencyId: string
  CurrencyDescription: string
  TotalIncome: number
  TotalExpenses: number
  MovementCount: number
}

interface AnalyticsDailyItemDTO {
  Date: string
  CurrencyId: string
  CurrencyDescription: string
  TotalIncome: number
  TotalExpenses: number
  MovementCount: number
}

interface AnalyticsCategoryItemDTO {
  CategoryDescription: string
  CategoryType: string
  CurrencyId: string
  CurrencyDescription: string
  TotalAmount: number
  MovementCount: number
}

interface AnalyticsUserItemDTO {
  UserId: string
  UserFullName: string
  Email: string
  CurrencyId: string
  CurrencyDescription: string
  TotalIncome: number
  TotalExpenses: number
  MovementCount: number
}

interface AdminMovementsAnalyticsResponseDTO {
  Year: number | null
  Month: number | null
  UserId: string | null
  TotalsByCurrency: AnalyticsCurrencyTotalDTO[]
  Monthly: AnalyticsMonthlyItemDTO[]
  Daily: AnalyticsDailyItemDTO[]
  ByCategory: AnalyticsCategoryItemDTO[]
  ByUser: AnalyticsUserItemDTO[]
}

function findApiRateForDate(fechaStr: string, sortedRatesAsc: Cotizacion[]): number {
  if (!sortedRatesAsc.length) return 1300
  const exacta = sortedRatesAsc.find((r) => r.fecha === fechaStr)
  if (exacta && exacta.valor > 0) return exacta.valor
  const anteriores = sortedRatesAsc.filter((r) => r.fecha <= fechaStr)
  if (anteriores.length > 0) {
    const val = anteriores[anteriores.length - 1].valor
    if (val > 0) return val
  }
  return sortedRatesAsc[0].valor > 0 ? sortedRatesAsc[0].valor : 1300
}

function getMovementConvertedAmounts(m: Movement): {
  ars: number
  usd: number
  cotizacion: number
  fechaCotizacion: string
} {
  if (esMonedaUsd(m.id_moneda, m.currencyDescription)) {
    const { valor, fechaCotizacion } = obtenerCotizacionParaFecha(m.date)
    return {
      ars: m.amount * valor,
      usd: m.amount,
      cotizacion: valor,
      fechaCotizacion,
    }
  }
  const conv = convertirArsADolar(m.amount, m.date)
  return {
    ars: m.amount,
    usd: conv.montoUsd,
    cotizacion: conv.cotizacionUtilizada,
    fechaCotizacion: conv.fechaCotizacion,
  }
}

export default function AdminAnalyticsPage() {
  const { usuario } = useAuth()
  const esAdmin = usuario?.id_tipo_usuario === 2
  const isApiMode = getConfig().mode === 'api'

  const now = new Date()
  const defaultYear = now.getFullYear()
  const defaultMonth = now.getMonth()

  // Estados principales
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth)
  const [selectedWeekId, setSelectedWeekId] = useState<string>('all')
  const [currencyView, setCurrencyView] = useState<CurrencyView>('both')
  const [daySortOrder, setDaySortOrder] = useState<DaySortOrder>('day_asc')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')
  const [pieGrouping, setPieGrouping] = useState<PieGrouping>('category')
  const [activePieHover, setActivePieHover] = useState<string | null>(null)
  const [resetNotice, setResetNotice] = useState<string | null>(null)

  const [apiUsers, setApiUsers] = useState<Usuario[]>([])
  const [apiRates, setApiRates] = useState<Cotizacion[]>([])
  const [apiMonthAnalytics, setApiMonthAnalytics] = useState<AdminMovementsAnalyticsResponseDTO | null>(null)
  const [apiYearAnalytics, setApiYearAnalytics] = useState<AdminMovementsAnalyticsResponseDTO | null>(null)
  const [apiAnalyticsUnavailable, setApiAnalyticsUnavailable] = useState(false)

  // Carga inicial de usuarios y cotizaciones históricas en Modo API
  useEffect(() => {
    if (!isApiMode || !esAdmin) return
    const controller = new AbortController()

    obtenerUsuariosSistema(controller.signal)
      .then(setApiUsers)
      .catch(() => {
        if (!controller.signal.aborted) setApiUsers([])
      })

    obtenerHistorialCotizacionesApi(controller.signal)
      .then((rates) => {
        setApiRates(rates.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)))
      })
      .catch(() => {
        if (!controller.signal.aborted) setApiRates([])
      })

    return () => controller.abort()
  }, [isApiMode, esAdmin])

  // Carga de analíticas agregadas (mensual + anual) desde GET /api/Admin/analytics/movements
  useEffect(() => {
    if (!isApiMode || !esAdmin) return
    const controller = new AbortController()

    const userParam = selectedUserId !== 'all' ? `&userId=${encodeURIComponent(selectedUserId)}` : ''
    const monthUrl = `${API_ENDPOINTS.admin.analiticasMovimientos}?year=${selectedYear}&month=${selectedMonth + 1}${userParam}`
    const yearUrl = `${API_ENDPOINTS.admin.analiticasMovimientos}?year=${selectedYear}${userParam}`

    Promise.all([
      apiFetch(monthUrl, { signal: controller.signal }),
      apiFetch(yearUrl, { signal: controller.signal }),
    ])
      .then(async ([monthRes, yearRes]) => {
        if (!monthRes.ok || !yearRes.ok) {
          setApiAnalyticsUnavailable(true)
          setApiMonthAnalytics(null)
          setApiYearAnalytics(null)
          return
        }
        const [monthJson, yearJson] = (await Promise.all([
          monthRes.json(),
          yearRes.json(),
        ])) as [AdminMovementsAnalyticsResponseDTO, AdminMovementsAnalyticsResponseDTO]

        setApiMonthAnalytics(monthJson)
        setApiYearAnalytics(yearJson)
        setApiAnalyticsUnavailable(false)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setApiAnalyticsUnavailable(true)
          setApiMonthAnalytics(null)
          setApiYearAnalytics(null)
        }
      })

    return () => controller.abort()
  }, [isApiMode, esAdmin, selectedYear, selectedMonth, selectedUserId])

  const localMovements = useMemo(() => (isApiMode ? [] : loadAllLocalMovements()), [isApiMode])
  const localUsers = useMemo(() => (isApiMode ? [] : loadLocalUsers()), [isApiMode])

  const allMovements = localMovements
  const allUsers = isApiMode ? apiUsers : localUsers

  // Años disponibles en los movimientos registrados
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([defaultYear, defaultYear - 1, defaultYear - 2])
    if (isApiMode) {
      apiYearAnalytics?.Monthly?.forEach((m) => {
        if (m.Year) yearsSet.add(m.Year)
      })
    } else {
      allMovements.forEach((m) => {
        const y = parseInt(m.date.split('-')[0], 10)
        if (!isNaN(y)) yearsSet.add(y)
      })
    }
    return Array.from(yearsSet).sort((a, b) => b - a)
  }, [isApiMode, apiYearAnalytics, allMovements, defaultYear])

  // Cantidad de días reales en el mes seleccionado
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate()
  }, [selectedYear, selectedMonth])

  // Cotización de referencia del mes para consolidaciones ARS/USD en Modo API
  const monthRefRate = useMemo(() => {
    const monthEndStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(
      daysInMonth
    ).padStart(2, '0')}`
    return findApiRateForDate(monthEndStr, apiRates)
  }, [selectedYear, selectedMonth, daysInMonth, apiRates])

  // Semana activa
  const activeWeek = useMemo(() => {
    return WEEK_OPTIONS.find((w) => w.id === selectedWeekId) || WEEK_OPTIONS[0]
  }, [selectedWeekId])

  // Rango de días para la vista diaria (semanal o mes completo)
  const dayRange = useMemo(() => {
    const start = Math.max(1, activeWeek.startDay)
    const end = Math.min(daysInMonth, activeWeek.endDay)
    return { start, end }
  }, [activeWeek, daysInMonth])

  // Nombre del usuario seleccionado
  const selectedUserObj = useMemo(() => {
    if (selectedUserId === 'all') return null
    return allUsers.find((u) => u.id_usuario === selectedUserId) || null
  }, [allUsers, selectedUserId])

  // Movimientos del mes seleccionado filtrados por usuario y categoría (Modo Local)
  const monthMovements = useMemo(() => {
    if (isApiMode) return []
    return allMovements.filter((mov) => {
      if (selectedUserId !== 'all' && mov.id_usuario !== selectedUserId) return false
      const [y, m] = mov.date.split('-').map(Number)
      if (y !== selectedYear || m !== selectedMonth + 1) return false
      if (selectedCategoryFilter !== 'all' && mov.category !== selectedCategoryFilter) return false
      return true
    })
  }, [isApiMode, allMovements, selectedUserId, selectedYear, selectedMonth, selectedCategoryFilter])

  // Gastos del mes (Modo Local)
  const monthExpenseMovements = useMemo(
    () => monthMovements.filter((m) => m.type === 'expense'),
    [monthMovements]
  )
  const monthIncomeMovements = useMemo(
    () => monthMovements.filter((m) => m.type === 'income'),
    [monthMovements]
  )

  // Totales del mes en ARS y USD
  const monthTotals = useMemo(() => {
    if (isApiMode) {
      let expArsRaw = 0
      let expUsdRaw = 0
      let incArsRaw = 0
      let incUsdRaw = 0

      ;(apiMonthAnalytics?.TotalsByCurrency || []).forEach((row) => {
        if (esMonedaUsd(String(row.CurrencyId), row.CurrencyDescription)) {
          expUsdRaw += Number(row.TotalExpenses || 0)
          incUsdRaw += Number(row.TotalIncome || 0)
        } else {
          expArsRaw += Number(row.TotalExpenses || 0)
          incArsRaw += Number(row.TotalIncome || 0)
        }
      })

      const totalExpenseArs = expArsRaw + expUsdRaw * monthRefRate
      const totalExpenseUsd = expUsdRaw + (monthRefRate > 0 ? expArsRaw / monthRefRate : 0)
      const totalIncomeArs = incArsRaw + incUsdRaw * monthRefRate
      const totalIncomeUsd = incUsdRaw + (monthRefRate > 0 ? incArsRaw / monthRefRate : 0)

      const countExpenses = (apiMonthAnalytics?.ByCategory || [])
        .filter((c) => c.CategoryType === 'Gasto')
        .reduce((acc, c) => acc + Number(c.MovementCount || 0), 0)
      const countIncomes = (apiMonthAnalytics?.ByCategory || [])
        .filter((c) => c.CategoryType === 'Ingreso')
        .reduce((acc, c) => acc + Number(c.MovementCount || 0), 0)

      return {
        totalExpenseArs,
        totalExpenseUsd,
        totalIncomeArs,
        totalIncomeUsd,
        balanceArs: totalIncomeArs - totalExpenseArs,
        balanceUsd: totalIncomeUsd - totalExpenseUsd,
        countExpenses,
        countIncomes,
      }
    }

    let totalExpenseArs = 0
    let totalExpenseUsd = 0
    let totalIncomeArs = 0
    let totalIncomeUsd = 0

    monthExpenseMovements.forEach((m) => {
      const conv = getMovementConvertedAmounts(m)
      totalExpenseArs += conv.ars
      totalExpenseUsd += conv.usd
    })

    monthIncomeMovements.forEach((m) => {
      const conv = getMovementConvertedAmounts(m)
      totalIncomeArs += conv.ars
      totalIncomeUsd += conv.usd
    })

    return {
      totalExpenseArs,
      totalExpenseUsd,
      totalIncomeArs,
      totalIncomeUsd,
      balanceArs: totalIncomeArs - totalExpenseArs,
      balanceUsd: totalIncomeUsd - totalExpenseUsd,
      countExpenses: monthExpenseMovements.length,
      countIncomes: monthIncomeMovements.length,
    }
  }, [isApiMode, apiMonthAnalytics, monthRefRate, monthExpenseMovements, monthIncomeMovements])

  // ==============================================================
  // 1. DÍAS COMPLETOS (SIN SALTEARSE NINGÚN DÍA)
  // ==============================================================
  const fullDailyData = useMemo(() => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const result = []

    for (let d = dayRange.start; d <= dayRange.end; d++) {
      const dateObj = new Date(selectedYear, selectedMonth, d)
      const dayName = dayNames[dateObj.getDay()]
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`

      if (isApiMode) {
        const dayEntries = (apiMonthAnalytics?.Daily || []).filter(
          (item) => String(item.Date).slice(0, 10) === dateStr
        )
        let expArsRaw = 0
        let expUsdRaw = 0
        let dayCount = 0

        dayEntries.forEach((item) => {
          const exp = Number(item.TotalExpenses || 0)
          if (esMonedaUsd(String(item.CurrencyId), item.CurrencyDescription)) {
            expUsdRaw += exp
          } else {
            expArsRaw += exp
          }
          if (exp > 0) {
            dayCount += Number(item.MovementCount || 0)
          }
        })

        const dayRate = findApiRateForDate(dateStr, apiRates)
        const totalArs = expArsRaw + expUsdRaw * dayRate
        const totalUsd = expUsdRaw + (dayRate > 0 ? expArsRaw / dayRate : 0)

        result.push({
          dayNumber: d,
          dayName,
          dateStr,
          totalArs,
          totalUsd,
          count: dayCount,
          cotizacion: dayRate,
          categories: [] as string[],
          movements: [] as Movement[],
        })
      } else {
        // Movimientos de gasto en esta fecha exacta (Modo Local)
        const dayExpenses = monthExpenseMovements.filter((m) => m.date === dateStr)

        let totalArs = 0
        let totalUsd = 0
        let lastCotiz = 0
        const categoriesSet = new Set<string>()

        dayExpenses.forEach((m) => {
          const conv = getMovementConvertedAmounts(m)
          totalArs += conv.ars
          totalUsd += conv.usd
          lastCotiz = conv.cotizacion
          if (m.category) categoriesSet.add(m.category)
        })

        if (lastCotiz === 0) {
          const { cotizacionUtilizada } = convertirArsADolar(1, dateStr)
          lastCotiz = cotizacionUtilizada
        }

        result.push({
          dayNumber: d,
          dayName,
          dateStr,
          totalArs,
          totalUsd,
          count: dayExpenses.length,
          cotizacion: lastCotiz,
          categories: Array.from(categoriesSet),
          movements: dayExpenses,
        })
      }
    }

    if (daySortOrder === 'day_desc') {
      result.sort((a, b) => b.dayNumber - a.dayNumber)
    } else if (daySortOrder === 'amount_desc') {
      result.sort((a, b) => b.totalArs - a.totalArs)
    } else {
      result.sort((a, b) => a.dayNumber - b.dayNumber)
    }

    return result
  }, [
    isApiMode,
    apiMonthAnalytics,
    apiRates,
    dayRange,
    selectedYear,
    selectedMonth,
    monthExpenseMovements,
    daySortOrder,
  ])

  // Días con consumo > 0 para calcular promedio
  const daysWithExpense = fullDailyData.filter((d) => d.totalArs > 0)
  const activeDaysCount = daysWithExpense.length || 1
  const dailyAverageArs = monthTotals.totalExpenseArs / activeDaysCount
  const dailyAverageUsd = monthTotals.totalExpenseUsd / activeDaysCount

  const maxDailyArs = Math.max(1, ...fullDailyData.map((d) => d.totalArs))

  // ==============================================================
  // 2. EVOLUCIÓN MENSUAL (12 MESES)
  // ==============================================================
  const yearlyMonthsData = useMemo(() => {
    return MONTHS.map((mObj) => {
      const monthIdx = mObj.value
      const monthNum = monthIdx + 1

      if (isApiMode) {
        const entries = (apiYearAnalytics?.Monthly || []).filter(
          (item) => item.Year === selectedYear && item.Month === monthNum
        )
        let expArsRaw = 0
        let expUsdRaw = 0
        let count = 0

        entries.forEach((item) => {
          const exp = Number(item.TotalExpenses || 0)
          if (esMonedaUsd(String(item.CurrencyId), item.CurrencyDescription)) {
            expUsdRaw += exp
          } else {
            expArsRaw += exp
          }
          if (exp > 0) count += Number(item.MovementCount || 0)
        })

        const lastDayOfMonth = new Date(selectedYear, monthNum, 0).getDate()
        const monthEndStr = `${selectedYear}-${String(monthNum).padStart(2, '0')}-${String(
          lastDayOfMonth
        ).padStart(2, '0')}`
        const rate = findApiRateForDate(monthEndStr, apiRates)

        const totalArs = expArsRaw + expUsdRaw * rate
        const totalUsd = expUsdRaw + (rate > 0 ? expArsRaw / rate : 0)

        return {
          monthNumber: monthNum,
          monthName: mObj.label,
          shortName: mObj.label.slice(0, 3),
          totalArs,
          totalUsd,
          count,
          isCurrentSelected: monthIdx === selectedMonth,
        }
      }

      const expenses = allMovements.filter((m) => {
        if (selectedUserId !== 'all' && m.id_usuario !== selectedUserId) return false
        if (m.type !== 'expense') return false
        const [y, mNum] = m.date.split('-').map(Number)
        return y === selectedYear && mNum === monthNum
      })

      let totalArs = 0
      let totalUsd = 0
      expenses.forEach((item) => {
        const conv = getMovementConvertedAmounts(item)
        totalArs += conv.ars
        totalUsd += conv.usd
      })

      return {
        monthNumber: monthNum,
        monthName: mObj.label,
        shortName: mObj.label.slice(0, 3),
        totalArs,
        totalUsd,
        count: expenses.length,
        isCurrentSelected: monthIdx === selectedMonth,
      }
    })
  }, [isApiMode, apiYearAnalytics, apiRates, allMovements, selectedUserId, selectedYear, selectedMonth])

  const maxMonthArs = Math.max(1, ...yearlyMonthsData.map((m) => m.totalArs))
  const yearlyTotalArs = yearlyMonthsData.reduce((acc, m) => acc + m.totalArs, 0)
  const yearlyTotalUsd = yearlyMonthsData.reduce((acc, m) => acc + m.totalUsd, 0)
  const monthsWithExpenseCount = yearlyMonthsData.filter((m) => m.totalArs > 0).length || 1
  const monthlyAverageArs = yearlyTotalArs / monthsWithExpenseCount
  const monthlyAverageUsd = yearlyTotalUsd / monthsWithExpenseCount

  // ==============================================================
  // 3. GRÁFICO DE TORTAS / DESGLOSE (CATEGORÍAS O USUARIOS)
  // ==============================================================
  const pieData = useMemo(() => {
    if (isApiMode) {
      if (pieGrouping === 'user' && selectedUserId === 'all') {
        const userMap = new Map<string, { name: string; totalArs: number; totalUsd: number; count: number }>()
        ;(apiMonthAnalytics?.ByUser || []).forEach((row) => {
          const uid = String(row.UserId)
          const existing = userMap.get(uid) || {
            name: row.UserFullName || row.Email || `Usuario ${uid.slice(0, 6)}`,
            totalArs: 0,
            totalUsd: 0,
            count: 0,
          }
          const exp = Number(row.TotalExpenses || 0)
          if (exp > 0) {
            if (esMonedaUsd(String(row.CurrencyId), row.CurrencyDescription)) {
              existing.totalArs += exp * monthRefRate
              existing.totalUsd += exp
            } else {
              existing.totalArs += exp
              existing.totalUsd += monthRefRate > 0 ? exp / monthRefRate : 0
            }
            existing.count += Number(row.MovementCount || 0)
          }
          userMap.set(uid, existing)
        })

        const list = Array.from(userMap.values()).filter((item) => item.totalArs > 0)
        list.sort((a, b) => b.totalArs - a.totalArs)
        const sumArs = list.reduce((acc, cur) => acc + cur.totalArs, 0) || 1
        return list.map((item, idx) => ({
          label: item.name,
          totalArs: item.totalArs,
          totalUsd: item.totalUsd,
          count: item.count,
          percent: (item.totalArs / sumArs) * 100,
          color: PALETTE[idx % PALETTE.length],
        }))
      } else {
        const catMap = new Map<string, { totalArs: number; totalUsd: number; count: number }>()
        ;(apiMonthAnalytics?.ByCategory || [])
          .filter((row) => row.CategoryType === 'Gasto')
          .forEach((row) => {
            const cat = row.CategoryDescription || 'Sin Categoría'
            const existing = catMap.get(cat) || { totalArs: 0, totalUsd: 0, count: 0 }
            const amt = Number(row.TotalAmount || 0)
            if (esMonedaUsd(String(row.CurrencyId), row.CurrencyDescription)) {
              existing.totalArs += amt * monthRefRate
              existing.totalUsd += amt
            } else {
              existing.totalArs += amt
              existing.totalUsd += monthRefRate > 0 ? amt / monthRefRate : 0
            }
            existing.count += Number(row.MovementCount || 0)
            catMap.set(cat, existing)
          })

        const list = Array.from(catMap.entries())
          .map(([cat, data]) => ({ name: cat, ...data }))
          .filter((item) => item.totalArs > 0)
        list.sort((a, b) => b.totalArs - a.totalArs)
        const sumArs = list.reduce((acc, cur) => acc + cur.totalArs, 0) || 1
        return list.map((item, idx) => ({
          label: item.name,
          totalArs: item.totalArs,
          totalUsd: item.totalUsd,
          count: item.count,
          percent: (item.totalArs / sumArs) * 100,
          color: PALETTE[idx % PALETTE.length],
        }))
      }
    }

    if (pieGrouping === 'user' && selectedUserId === 'all') {
      // Agrupado por Usuario (Modo Local)
      const userMap = new Map<string, { name: string; totalArs: number; totalUsd: number; count: number }>()
      allUsers.forEach((u) => {
        userMap.set(u.id_usuario, {
          name: `${u.nombre} ${u.apellido}`,
          totalArs: 0,
          totalUsd: 0,
          count: 0,
        })
      })

      monthExpenseMovements.forEach((m) => {
        const item = userMap.get(m.id_usuario)
        if (item) {
          const conv = getMovementConvertedAmounts(m)
          item.totalArs += conv.ars
          item.totalUsd += conv.usd
          item.count += 1
        }
      })

      const list = Array.from(userMap.values()).filter((item) => item.totalArs > 0)
      list.sort((a, b) => b.totalArs - a.totalArs)

      const sumArs = list.reduce((acc, cur) => acc + cur.totalArs, 0) || 1
      return list.map((item, idx) => ({
        label: item.name,
        totalArs: item.totalArs,
        totalUsd: item.totalUsd,
        count: item.count,
        percent: (item.totalArs / sumArs) * 100,
        color: PALETTE[idx % PALETTE.length],
      }))
    } else {
      // Agrupado por Categoría (Modo Local)
      const catMap = new Map<string, { totalArs: number; totalUsd: number; count: number }>()
      monthExpenseMovements.forEach((m) => {
        const cat = m.category || 'Sin Categoría'
        const existing = catMap.get(cat) || { totalArs: 0, totalUsd: 0, count: 0 }
        const conv = getMovementConvertedAmounts(m)
        existing.totalArs += conv.ars
        existing.totalUsd += conv.usd
        existing.count += 1
        catMap.set(cat, existing)
      })

      const list = Array.from(catMap.entries()).map(([cat, data]) => ({
        name: cat,
        ...data,
      }))
      list.sort((a, b) => b.totalArs - a.totalArs)

      const sumArs = list.reduce((acc, cur) => acc + cur.totalArs, 0) || 1
      return list.map((item, idx) => ({
        label: item.name,
        totalArs: item.totalArs,
        totalUsd: item.totalUsd,
        count: item.count,
        percent: (item.totalArs / sumArs) * 100,
        color: PALETTE[idx % PALETTE.length],
      }))
    }
  }, [isApiMode, apiMonthAnalytics, monthRefRate, pieGrouping, selectedUserId, allUsers, monthExpenseMovements])

  // Categoría top del mes
  const topCategoryItem = useMemo(() => {
    if (isApiMode) {
      const catMap = new Map<string, number>()
      ;(apiMonthAnalytics?.ByCategory || [])
        .filter((row) => row.CategoryType === 'Gasto')
        .forEach((row) => {
          const c = row.CategoryDescription || 'Sin Categoría'
          const amt = Number(row.TotalAmount || 0)
          const ars = esMonedaUsd(String(row.CurrencyId), row.CurrencyDescription)
            ? amt * monthRefRate
            : amt
          catMap.set(c, (catMap.get(c) || 0) + ars)
        })
      const sorted = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])
      return sorted.length ? { name: sorted[0][0], totalArs: sorted[0][1] } : null
    }

    const catMap = new Map<string, number>()
    monthExpenseMovements.forEach((m) => {
      const c = m.category || 'Sin Categoría'
      const conv = getMovementConvertedAmounts(m)
      catMap.set(c, (catMap.get(c) || 0) + conv.ars)
    })
    const sorted = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])
    return sorted.length ? { name: sorted[0][0], totalArs: sorted[0][1] } : null
  }, [isApiMode, apiMonthAnalytics, monthRefRate, monthExpenseMovements])

  // Desglose por Usuario en modo "Todos los usuarios"
  const userConsolidatedStats = useMemo(() => {
    if (selectedUserId !== 'all') return []

    if (isApiMode) {
      return allUsers
        .map((u) => {
          const userRows = (apiMonthAnalytics?.ByUser || []).filter(
            (r) => String(r.UserId) === u.id_usuario
          )
          let expArsRaw = 0
          let expUsdRaw = 0
          let count = 0
          userRows.forEach((r) => {
            const exp = Number(r.TotalExpenses || 0)
            if (esMonedaUsd(String(r.CurrencyId), r.CurrencyDescription)) {
              expUsdRaw += exp
            } else {
              expArsRaw += exp
            }
            if (exp > 0) count += Number(r.MovementCount || 0)
          })
          const totalArs = expArsRaw + expUsdRaw * monthRefRate
          const totalUsd = expUsdRaw + (monthRefRate > 0 ? expArsRaw / monthRefRate : 0)
          const pct =
            monthTotals.totalExpenseArs > 0 ? (totalArs / monthTotals.totalExpenseArs) * 100 : 0
          return {
            user: u,
            totalArs,
            totalUsd,
            count,
            pct,
          }
        })
        .sort((a, b) => b.totalArs - a.totalArs)
    }

    return allUsers
      .map((u) => {
        const userExpenses = monthExpenseMovements.filter((m) => m.id_usuario === u.id_usuario)
        let totalArs = 0
        let totalUsd = 0
        userExpenses.forEach((m) => {
          const conv = getMovementConvertedAmounts(m)
          totalArs += conv.ars
          totalUsd += conv.usd
        })
        const pct =
          monthTotals.totalExpenseArs > 0 ? (totalArs / monthTotals.totalExpenseArs) * 100 : 0
        return {
          user: u,
          totalArs,
          totalUsd,
          count: userExpenses.length,
          pct,
        }
      })
      .sort((a, b) => b.totalArs - a.totalArs)
  }, [
    isApiMode,
    apiMonthAnalytics,
    monthRefRate,
    allUsers,
    monthExpenseMovements,
    monthTotals.totalExpenseArs,
    selectedUserId,
  ])

  // Formateadores
  const formatArs = (amount: number) => `$ ${Math.round(amount).toLocaleString('es-AR')}`
  const formatUsd = (amount: number) =>
    `US$ ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Función de Restablecimiento Real de Filtros
  function handleResetFilters() {
    setSelectedUserId('all')
    setSelectedYear(defaultYear)
    setSelectedMonth(defaultMonth)
    setSelectedWeekId('all')
    setSelectedCategoryFilter('all')
    setCurrencyView('both')
    setDaySortOrder('day_asc')
    setViewMode('daily')
    setPieGrouping('category')
    setActivePieHover(null)

    setResetNotice('Filtros restablecidos a la vista general con éxito.')
    setTimeout(() => {
      setResetNotice(null)
    }, 4000)
  }

  // Coordenadas para el SVG Donut Chart
  const svgRadius = 65
  const svgCircumference = 2 * Math.PI * svgRadius

  // Calcular segmentos de donut
  let cumulativePercent = 0
  const donutSegments = pieData.map((slice) => {
    const strokeDasharray = `${(slice.percent / 100) * svgCircumference} ${svgCircumference}`
    const strokeDashoffset = -((cumulativePercent / 100) * svgCircumference)
    cumulativePercent += slice.percent
    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
    }
  })

  if (!esAdmin) {
    return (
      <div className="empty-state">
        <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h1>Acceso Restringido</h1>
        <p>Esta sección de analíticas y gráficos es de acceso exclusivo para administradores del sistema.</p>
        <Link to="/" className="primary-button" style={{ display: 'inline-block', marginTop: 16 }}>
          Volver a mi panel
        </Link>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      {isApiMode && apiAnalyticsUnavailable && (
        <div
          className="connection-status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
          }}
        >
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>
            No se pudieron obtener las analíticas desde <code>GET /api/Admin/analytics/movements</code>. Verificá que el servidor esté en línea y que tu sesión de Administrador sea válida.
          </span>
        </div>
      )}

      {/* Notificación de reset */}
      {resetNotice && (
        <div
          className="connection-status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            background: '#dcfce7',
            color: '#166534',
          }}
        >
          <CheckCircle size={18} />
          <span>{resetNotice}</span>
        </div>
      )}

      {/* Header */}
      <header className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-eyebrow">Funcionalidad Exclusiva Administrador</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>Consumos y Gráficos</h1>
            <span
              style={{
                background: '#4c1d95',
                color: '#ddd6fe',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <BarChart3 size={14} /> Panel Analítico
            </span>
          </div>
          <p className="page-description">
            Monitoreo bimonetario (ARS / USD), gráficos de barras sin días omitidos y distribución en torta por categorías o usuarios.
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="secondary-button"
            onClick={handleResetFilters}
            title="Restablecer todos los filtros a sus valores predeterminados"
          >
            <RotateCcw size={15} /> Restablecer filtros
          </button>
        </div>
      </header>

      {/* Selector de Modo de Visualización (Pestañas) */}
      <div className="view-mode-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'daily'}
          className={`view-mode-tab-btn ${viewMode === 'daily' ? 'active' : ''}`}
          onClick={() => setViewMode('daily')}
        >
          <BarChart3 size={18} />
          <span>Consumos por Día / Semana</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'monthly'}
          className={`view-mode-tab-btn ${viewMode === 'monthly' ? 'active' : ''}`}
          onClick={() => setViewMode('monthly')}
        >
          <PieChartIcon size={18} />
          <span>Consumos por Mes y Gráfico de Torta</span>
        </button>
      </div>

      {/* Barra de Filtros Principales */}
      <div className="admin-controls-card">
        <div className="admin-controls-grid">
          {/* Selector de Usuario */}
          <div className="admin-control-group">
            <label htmlFor="user-select" className="admin-control-label">
              <Users size={16} /> Usuario a Analizar
            </label>
            <select
              id="user-select"
              className="admin-select"
              value={selectedUserId}
              onChange={(e) => {
                const nextUser = e.target.value
                setSelectedUserId(nextUser)
                if (nextUser !== 'all' && pieGrouping === 'user') {
                  setPieGrouping('category')
                }
              }}
            >
              <option value="all">👥 Todos los usuarios (Consolidado General)</option>
              {allUsers.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  👤 {u.nombre} {u.apellido} ({u.correo_electronico})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Año y Mes */}
          <div className="admin-control-group">
            <label htmlFor="month-select" className="admin-control-label">
              <Calendar size={16} /> Mes y Año
            </label>
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <select
                id="month-select"
                className="admin-select"
                style={{ flex: 2, minWidth: 0 }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Año"
                className="admin-select"
                style={{ flex: 1, minWidth: 0 }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Semana (Activo en vista diaria) */}
          {viewMode === 'daily' ? (
            <div className="admin-control-group">
              <label htmlFor="week-select" className="admin-control-label">
                <CalendarRange size={16} /> Filtro de Semana
              </label>
              <select
                id="week-select"
                className="admin-select"
                value={selectedWeekId}
                onChange={(e) => setSelectedWeekId(e.target.value)}
              >
                {WEEK_OPTIONS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* En vista mensual: Selector de Agrupamiento de Torta */
            <div className="admin-control-group">
              <label htmlFor="pie-grouping" className="admin-control-label">
                <Layers size={16} /> Agrupar Gráfico de Torta Por
              </label>
              <select
                id="pie-grouping"
                className="admin-select"
                value={pieGrouping}
                onChange={(e) => {
                  const nextGrouping = e.target.value as PieGrouping
                  setPieGrouping(nextGrouping)
                  if (nextGrouping === 'user' && selectedUserId !== 'all') {
                    setSelectedUserId('all')
                  }
                }}
              >
                <option value="category">Categorías de Consumo</option>
                <option value="user">Usuarios del Sistema</option>
              </select>
            </div>
          )}

          {/* Selector de Moneda */}
          <div className="admin-control-group">
            <label htmlFor="currency-select" className="admin-control-label">
              <DollarSign size={16} /> Visualización Monetaria
            </label>
            <div className="currency-pill-toggle" role="group" aria-label="Visualización monetaria">
              <button
                type="button"
                className={`currency-pill-button ${currencyView === 'both' ? 'active' : ''}`}
                onClick={() => setCurrencyView('both')}
                title="Mostrar en Pesos y Dólares simultáneamente"
              >
                ARS + USD
              </button>
              <button
                type="button"
                className={`currency-pill-button ${currencyView === 'ars' ? 'active' : ''}`}
                onClick={() => setCurrencyView('ars')}
                title="Mostrar exclusivamente en Pesos Argentinos"
              >
                Pesos ($)
              </button>
              <button
                type="button"
                className={`currency-pill-button ${currencyView === 'usd' ? 'active' : ''}`}
                onClick={() => setCurrencyView('usd')}
                title="Mostrar exclusivamente en Dólares Estadounidenses"
              >
                Dólares (US$)
              </button>
            </div>
          </div>
        </div>

        {/* Banner de Contexto Activo */}
        <div className="active-context-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="context-chip">
              <strong>Foco:</strong>{' '}
              {selectedUserObj
                ? `${selectedUserObj.nombre} ${selectedUserObj.apellido} (ID #${selectedUserObj.id_usuario})`
                : 'Todos los usuarios de la plataforma'}
            </span>
            <span className="context-chip">
              <strong>Período:</strong> {MONTHS[selectedMonth].label} {selectedYear}
            </span>
            {viewMode === 'daily' && (
              <span className="context-chip">
                <strong>Rango días:</strong> Días {dayRange.start} al {dayRange.end}
              </span>
            )}
            <span className="context-chip">
              <strong>Operaciones del mes:</strong> {monthTotals.countExpenses} gastos
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Regla de Negocio: Cotización histórica al día del movimiento (CU16/CU19).
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <section className="summary-grid" style={{ marginBottom: 32 }} aria-label="Métricas Principales">
        {/* Total Consumos */}
        <div className="summary-card summary-card--expense">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="summary-card__title">Total Consumos en el Mes</p>
            <TrendingDown size={20} color="#dc2626" />
          </div>
          <div className="summary-card__amount" style={{ color: '#dc2626', fontSize: '1.75rem' }}>
            {(currencyView === 'both' || currencyView === 'ars') && (
              <div>{formatArs(monthTotals.totalExpenseArs)}</div>
            )}
            {(currencyView === 'both' || currencyView === 'usd') && (
              <div
                style={{
                  fontSize: currencyView === 'usd' ? '1.75rem' : '1.1rem',
                  color: '#475569',
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {formatUsd(monthTotals.totalExpenseUsd)}
              </div>
            )}
          </div>
          <p className="summary-card__description">
            {monthTotals.countExpenses} gastos en {MONTHS[selectedMonth].label} {selectedYear}
          </p>
        </div>

        {/* Promedio Diario */}
        <div className="summary-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="summary-card__title">Promedio Diario del Mes</p>
            <Receipt size={20} color="#2563eb" />
          </div>
          <div className="summary-card__amount" style={{ fontSize: '1.75rem' }}>
            {(currencyView === 'both' || currencyView === 'ars') && (
              <div>{formatArs(dailyAverageArs)} / día</div>
            )}
            {(currencyView === 'both' || currencyView === 'usd') && (
              <div
                style={{
                  fontSize: currencyView === 'usd' ? '1.75rem' : '1.1rem',
                  color: '#475569',
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {formatUsd(dailyAverageUsd)} / día
              </div>
            )}
          </div>
          <p className="summary-card__description">
            Sobre {activeDaysCount} {activeDaysCount === 1 ? 'día con consumo' : 'días con consumos'}
          </p>
        </div>

        {/* Categoría Top */}
        <div className="summary-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="summary-card__title">Categoría de Mayor Consumo</p>
            <Layers size={20} color="#7c3aed" />
          </div>
          <div className="summary-card__amount" style={{ fontSize: '1.35rem', color: '#0f172a' }}>
            {topCategoryItem ? topCategoryItem.name : 'Sin gastos'}
          </div>
          <p className="summary-card__description">
            {topCategoryItem
              ? `${formatArs(topCategoryItem.totalArs)} · ${
                  monthTotals.totalExpenseArs > 0
                    ? Math.round((topCategoryItem.totalArs / monthTotals.totalExpenseArs) * 100)
                    : 0
                }% del total del mes`
              : 'Sin movimientos registrados en este mes'}
          </p>
        </div>

        {/* Total Ingresos & Balance */}
        <div className="summary-card summary-card--income">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="summary-card__title">Total Ingresos / Balance</p>
            <TrendingUp size={20} color="#16a34a" />
          </div>
          <div className="summary-card__amount" style={{ color: '#16a34a', fontSize: '1.75rem' }}>
            {(currencyView === 'both' || currencyView === 'ars') && (
              <div>{formatArs(monthTotals.totalIncomeArs)}</div>
            )}
            {(currencyView === 'both' || currencyView === 'usd') && (
              <div
                style={{
                  fontSize: currencyView === 'usd' ? '1.75rem' : '1.1rem',
                  color: '#475569',
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                {formatUsd(monthTotals.totalIncomeUsd)}
              </div>
            )}
          </div>
          <p className="summary-card__description">
            Balance neto: {formatArs(monthTotals.balanceArs)} ({formatUsd(monthTotals.balanceUsd)})
          </p>
        </div>
      </section>

      {/* ============================================================== */}
      {/* VISTA 1: CONSUMOS POR DÍA / SEMANA (TODOS LOS DÍAS INCLUIDOS)   */}
      {/* ============================================================== */}
      {viewMode === 'daily' && (
        <>
          <section className="analytics-section" style={{ marginBottom: 36 }}>
            <div className="section-title-row">
              <div>
                <h2 className="section-title">
                  Consumos Diarios · {activeWeek.label} ({MONTHS[selectedMonth].label} {selectedYear})
                </h2>
                <p className="section-subtitle">
                  Muestra <strong>todos los días sin saltear ninguno</strong> (Lunes a Domingo). Los días sin gastos se indican con $0 para visualizar con precisión la continuidad temporal.
                </p>
              </div>

              {/* Botonera de cambio rápido de semana */}
              <div className="week-pills-container">
                {WEEK_OPTIONS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className={`week-pill-btn ${selectedWeekId === w.id ? 'active' : ''}`}
                    onClick={() => setSelectedWeekId(w.id)}
                  >
                    {w.id === 'all' ? 'Mes Completo' : w.id.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Histograma de Todos los Días */}
            <div className="daily-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.95rem', margin: 0, color: '#334155' }}>
                  Histograma de Gastos por Día (
                  {currencyView === 'usd' ? 'Valores en USD' : 'Valores en ARS'})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Mostrando días {dayRange.start} al {dayRange.end}
                </span>
              </div>

              <div className="daily-bars-container">
                {fullDailyData.map((item) => {
                  const hasExpense = item.totalArs > 0
                  const heightPct = hasExpense
                    ? Math.max(16, Math.round((item.totalArs / maxDailyArs) * 100))
                    : 6 // barra sutil para día sin gastos
                  const displayValue =
                    currencyView === 'usd' ? formatUsd(item.totalUsd) : formatArs(item.totalArs)

                  return (
                    <div
                      key={item.dateStr}
                      className={`daily-bar-column ${hasExpense ? 'has-expense' : 'no-expense'}`}
                      title={`${item.dayName} ${item.dayNumber} (${item.dateStr}): ${displayValue} · ${
                        hasExpense ? `${item.count} mov.` : 'Sin gastos'
                      }`}
                    >
                      <div className="daily-bar-tooltip">
                        <strong>
                          {item.dayName} {item.dayNumber}
                        </strong>
                        : {displayValue}
                        {hasExpense && ` (${item.count} op.)`}
                      </div>
                      <div
                        className={`daily-bar-fill ${hasExpense ? 'daily-bar-fill--active' : 'daily-bar-fill--zero'}`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="daily-bar-label-group">
                        <span className="daily-bar-dayname">{item.dayName}</span>
                        <span className="daily-bar-daynumber">{item.dayNumber}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tabla Detallada Día a Día con Ordenamiento */}
            <div style={{ marginTop: 24 }}>
              <div className="section-title-row" style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>
                  Detalle Cronológico Día por Día
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label htmlFor="day-order-select" style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>
                    Ordenar:
                  </label>
                  <select
                    id="day-order-select"
                    className="admin-select"
                    style={{ height: 36, fontSize: '0.8rem' }}
                    value={daySortOrder}
                    onChange={(e) => setDaySortOrder(e.target.value as DaySortOrder)}
                  >
                    <option value="day_asc">Día (Ascendente 1 ➔ fin)</option>
                    <option value="day_desc">Día (Descendente)</option>
                    <option value="amount_desc">Mayor Consumo Primero</option>
                  </select>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Día / Fecha</th>
                      <th>Día de la Semana</th>
                      <th>Consumo ARS ($)</th>
                      <th>Consumo USD (US$)</th>
                      <th>Cotización Aplicada</th>
                      <th>Categorías</th>
                      <th style={{ textAlign: 'right' }}>Operaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullDailyData.map((item) => (
                      <tr key={item.dateStr} style={{ opacity: item.totalArs === 0 ? 0.65 : 1 }}>
                        <td>
                          <strong>Día {item.dayNumber}</strong>{' '}
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({item.dateStr})</span>
                        </td>
                        <td>
                          <span className="badge badge--neutral">{item.dayName}</span>
                        </td>
                        <td
                          style={{
                            fontWeight: 700,
                            color: item.totalArs > 0 ? '#dc2626' : '#94a3b8',
                          }}
                        >
                          {formatArs(item.totalArs)}
                        </td>
                        <td
                          style={{
                            fontWeight: 600,
                            color: item.totalUsd > 0 ? '#0f172a' : '#94a3b8',
                          }}
                        >
                          {formatUsd(item.totalUsd)}
                        </td>
                        <td>
                          <span className="cotizacion-tag">
                            1 USD = ${item.cotizacion} ARS
                          </span>
                        </td>
                        <td>
                          {item.categories.length > 0 ? (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {item.categories.map((c) => (
                                <span key={c} className="table-category-tag">
                                  {c}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: CONSUMOS POR MES Y GRÁFICO DE TORTA                   */}
      {/* ============================================================== */}
      {viewMode === 'monthly' && (
        <>
          {/* Gráfico de Torta / Donut y Ranking */}
          <section className="analytics-section" style={{ marginBottom: 36 }}>
            <div className="section-title-row">
              <div>
                <h2 className="section-title">
                  Gráfico de Torta · Distribución de Consumos ({MONTHS[selectedMonth].label} {selectedYear})
                </h2>
                <p className="section-subtitle">
                  Visualizá el porcentaje representativo de cada{' '}
                  {pieGrouping === 'category' ? 'categoría de gasto' : 'usuario'} sobre el total de consumos del mes.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 3, borderRadius: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`currency-pill-button ${pieGrouping === 'category' ? 'active' : ''}`}
                  style={{ padding: '6px 12px' }}
                  onClick={() => setPieGrouping('category')}
                >
                  Por Categorías
                </button>
                <button
                  type="button"
                  className={`currency-pill-button ${pieGrouping === 'user' ? 'active' : ''}`}
                  style={{ padding: '6px 12px' }}
                  onClick={() => {
                    setPieGrouping('user')
                    if (selectedUserId !== 'all') {
                      setSelectedUserId('all')
                    }
                  }}
                >
                  Por Usuarios
                </button>
              </div>
            </div>

            {pieData.length === 0 ? (
              <div className="empty-panel">
                <p>No hay gastos registrados en {MONTHS[selectedMonth].label} {selectedYear} para graficar.</p>
              </div>
            ) : (
              <div className="pie-section-grid">
                {/* Visual SVG Donut */}
                <div className="pie-chart-card">
                  <h3 style={{ fontSize: '0.95rem', margin: '0 0 16px', color: '#334155', textAlign: 'center' }}>
                    Participación Porcentual ({pieGrouping === 'category' ? 'Categorías' : 'Usuarios'})
                  </h3>

                  <div className="donut-chart-container">
                    <svg viewBox="0 0 180 180" className="donut-svg">
                      <circle
                        cx="90"
                        cy="90"
                        r={svgRadius}
                        className="donut-bg-ring"
                      />
                      {donutSegments.map((segment) => (
                        <circle
                          key={segment.label}
                          cx="90"
                          cy="90"
                          r={svgRadius}
                          fill="transparent"
                          stroke={segment.color}
                          strokeWidth="28"
                          strokeDasharray={segment.strokeDasharray}
                          strokeDashoffset={segment.strokeDashoffset}
                          className="donut-slice"
                          style={{
                            opacity: activePieHover && activePieHover !== segment.label ? 0.45 : 1,
                            transform: activePieHover === segment.label ? 'scale(1.02)' : 'scale(1)',
                            transformOrigin: '90px 90px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={() => setActivePieHover(segment.label)}
                          onMouseLeave={() => setActivePieHover(null)}
                        />
                      ))}
                    </svg>

                    {/* Centro del donut con total */}
                    <div className="donut-center-label">
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Mes</span>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                        {formatArs(monthTotals.totalExpenseArs)}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>
                        {formatUsd(monthTotals.totalExpenseUsd)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Leyenda y Desglose de Sectores de la Torta */}
                <div className="pie-legend-card">
                  <h3 style={{ fontSize: '0.95rem', margin: '0 0 16px', color: '#334155' }}>
                    Desglose de la Torta ({pieData.length} {pieGrouping === 'category' ? 'categorías' : 'usuarios'})
                  </h3>

                  <div className="pie-legend-list">
                    {pieData.map((slice) => {
                      const isHovered = activePieHover === slice.label
                      return (
                        <div
                          key={slice.label}
                          className={`pie-legend-item ${isHovered ? 'pie-legend-item--hover' : ''}`}
                          onMouseEnter={() => setActivePieHover(slice.label)}
                          onMouseLeave={() => setActivePieHover(null)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              className="category-color-dot"
                              style={{ backgroundColor: slice.color, width: 12, height: 12 }}
                            />
                            <div>
                              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{slice.label}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                                {slice.count} transacciones
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.9rem' }}>
                              {formatArs(slice.totalArs)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {formatUsd(slice.totalUsd)} ·{' '}
                              <strong style={{ color: '#0f172a' }}>{slice.percent.toFixed(1)}%</strong>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Gráfico Comparativo Mes a Mes (Año Completo) */}
          <section className="analytics-section" style={{ marginBottom: 36 }}>
            <div className="section-title-row">
              <div>
                <h2 className="section-title">Evolución Anual · Comparativa Mes a Mes ({selectedYear})</h2>
                <p className="section-subtitle">
                  Promedio mensual registrado: <strong>{formatArs(monthlyAverageArs)}</strong> (
                  {formatUsd(monthlyAverageUsd)}). Hacé clic en cualquier mes para seleccionarlo.
                </p>
              </div>
            </div>

            <div className="monthly-chart-card">
              <div className="monthly-bars-grid">
                {yearlyMonthsData.map((mItem, idx) => {
                  const hasData = mItem.totalArs > 0
                  const heightPct = hasData
                    ? Math.max(14, Math.round((mItem.totalArs / maxMonthArs) * 100))
                    : 6
                  const isSelected = mItem.isCurrentSelected

                  return (
                    <div
                      key={mItem.monthNumber}
                      className={`monthly-bar-col ${isSelected ? 'monthly-bar-col--selected' : ''}`}
                      onClick={() => setSelectedMonth(idx)}
                      role="button"
                      tabIndex={0}
                      title={`${mItem.monthName}: ${formatArs(mItem.totalArs)} / ${formatUsd(
                        mItem.totalUsd
                      )} (${mItem.count} gastos)`}
                    >
                      <div className="monthly-bar-tooltip">
                        <strong>{mItem.monthName}</strong>: {formatArs(mItem.totalArs)} ({formatUsd(mItem.totalUsd)})
                      </div>
                      <div
                        className={`monthly-bar-fill ${hasData ? 'monthly-bar-fill--active' : 'monthly-bar-fill--zero'}`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="monthly-bar-label">{mItem.shortName}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ============================================================== */}
      {/* SECCIÓN 3: TABLA DE USUARIOS (EN VISTA GENERAL)                 */}
      {/* ============================================================== */}
      {selectedUserId === 'all' && (
        <section className="analytics-section" style={{ marginBottom: 36 }}>
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Consolidado por Usuario en el Mes</h2>
              <p className="section-subtitle">
                Comparativa de gasto individual entre usuarios para {MONTHS[selectedMonth].label} {selectedYear}. Hacé clic en "Analizar Usuario" para filtrar toda la pantalla en ese usuario.
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Tipo Cuenta</th>
                  <th>Total Consumos ARS</th>
                  <th>Total Consumos USD</th>
                  <th>Gastos Registrados</th>
                  <th>% del Mes</th>
                  <th style={{ textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {userConsolidatedStats.map((item) => (
                  <tr key={item.user.id_usuario}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {item.user.nombre.charAt(0)}
                          {item.user.apellido.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {item.user.nombre} {item.user.apellido}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {item.user.correo_electronico} (ID #{item.user.id_usuario})
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.user.id_tipo_usuario === 2 ? 'badge--info' : 'badge--neutral'
                        }`}
                      >
                        {item.user.id_tipo_usuario === 2 ? 'Administrador' : 'Usuario Común'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#dc2626' }}>
                      {formatArs(item.totalArs)}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatUsd(item.totalUsd)}</td>
                    <td>{item.count} gastos</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${item.pct}%`, height: '100%', background: '#2563eb' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {item.pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setSelectedUserId(item.user.id_usuario)
                          if (pieGrouping === 'user') {
                            setPieGrouping('category')
                          }
                        }}
                        title={`Filtrar gráficos para ${item.user.nombre}`}
                      >
                        <Filter size={13} /> Analizar Usuario
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* SECCIÓN 4: REGISTRO DE MOVIMIENTOS DETALLADOS (MODO LOCAL)     */}
      {/* ============================================================== */}
      {!isApiMode && (
        <section className="analytics-section">
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Movimientos Registrados en el Período</h2>
              <p className="section-subtitle">
                Auditoría de operaciones con cotización histórica aplicada al momento de cada movimiento (CU16/CU19).
              </p>
            </div>
          </div>

          {monthMovements.length === 0 ? (
            <div className="empty-panel">
              <p>No hay movimientos registrados para los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Usuario</th>
                    <th>Categoría</th>
                    <th>Cuenta</th>
                    <th>Tipo</th>
                    <th style={{ textAlign: 'right' }}>Monto ARS</th>
                    <th style={{ textAlign: 'right' }}>Equivalente USD</th>
                    <th>Cotización Utilizada</th>
                  </tr>
                </thead>
                <tbody>
                  {monthMovements.map((m) => {
                    const conv = getMovementConvertedAmounts(m)
                    const userOwner = allUsers.find((u) => u.id_usuario === m.id_usuario)

                    return (
                      <tr key={m.id}>
                        <td>{m.date}</td>
                        <td style={{ fontWeight: 600 }}>
                          {m.description}
                          {m.note && (
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                              {m.note}
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                            {userOwner ? `${userOwner.nombre} ${userOwner.apellido}` : `ID ${m.id_usuario}`}
                          </span>
                        </td>
                        <td>
                          <span className="table-category-tag">{m.category}</span>
                        </td>
                        <td>{m.account}</td>
                        <td>
                          <span
                            className={`badge ${
                              m.type === 'income' ? 'badge--success' : 'badge--danger'
                            }`}
                          >
                            {m.type === 'income' ? 'Ingreso' : 'Gasto'}
                          </span>
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: m.type === 'income' ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {m.type === 'income' ? '+' : '-'} {formatArs(conv.ars)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                          {formatUsd(conv.usd)}
                        </td>
                        <td>
                          <span
                            className="cotizacion-tag"
                            title={`Cotización tomada al ${conv.fechaCotizacion}`}
                          >
                            $ {conv.cotizacion} ARS ({conv.fechaCotizacion})
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
