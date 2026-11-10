namespace Finanzas.Domain.Models;


// Representa un ingreso o gasto asociado a una categoría y una cuenta.
public class Movement
{

    // Clave primaria que corresponde a Movimientos.ID_Movimiento.
    public Guid MovementId { get; private set; }

    // Motivo del movimiento.
    public string Description { get; private set; } = string.Empty;

   
    // Importe positivo del movimiento. TipoMovimiento determina si suma o resta.
    public decimal Amount { get; private set; }

   
    // Fecha financiera en la que ocurrió el movimiento.
    public DateTime Date { get; private set; }

   
    // Indica si el movimiento es un ingreso o un gasto.
    public string MovementType { get; private set; } = string.Empty;
   
    // Información adicional opcional.
    public string? Note { get; private set; }

    public DateTime CreationDate { get; private set; }

    // Foreign Keys
    public Guid UserId { get; private set; }
    public Guid AccountId { get; private set; }
    public Guid CategoryId { get; private set; }
    public Guid CurrencyId { get; private set; }

    // Navegaciones
    public User User { get; private set; } = null!;
    public Account Account { get; private set; } = null!;
    public Category Category { get; private set; } = null!;

    public Currency Currency { get; private set; } = null!;

    protected Movement() { }

    public Movement(
            string description,
            decimal amount,
            DateTime date,
            string movementType,
            Guid userId,
            Guid accountId,
            Guid categoryId,
            Guid currencyId,
            string? note = null)
    {
        
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("La descripción del movimiento es obligatoria.", nameof(description));
        
        if (amount <= 0)
            throw new ArgumentException("El importe debe ser mayor a cero.", nameof(amount));
        
        if (string.IsNullOrWhiteSpace(movementType))
            throw new ArgumentException("El tipo de movimiento es obligatorio.", nameof(movementType));
        
        if (userId == Guid.Empty)
            throw new ArgumentException("El movimiento debe estar asociado a un usuario.", nameof(userId));
        
        if (accountId == Guid.Empty)
            throw new ArgumentException("Debe asociar una cuenta válida.", nameof(accountId));
        
        if (categoryId == Guid.Empty)
            throw new ArgumentException("Debe asociar una categoría válida.", nameof(categoryId));
        
        if (currencyId == Guid.Empty)
            throw new ArgumentException("Debe especificar la moneda del movimiento.", nameof(currencyId));

        MovementId = Guid.NewGuid();
        Description = description.Trim();
        Amount = amount;
        Date = date;
        MovementType = movementType.Trim();
        UserId = userId;
        AccountId = accountId;
        CategoryId = categoryId;
        CurrencyId = currencyId;
        Note = note?.Trim();
        CreationDate = DateTime.UtcNow; // Auditoría 
    }
}
