namespace Finanzas.Application.DTOs.Request.Movements;

//Datos editables que el frontend envía para crear o modificar un movimiento.
public class MovementRequestDTO
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string MovementType { get; set; } = string.Empty; // 'Ingreso' o 'Gasto'
    public Guid CategoryId { get; set; }
    public Guid AccountId { get; set; }
    public string? Note { get; set; }
}
