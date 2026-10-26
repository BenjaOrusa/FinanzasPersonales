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
        private readonly IUserService userService;

        public CategoryService(ICategoryRepository categoryRepository, IUserService userService)
        {
            this.categoryRepository = categoryRepository;
            this.userService = userService;
        }

        public async Task<IReadOnlyList<CategoryResponseDTO>> GetAllAsync(string userEmail, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var categories = await categoryRepository.GetAllByUserIdAsync(user.Id, cancellationToken);

            return categories.Select(item => new CategoryResponseDTO
            {
                CategoryId = item.CategoryId,
                Description = item.Description,
                CategoryType = item.CategoryType,
                Active = item.Active
            }).ToList();
        }

        public async Task<CategoryResponseDTO> CreateAsync(string userEmail, CategoryRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);

            var description = request.Description.Trim();

            if (description.Length is 0 or > 100 || request.CategoryType is not ("Ingreso" or "Gasto"))
            {
                throw new ArgumentException("La descripción y el tipo de categoría no son válidos.");
            }

            if (await categoryRepository.ExistsByDescriptionAndTypeAndUserAsync(description, request.CategoryType, user.Id, cancellationToken))
            {
                throw new InvalidOperationException("Ya existe una categoría con esa descripción y tipo para este usuario.");
            }

            // Uso del constructor blindado de la entidad Category
            var category = new Category(description, request.CategoryType, user.Id);

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

        public async Task<bool> DeactivateAsync(string userEmail, Guid categoryId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var category = await categoryRepository.GetByIdAndUserIdAsync(categoryId, user.Id, cancellationToken);

            if (category is null) return false;

            // Baja lógica exigida por el CU10 (conservando el historial de movimientos)
            category.Deactivate();

            await categoryRepository.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}