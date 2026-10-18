namespace Finanzas.Domain.Models;


// Representa un ingreso o gasto asociado a una categoría y una cuenta.
public class Movement
{

    // Clave primaria que corresponde a Movimientos.ID_Movimiento.
    public Guid MovementId { get; set; }

    // Motivo del movimiento.
    public string Description { get; set; } = string.Empty;

   
    // Importe positivo del movimiento. TipoMovimiento determina si suma o resta.
    public decimal Amount { get; set; }

   
    // Fecha financiera en la que ocurrió el movimiento.
    public DateTime Date { get; set; }

   
    // Indica si el movimiento es un ingreso o un gasto.
    public string MovementType { get; set; } = string.Empty;

   
    // Clave foránea de la categoría utilizada.
    public Guid CategoryId { get; set; }

   
    // Clave foránea de la cuenta utilizada.
    public Guid AccountId { get; set; }

   
    // Información adicional opcional.
    public string? AdditionalInformation { get; set; }

   
    // Momento técnico en el que se creó el registro.
    public DateTime CreationDate { get; set; }

   
    // Navegación hacia la categoría relacionada.
    public Category Category { get; set; } = null!;

   
    // Navegación hacia la cuenta relacionada.
    public Account Account { get; set; } = null!;
}
