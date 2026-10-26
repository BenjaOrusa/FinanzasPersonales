namespace Finanzas.Domain.Models;


// Clasifica un movimiento como ingreso o gasto.
public class Category
{
    // Clave primaria que corresponde a Categorias.ID_Categoria.
    public Guid CategoryId { get; private set; }

    
    // Nombre que se muestra al seleccionar la categoría.
    public string Description { get; private set; } = string.Empty;

    
    // Indica si la categoría se utiliza con movimientos de ingreso o gasto.
    public string CategoryType { get; private set; } = string.Empty;


    // Permite ocultar una categoría sin eliminar su historial.
    public bool Active { get; private set; } = true;

   
    // Navegación hacia los movimientos clasificados con esta categoría.
    // No representa una columna adicional en la base de datos.
    public ICollection<Movement> Movements { get; private set; } = new List<Movement>();


    // Foreign Key a User
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    protected Category() { }

    public Category(string description, string categoryType, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("La descripción de la categoría es obligatoria.", nameof(description));

        if (string.IsNullOrWhiteSpace(categoryType))
            throw new ArgumentException("El tipo de categoría es obligatorio.", nameof(categoryType));

        if (userId == Guid.Empty)
            throw new ArgumentException("La categoría debe pertenecer a un usuario válido.", nameof(userId));

        CategoryId = Guid.NewGuid();
        Description = description.Trim();
        CategoryType = categoryType.Trim();
        UserId = userId;
    }

    public void Deactivate() => Active = false;
    public void Activate() => Active = true;
}


