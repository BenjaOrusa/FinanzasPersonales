namespace Finanzas.Application.DTOs.Response.Accounts;

/// <summary>Datos de una cuenta enviados al frontend.</summary>
public class AccountResponseDTO
{
    public Guid AccountId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public bool Active { get; set; }
}

