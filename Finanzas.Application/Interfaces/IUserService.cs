using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface IUserService
    {
        Task<User> GetValidUserAsync(string userEmail, CancellationToken cancellationToken);
        Task<IReadOnlyList<UserResponseDTO>> GetAllAsync(CancellationToken cancellationToken);
        Task<bool> UpdateStatusAsync(Guid userId, string newStatus, CancellationToken cancellationToken);
    }
}
