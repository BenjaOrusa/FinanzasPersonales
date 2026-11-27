namespace Finanzas.Application.DTOs.Response.Auth
{
    public enum LoginStatus
    {
        Success,
        InvalidCredentials,   // 401: correo o contraseña incorrectos
        AccessDenied          // 403: usuario Inactivo o Bloqueado (CU02 4.b / CU18)
    }

    // Resultado interno del login: permite distinguir los casos sin usar excepciones.
    public record LoginResult(LoginStatus Status, LoginResponse? Response = null, string? Message = null);
}