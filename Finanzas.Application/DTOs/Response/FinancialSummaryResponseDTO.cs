using Finanzas.Application.DTOs.Request;
using System;
using System.Collections.Generic;
using System.Text;


//Representa el resumen consolidado que agrupa los totales por cada moneda en la que el usuario tiene movimientos
namespace Finanzas.Application.DTOs.Response
{
    public class FinancialSummaryResponseDTO
    {
        public IReadOnlyList<CurrencySummaryDTO> SummariesByCurrency { get; set; } = new List<CurrencySummaryDTO>();
    }
}
