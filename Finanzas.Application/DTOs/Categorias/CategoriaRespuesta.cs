namespace Finanzas.Api.Contracts.Categorias;

/// <summary>Datos de una categoría enviados al frontend.</summary>
public class CategoriaRespuesta
{
    public int ID_Categoria { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string TipoCategoria { get; set; } = string.Empty;
    public bool Activa { get; set; }
}

/// <summary>Datos necesarios para crear una categoría.</summary>
public class CrearCategoriaSolicitud
{
    public string Descripcion { get; set; } = string.Empty;
    public string TipoCategoria { get; set; } = string.Empty;
}
