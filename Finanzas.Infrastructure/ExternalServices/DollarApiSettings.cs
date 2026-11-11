namespace Finanzas.Infrastructure.ExternalServices;

public sealed class DollarApiSettings
{
    public const string SectionName = "DollarApi";
    public string BaseUrl { get; set; } = "https://dolarapi.com/";
}
