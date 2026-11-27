using Finanzas.Domain.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace Finanzas.Infrastructure.ExternalServices
{
    public class JwtTokenService : ITokenService
    {
        private readonly JwtSettings settings;

        public JwtTokenService(IOptions<JwtSettings> settings)
        {
            this.settings = settings.Value;
        }

        public string GenerateToken(string username, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key));

            var descriptor = new SecurityTokenDescriptor
            {
                Issuer = settings.Issuer,
                Audience = settings.Audience,
                Expires = DateTime.UtcNow.AddMinutes(settings.ExpirationMinutes),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, username),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Name, username),
                    new Claim(ClaimTypes.Role, role)
                })
            };

            return new JsonWebTokenHandler().CreateToken(descriptor);
        }

        public bool TryReadTokenInfo(string token, out string tokenId, out DateTime expiresAtUtc)
        {
            tokenId = string.Empty;
            expiresAtUtc = DateTime.MinValue;

            try
            {
                var jwt = new JsonWebTokenHandler().ReadJsonWebToken(token);

                if (string.IsNullOrWhiteSpace(jwt.Id)) return false;

                tokenId = jwt.Id;
                expiresAtUtc = jwt.ValidTo;
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}