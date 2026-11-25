namespace Finanzas.Application.DTOs.Request.Accounts;

//Datos necesarios para crear una cuenta.
public class AccountRequestDTO
{
    public string Description { get; set; } = string.Empty;

    // 'Efectivo', 'Cuenta Bancaria' o 'Billetera Virtual'.
    // También se aceptan sin espacios ('CuentaBancaria', 'BilleteraVirtual'); se guarda siempre la forma con espacios.
    public string AccountType { get; set; } = string.Empty;
    public Guid CurrencyId { get; set; }
}