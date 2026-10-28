using Finanzas.Api.Contracts.Movements;
using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finanzas.Api.Controllers
{

    // Expone operaciones HTTP relacionadas con los movimientos financieros
    [Authorize(Policy = Policies.StandardUsers)]
    [ApiController]
    [Route("api/[controller]")]
    public class MovementController : ControllerBase
    {
        private readonly IMovementService movementService;

        public MovementController(IMovementService movementService)
        {
            this.movementService = movementService;
        }


        [HttpGet]
        [ProducesResponseType(typeof(IReadOnlyList<MovementResponseDTO>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<MovementResponseDTO>>> GetAll(CancellationToken cancellationToken)
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var movements = await movementService.GetAllAsync(userEmail, cancellationToken);
            return Ok(movements);
        }

        [HttpGet("{movementId:Guid}")]
        [ProducesResponseType(typeof(MovementResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MovementResponseDTO>> GetById(Guid movementId, CancellationToken cancellationToken)
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var response = await movementService.GetByIdAsync(userEmail, movementId, cancellationToken);
            return response is null ? NotFound() : Ok(response);
        }


        //CU11 — Registrar un movimiento
        [HttpPost]
        [ProducesResponseType(typeof(MovementResponseDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<MovementResponseDTO>> Create(
            [FromBody] MovementRequestDTO movementRequest, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var response = await movementService.CreateAsync(userEmail, movementRequest, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { movementId = response.MovementId }, response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        //CU12 — Editar un movimiento
        [HttpPut("{movementId:Guid}")]
        [ProducesResponseType(typeof(MovementResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MovementResponseDTO>> Update(
            Guid movementId, [FromBody] MovementRequestDTO movementRequest, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var response = await movementService.UpdateAsync(userEmail, movementId, movementRequest, cancellationToken);

                if (response is null) return NotFound();

                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        //CU13 — Eliminar un movimiento
        [HttpDelete("{movementId:Guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid movementId, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var deleted = await movementService.DeleteAsync(userEmail, movementId, cancellationToken);

                if (!deleted) return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // CU14: Consultar movimientos con filtros opcionales (tipo, fechas, cuenta, categoría)
        [HttpGet]
        [ProducesResponseType(typeof(IReadOnlyList<MovementResponseDTO>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<MovementResponseDTO>>> GetAll(
            [FromQuery] string? movementType,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] Guid? accountId,
            [FromQuery] Guid? categoryId,
            CancellationToken cancellationToken)
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();

            var filter = new MovementFilterDTO
            {
                MovementType = movementType,
                StartDate = startDate,
                EndDate = endDate,
                AccountId = accountId,
                CategoryId = categoryId
            };

            var movements = await movementService.GetFilteredAsync(userEmail, filter, cancellationToken);
            return Ok(movements);
        }
    }
}