using Finanzas.Api.Contracts.Movimientos;
using Finanzas.Api.Data;
using Finanzas.Api.Models;
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

    /// <summary>Crea un movimiento y devuelve la representación recién guardada.</summary>
    [HttpPost]
    public async Task<ActionResult<MovimientoRespuesta>> Crear(
        GuardarMovimientoSolicitud solicitud, CancellationToken cancellationToken)
    {
        var error = await Validar(solicitud, cancellationToken);
        if (error is not null) return BadRequest(error);

        var movimiento = new Movimiento
        {
            Descripcion = solicitud.Descripcion.Trim(),
            Importe = solicitud.Importe,
            Fecha = solicitud.Fecha,
            TipoMovimiento = solicitud.TipoMovimiento,
            ID_Categoria = solicitud.ID_Categoria,
            ID_Cuenta = solicitud.ID_Cuenta,
            Nota = NormalizarNota(solicitud.Nota)
        };

        context.Movimientos.Add(movimiento);
        await context.SaveChangesAsync(cancellationToken);
        var respuesta = await BuscarRespuesta(movimiento.ID_Movimiento, cancellationToken);
        return CreatedAtAction(nameof(ObtenerPorID), new { ID_Movimiento = movimiento.ID_Movimiento }, respuesta);
    }

    /// <summary>Obtiene un movimiento por su identificador.</summary>
    [HttpGet("{ID_Movimiento:int}")]
    public async Task<ActionResult<MovimientoRespuesta>> ObtenerPorID(int ID_Movimiento, CancellationToken cancellationToken)
    {
        var respuesta = await BuscarRespuesta(ID_Movimiento, cancellationToken);
        return respuesta is null ? NotFound() : Ok(respuesta);
    }

    /// <summary>Actualiza todos los datos editables de un movimiento.</summary>
    [HttpPut("{ID_Movimiento:int}")]
    public async Task<ActionResult<MovimientoRespuesta>> Actualizar(
        int ID_Movimiento, GuardarMovimientoSolicitud solicitud, CancellationToken cancellationToken)
    {
        var movimiento = await context.Movimientos.FindAsync([ID_Movimiento], cancellationToken);
        if (movimiento is null) return NotFound();
        var error = await Validar(solicitud, cancellationToken);
        if (error is not null) return BadRequest(error);

        movimiento.Descripcion = solicitud.Descripcion.Trim();
        movimiento.Importe = solicitud.Importe;
        movimiento.Fecha = solicitud.Fecha;
        movimiento.TipoMovimiento = solicitud.TipoMovimiento;
        movimiento.ID_Categoria = solicitud.ID_Categoria;
        movimiento.ID_Cuenta = solicitud.ID_Cuenta;
        movimiento.Nota = NormalizarNota(solicitud.Nota);
        await context.SaveChangesAsync(cancellationToken);
        return Ok(await BuscarRespuesta(ID_Movimiento, cancellationToken));
    }

    /// <summary>Elimina definitivamente un movimiento.</summary>
    [HttpDelete("{ID_Movimiento:int}")]
    public async Task<IActionResult> Eliminar(int ID_Movimiento, CancellationToken cancellationToken)
    {
        var movimiento = await context.Movimientos.FindAsync([ID_Movimiento], cancellationToken);
        if (movimiento is null) return NotFound();
        context.Movimientos.Remove(movimiento);
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private async Task<string?> Validar(GuardarMovimientoSolicitud solicitud, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(solicitud.Descripcion) || solicitud.Descripcion.Trim().Length > 200)
            return "La descripción es obligatoria y admite hasta 200 caracteres.";
        if (solicitud.Importe <= 0 || solicitud.TipoMovimiento is not ("Ingreso" or "Gasto"))
            return "El importe o el tipo de movimiento no son válidos.";
        if (solicitud.Nota?.Length > 500) return "La nota admite hasta 500 caracteres.";

        var categoria = await context.Categorias.AsNoTracking().SingleOrDefaultAsync(
            item => item.ID_Categoria == solicitud.ID_Categoria && item.Activa, cancellationToken);
        if (categoria is null || categoria.TipoCategoria != solicitud.TipoMovimiento)
            return "La categoría no existe, está inactiva o no corresponde al tipo de movimiento.";
        if (!await context.Cuentas.AnyAsync(item => item.ID_Cuenta == solicitud.ID_Cuenta && item.Activa, cancellationToken))
            return "La cuenta no existe o está inactiva.";
        return null;
    }

    private async Task<MovimientoRespuesta?> BuscarRespuesta(int ID_Movimiento, CancellationToken cancellationToken) =>
        await context.Movimientos.AsNoTracking()
            .Where(item => item.ID_Movimiento == ID_Movimiento)
            .Select(item => new MovimientoRespuesta
            {
                ID_Movimiento = item.ID_Movimiento, Descripcion = item.Descripcion,
                Importe = item.Importe, Fecha = item.Fecha, TipoMovimiento = item.TipoMovimiento,
                ID_Categoria = item.ID_Categoria, Categoria = item.Categoria.Descripcion,
                ID_Cuenta = item.ID_Cuenta, Cuenta = item.Cuenta.Descripcion, Nota = item.Nota
            }).SingleOrDefaultAsync(cancellationToken);

    private static string? NormalizarNota(string? nota) =>
        string.IsNullOrWhiteSpace(nota) ? null : nota.Trim();
}
