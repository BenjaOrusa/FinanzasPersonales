using System.Net;
using System.Net.Http.Json;
using Finanzas.Application.DTOs.Response.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRates;
using Finanzas.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Tests;

public class ExchangeRateEndpointTests
{
    private const string ImportUrl = "/api/ExchangeRate/import-latest-dollar";

    [Theory]
    [InlineData(null, HttpStatusCode.Unauthorized)]
    [InlineData("Customer", HttpStatusCode.Forbidden)]
    public async Task ImportRequiresAdministrator(string? role, HttpStatusCode expected)
    {
        await using var app = new FinanceApiFactory();
        using var client = app.Client(role);
        var response = await client.PostAsync(ImportUrl, null);
        Assert.Equal(expected, response.StatusCode);
        Assert.Equal(0, app.Provider.Calls);
    }

    [Fact]
    public async Task ImportUsesArgentinaDateAndUpdatesWithoutDuplicates()
    {
        await using var app = new FinanceApiFactory();
        using var client = app.Client();
        var first = await client.PostAsync(ImportUrl, null);
        first.EnsureSuccessStatusCode();
        var result = await first.Content.ReadFromJsonAsync<ImportedDollarQuoteResponseDTO>();
        Assert.Equal(new DateTime(2026, 1, 9), result!.ExchangeRate.Date);
        Assert.True(result.IsFromPreviousDay);
        Assert.Equal(1000m, result.ExchangeRate.Value);
        Assert.Equal("/v1/dolares/oficial", app.Provider.LastPath);
        app.Provider.Body = app.Provider.Body.Replace("1000", "1200");
        (await client.PostAsync(ImportUrl, null)).EnsureSuccessStatusCode();
        await app.WithDb(async db =>
        {
            Assert.Equal(2, await db.Currencies.CountAsync());
            Assert.Equal(1200m, (await db.ExchangeRates.SingleAsync()).Value);
        });
    }

    [Theory]
    [InlineData("null")]
    [InlineData("{}")]
    [InlineData("not-json")]
    [InlineData("{\"moneda\":\"USD\",\"casa\":\"oficial\",\"venta\":0,\"fechaActualizacion\":\"2026-01-09T18:00:00Z\"}")]
    public async Task InvalidProviderResponseDoesNotSave(string body)
    {
        await using var app = new FinanceApiFactory();
        app.Provider.Body = body;
        using var client = app.Client();
        Assert.Equal(HttpStatusCode.BadGateway, (await client.PostAsync(ImportUrl, null)).StatusCode);
        await app.WithDb(async db =>
        {
            Assert.Empty(await db.ExchangeRates.ToListAsync());
            Assert.Empty(await db.Currencies.ToListAsync());
        });
    }

    [Fact]
    public async Task ProviderOutagePreservesStoredRateAndCanRecover()
    {
        await using var app = new FinanceApiFactory();
        using var client = app.Client();
        (await client.PostAsync(ImportUrl, null)).EnsureSuccessStatusCode();
        app.Provider.Status = HttpStatusCode.ServiceUnavailable;
        Assert.Equal(HttpStatusCode.BadGateway, (await client.PostAsync(ImportUrl, null)).StatusCode);
        await app.WithDb(async db => Assert.Equal(1000m, (await db.ExchangeRates.SingleAsync()).Value));
        app.Provider.Status = HttpStatusCode.OK;
        (await client.PostAsync(ImportUrl, null)).EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task ConcurrentImportsKeepOneRate()
    {
        await using var app = new FinanceApiFactory();
        using var client = app.Client();
        var responses = await Task.WhenAll(Enumerable.Range(0, 5).Select(_ => client.PostAsync(ImportUrl, null)));
        Assert.All(responses, r => Assert.Equal(HttpStatusCode.OK, r.StatusCode));
        await app.WithDb(async db => Assert.Single(await db.ExchangeRates.ToListAsync()));
    }

    [Fact]
    public async Task EquivalentsUseMovementDayOrPriorNeverFutureAndOnlyOwnMovements()
    {
        await using var app = new FinanceApiFactory();
        using var client = app.Client("Customer");
        await app.WithDb(async db =>
        {
            var role = new TypeOfUser("Customer");
            var user = new User("test@example.test", "unused", "Test", "User", role.Id);
            var other = new User("other@example.test", "unused", "Other", "User", role.Id);
            var ars = new Currency("Pesos Argentinos");
            var usd = new Currency("Dólar Estadounidense");
            var account = new Account("Pruebas", "Efectivo", user.Id, ars.Id);
            var category = new Category("Pruebas", "Ingreso", user.Id);
            db.AddRange(role, user, other, ars, usd, account, category);
            foreach (var (name, day, currency) in new[] { ("sin historial", 8, ars.Id), ("exacta", 9, ars.Id),
                ("anterior", 10, ars.Id), ("otro día", 11, ars.Id), ("dólares", 8, usd.Id) })
                db.Add(new Movement(name, 10000m, new DateTime(2026, 1, day, 19, 0, 0), "Ingreso",
                    user.Id, account.AccountId, category.CategoryId, currency));
            db.Add(new Movement("ajeno", 1m, new DateTime(2026, 1, 9), "Ingreso", other.Id,
                account.AccountId, category.CategoryId, ars.Id));
            db.AddRange(new ExchangeRate(usd.Id, ars.Id, new DateTime(2026, 1, 9), 1000m),
                new ExchangeRate(usd.Id, ars.Id, new DateTime(2026, 1, 11), 2000m));
            await db.SaveChangesAsync();
        });
        var rows = await client.GetFromJsonAsync<List<MovementDollarEquivalentResponseDTO>>(
            "/api/ExchangeRate/movements-dollar-equivalent");
        Assert.Equal(5, rows!.Count);
        Assert.Null(rows.Single(x => x.Description == "sin historial").EquivalentInDollars);
        Assert.Equal(10m, rows.Single(x => x.Description == "exacta").EquivalentInDollars);
        var prior = rows.Single(x => x.Description == "anterior");
        Assert.Equal(10m, prior.EquivalentInDollars);
        Assert.Equal(new DateTime(2026, 1, 9), prior.ExchangeRateDateUsed);
        Assert.Contains("anterior", prior.Status);
        Assert.Equal(5m, rows.Single(x => x.Description == "otro día").EquivalentInDollars);
        Assert.Equal(10000m, rows.Single(x => x.Description == "dólares").EquivalentInDollars);
        Assert.Equal(0, app.Provider.Calls); // Consultar movimientos no importa datos.
    }
}
