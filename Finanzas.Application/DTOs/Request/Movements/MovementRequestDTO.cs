namespace Finanzas.Application.DTOs.Request.Movements;

/// <summary>Datos editables que el frontend envía para crear o modificar un movimiento.</summary>
public class MovementRequestDTO
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Guid AccountId { get; set; }
    public string? AdditionalInformation { get; set; }
}
