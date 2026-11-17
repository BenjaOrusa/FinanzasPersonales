namespace Finanzas.Api.BackgroundServices;

public sealed class DollarQuoteRefreshSettings
{
    public const string SectionName = "DollarQuoteRefresh";
    public bool Enabled { get; set; } = true;
    public int IntervalMinutes { get; set; } = 60;
}
