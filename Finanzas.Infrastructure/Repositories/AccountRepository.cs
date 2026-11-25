using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Infrastructure.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly FinanzasDbContext context;

        public AccountRepository(FinanzasDbContext context)
        {
            this.context = context;
        }


     public async Task<IReadOnlyList<Account>> GetAllByUserIdAsync(Guid userId, bool onlyActive, CancellationToken ct) =>
    await context.Accounts
        .AsNoTracking()
        .Include(item => item.Currency)
        .Where(item => item.UserId == userId && (!onlyActive || item.Active))
        .OrderBy(item => item.Description)
        .ToListAsync(ct);

        public async Task<Account?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken ct) =>
    await context.Accounts
        .Include(item => item.Currency)
        .FirstOrDefaultAsync(item => item.AccountId == id && item.UserId == userId, ct);

        public async Task<Currency?> GetCurrencyByIdAsync(Guid currencyId, CancellationToken ct) =>
            await context.Currencies.FirstOrDefaultAsync(item => item.Id == currencyId, ct);

        public async Task<bool> ExistsByDescriptionAndUserAsync(string description, Guid userId, CancellationToken cancellationToken) =>
            await context.Accounts
                .AnyAsync(item => item.UserId == userId && item.Description == description, cancellationToken);


        public async Task<bool> ExistsByDescriptionAndUserExcludingIdAsync(string description, Guid userId, Guid accountId, CancellationToken cancellationToken) =>
            await context.Accounts
                .AnyAsync(item => item.UserId == userId && item.Description == description && item.AccountId != accountId, cancellationToken);

        public async Task<bool> HasMovementsAsync(Guid accountId, CancellationToken cancellationToken) =>
            await context.Movements
                .AnyAsync(item => item.AccountId == accountId, cancellationToken);

        public void Add(Account account) => context.Accounts.Add(account);


        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}
