using Finanzas.Api.Contracts.Movements;
using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Domain.Interfaces;

namespace Finanzas.Application.Services
{
    public class MovementService : IMovementService
    {
        private readonly IMovementRepository movementRepository;

        public MovementService(IMovementRepository movementRepository)
        {
            this.movementRepository = movementRepository;
        }

        public async Task<IReadOnlyList<MovementResponseDTO>> GetAllAsync(CancellationToken cancellationToken)
        {
            var movements = await movementRepository.GetAllAsync(cancellationToken);

            return movements.Select(MapToResponseDTO).ToList();
        }

        public async Task<MovementResponseDTO?> GetByIdAsync(Guid movementId, CancellationToken cancellationToken)
        {
            var movement = await movementRepository.GetByIdAsync(movementId, cancellationToken);
            return movement is null ? null : MapToResponseDTO(movement);
        }

        public async Task<(MovementResponseDTO? Response, string? Error)> CreateAsync(MovementRequestDTO request, CancellationToken cancellationToken)
        {
            var error = await ValidateAsync(request, cancellationToken);
            if (error is not null) return (null, error);

            var movement = new Movement
            {
                Description = request.Description.Trim(),
                Amount = request.Amount,
                Date = request.Date,
                MovementType = request.MovementType,
                CategoryId = request.CategoryId,
                AccountId = request.AccountId,
                AdditionalInformation = NormalizarNota(request.AdditionalInformation)
            };

            movementRepository.Add(movement);
            await movementRepository.SaveChangesAsync(cancellationToken);

            // Recargamos o consultamos para asegurar relaciones mapeadas (Categoría y Cuenta)
            var createdMovement = await movementRepository.GetByIdAsync(movement.MovementId, cancellationToken);
            return (MapToResponseDTO(createdMovement!), null);
        }

        public async Task<(MovementResponseDTO? Response, string? Error)> UpdateAsync(Guid movementId, MovementRequestDTO request, CancellationToken cancellationToken)
        {
            var movement = await movementRepository.GetByIdAsync(movementId, cancellationToken);
            if (movement is null) return (null, "NotFound");

            var error = await ValidateAsync(request, cancellationToken);
            if (error is not null) return (null, error);

            movement.Description = request.Description.Trim();
            movement.Amount = request.Amount;
            movement.Date = request.Date;
            movement.MovementType = request.MovementType;
            movement.CategoryId = request.CategoryId;
            movement.AccountId = request.AccountId;
            movement.AdditionalInformation = NormalizarNota(request.AdditionalInformation);

            await movementRepository.SaveChangesAsync(cancellationToken);

            var updatedMovement = await movementRepository.GetByIdAsync(movementId, cancellationToken);
            return (MapToResponseDTO(updatedMovement!), null);
        }

        public async Task<bool> DeleteAsync(Guid movementId, CancellationToken cancellationToken)
        {
            var movement = await movementRepository.GetByIdAsync(movementId, cancellationToken);
            if (movement is null) return false;

            movementRepository.Remove(movement);
            await movementRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        private async Task<string?> ValidateAsync(MovementRequestDTO request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Description) || request.Description.Trim().Length > 200)
                return "La descripción es obligatoria y admite hasta 200 caracteres.";

            if (request.Amount <= 0 || request.MovementType is not ("Ingreso" or "Gasto"))
                return "El importe o el tipo de movimiento no son válidos.";

            if (request.AdditionalInformation?.Length > 500)
                return "La nota admite hasta 500 caracteres.";

            var validCategory = await movementRepository.CategoryExistsAndMatchesTypeAsync(request.CategoryId, request.MovementType, cancellationToken);
            if (!validCategory)
                return "La categoría no existe, está inactiva o no corresponde al tipo de movimiento.";

            var validAccount = await movementRepository.AccountExistsAndIsActiveAsync(request.AccountId, cancellationToken);
            if (!validAccount)
                return "La cuenta no existe o está inactiva.";

            return null;
        }

        private static MovementResponseDTO MapToResponseDTO(Movement movement) => new()
        {
            MovementId = movement.MovementId,
            Description = movement.Description,
            Amount = movement.Amount,
            Date = movement.Date,
            MovementType = movement.MovementType,
            CategoryId = movement.CategoryId,
            Category = movement.Category?.Description ?? string.Empty,
            AccountId = movement.AccountId,
            Account = movement.Account?.Description ?? string.Empty,
            AdditionalInformation = movement.AdditionalInformation
        };

        private static string? NormalizarNota(string? nota) =>
            string.IsNullOrWhiteSpace(nota) ? null : nota.Trim();
    }
}