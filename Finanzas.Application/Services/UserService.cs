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
    }
}