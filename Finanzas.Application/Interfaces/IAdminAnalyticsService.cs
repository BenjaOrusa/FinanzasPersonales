using Finanzas.Application.DTOs.Response.Admin;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Interfaces
{
    public interface IAdminAnalyticsService
    {
        Task<AdminMovementsAnalyticsResponseDTO> GetMovementsAnalyticsAsync(int? year, int? month, Guid? userId, CancellationToken cancellationToken);
    }
}