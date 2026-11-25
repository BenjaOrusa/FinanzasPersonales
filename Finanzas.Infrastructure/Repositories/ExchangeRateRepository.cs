using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Infrastructure.Repositories
{
    public class ExchangeRateRepository : IExchangeRateRepository
    {
        private readonly FinanzasDbContext context;

        public ExchangeRateRepository(FinanzasDbContext context)
        {
            this.context = context;
        }

        public async Task<ExchangeRate?> GetByCompositeKeyAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken) =>
            await context.ExchangeRates
                .Include(e => e.BaseCurrency)
                .Include(e => e.TargetCurrency)
                .FirstOrDefaultAsync(e => e.BaseCurrencyId == baseCurrencyId &&
                                          e.TargetCurrencyId == targetCurrencyId &&
                                          e.Date.Date == date.Date, cancellationToken);

        public async Task<ExchangeRate?> GetLatestPriorAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken) =>
            await context.ExchangeRates
                .Include(e => e.BaseCurrency)
                .Include(e => e.TargetCurrency)
                .Where(e => e.BaseCurrencyId == baseCurrencyId &&
                            e.TargetCurrencyId == targetCurrencyId &&
                            e.Date.Date <= date.Date)
                .OrderByDescending(e => e.Date)
                .FirstOrDefaultAsync(cancellationToken);

        // Última cotización guardada para el par, sin importar la fecha.
        public async Task<ExchangeRate?> GetLatestAsync(Guid baseCurrencyId, Guid targetCurrencyId, CancellationToken cancellationToken) =>
            await context.ExchangeRates
                .AsNoTracking()
                .Include(e => e.BaseCurrency)
                .Include(e => e.TargetCurrency)
                .Where(e => e.BaseCurrencyId == baseCurrencyId &&
                            e.TargetCurrencyId == targetCurrencyId)
                .OrderByDescending(e => e.Date)
                .FirstOrDefaultAsync(cancellationToken);

        // Historial de cotizaciones con filtros opcionales (solo lectura).
        public async Task<IReadOnlyList<ExchangeRate>> GetAllAsync(
            Guid? baseCurrencyId,
            Guid? targetCurrencyId,
            DateTime? startDate,
            DateTime? endDate,
            CancellationToken cancellationToken)
        {
            var query = context.ExchangeRates
                .AsNoTracking()
                .Include(e => e.BaseCurrency)
                .Include(e => e.TargetCurrency)
                .AsQueryable();

            if (baseCurrencyId.HasValue && baseCurrencyId.Value != Guid.Empty)
                query = query.Where(e => e.BaseCurrencyId == baseCurrencyId.Value);

            if (targetCurrencyId.HasValue && targetCurrencyId.Value != Guid.Empty)
                query = query.Where(e => e.TargetCurrencyId == targetCurrencyId.Value);

            if (startDate.HasValue)
                query = query.Where(e => e.Date >= startDate.Value.Date);

            if (endDate.HasValue)
                query = query.Where(e => e.Date <= endDate.Value.Date);

            return await query
                .OrderByDescending(e => e.Date)
                .ThenBy(e => e.BaseCurrency.Description)
                .ThenBy(e => e.TargetCurrency.Description)
                .ToListAsync(cancellationToken);
        }

        public void Add(ExchangeRate exchangeRate) => context.ExchangeRates.Add(exchangeRate);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}