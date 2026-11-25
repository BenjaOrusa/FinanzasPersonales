namespace Finanzas.Domain.Models;

// Valores permitidos para Account.AccountType.
// Deben coincidir EXACTAMENTE con el CHECK CK_Accounts_AccountType de SQL Server:
//   AccountType IN ('Efectivo', 'Cuenta Bancaria', 'Billetera Virtual')
public static class AccountTypes
{
    public const string Cash = "Efectivo";
    public const string BankAccount = "Cuenta Bancaria";
    public const string VirtualWallet = "Billetera Virtual";

    // Acepta el valor con o sin espacios y sin distinguir mayúsculas
    // ("CuentaBancaria", "Cuenta Bancaria", "cuenta bancaria") y devuelve la forma canónica que exige SQL Server.
    public static bool TryNormalize(string? value, out string normalized)
    {
        normalized = string.Empty;

        if (string.IsNullOrWhiteSpace(value)) return false;

        var key = new string(value.Where(c => !char.IsWhiteSpace(c)).ToArray());

        if (key.Equals("Efectivo", StringComparison.OrdinalIgnoreCase))
            normalized = Cash;
        else if (key.Equals("CuentaBancaria", StringComparison.OrdinalIgnoreCase))
            normalized = BankAccount;
        else if (key.Equals("BilleteraVirtual", StringComparison.OrdinalIgnoreCase))
            normalized = VirtualWallet;
        else
            return false;

        return true;
    }
}