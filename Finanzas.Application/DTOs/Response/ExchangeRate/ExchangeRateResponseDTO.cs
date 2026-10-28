using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Response.ExchangeRate
{
    public class ExchangeRateResponseDTO
    {
        public Guid BaseCurrencyId { get; set; }
        public string BaseCurrencyDescription { get; set; } = string.Empty;
        public Guid TargetCurrencyId { get; set; }
        public string TargetCurrencyDescription { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
    }
}
