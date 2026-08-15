namespace Finanzas.Api.Models;

/// <summary>
/// Representa el lugar donde se registra el dinero, como efectivo o una cuenta bancaria.
/// </summary>
public class Cuenta
{
    /// <summary>
    /// Clave primaria que corresponde a Cuentas.ID_Cuenta.
    /// </summary>
    public int ID_Cuenta { get; set; }

    /// <summary>
    /// Nombre visible de la cuenta.
    /// </summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>
    /// Clasifica la cuenta como efectivo, bancaria o billetera virtual.
    /// </summary>
    public string TipoCuenta { get; set; } = string.Empty;

    /// <summary>
    /// Permite dejar de utilizar la cuenta sin borrar movimientos anteriores.
    /// </summary>
    public bool Activa { get; set; }

    /// <summary>
    /// Navegación hacia los movimientos registrados en esta cuenta.
    /// El saldo se calcula desde esta relación y no se almacena en Cuenta.
    /// </summary>
    public ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
}
