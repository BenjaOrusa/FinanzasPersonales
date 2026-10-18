using Finanzas.Application.DTOs.Request.Accounts;
using Finanzas.Application.DTOs.Response.Accounts;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface IAccountService
    {
        Task<IReadOnlyList<AccountResponseDTO>> GetAllAsync(CancellationToken cancellationToken);
        Task<AccountResponseDTO> CreateAsync(AccountRequestDTO request, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(Guid accountId, CancellationToken cancellationToken);
    }
}
