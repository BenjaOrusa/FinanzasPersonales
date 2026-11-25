using Finanzas.Application.DTOs.Response;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Interfaces
{
    public interface IFinancialSummaryService
    {
        // startDate/endDate son opcionales: sin ellos se resume todo el historial del usuario.
        Task<FinancialSummaryResponseDTO> GetSummaryAsync(string userEmail, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken);
    }
}