using Finanzas.Domain.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Domain.Interfaces
{
    public interface ICurrencyRepository
    {
        Task<IReadOnlyList<Currency>> GetAllAsync(CancellationToken cancellationToken);
    }
}