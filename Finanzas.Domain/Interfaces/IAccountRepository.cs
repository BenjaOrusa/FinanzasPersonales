using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface IAccountRepository
    {
        Task<IReadOnlyList<Account>> GetAllAsync(CancellationToken cancellationToken);
        Task<Account?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAsync(string description, CancellationToken cancellationToken);
        Task<bool> HasMovementsAsync(Guid accountId, CancellationToken cancellationToken);
        void Add(Account account);
        void Remove(Account account);
        Task SaveChangesAsync(CancellationToken cancellationToken);

    }
}
