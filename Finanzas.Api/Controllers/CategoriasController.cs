using Finanzas.Api.Contracts.Categorias;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Api.Controllers;

/// <summary>Expone las categorías almacenadas en SQL Server.</summary>
[ApiController]
[Route("api/[controller]")]
public class CategoriasController(FinanzasDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoriaRespuesta>>> ObtenerTodas(CancellationToken cancellationToken)
    {
        var categorias = await context.Categorias.AsNoTracking()
            .OrderBy(item => item.Descripcion)
            .Select(item => new CategoriaRespuesta { ID_Categoria = item.ID_Categoria, Descripcion = item.Descripcion, TipoCategoria = item.TipoCategoria, Activa = item.Activa })
            .ToListAsync(cancellationToken);
        return Ok(categorias);
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaRespuesta>> Crear(CrearCategoriaSolicitud solicitud, CancellationToken cancellationToken)
    {
        var descripcion = solicitud.Descripcion.Trim();
        if (descripcion.Length is 0 or > 100 || solicitud.TipoCategoria is not ("Ingreso" or "Gasto"))
            return BadRequest("La descripción y el tipo de categoría no son válidos.");

        if (await context.Categorias.AnyAsync(item => item.Descripcion == descripcion && item.TipoCategoria == solicitud.TipoCategoria, cancellationToken))
            return Conflict("Ya existe una categoría con esa descripción y tipo.");

        var categoria = new Categoria { Descripcion = descripcion, TipoCategoria = solicitud.TipoCategoria, Activa = true };
        context.Categorias.Add(categoria);
        await context.SaveChangesAsync(cancellationToken);
        var respuesta = new CategoriaRespuesta { ID_Categoria = categoria.ID_Categoria, Descripcion = categoria.Descripcion, TipoCategoria = categoria.TipoCategoria, Activa = categoria.Activa };
        return CreatedAtAction(nameof(ObtenerTodas), respuesta);
    }

    [HttpDelete("{ID_Categoria:int}")]
    public async Task<IActionResult> Eliminar(int ID_Categoria, CancellationToken cancellationToken)
    {
        var categoria = await context.Categorias.FindAsync([ID_Categoria], cancellationToken);
        if (categoria is null) return NotFound();
        if (await context.Movimientos.AnyAsync(item => item.ID_Categoria == ID_Categoria, cancellationToken))
            return Conflict("La categoría tiene movimientos asociados.");
        context.Categorias.Remove(categoria);
        await context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
