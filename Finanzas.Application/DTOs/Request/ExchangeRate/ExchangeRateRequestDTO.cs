using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Request.ExchangeRate
{
    public class ExchangeRateRequestDTO
    {
        public Guid BaseCurrencyId { get; set; }
        public Guid TargetCurrencyId { get; set; }
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
    }
}
