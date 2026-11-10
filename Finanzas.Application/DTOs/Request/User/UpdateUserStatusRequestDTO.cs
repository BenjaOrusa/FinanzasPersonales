namespace Finanzas.Application.DTOs.Request.Users
{
    //Datos enviados por el Administrador para el CU18
    public class UpdateUserStatusRequestDTO
    {
        public string Status { get; set; } = string.Empty; // 'Activo', 'Inactivo', 'Bloqueado'
    }
}