using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
        public interface IMovementRepository
        {
            Task<IReadOnlyList<Movement>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken);
            Task<Movement?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken);
            void Add(Movement movement);
            void Remove(Movement movement);
            Task SaveChangesAsync(CancellationToken cancellationToken);
        }

}
