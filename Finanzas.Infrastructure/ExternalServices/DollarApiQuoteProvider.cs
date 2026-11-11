using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;

namespace Finanzas.Infrastructure.ExternalServices;

public sealed class DollarApiQuoteProvider(HttpClient httpClient) : IDollarQuoteProvider
{
    public async Task<DollarQuote> GetLatestAsync(CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.GetFromJsonAsync<DollarApiResponse>(
                "v1/dolares/oficial", cancellationToken);

            if (response is null || response.Sell <= 0 || response.UpdatedAt == default
                || response.UpdatedAt > DateTimeOffset.UtcNow.AddMinutes(5)
                || response.Currency != "USD" || response.Market != "oficial")
            {
                throw new QuoteProviderException("El proveedor devolvió una cotización inválida o incompleta.");
            }

            return new DollarQuote(response.Sell, response.UpdatedAt);
        }
        catch (HttpRequestException ex)
        {
            throw new QuoteProviderException("No se pudo consultar el proveedor de cotizaciones.", ex);
        }
        catch (JsonException ex)
        {
            throw new QuoteProviderException("La respuesta del proveedor no tiene el formato esperado.", ex);
        }
        catch (OperationCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            throw new QuoteProviderException("El proveedor de cotizaciones superó el tiempo de espera.", ex);
        }
    }

    private sealed class DollarApiResponse
    {
        [JsonPropertyName("moneda")]
        public string? Currency { get; set; }
        [JsonPropertyName("casa")]
        public string? Market { get; set; }
        [JsonPropertyName("venta")]
        public decimal Sell { get; set; }
        [JsonPropertyName("fechaActualizacion")]
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
