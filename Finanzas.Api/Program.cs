using Finanzas.Api;
using Finanzas.Application.Interfaces;
using Finanzas.Api.BackgroundServices;
using Finanzas.Application.Services;
using Finanzas.Domain.Interfaces;
using Finanzas.Infrastructure.ExternalServices;
using Finanzas.Infrastructure.Persistence;
using Finanzas.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configuracion base de datos
var connectionString = builder.Configuration.GetConnectionString("FinanzasPersonales")
    ?? throw new InvalidOperationException(
        "No se encontró la cadena de conexión 'FinanzasPersonales'.");

// AddDbContext registra un contexto por petición HTTP (vida útil Scoped).
builder.Services.AddDbContext<FinanzasDbContext>(options =>
    options.UseSqlServer(connectionString, sqlServerOptionsAction =>
    {
        sqlServerOptionsAction.EnableRetryOnFailure(
            maxRetryCount: 5,                        // Número máximo de reintentos
            maxRetryDelay: TimeSpan.FromSeconds(30), // Tiempo máximo de espera entre reintentos
            errorNumbersToAdd: null                  // Errores adicionales opcionales
        );
    }));


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

// Monedas
builder.Services.AddScoped<ICurrencyRepository, CurrencyRepository>();
builder.Services.AddScoped<ICurrencyService, CurrencyService>();

// Cotizaciones / Equivalencias
builder.Services.AddScoped<IExchangeRateRepository, ExchangeRateRepository>();
builder.Services.AddScoped<IExchangeRateService, ExchangeRateService>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddOptions<DollarQuoteRefreshSettings>()
    .Bind(builder.Configuration.GetSection(DollarQuoteRefreshSettings.SectionName))
    .Validate(settings => settings.IntervalMinutes is >= 1 and <= 1440,
        "DollarQuoteRefresh:IntervalMinutes debe estar entre 1 y 1440.")
    .ValidateOnStart();
builder.Services.AddHostedService<DollarQuoteRefreshWorker>();

builder.Services.Configure<DollarApiSettings>(builder.Configuration.GetSection(DollarApiSettings.SectionName));
var dollarApiSettings = builder.Configuration.GetSection(DollarApiSettings.SectionName).Get<DollarApiSettings>()
    ?? throw new InvalidOperationException("Falta la sección DollarApi.");
builder.Services.AddHttpClient<IDollarQuoteProvider, DollarApiQuoteProvider>(client =>
{
    client.BaseAddress = new Uri(dollarApiSettings.BaseUrl);
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddScoped<IFinancialSummaryService, FinancialSummaryService>();



// Autenticación, Tokens y Seguridad 
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();


builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();

// ==========================================


// CONFIGURACIÓN DE JWT DESDE APPSETTINGS.JSON
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("Missing section 'Jwt' in appsettings.json.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key))
{
    throw new InvalidOperationException("Missing key 'Jwt:Key' in appsettings.json.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });


// CONFIGURACIÓN DE POLÍTICAS DE AUTORIZACIÓN (POLICIES)
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(Policies.AdminsOnly, policy => policy.RequireRole("Administrator"));
    options.AddPolicy(Policies.StandardUsers, policy => policy.RequireRole("Customer"));
    options.AddPolicy(Policies.AllUsers, p => p.RequireRole("Administrator", "Customer"));
});

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

// Manejo de CORS
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

app.UseAuthentication();
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

    try
    {
        await context.Database.OpenConnectionAsync();
        await context.Database.CloseConnectionAsync();
    }
    catch (Exception ex)
    {
        throw new InvalidOperationException(
            "No fue posible conectar con la base FinanzasPersonales: " + ex.Message, ex);
    }

    logger.LogInformation(
        "Conexión con la base FinanzasPersonales verificada correctamente.");
}
