using Finanzas.Application.DTOs.Request.Categories;
using Finanzas.Application.DTOs.Response.Categories;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Domain.Interfaces;

namespace Finanzas.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            this.categoryRepository = categoryRepository;
        }

        public async Task<IReadOnlyList<CategoryResponseDTO>> GetAllAsync(CancellationToken cancellationToken)
        {
            var categories = await categoryRepository.GetAllAsync(cancellationToken);

            return categories.Select(item => new CategoryResponseDTO
            {
                CategoryId = item.CategoryId,
                Description = item.Description,
                CategoryType = item.CategoryType,
                Active = item.Active
            }).ToList();
        }

        public async Task<CategoryResponseDTO> CreateAsync(CategoryRequestDTO request, CancellationToken cancellationToken)
        {
            var description = request.Description.Trim();

            if (description.Length is 0 or > 100 || request.CategoryType is not ("Ingreso" or "Gasto"))
            {
                throw new ArgumentException("La descripción y el tipo de categoría no son válidos.");
            }

            if (await categoryRepository.ExistsByDescriptionAndTypeAsync(description, request.CategoryType, cancellationToken))
            {
                throw new InvalidOperationException("Ya existe una categoría con esa descripción y tipo.");
            }

            var category = new Category
            {
                Description = description,
                CategoryType = request.CategoryType,
                Active = true
            };

            categoryRepository.Add(category);
            await categoryRepository.SaveChangesAsync(cancellationToken);

            return new CategoryResponseDTO
            {
                CategoryId = category.CategoryId,
                Description = category.Description,
                CategoryType = category.CategoryType,
                Active = category.Active
            };
        }

        public async Task<bool> DeleteAsync(Guid categoryId, CancellationToken cancellationToken)
        {
            var category = await categoryRepository.GetByIdAsync(categoryId, cancellationToken);

            if (category is null) return false;

            if (await categoryRepository.HasMovementsAsync(categoryId, cancellationToken))
            {
                throw new InvalidOperationException("La categoría tiene movimientos asociados.");
            }

            categoryRepository.Remove(category);
            await categoryRepository.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}