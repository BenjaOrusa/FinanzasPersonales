namespace Finanzas.Domain.Models;

public sealed class QuoteProviderException(string message, Exception? innerException = null)
    : Exception(message, innerException);
