using Finanzas.Api.Contracts.Cuentas;
using Finanzas.Api.Data;
using Finanzas.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Api.Controllers;

/// <summary>Expone las cuentas almacenadas en SQL Server.</summary>
[ApiController]
[Route("api/[controller]")]
public class CuentasController(FinanzasDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CuentaRespuesta>>> ObtenerTodas(CancellationToken cancellationToken)
    {
        var cuentas = await context.Cuentas.AsNoTracking().OrderBy(item => item.Descripcion)
            .Select(item => new CuentaRespuesta { ID_Cuenta = item.ID_Cuenta, Descripcion = item.Descripcion, TipoCuenta = item.TipoCuenta, Activa = item.Activa })
            .ToListAsync(cancellationToken);
        return Ok(cuentas);
    }

    [HttpPost]
    public async Task<ActionResult<CuentaRespuesta>> Crear(CrearCuentaSolicitud solicitud, CancellationToken cancellationToken)
    {
        var descripcion = solicitud.Descripcion.Trim();
        if (descripcion.Length is 0 or > 100 || solicitud.TipoCuenta is not ("Efectivo" or "CuentaBancaria" or "BilleteraVirtual"))
            return BadRequest("La descripción y el tipo de cuenta no son válidos.");
        if (await context.Cuentas.AnyAsync(item => item.Descripcion == descripcion, cancellationToken))
            return Conflict("Ya existe una cuenta con esa descripción.");

        var cuenta = new Cuenta { Descripcion = descripcion, TipoCuenta = solicitud.TipoCuenta, Activa = true };
        context.Cuentas.Add(cuenta);
        await context.SaveChangesAsync(cancellationToken);
        var respuesta = new CuentaRespuesta { ID_Cuenta = cuenta.ID_Cuenta, Descripcion = cuenta.Descripcion, TipoCuenta = cuenta.TipoCuenta, Activa = cuenta.Activa };
        return CreatedAtAction(nameof(ObtenerTodas), respuesta);
    }

    [HttpDelete("{ID_Cuenta:int}")]
    public async Task<IActionResult> Eliminar(int ID_Cuenta, CancellationToken cancellationToken)
    {
        var cuenta = await context.Cuentas.FindAsync([ID_Cuenta], cancellationToken);
        if (cuenta is null) return NotFound();
        if (await context.Movimientos.AnyAsync(item => item.ID_Cuenta == ID_Cuenta, cancellationToken))
            return Conflict("La cuenta tiene movimientos asociados.");
        context.Cuentas.Remove(cuenta);
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
