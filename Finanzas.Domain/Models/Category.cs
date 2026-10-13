namespace Finanzas.Domain.Models;

/// <summary>
/// Clasifica un movimiento como ingreso o gasto.
/// </summary>
public class Category
{
    /// <summary>
    /// Clave primaria que corresponde a Categorias.ID_Categoria.
    /// </summary>
    public Guid CategoryId { get; set; }

    /// <summary>
    /// Nombre que se muestra al seleccionar la categoría.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Indica si la categoría se utiliza con movimientos de ingreso o gasto.
    /// </summary>
    public string CategoryType { get; set; } = string.Empty;

    /// <summary>
    /// Permite ocultar una categoría sin eliminar su historial.
    /// </summary>
    public bool Active { get; set; }

    /// <summary>
    /// Navegación hacia los movimientos clasificados con esta categoría.
    /// No representa una columna adicional en la base de datos.
    /// </summary>
    public ICollection<Movement> Movements { get; set; } = new List<Movement>();
}
