namespace Finanzas.Api.Models;

/// <summary>
/// Representa un ingreso o un gasto registrado por una persona.
/// Por ahora, las instancias se almacenarán únicamente en memoria.
/// </summary>
public class Movimiento
{
    /// <summary>
    /// Identificador único del movimiento dentro de la aplicación.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Explica el motivo del movimiento, por ejemplo, "Sueldo" o "Supermercado".
    /// El valor inicial evita que la propiedad sea null antes de asignarle una descripción.
    /// </summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>
    /// Cantidad de dinero involucrada. Se usa decimal porque representa importes
    /// monetarios con mayor precisión que float o double.
    /// </summary>
    public decimal Importe { get; set; }

    /// <summary>
    /// Fecha en la que ocurrió el movimiento. DateOnly expresa que, en esta etapa,
    /// no necesitamos almacenar una hora.
    /// </summary>
    public DateOnly Fecha { get; set; }

    /// <summary>
    /// Indica si el movimiento es un "Ingreso" o un "Gasto".
    /// Inicialmente es texto para mantener el modelo sencillo; después evaluaremos
    /// reemplazarlo por un enum y agregar validaciones.
    /// </summary>
    public string Tipo { get; set; } = string.Empty;
}
