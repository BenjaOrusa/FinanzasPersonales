using Finanzas.Domain.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Domain.Interfaces
{
    public interface ICurrencyRepository
    {
        void Add(Currency currency);
        Task<IReadOnlyList<Currency>> GetAllAsync(CancellationToken cancellationToken);
    }
}
