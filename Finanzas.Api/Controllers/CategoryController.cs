using Finanzas.Application.DTOs.Request.Categories;
using Finanzas.Application.DTOs.Response.Categories;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finanzas.Api.Controllers
{
    /// Expone las categorías almacenadas en SQL Server
    [Authorize(Policy = Policies.StandardUsers)]
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
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var categories = await categoryService.GetAllAsync(userEmail, cancellationToken);
            return Ok(categories);
        }

        [HttpPost]
        public async Task<ActionResult<CategoryResponseDTO>> Create([FromBody] CategoryRequestDTO categoryRequest, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var response = await categoryService.CreateAsync(userEmail, categoryRequest, cancellationToken);
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
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPatch("{categoryId:Guid}/deactivate")]
        public async Task<IActionResult> Deactivate(Guid categoryId, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var success = await categoryService.DeactivateAsync(userEmail, categoryId, cancellationToken);

                if (!success) return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}