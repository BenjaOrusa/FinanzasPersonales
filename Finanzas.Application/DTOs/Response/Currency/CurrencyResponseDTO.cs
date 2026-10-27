using System;

namespace Finanzas.Application.DTOs.Response.Currencies
{
    public class CurrencyResponseDTO
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}