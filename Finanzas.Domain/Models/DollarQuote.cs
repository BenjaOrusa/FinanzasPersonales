namespace Finanzas.Domain.Models;

// Resultado del proveedor: pesos argentinos por un dólar oficial, precio de venta.
// No es una entidad persistida: ExchangeRate representa el registro en la base.
public sealed record DollarQuote(decimal PesosPerDollar, DateTimeOffset UpdatedAt);
