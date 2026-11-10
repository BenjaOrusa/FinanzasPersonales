using Finanzas.Application.DTOs.Request.Accounts;
using Finanzas.Application.DTOs.Response.Accounts;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Services
{
    public class AccountService : IAccountService
    {

        private readonly IAccountRepository accountRepository;
        private readonly IUserService userService;

        public AccountService(IAccountRepository accountRepository, IUserService userService)
        {
            this.accountRepository = accountRepository;
            this.userService = userService;
        }




        public async Task<IReadOnlyList<AccountResponseDTO>> GetAllAsync(string userEmail, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var accounts = await accountRepository.GetAllByUserIdAsync(user.Id, cancellationToken);

            return accounts.Select(item => new AccountResponseDTO
            {
                AccountId = item.AccountId,
                Description = item.Description,
                AccountType = item.AccountType,
                Balance = item.Balance,
                Active = item.Active
            }).ToList();
        }

        public async Task<AccountResponseDTO?> GetByIdAsync(string userEmail, Guid accountId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var account = await accountRepository.GetByIdAndUserIdAsync(accountId, user.Id, cancellationToken);

            return account is null ? null : MapToResponseDTO(account);
        }

        public async Task<AccountResponseDTO> CreateAsync(string userEmail, AccountRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);

            var description = request.Description.Trim();

            if (description.Length is 0 or > 100 || request.AccountType is not ("Efectivo" or "CuentaBancaria" or "BilleteraVirtual"))
            {
                throw new ArgumentException("La descripción y el tipo de cuenta no son válidos.");
            }

            if (request.CurrencyId == Guid.Empty)
            {
                throw new ArgumentException("Debe especificar una moneda válida para la cuenta.");
            }

            if (await accountRepository.ExistsByDescriptionAndUserAsync(description, user.Id, cancellationToken))
            {
                throw new InvalidOperationException("Ya existe una cuenta con esa descripción para este usuario.");
            }

            // Uso del constructor blindado de la entidad Account
            var account = new Account(description, request.AccountType, user.Id, request.CurrencyId);

            accountRepository.Add(account);
            await accountRepository.SaveChangesAsync(cancellationToken);

            return new AccountResponseDTO
            {
                AccountId = account.AccountId,
                Description = account.Description,
                AccountType = account.AccountType,
                Balance = account.Balance,
                Active = account.Active
            };
        }

        public async Task<bool> DeactivateAsync(string userEmail, Guid accountId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var account = await accountRepository.GetByIdAndUserIdAsync(accountId, user.Id, cancellationToken);

            if (account is null) return false;

            // Ejecutamos la baja lógica del dominio en lugar de un Remove físico
            account.Deactivate();

            await accountRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<AccountResponseDTO> UpdateAsync(string userEmail, Guid accountId, AccountRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var account = await accountRepository.GetByIdAndUserIdAsync(accountId, user.Id, cancellationToken);

            if (account is null)
                throw new KeyNotFoundException("La cuenta no existe o no pertenece al usuario.");

            var description = request.Description.Trim();

            if (description.Length is 0 or > 100 || request.AccountType is not ("Efectivo" or "CuentaBancaria" or "BilleteraVirtual"))
            {
                throw new ArgumentException("La descripción y el tipo de cuenta no son válidos.");
            }

            if (request.CurrencyId == Guid.Empty)
            {
                throw new ArgumentException("Debe especificar una moneda válida para la cuenta.");
            }

            // Validar unicidad de descripción excluyendo la cuenta actual
            if (await accountRepository.ExistsByDescriptionAndUserExcludingIdAsync(description, user.Id, accountId, cancellationToken))
            {
                throw new InvalidOperationException("Ya existe otra cuenta con esa descripción para este usuario.");
            }

            // CU05: Validar coherencia con movimientos existentes si se intenta cambiar la moneda
            if (account.CurrencyId != request.CurrencyId)
            {
                bool hasMovements = await accountRepository.HasMovementsAsync(accountId, cancellationToken);
                if (hasMovements)
                {
                    throw new InvalidOperationException("No se puede modificar la moneda de una cuenta que ya posee movimientos históricos asociados.");
                }
            }

            // Actualizar mediante el método de dominio controlado
            account.Update(description, request.AccountType, request.CurrencyId);

            await accountRepository.SaveChangesAsync(cancellationToken);

            return MapToResponseDTO(account);
        }

        private static AccountResponseDTO MapToResponseDTO(Account account) => new()
        {
            AccountId = account.AccountId,
            Description = account.Description,
            AccountType = account.AccountType,
            Active = account.Active,
            Balance = account.Balance,
            CurrencyId = account.CurrencyId
        };
    }

}

