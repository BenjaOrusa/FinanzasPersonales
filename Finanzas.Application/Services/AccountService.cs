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
        public AccountService(IAccountRepository accountRepository)
        {
            this.accountRepository = accountRepository;
        }

        public async Task<IReadOnlyList<AccountResponseDTO>> GetAllAsync(CancellationToken cancellationToken)
        {
            var accounts = await accountRepository.GetAllAsync(cancellationToken);

            return accounts.Select(item => new AccountResponseDTO
            {
                AccountId = item.AccountId,
                Description = item.Description,
                AccountType = item.AccountType,
                Active = item.Active
            }).ToList();
        }

        public async Task<AccountResponseDTO> CreateAsync(AccountRequestDTO request, CancellationToken cancellationToken)
        {
            var description = request.Description.Trim();

            if (description.Length is 0 or > 100 || request.AccountType is not ("Efectivo" or "CuentaBancaria" or "BilleteraVirtual"))
            {
                throw new ArgumentException("La descripción y el tipo de cuenta no son válidos.");
            }

            if (await accountRepository.ExistsByDescriptionAsync(description, cancellationToken))
            {
                throw new InvalidOperationException("Ya existe una cuenta con esa descripción.");
            }

            var account = new Account
            {
                Description = description,
                AccountType = request.AccountType,
                Active = true
            };

            accountRepository.Add(account);
            await accountRepository.SaveChangesAsync(cancellationToken);

            return new AccountResponseDTO
            {
                AccountId = account.AccountId,
                Description = account.Description,
                AccountType = account.AccountType,
                Active = account.Active
            };
        }

        public async Task<bool> DeleteAsync(Guid accountId, CancellationToken cancellationToken)
        {
            var account = await accountRepository.GetByIdAsync(accountId, cancellationToken);

            if (account is null) return false;

            if (await accountRepository.HasMovementsAsync(accountId, cancellationToken))
            {
                throw new InvalidOperationException("La cuenta tiene movimientos asociados.");
            }

            accountRepository.Remove(account);
            await accountRepository.SaveChangesAsync(cancellationToken);

            return true;
        }
    }

}

