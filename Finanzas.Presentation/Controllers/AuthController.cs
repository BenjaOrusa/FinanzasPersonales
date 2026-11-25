using Finanzas.Application.DTOs.Request.Auth;
using Finanzas.Application.DTOs.Response.Auth;
using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace Finanzas.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService;
        }

        // CU02: Iniciar sesión. Devuelve el token y los datos del usuario.
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequestDTO request, CancellationToken cancellationToken)
        {
            var result = await authService.AuthenticateAsync(request, cancellationToken);

            if (result.Status == LoginStatus.AccessDenied)
            {
                // CU02 alternativa 4.b: usuario inactivo o bloqueado
                return StatusCode(StatusCodes.Status403Forbidden, result.Message);
            }

            if (result.Status != LoginStatus.Success || result.Response == null)
            {
                return Unauthorized("Usuario o password incorrectos.");
            }

            return Ok(result.Response);
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request, CancellationToken cancellationToken)
        {
            var result = await authService.RegisterAsync(request, cancellationToken);

            if (!result)
            {
                return BadRequest("El email ya se encuentra registrado.");
            }

            return Ok("Usuario registrado correctamente.");
        }

        // Perfil del usuario autenticado (Id, Name, Surname, Status, Role). Disponible para ambos roles.
        [Authorize(Policy = Policies.AllUsers)]
        [HttpGet("me")]
        public async Task<ActionResult<UserResponseDTO>> Me(CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var profile = await authService.GetProfileAsync(userEmail, cancellationToken);
                return Ok(profile);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // CU03: Cerrar sesión. Revoca en el servidor el token con el que se hizo la petición.
        [Authorize(Policy = Policies.AllUsers)]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout(CancellationToken cancellationToken)
        {
            if (AuthenticationHeaderValue.TryParse(Request.Headers.Authorization, out var header)
                && !string.IsNullOrWhiteSpace(header.Parameter))
            {
                await authService.LogoutAsync(header.Parameter, cancellationToken);
            }

            return Ok(new { Message = "Sesión cerrada correctamente." });
        }

    }
}