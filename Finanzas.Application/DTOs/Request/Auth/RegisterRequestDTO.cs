using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Request.Auth
{
    public record RegisterRequestDTO(
            string Email,
            string Password,
            string Name,
            string Surname);
}
