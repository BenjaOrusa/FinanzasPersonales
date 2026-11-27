namespace Finanzas.Domain.Interfaces
{
    // Registro de tokens JWT revocados (CU03: cerrar sesión invalida el token en el servidor).
    public interface ITokenRevocationStore
    {
        void Revoke(string tokenId, DateTime expiresAtUtc);
        bool IsRevoked(string tokenId);
    }
}