using Finanzas.Domain.Models;

namespace Finanzas.Domain.Interfaces;

public interface IDollarQuoteProvider
{
    Task<DollarQuote> GetLatestAsync(CancellationToken cancellationToken);
}
