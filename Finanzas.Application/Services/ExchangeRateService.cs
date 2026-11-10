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

        public ExchangeRateService(
            IExchangeRateRepository exchangeRateRepository,
            IMovementRepository movementRepository,
            ICurrencyRepository currencyRepository,
            IUserService userService)
        {
            this.exchangeRateRepository = exchangeRateRepository;
            this.movementRepository = movementRepository;
            this.currencyRepository = currencyRepository;
            this.userService = userService;
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

            // Identificar la moneda Dólar (asumiendo que su descripción contiene 'Dólar')
            var currencies = await currencyRepository.GetAllAsync(cancellationToken);
            var dollarCurrency = currencies.FirstOrDefault(c => c.Description.Contains("Dólar", StringComparison.OrdinalIgnoreCase));

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
                var rate = await exchangeRateRepository.GetByCompositeKeyAsync(m.CurrencyId, dollarId, m.Date, cancellationToken);
                DateTime? rateDateUsed = rate?.Date;

                // Alternativa 3.b del CU16: Buscar la última cotización anterior disponible
                if (rate is null && dollarId != Guid.Empty)
                {
                    rate = await exchangeRateRepository.GetLatestPriorAsync(m.CurrencyId, dollarId, m.Date, cancellationToken);
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
                        EquivalentInDollars = m.Amount, // Conserva visible el importe original
                        MovementDate = m.Date,
                        ExchangeRateDateUsed = null,
                        Status = "Sin cotización aplicable"
                    });
                }
                else
                {
                    decimal equivalent = m.Amount * rate.Value;
                    results.Add(new MovementDollarEquivalentResponseDTO
                    {
                        MovementId = m.MovementId,
                        Description = m.Description,
                        OriginalAmount = m.Amount,
                        OriginalCurrency = m.Currency?.Description ?? string.Empty,
                        EquivalentInDollars = equivalent,
                        MovementDate = m.Date,
                        ExchangeRateDateUsed = rateDateUsed,
                        Status = "Convertido"
                    });
                }
            }

            return results;
        }
    }
}