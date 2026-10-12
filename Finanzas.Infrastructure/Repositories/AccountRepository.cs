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


        public async Task<IReadOnlyList<Account>> GetAllAsync(CancellationToken cancellationToken) =>
            await context.Accounts.AsNoTracking().OrderBy(item => item.Description).ToListAsync(cancellationToken);

        public async Task<Account?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
            await context.Accounts.FindAsync([id], cancellationToken);

        public async Task<bool> ExistsByDescriptionAsync(string description, CancellationToken cancellationToken) =>
            await context.Accounts.AnyAsync(item => item.Description == description, cancellationToken);

        public async Task<bool> HasMovementsAsync(Guid accountId, CancellationToken cancellationToken) =>
            await context.Movements.AnyAsync(item => item.AccountId == accountId, cancellationToken);

        public void Add(Account account) => context.Accounts.Add(account);

        public void Remove(Account account) => context.Accounts.Remove(account);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}
