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

        // Historial de cotizaciones persistidas (solo lectura)
        public async Task<IReadOnlyList<ExchangeRateResponseDTO>> GetAllAsync(
            Guid? baseCurrencyId,
            Guid? targetCurrencyId,
            DateTime? startDate,
            DateTime? endDate,
            CancellationToken cancellationToken)
        {
            if (startDate.HasValue && endDate.HasValue && startDate.Value.Date > endDate.Value.Date)
                throw new ArgumentException("La fecha desde no puede ser posterior a la fecha hasta.");

            var rates = await exchangeRateRepository.GetAllAsync(
                baseCurrencyId, targetCurrencyId, startDate, endDate, cancellationToken);

            return rates.Select(MapToResponseDTO).ToList();
        }

        // Última cotización del dólar (base: Dólar Estadounidense, cotizada: Pesos Argentinos). Solo lectura.
        public async Task<ExchangeRateResponseDTO?> GetLatestDollarAsync(CancellationToken cancellationToken)
        {
            var currencies = await currencyRepository.GetAllAsync(cancellationToken);
            var dollar = currencies.FirstOrDefault(c => c.Description == DollarDescription);
            var peso = currencies.FirstOrDefault(c => c.Description == PesoDescription);

            if (dollar is null || peso is null) return null;

            var rate = await exchangeRateRepository.GetLatestAsync(dollar.Id, peso.Id, cancellationToken);

            return rate is null ? null : MapToResponseDTO(rate);
        }

        // CU19: Supervisar la disponibilidad de una cotización. No crea ni modifica nada.
        public async Task<ExchangeRateAvailabilityResponseDTO> CheckAvailabilityAsync(
            Guid baseCurrencyId,
            Guid targetCurrencyId,
            DateTime date,
            CancellationToken cancellationToken)
        {
            // Alternativa 4.a: criterios incompletos o inválidos
            if (baseCurrencyId == Guid.Empty || targetCurrencyId == Guid.Empty)
                throw new ArgumentException("Debe indicar la moneda base y la moneda cotizada.");

            if (baseCurrencyId == targetCurrencyId)
                throw new ArgumentException("La moneda base y la moneda cotizada deben ser distintas.");

            if (date == default)
                throw new ArgumentException("Debe indicar la fecha de referencia.");

            var currencies = await currencyRepository.GetAllAsync(cancellationToken);
            if (!currencies.Any(c => c.Id == baseCurrencyId) || !currencies.Any(c => c.Id == targetCurrencyId))
                throw new ArgumentException("Alguna de las monedas indicadas no existe.");

            // Última cotización de la fecha indicada o anterior
            var rate = await exchangeRateRepository.GetLatestPriorAsync(
                baseCurrencyId, targetCurrencyId, date, cancellationToken);

            // Alternativa 4.c: no existe cotización aplicable
            if (rate is null)
            {
                return new ExchangeRateAvailabilityResponseDTO
                {
                    Available = false,
                    Message = "No existe una cotización aplicable para los criterios indicados."
                };
            }

            // Alternativa 4.b: no hay cotización exacta, se informa la última anterior
            var isEarlier = rate.Date.Date < date.Date;

            return new ExchangeRateAvailabilityResponseDTO
            {
                Available = true,
                Value = rate.Value,
                RateDate = rate.Date,
                IsFromEarlierDate = isEarlier,
                Message = isEarlier
                    ? "No hay cotización para la fecha indicada; se informa la última anterior disponible."
                    : "Cotización disponible para la fecha indicada."
            };
        }

        private static ExchangeRateResponseDTO MapToResponseDTO(ExchangeRate rate) => new()
        {
            BaseCurrencyId = rate.BaseCurrencyId,
            BaseCurrencyDescription = rate.BaseCurrency?.Description ?? string.Empty,
            TargetCurrencyId = rate.TargetCurrencyId,
            TargetCurrencyDescription = rate.TargetCurrency?.Description ?? string.Empty,
            Date = rate.Date,
            Value = rate.Value
        };

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