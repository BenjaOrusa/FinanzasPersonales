using Finanzas.Application.DTOs.Request.Accounts;
using Finanzas.Application.DTOs.Response.Accounts;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Api.Controllers;

/// <summary>Expone las cuentas almacenadas en SQL Server.</summary>
[ApiController]
[Route("api/[controller]")]
public class AccountController(FinanzasDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AccountResponseDTO>>> GetAll(CancellationToken cancellationToken)
    {
        var accounts = await context.Accounts.AsNoTracking().OrderBy(item => item.Description)
            .Select(item => new AccountResponseDTO { AccountId = item.AccountId, Description = item.Description,
                AccountType = item.AccountType, Active = item.Active })
            .ToListAsync(cancellationToken);

        return Ok(accounts);
    }

    [HttpPost]
    public async Task<ActionResult<AccountRequestDTO>> Create(AccountRequestDTO accountRequest, CancellationToken cancellationToken)
    {
        var description = accountRequest.Description.Trim();

        if (description.Length is 0 or > 100 || accountRequest.AccountType is not ("Efectivo" or "CuentaBancaria" or "BilleteraVirtual"))

            return BadRequest("La descripción y el tipo de cuenta no son válidos.");

        if (await context.Accounts.AnyAsync(item => item.Description == description, cancellationToken))

            return Conflict("Ya existe una cuenta con esa descripción.");

        var account = new Account { Description = description, AccountType = accountRequest.AccountType, Active = true };
        
        context.Accounts.Add(account);
        await context.SaveChangesAsync(cancellationToken);

        var response = new AccountResponseDTO { AccountId = account.AccountId, 
            Description = account.Description, AccountType = account.AccountType, Active = account.Active };

        return CreatedAtAction(nameof(GetAll), response);
    }

    [HttpDelete("{AccountId:Guid}")]
    public async Task<IActionResult> Eliminar(Guid accountId, CancellationToken cancellationToken)
    {
        var account = await context.Accounts.FindAsync([accountId], cancellationToken);

        if (account is null) return NotFound();

        if (await context.Movements.AnyAsync(item => item.AccountId == accountId, cancellationToken))

            return Conflict("La cuenta tiene movimientos asociados.");

        context.Accounts.Remove(account);

        await context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
