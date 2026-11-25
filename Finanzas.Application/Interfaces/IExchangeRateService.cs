using Finanzas.Application.DTOs.Request.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRates;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Interfaces
{
    public interface IExchangeRateService
    {
        Task<ImportedDollarQuoteResponseDTO> ImportLatestDollarAsync(CancellationToken cancellationToken);
        Task<ExchangeRateResponseDTO> UpsertAsync(ExchangeRateRequestDTO request, CancellationToken cancellationToken);
        Task<IReadOnlyList<MovementDollarEquivalentResponseDTO>> GetMovementsDollarEquivalentsAsync(string userEmail, CancellationToken cancellationToken);

        // Historial de cotizaciones guardadas (filtros opcionales)
        Task<IReadOnlyList<ExchangeRateResponseDTO>> GetAllAsync(Guid? baseCurrencyId, Guid? targetCurrencyId, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken);

        // Última cotización guardada del dólar oficial en pesos (null si todavía no hay ninguna)
        Task<ExchangeRateResponseDTO?> GetLatestDollarAsync(CancellationToken cancellationToken);

        // CU19: consulta de disponibilidad (solo lectura)
        Task<ExchangeRateAvailabilityResponseDTO> CheckAvailabilityAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken);
    }
}