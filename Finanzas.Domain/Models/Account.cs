namespace Finanzas.Domain.Models;


// Representa el lugar donde se registra el dinero, como efectivo o una cuenta bancaria.
public class Account
{

    // Clave primaria que corresponde a Cuentas.ID_Cuenta.
    public Guid AccountId { get; private set; }

    
    // Nombre visible de la cuenta.
    public string Description { get; private set; } = string.Empty;

    
    // Clasifica la cuenta como efectivo, bancaria o billetera virtual.
    public string AccountType { get; private set; } = string.Empty;


    // Permite dejar de utilizar la cuenta sin borrar movimientos anteriores.
    public bool Active { get; private set; } = true;

    public decimal Balance { get; private set; } = 0;




    // Navegación hacia los movimientos registrados en esta cuenta.
    // El saldo se calcula desde esta relación y no se almacena en Cuenta.
    public ICollection<Movement> Movements { get; private set; } = new List<Movement>();


    // Foreign Key a User
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    // Foreign Key a Moneda 
    public Guid CurrencyId { get; private set; }
    public Currency Currency { get; private set; } = null!;




    // Constructor sin parámetros requerido por Entity Framework Core
    protected Account() { }

    //Constructor
    public Account(string description, string accountType, Guid userId, Guid currencyId)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("La descripción de la cuenta es obligatoria.", nameof(description));

        if (string.IsNullOrWhiteSpace(accountType))
            throw new ArgumentException("El tipo de cuenta es obligatorio.", nameof(accountType));

        if (userId == Guid.Empty)
            throw new ArgumentException("La cuenta debe pertenecer a un usuario válido.", nameof(userId));

        if (currencyId == Guid.Empty)
            throw new ArgumentException("La cuenta debe tener una moneda asociada.", nameof(currencyId));

        AccountId = Guid.NewGuid();
        Description = description.Trim();
        AccountType = accountType.Trim();
        UserId = userId;
        CurrencyId = currencyId;
    }

    // Métodos de comportamiento opcionales para alterar estado de forma controlada
    public void UpdateDescription(string newDescription)
    {
        if (string.IsNullOrWhiteSpace(newDescription))
            throw new ArgumentException("La descripción no puede estar vacía.", nameof(newDescription));
        Description = newDescription.Trim();
    }

    public void UpdateBalance(decimal amountChange)
    {
         Balance += amountChange;
    }

    public void Deactivate() => Active = false;
    public void Activate() => Active = true;
}
