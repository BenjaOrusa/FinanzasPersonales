using Finanzas.Application.DTOs.Request.Categories;
using Finanzas.Application.DTOs.Response.Categories;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<IReadOnlyList<CategoryResponseDTO>> GetAllAsync(string userEmail, CancellationToken cancellationToken);
        Task<CategoryResponseDTO> CreateAsync(string userEmail, CategoryRequestDTO request, CancellationToken cancellationToken);
        Task<bool> DeactivateAsync(string userEmail, Guid categoryId, CancellationToken cancellationToken);
    }
}
