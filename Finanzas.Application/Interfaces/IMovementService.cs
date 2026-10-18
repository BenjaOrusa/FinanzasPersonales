using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Api.Contracts.Movements;

namespace Finanzas.Application.Interfaces
{
    public interface IMovementService
    {
        Task<IReadOnlyList<MovementResponseDTO>> GetAllAsync(CancellationToken cancellationToken);
        Task<MovementResponseDTO?> GetByIdAsync(Guid movementId, CancellationToken cancellationToken);
        Task<(MovementResponseDTO? Response, string? Error)> CreateAsync(MovementRequestDTO request, CancellationToken cancellationToken);
        Task<(MovementResponseDTO? Response, string? Error)> UpdateAsync(Guid movementId, MovementRequestDTO request, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(Guid movementId, CancellationToken cancellationToken);
    }
}