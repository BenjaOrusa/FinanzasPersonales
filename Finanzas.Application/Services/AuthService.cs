using Finanzas.Application.DTOs.Request.Auth;
using Finanzas.Application.DTOs.Response.Auth;
using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Services
{
    public class AuthService : IAuthService
    {
        private const string ActiveStatus = "Activo";
        private const string BlockedStatus = "Bloqueado";

        private readonly IUserRepository userRepository;
        private readonly ITokenService tokenService;
        private readonly IPasswordHasher passwordHasher;
        private readonly ITokenRevocationStore tokenRevocationStore;

        public AuthService(
            IUserRepository userRepository,
            ITokenService tokenService,
            IPasswordHasher passwordHasher,
            ITokenRevocationStore tokenRevocationStore)
        {
            this.userRepository = userRepository;
            this.tokenService = tokenService;
            this.passwordHasher = passwordHasher;
            this.tokenRevocationStore = tokenRevocationStore;
        }

        public async Task<LoginResult> AuthenticateAsync(LoginRequestDTO request, CancellationToken cancellationToken = default)
        {
            var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);

            if (user == null || !passwordHasher.Verify(request.Password, user.PasswordHash))
            {
                return new LoginResult(LoginStatus.InvalidCredentials);
            }

            // CU02 alternativa 4.b y CU18: un usuario Inactivo o Bloqueado no puede iniciar sesión.
            // Se verifica DESPUÉS de validar la contraseña para no revelar el estado a quien no conoce las credenciales.
            if (!string.Equals(user.Status, ActiveStatus, StringComparison.OrdinalIgnoreCase))
            {
                var reason = string.Equals(user.Status, BlockedStatus, StringComparison.OrdinalIgnoreCase)
                    ? "bloqueado"
                    : "inactivo";

                return new LoginResult(
                    LoginStatus.AccessDenied,
                    Message: $"El usuario se encuentra {reason}. No puede iniciar sesión; contacte a un administrador.");
            }

            // Obtenemos el rol desde la entidad TypeOfUser (ej: "Administrator", "Customer")
            var roleName = user.TypeOfUser?.Description ?? "Customer";
            var token = tokenService.GenerateToken(user.Email, roleName);

            return new LoginResult(LoginStatus.Success, new LoginResponse(token, MapUser(user)));
        }


        public async Task<bool> RegisterAsync(RegisterRequestDTO request, CancellationToken cancellationToken = default)
        {
            // 1. Validar si ya existe un usuario con ese email
            if (await userRepository.ExistsEmailAsync(request.Email, cancellationToken))
            {
                return false;
            }

            // 2. Buscar el tipo de usuario por defecto ("Customer") o crearlo si no existe
            var customerRole = await userRepository.GetTypeOfUserByDescriptionAsync("Customer", cancellationToken);
            if (customerRole == null)
            {
                customerRole = new TypeOfUser("Customer");
                await userRepository.AddTypeOfUserAsync(customerRole, cancellationToken);
                await userRepository.SaveChangesAsync(cancellationToken);
            }

            // 3. Hashear la contraseña recibida
            var passwordHash = passwordHasher.Hash(request.Password);

            // 4. Instanciar la entidad User
            var user = new User(
                request.Email,
                passwordHash,
                request.Name,
                request.Surname,
                customerRole.Id);

            // 5. Guardar en la base de datos
            await userRepository.AddAsync(user, cancellationToken);
            await userRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<UserResponseDTO> GetProfileAsync(string userEmail, CancellationToken cancellationToken = default)
        {
            var user = await userRepository.GetByEmailAsync(userEmail, cancellationToken)
                ?? throw new UnauthorizedAccessException("El usuario autenticado no existe en el sistema.");

            return MapUser(user);
        }

        // CU03: el token queda registrado como revocado hasta su vencimiento natural.
        public Task LogoutAsync(string accessToken, CancellationToken cancellationToken = default)
        {
            if (tokenService.TryReadTokenInfo(accessToken, out var tokenId, out var expiresAtUtc))
            {
                tokenRevocationStore.Revoke(tokenId, expiresAtUtc);
            }

            return Task.CompletedTask;
        }

        private static UserResponseDTO MapUser(User user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Surname = user.Surname,
            Status = user.Status,
            Role = user.TypeOfUser?.Description ?? "Customer"
        };
    }
}