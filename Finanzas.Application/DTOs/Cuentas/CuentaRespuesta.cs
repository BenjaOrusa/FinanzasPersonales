namespace Finanzas.Api.Contracts.Cuentas;

/// <summary>Datos de una cuenta enviados al frontend.</summary>
public class CuentaRespuesta
{
    public int ID_Cuenta { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
    public bool Activa { get; set; }
}


/// <summary>Datos necesarios para crear una cuenta.</summary>
public class CrearCuentaSolicitud
{
    public string Descripcion { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
}
