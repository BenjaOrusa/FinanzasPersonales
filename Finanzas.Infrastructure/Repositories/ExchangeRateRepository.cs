using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
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

        public void Add(ExchangeRate exchangeRate) => context.ExchangeRates.Add(exchangeRate);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}