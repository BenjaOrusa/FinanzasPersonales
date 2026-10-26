namespace Finanzas.Application.DTOs.Response.Accounts;

//Datos de una cuenta enviados al frontend.
public class AccountResponseDTO
{
    public Guid AccountId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public bool Active { get; set; }

    public decimal Balance { get; set; }
}

