using Finanzas.Application.DTOs.Request.Categories;
using Finanzas.Application.DTOs.Response.Categories;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Finanzas.Api.Controllers
{
    /// Expone las categorías almacenadas en SQL Server
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            this.categoryService = categoryService;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<CategoryResponseDTO>>> GetAll(CancellationToken cancellationToken)
        {
            var categories = await categoryService.GetAllAsync(cancellationToken);
            return Ok(categories);
        }

        [HttpPost]
        public async Task<ActionResult<CategoryResponseDTO>> Create([FromBody] CategoryRequestDTO categoryRequest, CancellationToken cancellationToken)
        {
            try
            {
                var response = await categoryService.CreateAsync(categoryRequest, cancellationToken);
                return CreatedAtAction(nameof(GetAll), new { id = response.CategoryId }, response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpDelete("{categoryId:guid}")]
        public async Task<IActionResult> Delete(Guid categoryId, CancellationToken cancellationToken)
        {
            try
            {
                var deleted = await categoryService.DeleteAsync(categoryId, cancellationToken);

                if (!deleted) return NotFound();

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }
    }
}