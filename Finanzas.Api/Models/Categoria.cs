namespace Finanzas.Api.Models;

/// <summary>
/// Clasifica un movimiento como ingreso o gasto.
/// </summary>
public class Categoria
{
    /// <summary>
    /// Clave primaria que corresponde a Categorias.ID_Categoria.
    /// </summary>
    public int ID_Categoria { get; set; }

    /// <summary>
    /// Nombre que se muestra al seleccionar la categoría.
    /// </summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>
    /// Indica si la categoría se utiliza con movimientos de ingreso o gasto.
    /// </summary>
    public string TipoCategoria { get; set; } = string.Empty;

    /// <summary>
    /// Permite ocultar una categoría sin eliminar su historial.
    /// </summary>
    public bool Activa { get; set; }

    /// <summary>
    /// Navegación hacia los movimientos clasificados con esta categoría.
    /// No representa una columna adicional en la base de datos.
    /// </summary>
    public ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
}
