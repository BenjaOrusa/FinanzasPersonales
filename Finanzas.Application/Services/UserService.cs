using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository userRepository;

        public UserService(IUserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        public async Task<User> GetValidUserAsync(string userEmail, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetByEmailAsync(userEmail, cancellationToken);
            if (user == null)
            {
                throw new UnauthorizedAccessException("El usuario autenticado no existe en el sistema.");
            }
            return user;
        }

        // CU17: Obtener todos los usuarios sin exponer contraseñas ni hashes
        public async Task<IReadOnlyList<UserResponseDTO>> GetAllAsync(CancellationToken cancellationToken)
        {
            var users = await userRepository.GetAllAsync(cancellationToken);

            return users.Select(u => new UserResponseDTO
            {
                Id = u.Id,
                Email = u.Email,
                Name = u.Name,
                Surname = u.Surname,
                Status = u.Status,
                Role = u.TypeOfUser?.Description ?? "Customer"
            }).ToList();
        }

        // CU18: Activar, desactivar o bloquear un usuario usando el método de dominio ChangeStatus
        public async Task<bool> UpdateStatusAsync(Guid userId, string newStatus, CancellationToken cancellationToken)
        {
            var validStatuses = new[] { "Activo", "Inactivo", "Bloqueado" };

            if (string.IsNullOrWhiteSpace(newStatus) || !validStatuses.Contains(newStatus, StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException("El estado especificado no es válido. Debe ser 'Activo', 'Inactivo' o 'Bloqueado'.");
            }

            var user = await userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null) return false;

            // Invoca la encapsulación del dominio
            user.ChangeStatus(newStatus);

            await userRepository.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
