namespace Finanzas.Application.DTOs.Request.Categories;

/// <summary>Datos necesarios para crear una categoría.</summary>
public class CategoryRequestDTO
{
    public string Description { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
}

