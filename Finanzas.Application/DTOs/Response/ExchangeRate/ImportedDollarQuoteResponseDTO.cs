namespace Finanzas.Application.DTOs.Response.ExchangeRate;

public sealed record ImportedDollarQuoteResponseDTO(
    ExchangeRateResponseDTO ExchangeRate,
    DateTimeOffset ProviderUpdatedAt,
    bool IsFromPreviousDay,
    string Source = "DolarApi - dólar oficial venta");
