using System.Net;
using Finanzas.Api.BackgroundServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Time.Testing;

namespace Finanzas.Tests;

public class DollarQuoteRefreshWorkerTests
{
    [Fact]
    public async Task StartsImmediatelyRetriesAfterFailureAndKeepsDailyHistory()
    {
        await using var app = new FinanceApiFactory();
        using var client = app.Client();
        var clock = new FakeTimeProvider();
        using var worker = new DollarQuoteRefreshWorker(app.Services.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(new DollarQuoteRefreshSettings()), clock, NullLogger<DollarQuoteRefreshWorker>.Instance);
        await worker.StartAsync(default);
        try
        {
            await Until(async () =>
            {
                var count = 0;
                await app.WithDb(async db => count = await db.ExchangeRates.CountAsync());
                return count == 1;
            });
            app.Provider.Status = HttpStatusCode.ServiceUnavailable;
            await AdvanceUntil(clock, () => Volatile.Read(ref app.Provider.Calls) >= 2);
            await app.WithDb(async db => Assert.Single(await db.ExchangeRates.ToListAsync()));

            app.Provider.Status = HttpStatusCode.OK;
            app.Provider.Body = app.Provider.Body.Replace("2026-01-10", "2026-01-11").Replace("1000", "1200");
            await AdvanceUntil(clock, () => Volatile.Read(ref app.Provider.Calls) >= 3);
            await Until(async () =>
            {
                var count = 0;
                await app.WithDb(async db => count = await db.ExchangeRates.CountAsync());
                return count == 2;
            });
            await app.WithDb(async db =>
            {
                var rates = await db.ExchangeRates.OrderBy(r => r.Date).ToListAsync();
                Assert.Equal(1000m, rates[0].Value);
                Assert.Equal(new DateTime(2026, 1, 9), rates[0].Date);
                Assert.Equal(1200m, rates[1].Value);
                Assert.Equal(new DateTime(2026, 1, 10), rates[1].Date);
            });
        }
        finally
        {
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            await worker.StopAsync(timeout.Token);
        }
    }

    [Fact]
    public async Task DisabledWorkerDoesNotCallProvider()
    {
        await using var app = new FinanceApiFactory();
        using var client = app.Client();
        using var worker = new DollarQuoteRefreshWorker(app.Services.GetRequiredService<IServiceScopeFactory>(),
            Options.Create(new DollarQuoteRefreshSettings { Enabled = false }),
            TimeProvider.System, NullLogger<DollarQuoteRefreshWorker>.Instance);
        await worker.StartAsync(default);
        await worker.ExecuteTask!;
        Assert.Equal(0, app.Provider.Calls);
    }

    private static async Task AdvanceUntil(FakeTimeProvider clock, Func<bool> condition)
    {
        await Until(() =>
        {
            clock.Advance(TimeSpan.FromHours(1));
            return Task.FromResult(condition());
        });
    }

    private static async Task Until(Func<Task<bool>> condition)
    {
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        while (!await condition()) await Task.Delay(20, timeout.Token);
    }
}
