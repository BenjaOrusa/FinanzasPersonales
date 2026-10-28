namespace Finanzas.Application.DTOs.Request.Accounts;

//Datos necesarios para crear una cuenta.
public class AccountRequestDTO
{
    public string Description { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty; // 'Efectivo', 'CuentaBancaria', 'BilleteraVirtual'
    public Guid CurrencyId { get; set; }
}


