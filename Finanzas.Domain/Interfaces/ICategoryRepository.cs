using Finanzas.Domain.Models;

namespace Finanzas.Domain.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IReadOnlyList<Category>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken);
        Task<Category?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAndTypeAndUserAsync(string description, string categoryType, Guid userId, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAndTypeAndUserExcludingIdAsync(string description, string categoryType, Guid userId, Guid categoryId, CancellationToken cancellationToken);
        Task<bool> HasMovementsAsync(Guid categoryId, CancellationToken cancellationToken);
        void Add(Category category);
        void Remove(Category category);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}