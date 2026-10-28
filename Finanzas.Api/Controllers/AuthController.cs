using Finanzas.Application.DTOs.Request.Auth;
using Finanzas.Application.DTOs.Response.Auth;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

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

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequestDTO request, CancellationToken cancellationToken)
        {
            var login = await authService.AuthenticateAsync(request, cancellationToken);

            if (login == null)
            {
                return Unauthorized("Usuario o password incorrectos.");
            }

            return Ok(login);
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

    }
}
