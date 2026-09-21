namespace Finanzas.Application.DTOs.Request.Accounts;

/// <summary>Datos necesarios para crear una cuenta.</summary>
public class AccountRequestDTO
{
    public string Description { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
}


