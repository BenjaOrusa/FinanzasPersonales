using Finanzas.Application.DTOs.Request.Auth;
using Finanzas.Application.DTOs.Response.Auth;
using Finanzas.Application.DTOs.Response.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResult> AuthenticateAsync(LoginRequestDTO request, CancellationToken cancellationToken = default);
        Task<bool> RegisterAsync(RegisterRequestDTO request, CancellationToken cancellationToken = default);

        // Perfil del usuario autenticado (GET /api/Auth/me)
        Task<UserResponseDTO> GetProfileAsync(string userEmail, CancellationToken cancellationToken = default);

        // CU03: revoca el token recibido para que deje de ser válido en el servidor
        Task LogoutAsync(string accessToken, CancellationToken cancellationToken = default);
    }
}