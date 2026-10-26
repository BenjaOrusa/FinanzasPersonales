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


        public async Task<IReadOnlyList<Account>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
                    await context.Accounts
                        .AsNoTracking()
                        .Where(item => item.UserId == userId)
                        .OrderBy(item => item.Description)
                        .ToListAsync(cancellationToken);

        public async Task<Account?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
            await context.Accounts
                .FirstOrDefaultAsync(item => item.AccountId == id && item.UserId == userId, cancellationToken);

        public async Task<bool> ExistsByDescriptionAndUserAsync(string description, Guid userId, CancellationToken cancellationToken) =>
            await context.Accounts
                .AnyAsync(item => item.UserId == userId && item.Description == description, cancellationToken);

        public async Task<bool> HasMovementsAsync(Guid accountId, CancellationToken cancellationToken) =>
            await context.Movements
                .AnyAsync(item => item.AccountId == accountId, cancellationToken);

        public void Add(Account account) => context.Accounts.Add(account);

        public void Remove(Account account) => context.Accounts.Remove(account);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}
