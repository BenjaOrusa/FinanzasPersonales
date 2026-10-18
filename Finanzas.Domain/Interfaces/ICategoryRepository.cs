using Finanzas.Domain.Models;

namespace Finanzas.Domain.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken);
        Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAndTypeAsync(string description, string categoryType, CancellationToken cancellationToken);
        Task<bool> HasMovementsAsync(Guid categoryId, CancellationToken cancellationToken);
        void Add(Category category);
        void Remove(Category category);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}