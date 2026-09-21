namespace Finanzas.Domain.Models;

/// <summary>
/// Representa un ingreso o gasto asociado a una categoría y una cuenta.
/// </summary>
public class Movement
{
    /// <summary>
    /// Clave primaria que corresponde a Movimientos.ID_Movimiento.
    /// </summary>
    public Guid MovementId { get; set; }

    /// <summary>
    /// Motivo del movimiento.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Importe positivo del movimiento. TipoMovimiento determina si suma o resta.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Fecha financiera en la que ocurrió el movimiento.
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Indica si el movimiento es un ingreso o un gasto.
    /// </summary>
    public string MovementType { get; set; } = string.Empty;

    /// <summary>
    /// Clave foránea de la categoría utilizada.
    /// </summary>
    public Guid CategoryId { get; set; }

    /// <summary>
    /// Clave foránea de la cuenta utilizada.
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// Información adicional opcional.
    /// </summary>
    public string? AdditionalInformation { get; set; }

    /// <summary>
    /// Momento técnico en el que se creó el registro.
    /// </summary>
    public DateTime CreationDate { get; set; }

    /// <summary>
    /// Navegación hacia la categoría relacionada.
    /// </summary>
    public Category Category { get; set; } = null!;

    /// <summary>
    /// Navegación hacia la cuenta relacionada.
    /// </summary>
    public Account Account { get; set; } = null!;
}
