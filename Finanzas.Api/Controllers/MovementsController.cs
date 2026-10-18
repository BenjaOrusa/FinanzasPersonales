using Finanzas.Api.Contracts.Movements;
using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Finanzas.Api.Controllers
{
 
    // Expone operaciones HTTP relacionadas con los movimientos financieros
    [ApiController]
    [Route("api/[controller]")]
    public class MovementController : ControllerBase
    {
        private readonly IMovementService movementService;

        public MovementController(IMovementService movementService)
        {
            this.movementService = movementService;
        }

       
        // Obtiene todos los movimientos ordenados desde el más reciente
        [HttpGet]
        [ProducesResponseType<IReadOnlyList<MovementResponseDTO>>(StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<MovementResponseDTO>>> GetAll(CancellationToken cancellationToken)
        {
            var movements = await movementService.GetAllAsync(cancellationToken);
            return Ok(movements);
        }

        //Crea un movimiento y devuelve la representación recién guardada
        [HttpPost]
        public async Task<ActionResult<MovementResponseDTO>> Create(
            [FromBody] MovementRequestDTO movementRequest, CancellationToken cancellationToken)
        {
            var (response, error) = await movementService.CreateAsync(movementRequest, cancellationToken);

            if (error is not null) return BadRequest(error);

            return CreatedAtAction(nameof(GetById), new { MovementId = response!.MovementId }, response);
        }

        // Obtiene un movimiento por su identificador
        [HttpGet("{movementId:Guid}")]
        public async Task<ActionResult<MovementResponseDTO>> GetById(Guid movementId, CancellationToken cancellationToken)
        {
            var response = await movementService.GetByIdAsync(movementId, cancellationToken);
            return response is null ? NotFound() : Ok(response);
        }

        //Actualiza todos los datos editables de un movimiento
        [HttpPut("{movementId:Guid}")]
        public async Task<ActionResult<MovementResponseDTO>> Update(
            Guid movementId, [FromBody] MovementRequestDTO movementRequest, CancellationToken cancellationToken)
        {
            var (response, error) = await movementService.UpdateAsync(movementId, movementRequest, cancellationToken);

            if (error == "NotFound") return NotFound();
            if (error is not null) return BadRequest(error);

            return Ok(response);
        }

        //Elimina definitivamente un movimiento.
        [HttpDelete("{movementId:Guid}")]
        public async Task<IActionResult> Delete(Guid movementId, CancellationToken cancellationToken)
        {
            var deleted = await movementService.DeleteAsync(movementId, cancellationToken);

            if (!deleted) return NotFound();

            return NoContent();
        }
    }
}