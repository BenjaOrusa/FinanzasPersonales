using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Models
{
    public class TypeOfUser
    {
        public Guid Id { get; private set; } 
        public string Description { get; private set; } = string.Empty; // Ej: "Administrator", "Customer"

        // Propiedad de navegación
        public ICollection<User> Users { get; private set; } = new List<User>();

        protected TypeOfUser()
        {
        }

        protected TypeOfUser(string description)
        {
            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("La descripción es obligatoria.", nameof(description));
            Id = Guid.NewGuid();
            Description = description;
        }
    }
}
