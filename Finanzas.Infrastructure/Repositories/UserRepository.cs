using Finanzas.Application.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly FinanzasDbContext context;

        public UserRepository(FinanzasDbContext context)
        {
            this.context = context;
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            await context.Users
                .Include(u => u.TypeOfUser) // Traemos el rol asociado
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }
}
