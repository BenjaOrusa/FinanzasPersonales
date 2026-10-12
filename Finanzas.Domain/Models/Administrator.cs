using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Models
{
    public class Administrator : User
    {
        private Administrator()
        {
        }

        public Administrator(string email, string passwordHash)
            : base(email, passwordHash)
        {
        }
    }
}
