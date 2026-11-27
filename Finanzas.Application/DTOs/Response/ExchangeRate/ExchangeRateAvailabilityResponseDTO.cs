using System;

namespace Finanzas.Application.DTOs.Response.ExchangeRate
{
    // Resultado de la consulta de disponibilidad de una cotización (CU19). Es solo lectura.
    public class ExchangeRateAvailabilityResponseDTO
    {
        public bool Available { get; set; }
        public decimal? Value { get; set; }
        public DateTime? RateDate { get; set; }          // fecha de la cotización encontrada
        public bool IsFromEarlierDate { get; set; }      // true si no hay cotización exacta y se informa la última anterior (CU19 4.b)
        public string Message { get; set; } = string.Empty;
    }
}