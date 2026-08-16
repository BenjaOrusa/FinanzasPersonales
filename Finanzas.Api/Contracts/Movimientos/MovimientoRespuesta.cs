namespace Finanzas.Api.Contracts.Movimientos;

/// <summary>
/// Define el JSON que la API devuelve al frontend para representar un movimiento.
/// </summary>
public class MovimientoRespuesta
{
    public int ID_Movimiento { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public decimal Importe { get; set; }

    public DateOnly Fecha { get; set; }

    public string TipoMovimiento { get; set; } = string.Empty;

    public int ID_Categoria { get; set; }

    public string Categoria { get; set; } = string.Empty;

    public int ID_Cuenta { get; set; }

    public string Cuenta { get; set; } = string.Empty;

    public string? Nota { get; set; }
}
