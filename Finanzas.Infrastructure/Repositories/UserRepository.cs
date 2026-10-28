
using Finanzas.Domain.Interfaces;
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

        public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            await context.Users
                .Include(u => u.TypeOfUser)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default) =>
            await context.Users
                .AsNoTracking()
                .Include(u => u.TypeOfUser)
                .OrderBy(u => u.Surname)
                .ThenBy(u => u.Name)
                .ToListAsync(cancellationToken);

        public async Task<bool> ExistsEmailAsync(string email, CancellationToken cancellationToken = default) =>
            await context.Users.AnyAsync(u => u.Email == email, cancellationToken);

        public async Task AddAsync(User user, CancellationToken cancellationToken = default) =>
            await context.Users.AddAsync(user, cancellationToken);

        public async Task<TypeOfUser?> GetTypeOfUserByDescriptionAsync(string description, CancellationToken cancellationToken = default) =>
            await context.TypeOfUsers.FirstOrDefaultAsync(t => t.Description == description, cancellationToken);

        public async Task AddTypeOfUserAsync(TypeOfUser typeOfUser, CancellationToken cancellationToken = default) =>
            await context.TypeOfUsers.AddAsync(typeOfUser, cancellationToken);

        public async Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}
