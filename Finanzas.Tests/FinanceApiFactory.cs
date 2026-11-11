using System.Net;
using System.Net.Http.Headers;
using Finanzas.Domain.Interfaces;
using Finanzas.Infrastructure.ExternalServices;
using Finanzas.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Finanzas.Tests;

public sealed class FinanceApiFactory : WebApplicationFactory<Program>
{
    private readonly string databaseName = Guid.NewGuid().ToString();
    public ProviderHandler Provider { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("Jwt:Key", "test-only-signing-key-at-least-thirty-two-characters");
        builder.UseSetting("Jwt:Issuer", "finance-tests");
        builder.UseSetting("Jwt:Audience", "finance-tests");
        builder.UseSetting("DollarQuoteRefresh:Enabled", "false");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<FinanzasDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<FinanzasDbContext>>();
            services.AddDbContext<FinanzasDbContext>(o => o.UseInMemoryDatabase(databaseName));
            services.RemoveAll<IDollarQuoteProvider>();
            services.AddScoped<IDollarQuoteProvider>(_ => new DollarApiQuoteProvider(
                new HttpClient(Provider, disposeHandler: false) { BaseAddress = new Uri("https://provider.test/") }));
        });
    }

    public HttpClient Client(string? role = "Administrator", string email = "test@example.test")
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        if (role is not null)
        {
            using var scope = Services.CreateScope();
            var token = scope.ServiceProvider.GetRequiredService<ITokenService>().GenerateToken(email, role);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
        return client;
    }

    public async Task WithDb(Func<FinanzasDbContext, Task> action)
    {
        await using var scope = Services.CreateAsyncScope();
        await action(scope.ServiceProvider.GetRequiredService<FinanzasDbContext>());
    }
}

public sealed class ProviderHandler : HttpMessageHandler
{
    public string Body { get; set; } = """{"moneda":"USD","casa":"oficial","venta":1000,"fechaActualizacion":"2026-01-10T01:30:00Z"}""";
    public HttpStatusCode Status { get; set; } = HttpStatusCode.OK;
    public int Calls;
    public string? LastPath;
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref Calls);
        LastPath = request.RequestUri!.AbsolutePath;
        return Task.FromResult(new HttpResponseMessage(Status) { Content = new StringContent(Body) });
    }
}
