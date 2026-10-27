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


        //CU08 — Crear una categoría
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

        // CU09: Editar una categoría propia
        [HttpPut("{categoryId:Guid}")]
        public async Task<ActionResult<CategoryResponseDTO>> Update(Guid categoryId, [FromBody] CategoryRequestDTO categoryRequest, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var response = await categoryService.UpdateAsync(userEmail, categoryId, categoryRequest, cancellationToken);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
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


        //CU10 — Desactivar una categoría
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