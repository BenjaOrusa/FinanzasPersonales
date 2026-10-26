namespace Finanzas.Api.Contracts.Movements;


// Define el JSON que la API devuelve al frontend para representar un movimiento.
public class MovementResponseDTO
{
    public Guid MovementId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryDescription { get; set; } = string.Empty;
    public Guid AccountId { get; set; }
    public string AccountDescription { get; set; } = string.Empty;
    public Guid CurrencyId { get; set; }
    public string? Note { get; set; }
    public DateTime CreationDate { get; set; }
}
