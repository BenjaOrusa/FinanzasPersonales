using Finanzas.Application.DTOs.Request.Auth;
using Finanzas.Application.DTOs.Response.Auth;
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
        private readonly IUserRepository userRepository;
        private readonly ITokenService tokenService;
        private readonly IPasswordHasher passwordHasher;

        public AuthService(
            IUserRepository userRepository,
            ITokenService tokenService,
            IPasswordHasher passwordHasher)
        {
            this.userRepository = userRepository;
            this.tokenService = tokenService;
            this.passwordHasher = passwordHasher;
        }

        public async Task<LoginResponse?> AuthenticateAsync(LoginRequestDTO request, CancellationToken cancellationToken = default)
        {
            var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);

            if (user == null || !passwordHasher.Verify(request.Password, user.PasswordHash))
            {
                return null;
            }

            // Obtenemos el rol desde la entidad TypeOfUser (ej: "Administrator", "Customer")
            var roleName = user.TypeOfUser?.Description ?? "Customer";

            return new LoginResponse(tokenService.GenerateToken(user.Email, roleName));
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
    }
}

