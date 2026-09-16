namespace Finanzas.Api.Contracts.Movimientos;

/// <summary>Datos editables que el frontend envía para crear o modificar un movimiento.</summary>
public class GuardarMovimientoSolicitud
{
    public string Descripcion { get; set; } = string.Empty;
    public decimal Importe { get; set; }
    public DateOnly Fecha { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public int ID_Categoria { get; set; }
    public int ID_Cuenta { get; set; }
    public string? Nota { get; set; }
}
