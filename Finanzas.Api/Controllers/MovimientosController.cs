using Finanzas.Api.Contracts.Movimientos;
using Finanzas.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Api.Controllers;

/// <summary>
/// Expone operaciones HTTP relacionadas con los movimientos financieros.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MovimientosController(FinanzasDbContext context) : ControllerBase
{
    /// <summary>
    /// Obtiene todos los movimientos ordenados desde el más reciente.
    /// </summary>
    /// <param name="cancellationToken">
    /// Permite cancelar la consulta si el cliente abandona la petición.
    /// </param>
    /// <returns>Una respuesta 200 OK con los movimientos almacenados.</returns>
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<MovimientoRespuesta>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MovimientoRespuesta>>> ObtenerTodos(
        CancellationToken cancellationToken)
    {
        var movimientos = await context.Movimientos
            // La consulta es de lectura; EF no necesita seguir cambios en estas entidades.
            .AsNoTracking()
            .OrderByDescending(movimiento => movimiento.Fecha)
            .ThenByDescending(movimiento => movimiento.ID_Movimiento)
            // Select proyecta únicamente los datos que forman parte del contrato HTTP.
            .Select(movimiento => new MovimientoRespuesta
            {
                ID_Movimiento = movimiento.ID_Movimiento,
                Descripcion = movimiento.Descripcion,
                Importe = movimiento.Importe,
                Fecha = movimiento.Fecha,
                TipoMovimiento = movimiento.TipoMovimiento,
                ID_Categoria = movimiento.ID_Categoria,
                Categoria = movimiento.Categoria.Descripcion,
                ID_Cuenta = movimiento.ID_Cuenta,
                Cuenta = movimiento.Cuenta.Descripcion,
                Nota = movimiento.Nota
            })
            .ToListAsync(cancellationToken);

        return Ok(movimientos);
    }
}
