using System;

namespace Finanzas.Application.DTOs.Response.Users
{
    public class UserResponseDTO
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // 'Activo', 'Inactivo', 'Bloqueado'
        public string Role { get; set; } = string.Empty;   // 'Administrator', 'Customer'
    }
}