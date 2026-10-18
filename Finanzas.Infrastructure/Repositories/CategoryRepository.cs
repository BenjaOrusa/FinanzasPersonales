using Finanzas.Domain.Models;
using Finanzas.Domain.Interfaces;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly FinanzasDbContext context;

        public CategoryRepository(FinanzasDbContext context)
        {
            this.context = context;
        }

        public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken) =>
            await context.Categories.AsNoTracking().OrderBy(item => item.Description).ToListAsync(cancellationToken);

        public async Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
            await context.Categories.FindAsync([id], cancellationToken);

        public async Task<bool> ExistsByDescriptionAndTypeAsync(string description, string categoryType, CancellationToken cancellationToken) =>
            await context.Categories.AnyAsync(item => item.Description == description && item.CategoryType == categoryType, cancellationToken);

        public async Task<bool> HasMovementsAsync(Guid categoryId, CancellationToken cancellationToken) =>
            await context.Movements.AnyAsync(item => item.CategoryId == categoryId, cancellationToken);

        public void Add(Category category) => context.Categories.Add(category);

        public void Remove(Category category) => context.Categories.Remove(category);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}