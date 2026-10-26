using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Models
{
    // Representa una MONEDA utilizada en las cuentas y movimientos financieros.
    public class Currency
    {
        public Guid Id { get; private set; }
        public string Description { get; private set; } = string.Empty; // Ej: "Peso Argentino", "Dólar Estadounidense"

        public ICollection<Account> Accounts { get; private set; } = new List<Account>();
        public ICollection<Movement> Movements { get; private set; } = new List<Movement>();

        protected Currency() { }

        public Currency(string description)
        {
            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("La descripción de la moneda es obligatoria.", nameof(description));

            Id = Guid.NewGuid();
            Description = description.Trim();
        }
    }
}
