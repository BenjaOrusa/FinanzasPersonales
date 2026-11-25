using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Domain.Interfaces
{
    public interface IExchangeRateRepository
    {
        Task<ExchangeRate?> GetByCompositeKeyAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken);
        Task<ExchangeRate?> GetLatestPriorAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken);
        Task<ExchangeRate?> GetLatestAsync(Guid baseCurrencyId, Guid targetCurrencyId, CancellationToken cancellationToken);
        Task<IReadOnlyList<ExchangeRate>> GetAllAsync(Guid? baseCurrencyId, Guid? targetCurrencyId, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken);
        void Add(ExchangeRate exchangeRate);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}