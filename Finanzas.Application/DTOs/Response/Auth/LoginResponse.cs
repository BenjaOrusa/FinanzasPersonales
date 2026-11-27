using Finanzas.Application.DTOs.Response.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Response.Auth
{
    // Token JWT + datos del usuario autenticado (Id, Name, Surname, Status, Role).
    public record LoginResponse(string Token, UserResponseDTO User);

}