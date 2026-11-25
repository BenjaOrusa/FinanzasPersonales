using System;
using System.Collections.Generic;

namespace Finanzas.Application.DTOs.Response.Admin
{
    // Datos agregados de movimientos para los gráficos del panel de administración.
    // Los importes de monedas distintas nunca se suman entre sí: todo viene separado por moneda.
    public class AdminMovementsAnalyticsResponseDTO
    {
        // Filtros aplicados (null = sin filtrar)
        public int? Year { get; set; }
        public int? Month { get; set; }
        public Guid? UserId { get; set; }

        public IReadOnlyList<AnalyticsCurrencyTotalDTO> TotalsByCurrency { get; set; } = new List<AnalyticsCurrencyTotalDTO>();

        // Un registro por mes y moneda (consumo mensual)
        public IReadOnlyList<AnalyticsMonthlyItemDTO> Monthly { get; set; } = new List<AnalyticsMonthlyItemDTO>();

        // Un registro por día y moneda. Solo se completa cuando se filtra por año y mes (consumo diario)
        public IReadOnlyList<AnalyticsDailyItemDTO> Daily { get; set; } = new List<AnalyticsDailyItemDTO>();

        // Totales por categoría (agrupadas por nombre y tipo) y moneda
        public IReadOnlyList<AnalyticsCategoryItemDTO> ByCategory { get; set; } = new List<AnalyticsCategoryItemDTO>();

        // Totales por usuario y moneda
        public IReadOnlyList<AnalyticsUserItemDTO> ByUser { get; set; } = new List<AnalyticsUserItemDTO>();
    }

    public class AnalyticsCurrencyTotalDTO
    {
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal Balance { get; set; }
        public int MovementCount { get; set; }
    }

    public class AnalyticsMonthlyItemDTO
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public int MovementCount { get; set; }
    }

    public class AnalyticsDailyItemDTO
    {
        public DateTime Date { get; set; }
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public int MovementCount { get; set; }
    }

    public class AnalyticsCategoryItemDTO
    {
        public string CategoryDescription { get; set; } = string.Empty;
        public string CategoryType { get; set; } = string.Empty;   // 'Ingreso' o 'Gasto'
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int MovementCount { get; set; }
    }

    public class AnalyticsUserItemDTO
    {
        public Guid UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public int MovementCount { get; set; }
    }
}