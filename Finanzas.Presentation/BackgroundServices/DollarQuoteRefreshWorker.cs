using Finanzas.Application.Interfaces;
using Microsoft.Extensions.Options;

namespace Finanzas.Api.BackgroundServices;

// Vive con la API. Cada intento obtiene su propio servicio y DbContext scoped.
public sealed class DollarQuoteRefreshWorker(
    IServiceScopeFactory scopeFactory,
    IOptions<DollarQuoteRefreshSettings> options,
    TimeProvider timeProvider,
    ILogger<DollarQuoteRefreshWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!options.Value.Enabled) return;

        var interval = TimeSpan.FromMinutes(options.Value.IntervalMinutes);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var service = scope.ServiceProvider.GetRequiredService<IExchangeRateService>();
                var result = await service.ImportLatestDollarAsync(stoppingToken);
                logger.LogInformation("Dólar oficial guardado para {Date}: {Value} ARS por USD.",
                    result.ExchangeRate.Date, result.ExchangeRate.Value);
                if (result.IsFromPreviousDay)
                    logger.LogWarning("El proveedor aún no informa la cotización de hoy. Se conserva su fecha: {Date}.",
                        result.ExchangeRate.Date);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                // Una caída externa no debe detener la API ni reemplazar valores por cero.
                logger.LogError(ex, "No se actualizó el dólar. Se reintentará en {Minutes} minutos.",
                    options.Value.IntervalMinutes);
            }

            try
            {
                await Task.Delay(interval, timeProvider, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}
