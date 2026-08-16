using Finanzas.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Conserva en JSON la nomenclatura exacta definida para las propiedades C#.
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });
builder.Services.AddOpenApi();

const string PoliticaCorsFrontend = "FrontendLocal";

builder.Services.AddCors(options =>
{
    options.AddPolicy(PoliticaCorsFrontend, policy =>
    {
        policy
            .WithOrigins("http://localhost:59169")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// La cadena se obtiene desde la configuración; su valor real no se escribe en el código.
var connectionString = builder.Configuration.GetConnectionString("FinanzasPersonales")
    ?? throw new InvalidOperationException(
        "No se encontró la cadena de conexión 'FinanzasPersonales'.");

// AddDbContext registra un contexto por petición HTTP (vida útil Scoped).
builder.Services.AddDbContext<FinanzasDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // Esta comprobación de desarrollo solo intenta abrir la conexión; no modifica datos.
    await VerificarConexionAsync(app.Services, app.Logger);
}

app.UseHttpsRedirection();

// CORS debe ejecutarse antes de mapear los controladores que recibirán las peticiones.
app.UseCors(PoliticaCorsFrontend);

app.UseAuthorization();

app.MapControllers();

app.Run();

static async Task VerificarConexionAsync(
    IServiceProvider services,
    ILogger logger)
{
    await using var scope = services.CreateAsyncScope();
    var context = scope.ServiceProvider.GetRequiredService<FinanzasDbContext>();

    if (!await context.Database.CanConnectAsync())
    {
        throw new InvalidOperationException(
            "No fue posible conectar con la base FinanzasPersonales.");
    }

    logger.LogInformation(
        "Conexión con la base FinanzasPersonales verificada correctamente.");
}
