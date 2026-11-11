using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Application.DTOs.Response.Movements;

namespace Finanzas.Application.Interfaces
{
    public interface IMovementService
    {
        Task<IReadOnlyList<MovementResponseDTO>> GetAllAsync(string userEmail, CancellationToken cancellationToken);
        Task<MovementResponseDTO?> GetByIdAsync(string userEmail, Guid movementId, CancellationToken cancellationToken);
        Task<MovementResponseDTO> CreateAsync(string userEmail, MovementRequestDTO request, CancellationToken cancellationToken);
        Task<MovementResponseDTO?> UpdateAsync(string userEmail, Guid movementId, MovementRequestDTO request, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(string userEmail, Guid movementId, CancellationToken cancellationToken);

        Task<IReadOnlyList<MovementResponseDTO>> GetFilteredAsync(string userEmail, MovementFilterDTO filter, CancellationToken cancellationToken);
    }
}
