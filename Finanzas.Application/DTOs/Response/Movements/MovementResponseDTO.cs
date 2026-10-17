namespace Finanzas.Application.DTOs.Response.Movements;

/// <summary>
/// Define el JSON que la API devuelve al frontend para representar un movimiento.
/// </summary>
public class MovementResponseDTO
{
    public Guid MovementId { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public DateTime Date { get; set; }

    public string MovementType { get; set; } = string.Empty;

    public Guid CategoryId { get; set; }

    public string Category { get; set; } = string.Empty;

    public Guid AccountId { get; set; }

    public string Account { get; set; } = string.Empty;

    public string? AdditionalInformation { get; set; }
}
