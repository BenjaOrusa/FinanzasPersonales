using System;
using System.Collections.Generic;
using System.Text;

//Representa el desglose financiero para una moneda en particular.

namespace Finanzas.Application.DTOs.Request
{
    public class CurrencySummaryDTO
    {
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal Balance { get; set; }
    }
}
