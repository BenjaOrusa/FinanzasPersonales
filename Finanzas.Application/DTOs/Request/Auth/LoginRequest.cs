using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Request.Auth
{
    public record LoginRequest(string Email, string Password);
    
}
