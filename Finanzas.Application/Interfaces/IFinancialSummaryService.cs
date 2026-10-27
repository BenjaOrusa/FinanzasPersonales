using Finanzas.Application.DTOs.Response;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Interfaces
{
    public interface IFinancialSummaryService
    {
        Task<FinancialSummaryResponseDTO> GetSummaryAsync(string userEmail, CancellationToken cancellationToken);
    }
}