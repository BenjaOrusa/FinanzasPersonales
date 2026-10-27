using Finanzas.Domain.Models;
using Finanzas.Domain.Interfaces;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Infrastructure.Repositories
{
    public class MovementRepository : IMovementRepository
    {
        private readonly FinanzasDbContext context;

        public MovementRepository(FinanzasDbContext context)
        {
            this.context = context;
        }



        public async Task<IReadOnlyList<Movement>> GetFilteredByUserIdAsync(
            Guid userId,
            string? movementType,
            DateTime? startDate,
            DateTime? endDate,
            Guid? accountId,
            Guid? categoryId,
            CancellationToken cancellationToken)
        {
            var query = context.Movements
                .AsNoTracking()
                .Include(m => m.Category)
                .Include(m => m.Account)
                .Include(m => m.Currency)
                .Where(m => m.UserId == userId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(movementType))
            {
                query = query.Where(m => m.MovementType == movementType);
            }

            if (startDate.HasValue)
            {
                query = query.Where(m => m.Date >= startDate.Value.Date);
            }

            if (endDate.HasValue)
            {
                query = query.Where(m => m.Date <= endDate.Value.Date);
            }

            if (accountId.HasValue && accountId.Value != Guid.Empty)
            {
                query = query.Where(m => m.AccountId == accountId.Value);
            }

            if (categoryId.HasValue && categoryId.Value != Guid.Empty)
            {
                query = query.Where(m => m.CategoryId == categoryId.Value);
            }

            return await query
                .OrderByDescending(m => m.Date)
                .ThenByDescending(m => m.CreationDate)
                .ToListAsync(cancellationToken);
        }


        public async Task<IReadOnlyList<Movement>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
            await context.Movements
                .AsNoTracking()
                .Include(m => m.Category)
                .Include(m => m.Account)
                .Include(m => m.Currency)
                .Where(m => m.UserId == userId)
                .OrderByDescending(movement => movement.Date)
                .ThenByDescending(movement => movement.CreationDate)
                .ToListAsync(cancellationToken);

        public async Task<Movement?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
            await context.Movements
                .Include(m => m.Category)
                .Include(m => m.Account)
                .Include(m => m.Currency)
                .FirstOrDefaultAsync(m => m.MovementId == id && m.UserId == userId, cancellationToken);

        public void Add(Movement movement) => context.Movements.Add(movement);

        public void Remove(Movement movement) => context.Movements.Remove(movement);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}