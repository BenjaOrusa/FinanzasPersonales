using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<bool> ExistsEmailAsync(string email, CancellationToken cancellationToken = default);
        Task AddAsync(User user, CancellationToken cancellationToken = default);
        Task<TypeOfUser?> GetTypeOfUserByDescriptionAsync(string description, CancellationToken cancellationToken = default);
        Task AddTypeOfUserAsync(TypeOfUser typeOfUser, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
