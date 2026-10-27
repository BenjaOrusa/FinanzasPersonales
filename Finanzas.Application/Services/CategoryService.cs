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

        public async Task<CategoryResponseDTO> UpdateAsync(string userEmail, Guid categoryId, CategoryRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var category = await categoryRepository.GetByIdAndUserIdAsync(categoryId, user.Id, cancellationToken);

            if (category is null)
                throw new KeyNotFoundException("La categoría no existe o no pertenece al usuario.");

            var description = request.Description.Trim();

            if (description.Length is 0 or > 100 || request.CategoryType is not ("Ingreso" or "Gasto"))
            {
                throw new ArgumentException("La descripción y el tipo de categoría no son válidos.");
            }

            // Validar unicidad excluyendo la categoría actual
            if (await categoryRepository.ExistsByDescriptionAndTypeAndUserExcludingIdAsync(description, request.CategoryType, user.Id, categoryId, cancellationToken))
            {
                throw new InvalidOperationException("Ya existe otra categoría con esa descripción y tipo para este usuario.");
            }

            // CU09 (Alternativa 4.b): Verificar compatibilidad del nuevo tipo con movimientos existentes
            if (category.CategoryType != request.CategoryType)
            {
                bool hasMovements = await categoryRepository.HasMovementsAsync(categoryId, cancellationToken);
                if (hasMovements)
                {
                    throw new InvalidOperationException("El cambio de tipo dejaría movimientos existentes con una categoría incompatible.");
                }
            }

            category.Update(description, request.CategoryType);
            await categoryRepository.SaveChangesAsync(cancellationToken);

            return MapToResponseDTO(category);
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
        private static CategoryResponseDTO MapToResponseDTO(Category category) => new()
        {
            CategoryId = category.CategoryId,
            Description = category.Description,
            CategoryType = category.CategoryType,
            Active = category.Active
        };
    }
}