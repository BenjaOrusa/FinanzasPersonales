namespace Finanzas.Application.DTOs.Request.Categories;

//Datos necesarios para crear una categoría.
public class CategoryRequestDTO
{
    public string Description { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty; // 'Ingreso' o 'Gasto'
}

