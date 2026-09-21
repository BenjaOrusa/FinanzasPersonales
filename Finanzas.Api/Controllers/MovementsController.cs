using Finanzas.Api.Contracts.Movements;
using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Api.Controllers;

/// <summary>
/// Expone operaciones HTTP relacionadas con los movimientos financieros.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MovementController(FinanzasDbContext context) : ControllerBase
{
    /// <summary>
    /// Obtiene todos los movimientos ordenados desde el más reciente.
    /// </summary>
    /// <param name="cancellationToken">
    /// Permite cancelar la consulta si el cliente abandona la petición.
    /// </param>
    /// <returns>Una respuesta 200 OK con los movimientos almacenados.</returns>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<MovementResponseDTO>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MovementResponseDTO>>> GetAll(
        CancellationToken cancellationToken)
    {
        var movements = await context.Movements
            // La consulta es de lectura; EF no necesita seguir cambios en estas entidades.
            .AsNoTracking()
            .OrderByDescending(movement => movement.Date)
            .ThenByDescending(movement => movement.MovementId)
            // Select proyecta únicamente los datos que forman parte del contrato HTTP.
            .Select(movement => new MovementResponseDTO
            {
                MovementId = movement.MovementId,
                Description = movement.Description,
                Amount = movement.Amount,
                Date = movement.Date,
                MovementType = movement.MovementType,
                CategoryId = movement.CategoryId,
                Category = movement.Category.Description,
                AccountId = movement.AccountId,
                Account = movement.Account.Description,
                AdditionalInformation = movement.AdditionalInformation
            })
            .ToListAsync(cancellationToken);

        return Ok(movements);
    }

    /// <summary>Crea un movimiento y devuelve la representación recién guardada.</summary>
    [HttpPost]
    public async Task<ActionResult<MovementResponseDTO>> Create(
        MovementRequestDTO movementRequest, CancellationToken cancellationToken)
    {
        var error = await Validate(movementRequest, cancellationToken);
        if (error is not null) return BadRequest(error);

        var movement = new Movement
        {
            Description = movementRequest.Description.Trim(),
            Amount = movementRequest.Amount,
            Date = movementRequest.Date,
            MovementType = movementRequest.MovementType,
            CategoryId = movementRequest.CategoryId,
            AccountId = movementRequest.AccountId,
            AdditionalInformation = NormalizarNota(movementRequest.AdditionalInformation)
        };

        context.Movements.Add(movement);
        await context.SaveChangesAsync(cancellationToken);

        var response = await SearchResponse(movement.MovementId, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { MovementId = movement.MovementId }, response);
    }

    /// <summary>Obtiene un movimiento por su identificador.</summary>
    [HttpGet("{MovementId:Guid}")]
    public async Task<ActionResult<MovementResponseDTO>> GetById(Guid movementId, CancellationToken cancellationToken)
    {
        var response = await SearchResponse(movementId, cancellationToken);
        return response is null ? NotFound() : Ok(response);
    }



    /// <summary>Actualiza todos los datos editables de un movimiento.</summary>
    [HttpPut("{MovementId:Guid}")]
    public async Task<ActionResult<MovementResponseDTO>> Update(
        Guid MovementId, MovementRequestDTO movementRequest, CancellationToken cancellationToken)
    {
        var movement = await context.Movements.FindAsync([MovementId], cancellationToken);
        if (movement is null) return NotFound();


        var error = await Validate(movementRequest, cancellationToken);
        if (error is not null) return BadRequest(error);

        movement.Description = movementRequest.Description.Trim();
        movement.Amount = movementRequest.Amount;
        movement.Date = movementRequest.Date;
        movement.MovementType = movementRequest.MovementType;
        movement.CategoryId = movementRequest.CategoryId;
        movement.AccountId = movementRequest.AccountId;
        movement.AdditionalInformation = NormalizarNota(movementRequest.AdditionalInformation);

        await context.SaveChangesAsync(cancellationToken);

        return Ok(await SearchResponse(movement.MovementId, cancellationToken));
    }

    /// <summary>Elimina definitivamente un movimiento.</summary>
    [HttpDelete("{MovementId:Guid}")]
    public async Task<IActionResult> Delete(Guid movementId, CancellationToken cancellationToken)
    {
        var movement = await context.Movements.FindAsync([movementId], cancellationToken);
        if (movement is null) return NotFound();

        context.Movements.Remove(movement);
        
        await context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private async Task<string?> Validate(MovementRequestDTO movementRequest, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(movementRequest.Description) || movementRequest.Description.Trim().Length > 200)
            return "La descripción es obligatoria y admite hasta 200 caracteres.";

        if (movementRequest.Amount <= 0 || movementRequest.MovementType is not ("Ingreso" or "Gasto"))
            return "El importe o el tipo de movimiento no son válidos.";

        if (movementRequest.AdditionalInformation?.Length > 500) return "La nota admite hasta 500 caracteres.";

        var category = await context.Categories.AsNoTracking().SingleOrDefaultAsync(
            item => item.CategoryId == movementRequest.CategoryId && item.Active, cancellationToken);

        if (category is null || category.CategoryType != movementRequest.MovementType)
            return "La categoría no existe, está inactiva o no corresponde al tipo de movimiento.";

        if (!await context.Accounts.AnyAsync(item => item.AccountId == movementRequest.AccountId && item.Active, cancellationToken))
            return "La cuenta no existe o está inactiva.";

        return null;
    }

    private async Task<MovementResponseDTO?> SearchResponse(Guid movementId, CancellationToken cancellationToken) =>
        
        await context.Movements.AsNoTracking()
            .Where(item => item.MovementId == movementId)
            .Select(item => new MovementResponseDTO
            {
                MovementId = item.MovementId, Description = item.Description,
                Amount = item.Amount, Date = item.Date, MovementType = item.MovementType,
                CategoryId = item.CategoryId, Category = item.Category.Description,
                AccountId = item.AccountId, Account = item.Account.Description, 
                AdditionalInformation = item.AdditionalInformation

            }).SingleOrDefaultAsync(cancellationToken);

    private static string? NormalizarNota(string? nota) =>
        string.IsNullOrWhiteSpace(nota) ? null : nota.Trim();
}
