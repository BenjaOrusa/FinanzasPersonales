namespace Finanzas.Domain.Models;

/// <summary>
/// Representa un ingreso o gasto asociado a una categoría y una cuenta.
/// </summary>
public class Movimiento
{
    /// <summary>
    /// Clave primaria que corresponde a Movimientos.ID_Movimiento.
    /// </summary>
    public int ID_Movimiento { get; set; }

    /// <summary>
    /// Motivo del movimiento.
    /// </summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>
    /// Importe positivo del movimiento. TipoMovimiento determina si suma o resta.
    /// </summary>
    public decimal Importe { get; set; }

    /// <summary>
    /// Fecha financiera en la que ocurrió el movimiento.
    /// </summary>
    public DateOnly Fecha { get; set; }

    /// <summary>
    /// Indica si el movimiento es un ingreso o un gasto.
    /// </summary>
    public string TipoMovimiento { get; set; } = string.Empty;

    /// <summary>
    /// Clave foránea de la categoría utilizada.
    /// </summary>
    public int ID_Categoria { get; set; }

    /// <summary>
    /// Clave foránea de la cuenta utilizada.
    /// </summary>
    public int ID_Cuenta { get; set; }

    /// <summary>
    /// Información adicional opcional.
    /// </summary>
    public string? Nota { get; set; }

    /// <summary>
    /// Momento técnico en el que se creó el registro.
    /// </summary>
    public DateTime FechaCreacion { get; set; }

    /// <summary>
    /// Navegación hacia la categoría relacionada.
    /// </summary>
    public Categoria Categoria { get; set; } = null!;

    /// <summary>
    /// Navegación hacia la cuenta relacionada.
    /// </summary>
    public Cuenta Cuenta { get; set; } = null!;
}
