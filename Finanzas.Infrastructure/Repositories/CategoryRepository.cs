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

        public async Task<IReadOnlyList<Category>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
            await context.Categories
                .AsNoTracking()
                .Where(item => item.UserId == userId)
                .OrderBy(item => item.Description)
                .ToListAsync(cancellationToken);

        public async Task<Category?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
            await context.Categories
                .FirstOrDefaultAsync(item => item.CategoryId == id && item.UserId == userId, cancellationToken);

        public async Task<bool> ExistsByDescriptionAndTypeAndUserAsync(string description, string categoryType, Guid userId, CancellationToken cancellationToken) =>
            await context.Categories
                .AnyAsync(item => item.UserId == userId && item.Description == description && item.CategoryType == categoryType, cancellationToken);
        public async Task<bool> ExistsByDescriptionAndTypeAndUserExcludingIdAsync(string description, string categoryType, Guid userId, Guid categoryId, CancellationToken cancellationToken) =>
            await context.Categories
                .AnyAsync(item => item.UserId == userId && item.Description == description && item.CategoryType == categoryType && item.CategoryId != categoryId, cancellationToken);

        public async Task<bool> HasMovementsAsync(Guid categoryId, CancellationToken cancellationToken) =>
            await context.Movements
                .AnyAsync(item => item.CategoryId == categoryId, cancellationToken);

        public void Add(Category category) => context.Categories.Add(category);

        public void Remove(Category category) => context.Categories.Remove(category);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}