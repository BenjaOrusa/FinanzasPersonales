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

        public async Task<IReadOnlyList<Movement>> GetAllAsync(CancellationToken cancellationToken) =>
            await context.Movements
                .AsNoTracking()
                .Include(m => m.Category)
                .Include(m => m.Account)
                .OrderByDescending(movement => movement.Date)
                .ThenByDescending(movement => movement.MovementId)
                .ToListAsync(cancellationToken);

        public async Task<Movement?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
            await context.Movements
                .Include(m => m.Category)
                .Include(m => m.Account)
                .FirstOrDefaultAsync(m => m.MovementId == id, cancellationToken);

        public async Task<bool> CategoryExistsAndMatchesTypeAsync(Guid categoryId, string movementType, CancellationToken cancellationToken)
        {
            var category = await context.Categories
                .AsNoTracking()
                .SingleOrDefaultAsync(item => item.CategoryId == categoryId && item.Active, cancellationToken);

            return category is not null && category.CategoryType == movementType;
        }

        public async Task<bool> AccountExistsAndIsActiveAsync(Guid accountId, CancellationToken cancellationToken) =>
            await context.Accounts
                .AsNoTracking()
                .AnyAsync(item => item.AccountId == accountId && item.Active, cancellationToken);

        public void Add(Movement movement) => context.Movements.Add(movement);

        public void Remove(Movement movement) => context.Movements.Remove(movement);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}