using Finanzas.Application.DTOs.Request.Accounts;
using Finanzas.Application.DTOs.Response.Accounts;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Api.Controllers;

// Expone las cuentas almacenadas en SQL Server
[Authorize(Policy = Policies.StandardUsers)]
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
        var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();

        var accounts = await accountService.GetAllAsync(userEmail, cancellationToken);
        return Ok(accounts);
    }



    //CU04 — Crear una cuenta financiera
    [HttpPost]
    public async Task<ActionResult<AccountResponseDTO>> Create([FromBody] AccountRequestDTO accountRequest, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();

            var response = await accountService.CreateAsync(userEmail, accountRequest, cancellationToken);
            return CreatedAtAction(nameof(GetAll), new { id = response.AccountId }, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }


    // CU05: Editar una cuenta financiera propia
    [HttpPut("{accountId:Guid}")]
    public async Task<ActionResult<AccountResponseDTO>> Update(Guid accountId, [FromBody] AccountRequestDTO accountRequest, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var response = await accountService.UpdateAsync(userEmail, accountId, accountRequest, cancellationToken);

            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }


    //CU06 — Desactivar una cuenta financiera
    [HttpPatch("{accountId:Guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid accountId, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var success = await accountService.DeactivateAsync(userEmail, accountId, cancellationToken);

            if (!success) return NotFound();

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    // CU07: Consultar saldo y detalles de una cuenta específica del usuario
    [HttpGet("{accountId:Guid}")]
    public async Task<ActionResult<AccountResponseDTO>> GetById(Guid accountId, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var account = await accountService.GetByIdAsync(userEmail, accountId, cancellationToken);

            if (account is null) return NotFound();

            return Ok(account);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}

