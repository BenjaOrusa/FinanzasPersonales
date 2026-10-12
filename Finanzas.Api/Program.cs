using Finanzas.Application.Interfaces;
using Finanzas.Application.Services;
using Finanzas.Domain.Interfaces;
using Finanzas.Infrastructure.Persistence;
using Finanzas.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Configuracion base de datos
var connectionString = builder.Configuration.GetConnectionString("FinanzasPersonales")
    ?? throw new InvalidOperationException(
        "No se encontró la cadena de conexión 'FinanzasPersonales'.");

// AddDbContext registra un contexto por petición HTTP (vida útil Scoped).
builder.Services.AddDbContext<FinanzasDbContext>(options =>
    options.UseSqlServer(connectionString));


// ==========================================
// REGISTRO DE REPOSITORIOS Y SERVICIOS (DI)
// ==========================================
// Cuentas
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<IAccountService, AccountService>();

// Categorías
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// Movimientos
builder.Services.AddScoped<IMovementRepository, MovementRepository>();
builder.Services.AddScoped<IMovementService, MovementService>();
// ==========================================



builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Conserva en JSON la nomenclatura exacta definida para las propiedades C#.
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });
//builder.Services.AddOpenApi();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Pegue aqui el token devuelto por POST /api/auth/login (sin la palabra Bearer)."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document)] = new List<string>()
    });
});

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


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.MapOpenApi();
        app.UseSwagger();
        app.UseSwaggerUI();

    // Esta comprobación de desarrollo solo intenta abrir la conexión; no modifica datos.
    await VerificarConexionAsync(app.Services, app.Logger);
}

app.UseHttpsRedirection();

// CORS debe ejecutarse antes de mapear los controladores que recibirán las peticiones.
app.UseCors(PoliticaCorsFrontend);

app.UseAuthorization();

app.MapControllers();

app.Run();


// Función opcional de diagnóstico. Lo único que hace es forzar una comprobación temprana (CanConnectAsync())
// apenas arranca la aplicación en modo desarrollo. Si la base no responde, la app se detiene de inmediato
// y te avisa con un error claro, en lugar de dejar que arranquen los endpoints y fallen después.
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
