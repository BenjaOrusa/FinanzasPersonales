using Finanzas.Application.DTOs.Request.Categories;
using Finanzas.Application.DTOs.Response.Categories;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Api.Controllers;

/// <summary>Expone las categorías almacenadas en SQL Server.</summary>
[ApiController]
[Route("api/[controller]")]
public class CategoryController(FinanzasDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryResponseDTO>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await context.Categories.AsNoTracking()
            .OrderBy(item => item.Description)
            .Select(item => new CategoryResponseDTO { CategoryId = item.CategoryId, Description = item.Description,
                CategoryType = item.CategoryType, Active = item.Active })
            .ToListAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponseDTO>> Create(CategoryRequestDTO categoryRequest, CancellationToken cancellationToken)
    {
        var description = categoryRequest.Description.Trim();

        if (description.Length is 0 or > 100 || categoryRequest.CategoryType is not ("Ingreso" or "Gasto"))
            return BadRequest("La descripción y el tipo de categoría no son válidos.");

        if (await context.Categories.AnyAsync(item => item.Description == description && item.CategoryType == categoryRequest.CategoryType, cancellationToken))
            return Conflict("Ya existe una categoría con esa descripción y tipo.");

        var category = new Category { Description = description, CategoryType = categoryRequest.CategoryType, 
            Active = true };

        context.Categories.Add(category);

        await context.SaveChangesAsync(cancellationToken);

        var response = new CategoryResponseDTO { CategoryId = category.CategoryId, Description = category.Description, 
            CategoryType = category.CategoryType, Active = category.Active };

        return CreatedAtAction(nameof(GetAll), response);
    }

    [HttpDelete("{CategoryId:guid}")]
    public async Task<IActionResult> Delete(Guid categoryId, CancellationToken cancellationToken)
    {
        var category = await context.Categories.FindAsync([categoryId], cancellationToken);

        if (category is null) return NotFound();

        if (await context.Movements.AnyAsync(item => item.CategoryId == categoryId, cancellationToken))
            return Conflict("La categoría tiene movimientos asociados.");

        context.Categories.Remove(category);

        await context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
