using Finanzas.Application.DTOs.Request.Accounts;
using Finanzas.Application.DTOs.Response.Accounts;
using Finanzas.Domain.Models;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Api.Controllers;

// Expone las cuentas almacenadas en SQL Server
[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IAccountService accountService;

    public AccountController(IAccountService accountService) 
    { 
            this.accountService = accountService;
    }


    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AccountResponseDTO>>> GetAll(CancellationToken cancellationToken)
    {
        var accounts = await accountService.GetAllAsync(cancellationToken);
        return Ok(accounts);
    }

    [HttpPost]
    public async Task<ActionResult<AccountResponseDTO>> Create([FromBody] AccountRequestDTO accountRequest, CancellationToken cancellationToken)
    {
        try
        {
            var response = await accountService.CreateAsync(accountRequest, cancellationToken);
            return CreatedAtAction(nameof(GetAll), new { id = response.AccountId }, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            // Maneja tanto el conflicto por duplicado como el de movimientos asociados si usas excepciones de este tipo
            return Conflict(ex.Message);
        }
    }

    [HttpDelete("{accountId:Guid}")]
    public async Task<IActionResult> Delete(Guid accountId, CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await accountService.DeleteAsync(accountId, cancellationToken);

            if (!deleted) return NotFound();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }
}

