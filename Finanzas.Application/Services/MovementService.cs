using Finanzas.Api.Contracts.Movements;
using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class MovementService : IMovementService
    {
        private readonly IMovementRepository movementRepository;
        private readonly IAccountRepository accountRepository;
        private readonly ICategoryRepository categoryRepository;
        private readonly IUserService userService;

        public MovementService(
            IMovementRepository movementRepository,
            IAccountRepository accountRepository,
            ICategoryRepository categoryRepository,
            IUserService userService)
        {
            this.movementRepository = movementRepository;
            this.accountRepository = accountRepository;
            this.categoryRepository = categoryRepository;
            this.userService = userService;
        }



        public async Task<IReadOnlyList<MovementResponseDTO>> GetFilteredAsync(string userEmail, MovementFilterDTO filter, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);

            var movements = await movementRepository.GetFilteredByUserIdAsync(
                user.Id,
                filter.MovementType,
                filter.StartDate,
                filter.EndDate,
                filter.AccountId,
                filter.CategoryId,
                cancellationToken);

            return movements.Select(MapToResponseDTO).ToList();
        }


        public async Task<IReadOnlyList<MovementResponseDTO>> GetAllAsync(string userEmail, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movements = await movementRepository.GetAllByUserIdAsync(user.Id, cancellationToken);

            return movements.Select(MapToResponseDTO).ToList();
        }

        public async Task<MovementResponseDTO?> GetByIdAsync(string userEmail, Guid movementId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movement = await movementRepository.GetByIdAndUserIdAsync(movementId, user.Id, cancellationToken);
            return movement is null ? null : MapToResponseDTO(movement);
        }

        public async Task<MovementResponseDTO> CreateAsync(string userEmail, MovementRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);

            // Validar existencia y pertenencia de la cuenta activa al usuario
            var account = await accountRepository.GetByIdAndUserIdAsync(request.AccountId, user.Id, cancellationToken);
            if (account is null || !account.Active)
            {
                throw new InvalidOperationException("La cuenta no existe, está inactiva o no pertenece al usuario.");
            }

            // Validar existencia, pertenencia y compatibilidad de la categoría activa con el tipo de movimiento
            var category = await categoryRepository.GetByIdAndUserIdAsync(request.CategoryId, user.Id, cancellationToken);
            if (category is null || !category.Active || category.CategoryType != request.MovementType)
            {
                throw new InvalidOperationException("La categoría no existe, está inactiva o su tipo no coincide con el movimiento.");
            }

            // Instanciar el movimiento usando su constructor blindado.
            // La moneda se hereda automáticamente de la cuenta asociada.
            var movement = new Movement(
                request.Description,
                request.Amount,
                request.Date,
                request.MovementType,
                user.Id,
                account.AccountId,
                category.CategoryId,
                account.CurrencyId,
                request.Note);

            // Actualización del saldo de la cuenta (CU11)
            decimal balanceImpact = movement.MovementType == "Ingreso" ? movement.Amount : -movement.Amount;
            account.UpdateBalance(balanceImpact);

            movementRepository.Add(movement);
            await movementRepository.SaveChangesAsync(cancellationToken);

            var createdMovement = await movementRepository.GetByIdAndUserIdAsync(movement.MovementId, user.Id, cancellationToken);
            return MapToResponseDTO(createdMovement!);
        }

        public async Task<MovementResponseDTO?> UpdateAsync(string userEmail, Guid movementId, MovementRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movement = await movementRepository.GetByIdAndUserIdAsync(movementId, user.Id, cancellationToken);
            if (movement is null) return null;

            // Obtener cuenta anterior para revertir impacto en saldo si cambió la cuenta o el importe
            var oldAccount = await accountRepository.GetByIdAndUserIdAsync(movement.AccountId, user.Id, cancellationToken);
            var newAccount = await accountRepository.GetByIdAndUserIdAsync(request.AccountId, user.Id, cancellationToken);

            if (newAccount is null || !newAccount.Active)
            {
                throw new InvalidOperationException("La cuenta especificada no existe o está inactiva.");
            }

            var category = await categoryRepository.GetByIdAndUserIdAsync(request.CategoryId, user.Id, cancellationToken);
            if (category is null || !category.Active || category.CategoryType != request.MovementType)
            {
                throw new InvalidOperationException("La categoría especificada no existe, está inactiva o no coincide con el tipo de movimiento.");
            }

            // 1. Revertir saldo anterior
            if (oldAccount != null)
            {
                decimal oldBalanceImpact = movement.MovementType == "Ingreso" ? -movement.Amount : movement.Amount;
                oldAccount.UpdateBalance(oldBalanceImpact);
            }

            // 2. Reemplazar por la entidad modificada conservando auditorías
            movementRepository.Remove(movement);

            var updatedMovement = new Movement(
                request.Description,
                request.Amount,
                request.Date,
                request.MovementType,
                user.Id,
                newAccount.AccountId,
                category.CategoryId,
                newAccount.CurrencyId,
                request.Note);

            // 3. Aplicar nuevo saldo
            decimal newBalanceImpact = updatedMovement.MovementType == "Ingreso" ? updatedMovement.Amount : -updatedMovement.Amount;
            newAccount.UpdateBalance(newBalanceImpact);

            movementRepository.Add(updatedMovement);
            await movementRepository.SaveChangesAsync(cancellationToken);

            var refreshed = await movementRepository.GetByIdAndUserIdAsync(updatedMovement.MovementId, user.Id, cancellationToken);
            return MapToResponseDTO(refreshed!);
        }

        public async Task<bool> DeleteAsync(string userEmail, Guid movementId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movement = await movementRepository.GetByIdAndUserIdAsync(movementId, user.Id, cancellationToken);
            if (movement is null) return false;

            // Revertir el saldo de la cuenta al eliminar el movimiento (CU13)
            var account = await accountRepository.GetByIdAndUserIdAsync(movement.AccountId, user.Id, cancellationToken);
            if (account != null)
            {
                decimal balanceImpact = movement.MovementType == "Ingreso" ? -movement.Amount : movement.Amount;
                account.UpdateBalance(balanceImpact);
            }

            movementRepository.Remove(movement);
            await movementRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        private static MovementResponseDTO MapToResponseDTO(Movement movement) => new()
        {
            MovementId = movement.MovementId,
            Description = movement.Description,
            Amount = movement.Amount,
            Date = movement.Date,
            MovementType = movement.MovementType,
            CategoryId = movement.CategoryId,
            CategoryDescription = movement.Category?.Description ?? string.Empty,
            AccountId = movement.AccountId,
            AccountDescription = movement.Account?.Description ?? string.Empty,
            CurrencyId = movement.CurrencyId,
            Note = movement.Note,
            CreationDate = movement.CreationDate
        };
    }
}