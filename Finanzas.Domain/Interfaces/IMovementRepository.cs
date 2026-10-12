using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface IMovementRepository
    {
        Task<IReadOnlyList<Movement>> GetAllAsync(CancellationToken cancellationToken);
        Task<Movement?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<bool> CategoryExistsAndMatchesTypeAsync(Guid categoryId, string movementType, CancellationToken cancellationToken);
        Task<bool> AccountExistsAndIsActiveAsync(Guid accountId, CancellationToken cancellationToken);
        void Add(Movement movement);
        void Remove(Movement movement);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
