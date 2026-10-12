using Finanzas.Application.DTOs.Request.Categories;
using Finanzas.Application.DTOs.Response.Categories;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<IReadOnlyList<CategoryResponseDTO>> GetAllAsync(CancellationToken cancellationToken);
        Task<CategoryResponseDTO> CreateAsync(CategoryRequestDTO request, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(Guid categoryId, CancellationToken cancellationToken);
    }
}
