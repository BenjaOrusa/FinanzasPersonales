namespace Finanzas.Domain.Models;

/// <summary>
/// Representa el lugar donde se registra el dinero, como efectivo o una cuenta bancaria.
/// </summary>
public class Account
{
    /// <summary>
    /// Clave primaria que corresponde a Cuentas.ID_Cuenta.
    /// </summary>
    public Guid AccountId { get; set; }

    /// <summary>
    /// Nombre visible de la cuenta.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Clasifica la cuenta como efectivo, bancaria o billetera virtual.
    /// </summary>
    public string AccountType { get; set; } = string.Empty;

    /// <summary>
    /// Permite dejar de utilizar la cuenta sin borrar movimientos anteriores.
    /// </summary>
    public bool Active { get; set; }

    /// <summary>
    /// Navegación hacia los movimientos registrados en esta cuenta.
    /// El saldo se calcula desde esta relación y no se almacena en Cuenta.
    /// </summary>
    public ICollection<Movement> Movements { get; set; } = new List<Movement>();
}
