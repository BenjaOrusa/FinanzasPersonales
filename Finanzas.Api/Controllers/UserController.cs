using Finanzas.Application.DTOs.Request.Users;
using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    // Módulo de Administración: Exclusivo para administradores
    [Authorize(Policy = Policies.AdminsOnly)]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService userService;

        public UserController(IUserService userService)
        {
            this.userService = userService;
        }

        // CU17: Consultar el listado de usuarios del sistema
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<UserResponseDTO>>> GetAll(CancellationToken cancellationToken)
        {
            var users = await userService.GetAllAsync(cancellationToken);
            return Ok(users);
        }

        // CU18: Activar, desactivar o bloquear un usuario
        [HttpPatch("{userId:Guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid userId, [FromBody] UpdateUserStatusRequestDTO request, CancellationToken cancellationToken)
        {
            try
            {
                var success = await userService.UpdateStatusAsync(userId, request.Status, cancellationToken);

                if (!success) return NotFound("El usuario especificado no existe.");

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}