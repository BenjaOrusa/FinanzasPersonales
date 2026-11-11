using Finanzas.Application.DTOs.Request.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRates;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class ExchangeRateService : IExchangeRateService
    {
        private readonly IExchangeRateRepository exchangeRateRepository;
        private readonly IMovementRepository movementRepository;
        private readonly ICurrencyRepository currencyRepository;
        private readonly IUserService userService;
        private readonly IDollarQuoteProvider dollarQuoteProvider;
        private const string DollarDescription = "Dólar Estadounidense";
        private const string PesoDescription = "Pesos Argentinos";
        // Evita que el endpoint y la tarea automática creen la misma fila a la vez
        // dentro de una instancia de la API.
        private static readonly SemaphoreSlim ImportGate = new(1, 1);
        private static readonly TimeZoneInfo ArgentinaTimeZone =
            TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");

        public ExchangeRateService(
            IExchangeRateRepository exchangeRateRepository,
            IMovementRepository movementRepository,
            ICurrencyRepository currencyRepository,
            IUserService userService,
            IDollarQuoteProvider dollarQuoteProvider)
        {
            this.exchangeRateRepository = exchangeRateRepository;
            this.movementRepository = movementRepository;
            this.currencyRepository = currencyRepository;
            this.userService = userService;
            this.dollarQuoteProvider = dollarQuoteProvider;
        }

        public async Task<ImportedDollarQuoteResponseDTO> ImportLatestDollarAsync(CancellationToken cancellationToken)
        {
            await ImportGate.WaitAsync(cancellationToken);
            try
            {
                return await ImportLatestDollarCoreAsync(cancellationToken);
            }
            finally
            {
                ImportGate.Release();
            }
        }

        private async Task<ImportedDollarQuoteResponseDTO> ImportLatestDollarCoreAsync(CancellationToken cancellationToken)
        {
            // Consultar primero: si falla el proveedor no se alteran los datos locales.
            var quote = await dollarQuoteProvider.GetLatestAsync(cancellationToken);
            var quoteDate = TimeZoneInfo.ConvertTime(quote.UpdatedAt, ArgentinaTimeZone).Date;
            var today = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, ArgentinaTimeZone).Date;
            var currencies = await currencyRepository.GetAllAsync(cancellationToken);

            Currency ResolveCurrency(string description)
            {
                var currency = currencies.FirstOrDefault(c => c.Description == description);
                if (currency is not null) return currency;
                currency = new Currency(description);
                currencyRepository.Add(currency);
                return currency;
            }

            var dollar = ResolveCurrency(DollarDescription);
            var peso = ResolveCurrency(PesoDescription);
            // El mismo DbContext scoped guarda monedas y cotización en una transacción.
            var saved = await UpsertAsync(new ExchangeRateRequestDTO
            {
                BaseCurrencyId = dollar.Id,
                TargetCurrencyId = peso.Id,
                Date = quoteDate,
                Value = quote.PesosPerDollar
            }, cancellationToken);

            return new ImportedDollarQuoteResponseDTO(saved, quote.UpdatedAt, quoteDate < today);
        }

        //CU19  Supervisar la disponibilidad de las cotizaciones
        public async Task<ExchangeRateResponseDTO> UpsertAsync(ExchangeRateRequestDTO request, CancellationToken cancellationToken)
        {
            if (request.Value <= 0)
                throw new ArgumentException("El valor de la cotización debe ser mayor a cero.");

            var existingRate = await exchangeRateRepository.GetByCompositeKeyAsync(
                request.BaseCurrencyId, request.TargetCurrencyId, request.Date, cancellationToken);

            ExchangeRate exchangeRate;
            if (existingRate is null)
            {
                exchangeRate = new ExchangeRate(request.BaseCurrencyId, request.TargetCurrencyId, request.Date, request.Value);
                exchangeRateRepository.Add(exchangeRate);
            }
            else
            {
                existingRate.UpdateValue(request.Value);
                exchangeRate = existingRate;
            }

            await exchangeRateRepository.SaveChangesAsync(cancellationToken);

            var savedRate = await exchangeRateRepository.GetByCompositeKeyAsync(
                exchangeRate.BaseCurrencyId, exchangeRate.TargetCurrencyId, exchangeRate.Date, cancellationToken);

            return new ExchangeRateResponseDTO
            {
                BaseCurrencyId = savedRate!.BaseCurrencyId,
                BaseCurrencyDescription = savedRate.BaseCurrency?.Description ?? string.Empty,
                TargetCurrencyId = savedRate.TargetCurrencyId,
                TargetCurrencyDescription = savedRate.TargetCurrency?.Description ?? string.Empty,
                Date = savedRate.Date,
                Value = savedRate.Value
            };
        }

        public async Task<IReadOnlyList<MovementDollarEquivalentResponseDTO>> GetMovementsDollarEquivalentsAsync(string userEmail, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movements = await movementRepository.GetAllByUserIdAsync(user.Id, cancellationToken);

            // Usar la misma moneda canónica que registra la importación.
            var currencies = await currencyRepository.GetAllAsync(cancellationToken);
            var dollarCurrency = currencies.FirstOrDefault(c => c.Description == DollarDescription);

            Guid dollarId = dollarCurrency?.Id ?? Guid.Empty;

            var results = new List<MovementDollarEquivalentResponseDTO>();

            foreach (var m in movements)
            {
                // Alternativa 3.a del CU16: El movimiento ya está expresado en dólares
                if (dollarId != Guid.Empty && m.CurrencyId == dollarId)
                {
                    results.Add(new MovementDollarEquivalentResponseDTO
                    {
                        MovementId = m.MovementId,
                        Description = m.Description,
                        OriginalAmount = m.Amount,
                        OriginalCurrency = m.Currency?.Description ?? "Dólar",
                        EquivalentInDollars = m.Amount,
                        MovementDate = m.Date,
                        ExchangeRateDateUsed = m.Date,
                        Status = "Convertido (Moneda Destino)"
                    });
                    continue;
                }

                // Buscar cotización exacta para la fecha del movimiento
                var rate = dollarId == Guid.Empty ? null : await exchangeRateRepository.GetByCompositeKeyAsync(dollarId, m.CurrencyId, m.Date, cancellationToken);
                DateTime? rateDateUsed = rate?.Date;

                // Alternativa 3.b del CU16: Buscar la última cotización anterior disponible
                if (rate is null && dollarId != Guid.Empty)
                {
                    rate = await exchangeRateRepository.GetLatestPriorAsync(dollarId, m.CurrencyId, m.Date, cancellationToken);
                    rateDateUsed = rate?.Date;
                }

                // Alternativa 3.c del CU16: No existe cotización aplicable
                if (rate is null)
                {
                    results.Add(new MovementDollarEquivalentResponseDTO
                    {
                        MovementId = m.MovementId,
                        Description = m.Description,
                        OriginalAmount = m.Amount,
                        OriginalCurrency = m.Currency?.Description ?? string.Empty,
                        EquivalentInDollars = null,
                        MovementDate = m.Date,
                        ExchangeRateDateUsed = null,
                        Status = "Sin cotización aplicable"
                    });
                }
                else
                {
                    decimal equivalent = decimal.Round(m.Amount / rate.Value, 2, MidpointRounding.AwayFromZero);
                    results.Add(new MovementDollarEquivalentResponseDTO
                    {
                        MovementId = m.MovementId,
                        Description = m.Description,
                        OriginalAmount = m.Amount,
                        OriginalCurrency = m.Currency?.Description ?? string.Empty,
                        EquivalentInDollars = equivalent,
                        MovementDate = m.Date,
                        ExchangeRateDateUsed = rateDateUsed,
                        Status = rateDateUsed?.Date == m.Date.Date
                            ? "Convertido"
                            : "Convertido con última cotización anterior"
                    });
                }
            }

            return results;
        }
    }
}
