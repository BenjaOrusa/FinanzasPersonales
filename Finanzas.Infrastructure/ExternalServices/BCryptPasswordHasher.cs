using Finanzas.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Infrastructure.ExternalServices
{
    public class BCryptPasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

        public bool Verify(string password, string passwordHash) =>
            BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}
