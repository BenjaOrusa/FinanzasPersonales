using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface IAccountRepository
    {
        Task<IReadOnlyList<Account>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken);
        Task<Account?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAndUserAsync(string description, Guid userId, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAndUserExcludingIdAsync(string description, Guid userId, Guid accountId, CancellationToken cancellationToken);
        Task<bool> HasMovementsAsync(Guid accountId, CancellationToken cancellationToken);
        void Add(Account account);
        void Remove(Account account);
        Task SaveChangesAsync(CancellationToken cancellationToken);

    }
}
