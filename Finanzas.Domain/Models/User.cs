using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Models
{
    public class User
    {
        public Guid Id { get; private set; }
        public string Email { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
        public string Name { get; private set; } = string.Empty;
        public string Surname { get; private set; } = string.Empty;
        public bool Active { get; private set; } = true;

        // Relación con TypeOfUser (Foreign Key)
        public Guid TypeOfUserId { get; private set; }
        public TypeOfUser? TypeOfUser { get; set; }

        public User()
        {
        }

    public User(string email, string passwordHash, string name, string surname, Guid typeOfUserId)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("El email es obligatorio.", nameof(email));

        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("El hash del password es obligatorio.", nameof(passwordHash));

        if (typeOfUserId == Guid.Empty)
            throw new ArgumentException("El tipo de usuario es obligatorio.", nameof(typeOfUserId));

            Id = Guid.NewGuid();
        Email = email;
        PasswordHash = passwordHash;
        Name = name;
        Surname = surname;
        TypeOfUserId = typeOfUserId;
        }
}


}
