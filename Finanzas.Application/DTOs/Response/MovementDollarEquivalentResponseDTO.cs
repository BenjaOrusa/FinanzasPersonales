using System;

namespace Finanzas.Application.DTOs.Response.ExchangeRates
{
    public class MovementDollarEquivalentResponseDTO
    {
        public Guid MovementId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal OriginalAmount { get; set; }
        public string OriginalCurrency { get; set; } = string.Empty;
        public decimal EquivalentInDollars { get; set; }
        public DateTime MovementDate { get; set; }
        public DateTime? ExchangeRateDateUsed { get; set; }
        public string Status { get; set; } = string.Empty; // 'Convertido' o 'Sin cotización aplicable'
    }
}