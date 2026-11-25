using Finanzas.Domain.Interfaces;
using System.Collections.Concurrent;

namespace Finanzas.Infrastructure.ExternalServices
{
    // Guarda en memoria los jti de los tokens revocados hasta que vencen.
    // Se registra como Singleton. Limitación: se pierde al reiniciar la API y no se comparte entre varias instancias.
    public sealed class InMemoryTokenRevocationStore : ITokenRevocationStore
    {
        private readonly ConcurrentDictionary<string, DateTime> revokedTokens = new();

        public void Revoke(string tokenId, DateTime expiresAtUtc)
        {
            PurgeExpired();
            revokedTokens[tokenId] = expiresAtUtc;
        }

        public bool IsRevoked(string tokenId) =>
            !string.IsNullOrEmpty(tokenId) && revokedTokens.ContainsKey(tokenId);

        // Un token vencido ya no es válido por sí mismo, así que no hace falta recordarlo.
        private void PurgeExpired()
        {
            var now = DateTime.UtcNow;
            foreach (var item in revokedTokens)
            {
                if (item.Value <= now)
                    revokedTokens.TryRemove(item.Key, out _);
            }
        }
    }
}