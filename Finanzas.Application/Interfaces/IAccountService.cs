using Finanzas.Application.DTOs.Request.Accounts;
using Finanzas.Application.DTOs.Response.Accounts;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface IAccountService
    {
        Task<IReadOnlyList<AccountResponseDTO>> GetAllAsync(string userEmail, bool active, CancellationToken cancellationToken);
        Task<AccountResponseDTO?> GetByIdAsync(string userEmail, Guid accountId, CancellationToken cancellationToken);
        Task<AccountResponseDTO> CreateAsync(string userEmail, AccountRequestDTO request, CancellationToken cancellationToken);
        Task<AccountResponseDTO> UpdateAsync(string userEmail, Guid accountId, AccountRequestDTO request, CancellationToken cancellationToken);
        Task<bool> DeactivateAsync(string userEmail, Guid accountId, CancellationToken cancellationToken);
    }
}
