namespace Finanzas.Application.DTOs.Response.Categories;

//Datos de una categoría enviados al frontend.
public class CategoryResponseDTO
{
    public Guid CategoryId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
    public bool Active { get; set; }
}
