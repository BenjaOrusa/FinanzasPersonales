using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(string username, string role);

        // Lee el identificador (jti) y el vencimiento de un token ya emitido. Devuelve false si el token es inválido.
        bool TryReadTokenInfo(string token, out string tokenId, out DateTime expiresAtUtc);
    }
}