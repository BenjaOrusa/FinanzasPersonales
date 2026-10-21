using Finanzas.Application.DTOs.Request.Auth;
using Finanzas.Application.DTOs.Response.Auth;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> AuthenticateAsync(LoginRequestDTO request, CancellationToken cancellationToken = default);
        Task<bool> RegisterAsync(RegisterRequestDTO request, CancellationToken cancellationToken = default);
    }
}
