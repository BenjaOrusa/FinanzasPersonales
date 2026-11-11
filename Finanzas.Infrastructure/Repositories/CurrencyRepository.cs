using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Infrastructure.Repositories
{
    public class CurrencyRepository : ICurrencyRepository
    {
        private readonly FinanzasDbContext context;

        public CurrencyRepository(FinanzasDbContext context)
        {
            this.context = context;
        }

        public void Add(Currency currency) => context.Currencies.Add(currency);

        public async Task<IReadOnlyList<Currency>> GetAllAsync(CancellationToken cancellationToken) =>
            await context.Currencies
                .AsNoTracking()
                .OrderBy(c => c.Description)
                .ToListAsync(cancellationToken);
    }
}
