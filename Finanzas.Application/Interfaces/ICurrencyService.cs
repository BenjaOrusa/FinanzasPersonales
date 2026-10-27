using Finanzas.Application.DTOs.Response.Currencies;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Interfaces
{
    public interface ICurrencyService
    {
        Task<IReadOnlyList<CurrencyResponseDTO>> GetAllAsync(CancellationToken cancellationToken);
    }
}