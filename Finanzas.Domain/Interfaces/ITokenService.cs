using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(string username, string role);
    }
}
