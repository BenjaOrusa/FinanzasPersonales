# Backend completo – Gestión de Finanzas Personales (.NET)

Documento generado para análisis por otra IA. Contiene el código fuente del backend sin modificaciones (solo se normalizaron saltos de línea y se quitó el BOM).

Excluido: `bin`, `obj`, `.git`, `.vs`, `publish`, `finanzas.web`, `Finanzas.Api`, `.github`, `docs`, archivos `*.Designer.cs` y `*ModelSnapshot.cs` de migraciones, y archivos `.user`.

## Arquitectura (resumen)

- **Finanzas.Presentation**: API ASP.NET Core (Program.cs, Controllers, BackgroundServices, Policies, appsettings).
- **Finanzas.Application**: DTOs, interfaces de servicios y servicios (lógica de negocio).
- **Finanzas.Domain**: entidades (Models) e interfaces de repositorios/proveedores.
- **Finanzas.Infrastructure**: DbContext (EF Core + SQL Server), repositorios, servicios externos (JWT, BCrypt, DolarApi), migraciones.
- **database**: scripts SQL.

## Índice de archivos

1. `FinanzasPersonales.slnx`
2. `Finanzas.Presentation/Finanzas.Presentation.csproj`
3. `Finanzas.Presentation/Policies.cs`
4. `Finanzas.Presentation/Program.cs`
5. `Finanzas.Presentation/appsettings.Development.json`
6. `Finanzas.Presentation/appsettings.json`
7. `Finanzas.Presentation/BackgroundServices/DollarQuoteRefreshSettings.cs`
8. `Finanzas.Presentation/BackgroundServices/DollarQuoteRefreshWorker.cs`
9. `Finanzas.Presentation/Controllers/AccountController.cs`
10. `Finanzas.Presentation/Controllers/AdminController.cs`
11. `Finanzas.Presentation/Controllers/AuthController.cs`
12. `Finanzas.Presentation/Controllers/CategoryController.cs`
13. `Finanzas.Presentation/Controllers/CurrencyController.cs`
14. `Finanzas.Presentation/Controllers/ExchangeRateController.cs`
15. `Finanzas.Presentation/Controllers/FinancialSummaryController.cs`
16. `Finanzas.Presentation/Controllers/MovementsController.cs`
17. `Finanzas.Presentation/Controllers/UserController.cs`
18. `Finanzas.Presentation/Properties/launchSettings.json`
19. `Finanzas.Application/Finanzas.Application.csproj`
20. `Finanzas.Application/DTOs/Request/CurrencySummaryDTO.cs`
21. `Finanzas.Application/DTOs/Request/Accounts/AccountRequestDTO.cs`
22. `Finanzas.Application/DTOs/Request/Auth/LoginRequestDTO.cs`
23. `Finanzas.Application/DTOs/Request/Auth/RegisterRequestDTO.cs`
24. `Finanzas.Application/DTOs/Request/Categories/CategoryRequestDTO.cs`
25. `Finanzas.Application/DTOs/Request/ExchangeRate/ExchangeRateRequestDTO.cs`
26. `Finanzas.Application/DTOs/Request/Movements/MovementFilterDTO.cs`
27. `Finanzas.Application/DTOs/Request/Movements/MovementRequestDTO.cs`
28. `Finanzas.Application/DTOs/Request/User/UpdateUserStatusRequestDTO.cs`
29. `Finanzas.Application/DTOs/Response/FinancialSummaryResponseDTO.cs`
30. `Finanzas.Application/DTOs/Response/MovementDollarEquivalentResponseDTO.cs`
31. `Finanzas.Application/DTOs/Response/Accounts/AccountResponseDTO.cs`
32. `Finanzas.Application/DTOs/Response/Admin/AdminMovementsAnalyticsResponseDTO.cs`
33. `Finanzas.Application/DTOs/Response/Auth/LoginResponse.cs`
34. `Finanzas.Application/DTOs/Response/Auth/LoginResult.cs`
35. `Finanzas.Application/DTOs/Response/Categories/CategoryResponseDTO.cs`
36. `Finanzas.Application/DTOs/Response/Currency/CurrencyResponseDTO.cs`
37. `Finanzas.Application/DTOs/Response/ExchangeRate/ExchangeRateAvailabilityResponseDTO.cs`
38. `Finanzas.Application/DTOs/Response/ExchangeRate/ExchangeRateResponseDTO.cs`
39. `Finanzas.Application/DTOs/Response/ExchangeRate/ImportedDollarQuoteResponseDTO.cs`
40. `Finanzas.Application/DTOs/Response/Movements/MovementResponseDTO.cs`
41. `Finanzas.Application/DTOs/Response/User/UserResponseDTO.cs`
42. `Finanzas.Application/Interfaces/IAccountService.cs`
43. `Finanzas.Application/Interfaces/IAdminAnalyticsService.cs`
44. `Finanzas.Application/Interfaces/IAuthService.cs`
45. `Finanzas.Application/Interfaces/ICategoryService.cs`
46. `Finanzas.Application/Interfaces/ICurrencyService.cs`
47. `Finanzas.Application/Interfaces/IExchangeRateService.cs`
48. `Finanzas.Application/Interfaces/IFinancialSummaryService.cs`
49. `Finanzas.Application/Interfaces/IMovementService.cs`
50. `Finanzas.Application/Interfaces/IUserService.cs`
51. `Finanzas.Application/Services/AccountService.cs`
52. `Finanzas.Application/Services/AdminAnalyticsService.cs`
53. `Finanzas.Application/Services/AuthService.cs`
54. `Finanzas.Application/Services/CategoryService.cs`
55. `Finanzas.Application/Services/CurrencyService.cs`
56. `Finanzas.Application/Services/ExchangeRateService.cs`
57. `Finanzas.Application/Services/FinancialSummaryService.cs`
58. `Finanzas.Application/Services/MovementService.cs`
59. `Finanzas.Application/Services/UserService.cs`
60. `Finanzas.Domain/Finanzas.Domain.csproj`
61. `Finanzas.Domain/Interfaces/IAccountRepository.cs`
62. `Finanzas.Domain/Interfaces/ICategoryRepository.cs`
63. `Finanzas.Domain/Interfaces/ICurrencyRepository.cs`
64. `Finanzas.Domain/Interfaces/IDollarQuoteProvider.cs`
65. `Finanzas.Domain/Interfaces/IExchangeRateRepository.cs`
66. `Finanzas.Domain/Interfaces/IMovementRepository.cs`
67. `Finanzas.Domain/Interfaces/IPasswordHasher.cs`
68. `Finanzas.Domain/Interfaces/ITokenRevocationStore.cs`
69. `Finanzas.Domain/Interfaces/ITokenService.cs`
70. `Finanzas.Domain/Interfaces/IUserRepository.cs`
71. `Finanzas.Domain/Models/Account.cs`
72. `Finanzas.Domain/Models/AccountTypes.cs`
73. `Finanzas.Domain/Models/Category.cs`
74. `Finanzas.Domain/Models/Currency.cs`
75. `Finanzas.Domain/Models/DollarQuote.cs`
76. `Finanzas.Domain/Models/ExchangeRate.cs`
77. `Finanzas.Domain/Models/Movement.cs`
78. `Finanzas.Domain/Models/QuoteProviderException.cs`
79. `Finanzas.Domain/Models/TypeOfUser.cs`
80. `Finanzas.Domain/Models/User.cs`
81. `Finanzas.Infrastructure/Finanzas.Infrastructure.csproj`
82. `Finanzas.Infrastructure/ExternalServices/BCryptPasswordHasher.cs`
83. `Finanzas.Infrastructure/ExternalServices/DollarApiQuoteProvider.cs`
84. `Finanzas.Infrastructure/ExternalServices/DollarApiSettings.cs`
85. `Finanzas.Infrastructure/ExternalServices/InMemoryTokenRevocationStore.cs`
86. `Finanzas.Infrastructure/ExternalServices/JwtSettings.cs`
87. `Finanzas.Infrastructure/ExternalServices/JwtTokenService.cs`
88. `Finanzas.Infrastructure/Migrations/20260921014051_InitialEntities.cs`
89. `Finanzas.Infrastructure/Migrations/20261018201328_AddUsersAndTypeOfUsers.cs`
90. `Finanzas.Infrastructure/Migrations/20261026034227_InitialCreate.cs`
91. `Finanzas.Infrastructure/Migrations/20261027025456_AddNewTables.cs`
92. `Finanzas.Infrastructure/Migrations/20261111003821_NuevaMigracion.cs`
93. `Finanzas.Infrastructure/Migrations/20261111004435_SeedBaseCurrencies.cs`
94. `Finanzas.Infrastructure/Migrations/20261111040117_UpdateAccountTypeCheckConstraint.cs`
95. `Finanzas.Infrastructure/Migrations/20261125221955_AgregoMetodos.cs`
96. `Finanzas.Infrastructure/Persistence/FinanzasDbContext.cs`
97. `Finanzas.Infrastructure/Repositories/AccountRepository.cs`
98. `Finanzas.Infrastructure/Repositories/CategoryRepository.cs`
99. `Finanzas.Infrastructure/Repositories/CurrencyRepository.cs`
100. `Finanzas.Infrastructure/Repositories/ExchangeRateRepository.cs`
101. `Finanzas.Infrastructure/Repositories/MovementRepository.cs`
102. `Finanzas.Infrastructure/Repositories/UserRepository.cs`
103. `database/README.md`
104. `database/traslado-datos-prueba.sql`
105. `database/scripts/001_crear_estructura_inicial.sql`
106. `database/scripts/002_cargar_datos_iniciales.sql`


---

## `FinanzasPersonales.slnx`

```xml
<Solution>
  <Project Path="Finanzas.Application/Finanzas.Application.csproj" Id="850a9862-fc30-410f-9fd0-dcd2f7bd3f07" />
  <Project Path="Finanzas.Domain/Finanzas.Domain.csproj" Id="4c54d34b-ac9c-4a3f-8a33-40ef50a3012a" />
  <Project Path="Finanzas.Infrastructure/Finanzas.Infrastructure.csproj" Id="66d122ba-5c04-40d9-a8a2-d09b23b7abf3" />
  <Project Path="Finanzas.Presentation/Finanzas.Presentation.csproj" />
  <Project Path="finanzas.web/finanzas.web.esproj">
    <Build />
    <Deploy />
  </Project>
</Solution>
```

---

## `Finanzas.Presentation/Finanzas.Presentation.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UserSecretsId>52715d59-b8b9-48ce-ba9b-da1608c16161</UserSecretsId>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.0.12" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.0.12" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.12">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="10.3.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Finanzas.Application\Finanzas.Application.csproj" />
    <ProjectReference Include="..\Finanzas.Infrastructure\Finanzas.Infrastructure.csproj" />
  </ItemGroup>

</Project>
```

---

## `Finanzas.Presentation/Policies.cs`

```csharp
namespace Finanzas.Api
{
    public static class Policies
    {
        public const string AdminsOnly = "AdminsOnly";
        public const string StandardUsers = "StandardUsers";

        public const string AllUsers = "AllUsers";
    }
}
```

---

## `Finanzas.Presentation/Program.cs`

```csharp
using Finanzas.Api;
using Finanzas.Api.BackgroundServices;
using Finanzas.Application.Interfaces;
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
using System.Security.Claims;
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

// Panel de administración (gráficos de movimientos)
builder.Services.AddScoped<IAdminAnalyticsService, AdminAnalyticsService>();



// Autenticación, Tokens y Seguridad 
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();


builder.Services.AddScoped<ITokenService, JwtTokenService>();
// Registro en memoria de tokens revocados por el logout (Singleton: debe vivir mientras viva la API)
builder.Services.AddSingleton<ITokenRevocationStore, InMemoryTokenRevocationStore>();
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
            ClockSkew = TimeSpan.Zero,

            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };

        // CU03: si el token fue revocado por POST /api/Auth/logout, se rechaza aunque no haya vencido.
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var revocationStore = context.HttpContext.RequestServices.GetRequiredService<ITokenRevocationStore>();

                if (context.SecurityToken is Microsoft.IdentityModel.JsonWebTokens.JsonWebToken jwt
                    && revocationStore.IsRevoked(jwt.Id))
                {
                    context.Fail("El token fue revocado (sesión cerrada).");
                }

                return Task.CompletedTask;
            }
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
// Los orígenes permitidos se leen de la sección "Cors:AllowedOrigins" (appsettings.json o variables de entorno de Azure:
// Cors__AllowedOrigins__0, Cors__AllowedOrigins__1, ...). Se admiten comodines de subdominio, ej: https://*.azurestaticapps.net
const string PoliticaCorsFrontend = "AllowFrontend";

var allowedOrigins = (builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.Trim().TrimEnd('/'))
    .ToArray();

if (allowedOrigins.Length == 0)
{
    // Valores por defecto para desarrollo local cuando no hay configuración.
    allowedOrigins = new[] { "http://localhost:3000", "http://localhost:5173", "http://localhost:59169" };
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(PoliticaCorsFrontend, policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .SetIsOriginAllowedToAllowWildcardSubdomains()
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
```

---

## `Finanzas.Presentation/appsettings.Development.json`

```json
{
  "ConnectionStrings": {
    "FinanzasPersonales": "Server=localhost;Database=FinanzasPersonales;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True"
  },
  "Jwt": {
    "Key": "clave-secreta-finanzas-personales-cambiar-en-produccion-256-bits",
    "Issuer": "FinanzasApi",
    "Audience": "FinanzasClient",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

---

## `Finanzas.Presentation/appsettings.json`

```json
{
  "ConnectionStrings": {
    "FinanzasPersonales": "Server=localhost;Database=FinanzasPersonales;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True"
  },
  "DollarApi": {
    "BaseUrl": "https://dolarapi.com/"
  },
  "Jwt": {
    "Key": "",
    "Issuer": "",
    "Audience": "",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:59169"
    ]
  },
  "DollarQuoteRefresh": {
    "Enabled": true,
    "IntervalMinutes": 60
  },
  "AllowedHosts": "*"
}
```

---

## `Finanzas.Presentation/BackgroundServices/DollarQuoteRefreshSettings.cs`

```csharp
namespace Finanzas.Api.BackgroundServices;

public sealed class DollarQuoteRefreshSettings
{
    public const string SectionName = "DollarQuoteRefresh";
    public bool Enabled { get; set; } = true;
    public int IntervalMinutes { get; set; } = 60;
}
```

---

## `Finanzas.Presentation/BackgroundServices/DollarQuoteRefreshWorker.cs`

```csharp
using Finanzas.Application.Interfaces;
using Microsoft.Extensions.Options;

namespace Finanzas.Api.BackgroundServices;

// Vive con la API. Cada intento obtiene su propio servicio y DbContext scoped.
public sealed class DollarQuoteRefreshWorker(
    IServiceScopeFactory scopeFactory,
    IOptions<DollarQuoteRefreshSettings> options,
    TimeProvider timeProvider,
    ILogger<DollarQuoteRefreshWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!options.Value.Enabled) return;

        var interval = TimeSpan.FromMinutes(options.Value.IntervalMinutes);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var service = scope.ServiceProvider.GetRequiredService<IExchangeRateService>();
                var result = await service.ImportLatestDollarAsync(stoppingToken);
                logger.LogInformation("Dólar oficial guardado para {Date}: {Value} ARS por USD.",
                    result.ExchangeRate.Date, result.ExchangeRate.Value);
                if (result.IsFromPreviousDay)
                    logger.LogWarning("El proveedor aún no informa la cotización de hoy. Se conserva su fecha: {Date}.",
                        result.ExchangeRate.Date);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                // Una caída externa no debe detener la API ni reemplazar valores por cero.
                logger.LogError(ex, "No se actualizó el dólar. Se reintentará en {Minutes} minutos.",
                    options.Value.IntervalMinutes);
            }

            try
            {
                await Task.Delay(interval, timeProvider, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}
```

---

## `Finanzas.Presentation/Controllers/AccountController.cs`

```csharp
using Finanzas.Application.DTOs.Request.Accounts;
using Finanzas.Application.DTOs.Response.Accounts;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finanzas.Api.Controllers;

// Expone las cuentas almacenadas en SQL Server
[Authorize(Policy = Policies.StandardUsers)]
[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IAccountService accountService;

    public AccountController(IAccountService accountService)
    {
        this.accountService = accountService;
    }


    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AccountResponseDTO>>> GetAllActive([FromQuery] bool active, CancellationToken cancellationToken)
    {
        var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();

        var accounts = await accountService.GetAllAsync(userEmail, active, cancellationToken);
        return Ok(accounts);
    }



    //CU04 — Crear una cuenta financiera
    [HttpPost]
    public async Task<ActionResult<AccountResponseDTO>> Create(
        [FromBody] AccountRequestDTO accountRequest, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var response = await accountService.CreateAsync(userEmail, accountRequest, cancellationToken);

            return CreatedAtAction(nameof(GetById), new { accountId = response.AccountId }, response);
        }
        catch (ArgumentException ex) { return BadRequest(ex.Message); }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(ex.Message); }
    }


    // CU05: Editar una cuenta financiera propia
    [HttpPut("{accountId:Guid}")]
    public async Task<ActionResult<AccountResponseDTO>> Update(Guid accountId, [FromBody] AccountRequestDTO accountRequest, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var response = await accountService.UpdateAsync(userEmail, accountId, accountRequest, cancellationToken);

            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }


    //CU06 — Desactivar una cuenta financiera
    [HttpPatch("{accountId:Guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid accountId, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var success = await accountService.DeactivateAsync(userEmail, accountId, cancellationToken);

            if (!success) return NotFound();

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    // CU06 (complemento): Reactivar una cuenta desactivada
    [HttpPatch("{accountId:Guid}/activate")]
    public async Task<IActionResult> Activate(Guid accountId, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var success = await accountService.ActivateAsync(userEmail, accountId, cancellationToken);

            if (!success) return NotFound();

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    // Eliminar físicamente una cuenta SIN movimientos (409 si tiene movimientos)
    [HttpDelete("{accountId:Guid}")]
    public async Task<IActionResult> Delete(Guid accountId, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var success = await accountService.DeleteAsync(userEmail, accountId, cancellationToken);

            if (!success) return NotFound();

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    // CU07: Consultar saldo y detalles de una cuenta específica del usuario
    [HttpGet("{accountId:Guid}")]
    public async Task<ActionResult<AccountResponseDTO>> GetById(Guid accountId, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var account = await accountService.GetByIdAsync(userEmail, accountId, cancellationToken);

            if (account is null) return NotFound();

            return Ok(account);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}
```

---

## `Finanzas.Presentation/Controllers/AdminController.cs`

```csharp
using Finanzas.Application.DTOs.Response.Admin;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    // Módulo de Administración: Exclusivo para administradores
    [Authorize(Policy = Policies.AdminsOnly)]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminAnalyticsService adminAnalyticsService;

        public AdminController(IAdminAnalyticsService adminAnalyticsService)
        {
            this.adminAnalyticsService = adminAnalyticsService;
        }

        // Datos agregados de movimientos para los gráficos del panel de administración.
        // Filtros opcionales: ?year=2026&month=11&userId=<guid>  (month requiere year)
        [HttpGet("analytics/movements")]
        public async Task<ActionResult<AdminMovementsAnalyticsResponseDTO>> GetMovementsAnalytics(
            [FromQuery] int? year,
            [FromQuery] int? month,
            [FromQuery] Guid? userId,
            CancellationToken cancellationToken)
        {
            try
            {
                var analytics = await adminAnalyticsService.GetMovementsAnalyticsAsync(
                    year, month, userId, cancellationToken);
                return Ok(analytics);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
```

---

## `Finanzas.Presentation/Controllers/AuthController.cs`

```csharp
using Finanzas.Application.DTOs.Request.Auth;
using Finanzas.Application.DTOs.Response.Auth;
using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace Finanzas.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService authService;

        public AuthController(IAuthService authService)
        {
            this.authService = authService;
        }

        // CU02: Iniciar sesión. Devuelve el token y los datos del usuario.
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequestDTO request, CancellationToken cancellationToken)
        {
            var result = await authService.AuthenticateAsync(request, cancellationToken);

            if (result.Status == LoginStatus.AccessDenied)
            {
                // CU02 alternativa 4.b: usuario inactivo o bloqueado
                return StatusCode(StatusCodes.Status403Forbidden, result.Message);
            }

            if (result.Status != LoginStatus.Success || result.Response == null)
            {
                return Unauthorized("Usuario o password incorrectos.");
            }

            return Ok(result.Response);
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request, CancellationToken cancellationToken)
        {
            var result = await authService.RegisterAsync(request, cancellationToken);

            if (!result)
            {
                return BadRequest("El email ya se encuentra registrado.");
            }

            return Ok("Usuario registrado correctamente.");
        }

        // Perfil del usuario autenticado (Id, Name, Surname, Status, Role). Disponible para ambos roles.
        [Authorize(Policy = Policies.AllUsers)]
        [HttpGet("me")]
        public async Task<ActionResult<UserResponseDTO>> Me(CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var profile = await authService.GetProfileAsync(userEmail, cancellationToken);
                return Ok(profile);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // CU03: Cerrar sesión. Revoca en el servidor el token con el que se hizo la petición.
        [Authorize(Policy = Policies.AllUsers)]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout(CancellationToken cancellationToken)
        {
            if (AuthenticationHeaderValue.TryParse(Request.Headers.Authorization, out var header)
                && !string.IsNullOrWhiteSpace(header.Parameter))
            {
                await authService.LogoutAsync(header.Parameter, cancellationToken);
            }

            return Ok(new { Message = "Sesión cerrada correctamente." });
        }

    }
}
```

---

## `Finanzas.Presentation/Controllers/CategoryController.cs`

```csharp
using Finanzas.Application.DTOs.Request.Categories;
using Finanzas.Application.DTOs.Response.Categories;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finanzas.Api.Controllers
{
    /// Expone las categorías almacenadas en SQL Server
    [Authorize(Policy = Policies.StandardUsers)]
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            this.categoryService = categoryService;
        }


        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<CategoryResponseDTO>>> GetAll(CancellationToken cancellationToken)
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var categories = await categoryService.GetAllAsync(userEmail, cancellationToken);
            return Ok(categories);
        }


        //CU08 — Crear una categoría
        [HttpPost]
        public async Task<ActionResult<CategoryResponseDTO>> Create([FromBody] CategoryRequestDTO categoryRequest, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var response = await categoryService.CreateAsync(userEmail, categoryRequest, cancellationToken);
                return CreatedAtAction(nameof(GetAll), new { id = response.CategoryId }, response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // CU09: Editar una categoría propia
        [HttpPut("{categoryId:Guid}")]
        public async Task<ActionResult<CategoryResponseDTO>> Update(Guid categoryId, [FromBody] CategoryRequestDTO categoryRequest, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var response = await categoryService.UpdateAsync(userEmail, categoryId, categoryRequest, cancellationToken);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }


        //CU10 — Desactivar una categoría
        [HttpPatch("{categoryId:Guid}/deactivate")]
        public async Task<IActionResult> Deactivate(Guid categoryId, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var success = await categoryService.DeactivateAsync(userEmail, categoryId, cancellationToken);

                if (!success) return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // CU10 (complemento): Reactivar una categoría desactivada
        [HttpPatch("{categoryId:Guid}/activate")]
        public async Task<IActionResult> Activate(Guid categoryId, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var success = await categoryService.ActivateAsync(userEmail, categoryId, cancellationToken);

                if (!success) return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // Eliminar físicamente una categoría SIN movimientos (409 si tiene movimientos)
        [HttpDelete("{categoryId:Guid}")]
        public async Task<IActionResult> Delete(Guid categoryId, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var success = await categoryService.DeleteAsync(userEmail, categoryId, cancellationToken);

                if (!success) return NotFound();

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}
```

---

## `Finanzas.Presentation/Controllers/CurrencyController.cs`

```csharp
using Finanzas.Application.DTOs.Response.Currencies;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    // Catálogo de monedas: lo consultan tanto el usuario común (crear cuentas) como el administrador (cargar cotizaciones)
    [Authorize(Policy = Policies.AllUsers)]
    [ApiController]
    [Route("api/[controller]")]
    public class CurrencyController : ControllerBase
    {
        private readonly ICurrencyService currencyService;

        public CurrencyController(ICurrencyService currencyService)
        {
            this.currencyService = currencyService;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<CurrencyResponseDTO>>> GetAll(CancellationToken cancellationToken)
        {
            var currencies = await currencyService.GetAllAsync(cancellationToken);
            return Ok(currencies);
        }
    }
}
```

---

## `Finanzas.Presentation/Controllers/ExchangeRateController.cs`

```csharp
using Finanzas.Application.DTOs.Request.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRates;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExchangeRateController : ControllerBase
    {
        private readonly IExchangeRateService exchangeRateService;

        public ExchangeRateController(IExchangeRateService exchangeRateService)
        {
            this.exchangeRateService = exchangeRateService;
        }

        // Historial de cotizaciones guardadas (tabla de AdminCotizacionesPage). Filtros opcionales.
        [Authorize(Policy = Policies.AllUsers)]
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<ExchangeRateResponseDTO>>> GetAll(
            [FromQuery] Guid? baseCurrencyId,
            [FromQuery] Guid? targetCurrencyId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var rates = await exchangeRateService.GetAllAsync(
                    baseCurrencyId, targetCurrencyId, startDate, endDate, cancellationToken);
                return Ok(rates);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Última cotización guardada del dólar oficial (para mostrarla en el resumen del usuario común).
        [Authorize(Policy = Policies.AllUsers)]
        [HttpGet("latest-dollar")]
        public async Task<ActionResult<ExchangeRateResponseDTO>> GetLatestDollar(CancellationToken cancellationToken)
        {
            var rate = await exchangeRateService.GetLatestDollarAsync(cancellationToken);

            if (rate is null)
                return NotFound("Todavía no hay una cotización del dólar guardada.");

            return Ok(rate);
        }

        // CU19: Exclusivo para administradores - Consultar disponibilidad de una cotización (solo lectura)
        [Authorize(Policy = Policies.AdminsOnly)]
        [HttpGet("availability")]
        public async Task<ActionResult<ExchangeRateAvailabilityResponseDTO>> GetAvailability(
            [FromQuery] Guid baseCurrencyId,
            [FromQuery] Guid targetCurrencyId,
            [FromQuery] DateTime date,
            CancellationToken cancellationToken)
        {
            try
            {
                var availability = await exchangeRateService.CheckAvailabilityAsync(
                    baseCurrencyId, targetCurrencyId, date, cancellationToken);
                return Ok(availability);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Policy = Policies.AdminsOnly)]
        [HttpPost("import-latest-dollar")]
        public async Task<ActionResult<ImportedDollarQuoteResponseDTO>> ImportLatestDollar(CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await exchangeRateService.ImportLatestDollarAsync(cancellationToken));
            }
            catch (QuoteProviderException ex)
            {
                return Problem(statusCode: StatusCodes.Status502BadGateway, title: "No se pudo importar la cotización", detail: ex.Message);
            }
        }

        // Exclusivo para administradores - Registrar o corregir una cotización manualmente
        [Authorize(Policy = Policies.AdminsOnly)]
        [HttpPost]
        public async Task<ActionResult<ExchangeRateResponseDTO>> Upsert([FromBody] ExchangeRateRequestDTO request, CancellationToken cancellationToken)
        {
            try
            {
                var response = await exchangeRateService.UpsertAsync(request, cancellationToken);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // CU16: Usuario común - Consultar equivalencia de movimientos en dólares con regla de fallback
        [Authorize(Policy = Policies.StandardUsers)]
        [HttpGet("movements-dollar-equivalent")]
        public async Task<ActionResult<IReadOnlyList<MovementDollarEquivalentResponseDTO>>> GetMovementsDollarEquivalents(CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var result = await exchangeRateService.GetMovementsDollarEquivalentsAsync(userEmail, cancellationToken);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}
```

---

## `Finanzas.Presentation/Controllers/FinancialSummaryController.cs`

```csharp
using Finanzas.Application.DTOs.Response;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    [Authorize(Policy = Policies.StandardUsers)]
    [ApiController]
    [Route("api/[controller]")]
    public class FinancialSummaryController : ControllerBase
    {
        private readonly IFinancialSummaryService financialSummaryService;

        public FinancialSummaryController(IFinancialSummaryService financialSummaryService)
        {
            this.financialSummaryService = financialSummaryService;
        }

        // CU15: Consultar el resumen financiero (totales de ingresos, gastos y balance por moneda).
        // Filtro opcional por período: ?startDate=2026-11-01&endDate=2026-11-30 (sin parámetros = todo el historial).
        [HttpGet]
        public async Task<ActionResult<FinancialSummaryResponseDTO>> GetSummary(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var summary = await financialSummaryService.GetSummaryAsync(userEmail, startDate, endDate, cancellationToken);
                return Ok(summary);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}
```

---

## `Finanzas.Presentation/Controllers/MovementsController.cs`

```csharp
using Finanzas.Application.DTOs.Response.Movements;
using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Finanzas.Api.Controllers
{

    // Expone operaciones HTTP relacionadas con los movimientos financieros
    [Authorize(Policy = Policies.StandardUsers)]
    [ApiController]
    [Route("api/[controller]")]
    public class MovementController : ControllerBase
    {
        private readonly IMovementService movementService;

        public MovementController(IMovementService movementService)
        {
            this.movementService = movementService;
        }


        [HttpGet("{movementId:Guid}")]
        [ProducesResponseType(typeof(MovementResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MovementResponseDTO>> GetById(Guid movementId, CancellationToken cancellationToken)
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
            var response = await movementService.GetByIdAsync(userEmail, movementId, cancellationToken);
            return response is null ? NotFound() : Ok(response);
        }


        //CU11 — Registrar un movimiento
        [HttpPost]
        [ProducesResponseType(typeof(MovementResponseDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<MovementResponseDTO>> Create(
            [FromBody] MovementRequestDTO movementRequest, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var response = await movementService.CreateAsync(userEmail, movementRequest, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { movementId = response.MovementId }, response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        //CU12 — Editar un movimiento
        [HttpPut("{movementId:Guid}")]
        [ProducesResponseType(typeof(MovementResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MovementResponseDTO>> Update(
            Guid movementId, [FromBody] MovementRequestDTO movementRequest, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var response = await movementService.UpdateAsync(userEmail, movementId, movementRequest, cancellationToken);

                if (response is null) return NotFound();

                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        //CU13 — Eliminar un movimiento
        [HttpDelete("{movementId:Guid}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid movementId, CancellationToken cancellationToken)
        {
            try
            {
                var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();
                var deleted = await movementService.DeleteAsync(userEmail, movementId, cancellationToken);

                if (!deleted) return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        // CU14: Consultar movimientos con filtros opcionales (tipo, fechas, cuenta, categoría)
        [HttpGet("filter")]
        [ProducesResponseType(typeof(IReadOnlyList<MovementResponseDTO>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IReadOnlyList<MovementResponseDTO>>> GetAllByFilter(
            [FromQuery] string? movementType,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] Guid? accountId,
            [FromQuery] Guid? categoryId,
            CancellationToken cancellationToken)
        {
            var userEmail = User.Identity?.Name ?? throw new UnauthorizedAccessException();

            var filter = new MovementFilterDTO
            {
                MovementType = movementType,
                StartDate = startDate,
                EndDate = endDate,
                AccountId = accountId,
                CategoryId = categoryId
            };

            var movements = await movementService.GetFilteredAsync(userEmail, filter, cancellationToken);
            return Ok(movements);
        }
    }
}
```

---

## `Finanzas.Presentation/Controllers/UserController.cs`

```csharp
using Finanzas.Application.DTOs.Request.Users;
using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Api.Controllers
{
    // Módulo de Administración: Exclusivo para administradores
    [Authorize(Policy = Policies.AdminsOnly)]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService userService;

        public UserController(IUserService userService)
        {
            this.userService = userService;
        }

        // CU17: Consultar el listado de usuarios del sistema
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<UserResponseDTO>>> GetAll(CancellationToken cancellationToken)
        {
            var users = await userService.GetAllAsync(cancellationToken);
            return Ok(users);
        }

        // CU18: Activar, desactivar o bloquear un usuario
        [HttpPatch("{userId:Guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid userId, [FromBody] UpdateUserStatusRequestDTO request, CancellationToken cancellationToken)
        {
            try
            {
                var success = await userService.UpdateStatusAsync(userId, request.Status, cancellationToken);

                if (!success) return NotFound("El usuario especificado no existe.");

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
```

---

## `Finanzas.Presentation/Properties/launchSettings.json`

```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "dotnetRunMessages": true,
      "applicationUrl": "http://localhost:5056"
    },
    "https": {
      "commandName": "Project",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "dotnetRunMessages": true,
      "applicationUrl": "https://localhost:7097;http://localhost:5056"
    },
    "IIS Express": {
      "commandName": "IISExpress",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  },
  "$schema": "https://json.schemastore.org/launchsettings.json",
  "iisSettings": {
    "windowsAuthentication": false,
    "anonymousAuthentication": true,
    "iisExpress": {
      "applicationUrl": "http://localhost:60753/",
      "sslPort": 44378
    }
  }
}
```

---

## `Finanzas.Application/Finanzas.Application.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\Finanzas.Domain\Finanzas.Domain.csproj" />
  </ItemGroup>

</Project>
```

---

## `Finanzas.Application/DTOs/Request/CurrencySummaryDTO.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

//Representa el desglose financiero para una moneda en particular.

namespace Finanzas.Application.DTOs.Request
{
    public class CurrencySummaryDTO
    {
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal Balance { get; set; }
    }
}
```

---

## `Finanzas.Application/DTOs/Request/Accounts/AccountRequestDTO.cs`

```csharp
namespace Finanzas.Application.DTOs.Request.Accounts;

//Datos necesarios para crear una cuenta.
public class AccountRequestDTO
{
    public string Description { get; set; } = string.Empty;

    // 'Efectivo', 'Cuenta Bancaria' o 'Billetera Virtual'.
    // También se aceptan sin espacios ('CuentaBancaria', 'BilleteraVirtual'); se guarda siempre la forma con espacios.
    public string AccountType { get; set; } = string.Empty;
    public Guid CurrencyId { get; set; }
}
```

---

## `Finanzas.Application/DTOs/Request/Auth/LoginRequestDTO.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Request.Auth
{
    public record LoginRequestDTO(string Email, string Password);
    
}
```

---

## `Finanzas.Application/DTOs/Request/Auth/RegisterRequestDTO.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Request.Auth
{
    public record RegisterRequestDTO(
            string Email,
            string Password,
            string Name,
            string Surname);
}
```

---

## `Finanzas.Application/DTOs/Request/Categories/CategoryRequestDTO.cs`

```csharp
namespace Finanzas.Application.DTOs.Request.Categories;

//Datos necesarios para crear una categoría.
public class CategoryRequestDTO
{
    public string Description { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty; // 'Ingreso' o 'Gasto'
}
```

---

## `Finanzas.Application/DTOs/Request/ExchangeRate/ExchangeRateRequestDTO.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Request.ExchangeRate
{
    public class ExchangeRateRequestDTO
    {
        public Guid BaseCurrencyId { get; set; }
        public Guid TargetCurrencyId { get; set; }
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
    }
}
```

---

## `Finanzas.Application/DTOs/Request/Movements/MovementFilterDTO.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Request.Movements
{
    public class MovementFilterDTO
    {
        public string? MovementType { get; set; } // 'Ingreso' o 'Gasto'
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? AccountId { get; set; }
        public Guid? CategoryId { get; set; }
    }
}
```

---

## `Finanzas.Application/DTOs/Request/Movements/MovementRequestDTO.cs`

```csharp
namespace Finanzas.Application.DTOs.Request.Movements;

//Datos editables que el frontend envía para crear o modificar un movimiento.
public class MovementRequestDTO
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string MovementType { get; set; } = string.Empty; // 'Ingreso' o 'Gasto'
    public Guid CategoryId { get; set; }
    public Guid AccountId { get; set; }
    public string? Note { get; set; }
}
```

---

## `Finanzas.Application/DTOs/Request/User/UpdateUserStatusRequestDTO.cs`

```csharp
namespace Finanzas.Application.DTOs.Request.Users
{
    //Datos enviados por el Administrador para el CU18
    public class UpdateUserStatusRequestDTO
    {
        public string Status { get; set; } = string.Empty; // 'Activo', 'Inactivo', 'Bloqueado'
    }
}
```

---

## `Finanzas.Application/DTOs/Response/FinancialSummaryResponseDTO.cs`

```csharp
using Finanzas.Application.DTOs.Request;
using System;
using System.Collections.Generic;
using System.Text;


//Representa el resumen consolidado que agrupa los totales por cada moneda en la que el usuario tiene movimientos
namespace Finanzas.Application.DTOs.Response
{
    public class FinancialSummaryResponseDTO
    {
        public IReadOnlyList<CurrencySummaryDTO> SummariesByCurrency { get; set; } = new List<CurrencySummaryDTO>();
    }
}
```

---

## `Finanzas.Application/DTOs/Response/MovementDollarEquivalentResponseDTO.cs`

```csharp
using System;

namespace Finanzas.Application.DTOs.Response.ExchangeRates
{
    public class MovementDollarEquivalentResponseDTO
    {
        public Guid MovementId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal OriginalAmount { get; set; }
        public string OriginalCurrency { get; set; } = string.Empty;
        public decimal? EquivalentInDollars { get; set; }
        public DateTime MovementDate { get; set; }
        public DateTime? ExchangeRateDateUsed { get; set; }
        public string Status { get; set; } = string.Empty; // 'Convertido' o 'Sin cotización aplicable'
    }
}
```

---

## `Finanzas.Application/DTOs/Response/Accounts/AccountResponseDTO.cs`

```csharp
namespace Finanzas.Application.DTOs.Response.Accounts;

//Datos de una cuenta enviados al frontend.
public class AccountResponseDTO
{
    public Guid AccountId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public bool Active { get; set; }

    public decimal Balance { get; set; }

    public Guid CurrencyId { get; set; }

    public string CurrencyDescription { get; set; } = string.Empty;
}
```

---

## `Finanzas.Application/DTOs/Response/Admin/AdminMovementsAnalyticsResponseDTO.cs`

```csharp
using System;
using System.Collections.Generic;

namespace Finanzas.Application.DTOs.Response.Admin
{
    // Datos agregados de movimientos para los gráficos del panel de administración.
    // Los importes de monedas distintas nunca se suman entre sí: todo viene separado por moneda.
    public class AdminMovementsAnalyticsResponseDTO
    {
        // Filtros aplicados (null = sin filtrar)
        public int? Year { get; set; }
        public int? Month { get; set; }
        public Guid? UserId { get; set; }

        public IReadOnlyList<AnalyticsCurrencyTotalDTO> TotalsByCurrency { get; set; } = new List<AnalyticsCurrencyTotalDTO>();

        // Un registro por mes y moneda (consumo mensual)
        public IReadOnlyList<AnalyticsMonthlyItemDTO> Monthly { get; set; } = new List<AnalyticsMonthlyItemDTO>();

        // Un registro por día y moneda. Solo se completa cuando se filtra por año y mes (consumo diario)
        public IReadOnlyList<AnalyticsDailyItemDTO> Daily { get; set; } = new List<AnalyticsDailyItemDTO>();

        // Totales por categoría (agrupadas por nombre y tipo) y moneda
        public IReadOnlyList<AnalyticsCategoryItemDTO> ByCategory { get; set; } = new List<AnalyticsCategoryItemDTO>();

        // Totales por usuario y moneda
        public IReadOnlyList<AnalyticsUserItemDTO> ByUser { get; set; } = new List<AnalyticsUserItemDTO>();
    }

    public class AnalyticsCurrencyTotalDTO
    {
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal Balance { get; set; }
        public int MovementCount { get; set; }
    }

    public class AnalyticsMonthlyItemDTO
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public int MovementCount { get; set; }
    }

    public class AnalyticsDailyItemDTO
    {
        public DateTime Date { get; set; }
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public int MovementCount { get; set; }
    }

    public class AnalyticsCategoryItemDTO
    {
        public string CategoryDescription { get; set; } = string.Empty;
        public string CategoryType { get; set; } = string.Empty;   // 'Ingreso' o 'Gasto'
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int MovementCount { get; set; }
    }

    public class AnalyticsUserItemDTO
    {
        public Guid UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Guid CurrencyId { get; set; }
        public string CurrencyDescription { get; set; } = string.Empty;
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public int MovementCount { get; set; }
    }
}
```

---

## `Finanzas.Application/DTOs/Response/Auth/LoginResponse.cs`

```csharp
using Finanzas.Application.DTOs.Response.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Response.Auth
{
    // Token JWT + datos del usuario autenticado (Id, Name, Surname, Status, Role).
    public record LoginResponse(string Token, UserResponseDTO User);

}
```

---

## `Finanzas.Application/DTOs/Response/Auth/LoginResult.cs`

```csharp
namespace Finanzas.Application.DTOs.Response.Auth
{
    public enum LoginStatus
    {
        Success,
        InvalidCredentials,   // 401: correo o contraseña incorrectos
        AccessDenied          // 403: usuario Inactivo o Bloqueado (CU02 4.b / CU18)
    }

    // Resultado interno del login: permite distinguir los casos sin usar excepciones.
    public record LoginResult(LoginStatus Status, LoginResponse? Response = null, string? Message = null);
}
```

---

## `Finanzas.Application/DTOs/Response/Categories/CategoryResponseDTO.cs`

```csharp
namespace Finanzas.Application.DTOs.Response.Categories;

//Datos de una categoría enviados al frontend.
public class CategoryResponseDTO
{
    public Guid CategoryId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
    public bool Active { get; set; }
}
```

---

## `Finanzas.Application/DTOs/Response/Currency/CurrencyResponseDTO.cs`

```csharp
using System;

namespace Finanzas.Application.DTOs.Response.Currencies
{
    public class CurrencyResponseDTO
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
```

---

## `Finanzas.Application/DTOs/Response/ExchangeRate/ExchangeRateAvailabilityResponseDTO.cs`

```csharp
using System;

namespace Finanzas.Application.DTOs.Response.ExchangeRate
{
    // Resultado de la consulta de disponibilidad de una cotización (CU19). Es solo lectura.
    public class ExchangeRateAvailabilityResponseDTO
    {
        public bool Available { get; set; }
        public decimal? Value { get; set; }
        public DateTime? RateDate { get; set; }          // fecha de la cotización encontrada
        public bool IsFromEarlierDate { get; set; }      // true si no hay cotización exacta y se informa la última anterior (CU19 4.b)
        public string Message { get; set; } = string.Empty;
    }
}
```

---

## `Finanzas.Application/DTOs/Response/ExchangeRate/ExchangeRateResponseDTO.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.DTOs.Response.ExchangeRate
{
    public class ExchangeRateResponseDTO
    {
        public Guid BaseCurrencyId { get; set; }
        public string BaseCurrencyDescription { get; set; } = string.Empty;
        public Guid TargetCurrencyId { get; set; }
        public string TargetCurrencyDescription { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Value { get; set; }
    }
}
```

---

## `Finanzas.Application/DTOs/Response/ExchangeRate/ImportedDollarQuoteResponseDTO.cs`

```csharp
namespace Finanzas.Application.DTOs.Response.ExchangeRate;

public sealed record ImportedDollarQuoteResponseDTO(
    ExchangeRateResponseDTO ExchangeRate,
    DateTimeOffset ProviderUpdatedAt,
    bool IsFromPreviousDay,
    string Source = "DolarApi - dólar oficial venta");
```

---

## `Finanzas.Application/DTOs/Response/Movements/MovementResponseDTO.cs`

```csharp
namespace Finanzas.Application.DTOs.Response.Movements;


// Define el JSON que la API devuelve al frontend para representar un movimiento.
public class MovementResponseDTO
{
    public Guid MovementId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryDescription { get; set; } = string.Empty;
    public Guid AccountId { get; set; }
    public string AccountDescription { get; set; } = string.Empty;
    public Guid CurrencyId { get; set; }
    public string? Note { get; set; }
    public DateTime CreationDate { get; set; }
}
```

---

## `Finanzas.Application/DTOs/Response/User/UserResponseDTO.cs`

```csharp
using System;

namespace Finanzas.Application.DTOs.Response.Users
{
    public class UserResponseDTO
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // 'Activo', 'Inactivo', 'Bloqueado'
        public string Role { get; set; } = string.Empty;   // 'Administrator', 'Customer'
    }
}
```

---

## `Finanzas.Application/Interfaces/IAccountService.cs`

```csharp
using Finanzas.Application.DTOs.Request.Accounts;
using Finanzas.Application.DTOs.Response.Accounts;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface IAccountService
    {
        Task<IReadOnlyList<AccountResponseDTO>> GetAllAsync(string userEmail, bool active, CancellationToken cancellationToken);
        Task<AccountResponseDTO?> GetByIdAsync(string userEmail, Guid accountId, CancellationToken cancellationToken);
        Task<AccountResponseDTO> CreateAsync(string userEmail, AccountRequestDTO request, CancellationToken cancellationToken);
        Task<AccountResponseDTO> UpdateAsync(string userEmail, Guid accountId, AccountRequestDTO request, CancellationToken cancellationToken);
        Task<bool> DeactivateAsync(string userEmail, Guid accountId, CancellationToken cancellationToken);
        Task<bool> ActivateAsync(string userEmail, Guid accountId, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(string userEmail, Guid accountId, CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Application/Interfaces/IAdminAnalyticsService.cs`

```csharp
using Finanzas.Application.DTOs.Response.Admin;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Interfaces
{
    public interface IAdminAnalyticsService
    {
        Task<AdminMovementsAnalyticsResponseDTO> GetMovementsAnalyticsAsync(int? year, int? month, Guid? userId, CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Application/Interfaces/IAuthService.cs`

```csharp
using Finanzas.Application.DTOs.Request.Auth;
using Finanzas.Application.DTOs.Response.Auth;
using Finanzas.Application.DTOs.Response.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResult> AuthenticateAsync(LoginRequestDTO request, CancellationToken cancellationToken = default);
        Task<bool> RegisterAsync(RegisterRequestDTO request, CancellationToken cancellationToken = default);

        // Perfil del usuario autenticado (GET /api/Auth/me)
        Task<UserResponseDTO> GetProfileAsync(string userEmail, CancellationToken cancellationToken = default);

        // CU03: revoca el token recibido para que deje de ser válido en el servidor
        Task LogoutAsync(string accessToken, CancellationToken cancellationToken = default);
    }
}
```

---

## `Finanzas.Application/Interfaces/ICategoryService.cs`

```csharp
using Finanzas.Application.DTOs.Request.Categories;
using Finanzas.Application.DTOs.Response.Categories;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<IReadOnlyList<CategoryResponseDTO>> GetAllAsync(string userEmail, CancellationToken cancellationToken);
        Task<CategoryResponseDTO> CreateAsync(string userEmail, CategoryRequestDTO request, CancellationToken cancellationToken);
        Task<CategoryResponseDTO> UpdateAsync(string userEmail, Guid categoryId, CategoryRequestDTO request, CancellationToken cancellationToken);
        Task<bool> DeactivateAsync(string userEmail, Guid categoryId, CancellationToken cancellationToken);
        Task<bool> ActivateAsync(string userEmail, Guid categoryId, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(string userEmail, Guid categoryId, CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Application/Interfaces/ICurrencyService.cs`

```csharp
using Finanzas.Application.DTOs.Response.Currencies;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Interfaces
{
    public interface ICurrencyService
    {
        Task<IReadOnlyList<CurrencyResponseDTO>> GetAllAsync(CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Application/Interfaces/IExchangeRateService.cs`

```csharp
using Finanzas.Application.DTOs.Request.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRates;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Interfaces
{
    public interface IExchangeRateService
    {
        Task<ImportedDollarQuoteResponseDTO> ImportLatestDollarAsync(CancellationToken cancellationToken);
        Task<ExchangeRateResponseDTO> UpsertAsync(ExchangeRateRequestDTO request, CancellationToken cancellationToken);
        Task<IReadOnlyList<MovementDollarEquivalentResponseDTO>> GetMovementsDollarEquivalentsAsync(string userEmail, CancellationToken cancellationToken);

        // Historial de cotizaciones guardadas (filtros opcionales)
        Task<IReadOnlyList<ExchangeRateResponseDTO>> GetAllAsync(Guid? baseCurrencyId, Guid? targetCurrencyId, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken);

        // Última cotización guardada del dólar oficial en pesos (null si todavía no hay ninguna)
        Task<ExchangeRateResponseDTO?> GetLatestDollarAsync(CancellationToken cancellationToken);

        // CU19: consulta de disponibilidad (solo lectura)
        Task<ExchangeRateAvailabilityResponseDTO> CheckAvailabilityAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Application/Interfaces/IFinancialSummaryService.cs`

```csharp
using Finanzas.Application.DTOs.Response;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Interfaces
{
    public interface IFinancialSummaryService
    {
        // startDate/endDate son opcionales: sin ellos se resume todo el historial del usuario.
        Task<FinancialSummaryResponseDTO> GetSummaryAsync(string userEmail, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Application/Interfaces/IMovementService.cs`

```csharp
using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Application.DTOs.Response.Movements;

namespace Finanzas.Application.Interfaces
{
    public interface IMovementService
    {
        Task<IReadOnlyList<MovementResponseDTO>> GetAllAsync(string userEmail, CancellationToken cancellationToken);
        Task<MovementResponseDTO?> GetByIdAsync(string userEmail, Guid movementId, CancellationToken cancellationToken);
        Task<MovementResponseDTO> CreateAsync(string userEmail, MovementRequestDTO request, CancellationToken cancellationToken);
        Task<MovementResponseDTO?> UpdateAsync(string userEmail, Guid movementId, MovementRequestDTO request, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(string userEmail, Guid movementId, CancellationToken cancellationToken);

        Task<IReadOnlyList<MovementResponseDTO>> GetFilteredAsync(string userEmail, MovementFilterDTO filter, CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Application/Interfaces/IUserService.cs`

```csharp
using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Interfaces
{
    public interface IUserService
    {
        Task<User> GetValidUserAsync(string userEmail, CancellationToken cancellationToken);
        Task<IReadOnlyList<UserResponseDTO>> GetAllAsync(CancellationToken cancellationToken);
        Task<bool> UpdateStatusAsync(Guid userId, string newStatus, CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Application/Services/AccountService.cs`

```csharp
using Finanzas.Application.DTOs.Request.Accounts;
using Finanzas.Application.DTOs.Response.Accounts;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Services
{
    public class AccountService : IAccountService
    {

        private readonly IAccountRepository accountRepository;
        private readonly IUserService userService;

        public AccountService(IAccountRepository accountRepository, IUserService userService)
        {
            this.accountRepository = accountRepository;
            this.userService = userService;
        }




        public async Task<IReadOnlyList<AccountResponseDTO>> GetAllAsync(string userEmail, bool active, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var accounts = await accountRepository.GetAllByUserIdAsync(user.Id, active, cancellationToken);

            return accounts.Select(a => MapToResponseDTO(a, a.Currency.Description)).ToList();
        }

        public async Task<AccountResponseDTO?> GetByIdAsync(string userEmail, Guid accountId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var account = await accountRepository.GetByIdAndUserIdAsync(accountId, user.Id, cancellationToken);

            return account is null ? null : MapToResponseDTO(account, account.Currency.Description);
        }

        public async Task<AccountResponseDTO> CreateAsync(string userEmail, AccountRequestDTO request, CancellationToken ct)
        {
            var user = await userService.GetValidUserAsync(userEmail, ct);
            var description = request.Description.Trim();

            // El tipo se normaliza a la forma que exige el CHECK de SQL Server ('Cuenta Bancaria', 'Billetera Virtual').
            if (description.Length is 0 or > 100 || !AccountTypes.TryNormalize(request.AccountType, out var accountType))
                throw new ArgumentException("La descripción y el tipo de cuenta no son válidos.");

            var currency = await GetValidCurrencyAsync(request.CurrencyId, ct);

            if (await accountRepository.ExistsByDescriptionAndUserAsync(description, user.Id, ct))
                throw new InvalidOperationException("Ya existe una cuenta con esa descripción para este usuario.");

            var account = new Account(description, accountType, user.Id, currency.Id);
            accountRepository.Add(account);
            await accountRepository.SaveChangesAsync(ct);

            return MapToResponseDTO(account, currency.Description);
        }

        public async Task<bool> DeactivateAsync(string userEmail, Guid accountId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var account = await accountRepository.GetByIdAndUserIdAsync(accountId, user.Id, cancellationToken);

            if (account is null) return false;

            // Ejecutamos la baja lógica del dominio en lugar de un Remove físico
            account.Deactivate();

            await accountRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        // Reactiva una cuenta que fue desactivada (CU06 en sentido inverso)
        public async Task<bool> ActivateAsync(string userEmail, Guid accountId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var account = await accountRepository.GetByIdAndUserIdAsync(accountId, user.Id, cancellationToken);

            if (account is null) return false;

            account.Activate();

            await accountRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        // Eliminación física: solo permitida si la cuenta no tiene movimientos (no se pierde historial).
        public async Task<bool> DeleteAsync(string userEmail, Guid accountId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var account = await accountRepository.GetByIdAndUserIdAsync(accountId, user.Id, cancellationToken);

            if (account is null) return false;

            if (await accountRepository.HasMovementsAsync(accountId, cancellationToken))
            {
                throw new InvalidOperationException(
                    "No se puede eliminar una cuenta que tiene movimientos asociados. Desactívela para conservar su historial.");
            }

            accountRepository.Remove(account);
            await accountRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<AccountResponseDTO> UpdateAsync(string userEmail, Guid accountId, AccountRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var account = await accountRepository.GetByIdAndUserIdAsync(accountId, user.Id, cancellationToken);

            if (account is null)
                throw new KeyNotFoundException("La cuenta no existe o no pertenece al usuario.");

            var description = request.Description.Trim();

            if (description.Length is 0 or > 100 || !AccountTypes.TryNormalize(request.AccountType, out var accountType))
            {
                throw new ArgumentException("La descripción y el tipo de cuenta no son válidos.");
            }

            var currency = await GetValidCurrencyAsync(request.CurrencyId, cancellationToken);

            // Validar unicidad de descripción excluyendo la cuenta actual
            if (await accountRepository.ExistsByDescriptionAndUserExcludingIdAsync(description, user.Id, accountId, cancellationToken))
            {
                throw new InvalidOperationException("Ya existe otra cuenta con esa descripción para este usuario.");
            }

            // CU05: Validar coherencia con movimientos existentes si se intenta cambiar la moneda
            if (account.CurrencyId != request.CurrencyId)
            {
                bool hasMovements = await accountRepository.HasMovementsAsync(accountId, cancellationToken);
                if (hasMovements)
                {
                    throw new InvalidOperationException("No se puede modificar la moneda de una cuenta que ya posee movimientos históricos asociados.");
                }
            }

            // Actualizar mediante el método de dominio controlado
            account.Update(description, accountType, currency.Id);

            await accountRepository.SaveChangesAsync(cancellationToken);

            return MapToResponseDTO(account, currency.Description);
        }

        private async Task<Currency> GetValidCurrencyAsync(Guid currencyId, CancellationToken ct)
        {
            if (currencyId == Guid.Empty)
                throw new ArgumentException("Debe especificar una moneda válida para la cuenta.");

            return await accountRepository.GetCurrencyByIdAsync(currencyId, ct)
                ?? throw new ArgumentException("La moneda indicada no existe.");
        }

        private static AccountResponseDTO MapToResponseDTO(Account account, string currencyDescription) => new()
        {
            AccountId = account.AccountId,
            Description = account.Description,
            AccountType = account.AccountType,
            Active = account.Active,
            Balance = account.Balance,
            CurrencyId = account.CurrencyId,
            CurrencyDescription = currencyDescription
        };
    }

}
```

---

## `Finanzas.Application/Services/AdminAnalyticsService.cs`

```csharp
using Finanzas.Application.DTOs.Response.Admin;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class AdminAnalyticsService : IAdminAnalyticsService
    {
        private const string UnknownCurrency = "Moneda Desconocida";

        private readonly IMovementRepository movementRepository;
        private readonly IUserRepository userRepository;

        public AdminAnalyticsService(IMovementRepository movementRepository, IUserRepository userRepository)
        {
            this.movementRepository = movementRepository;
            this.userRepository = userRepository;
        }

        public async Task<AdminMovementsAnalyticsResponseDTO> GetMovementsAnalyticsAsync(
            int? year, int? month, Guid? userId, CancellationToken cancellationToken)
        {
            // Validación de filtros
            if (month.HasValue && !year.HasValue)
                throw new ArgumentException("Para filtrar por mes debe indicar también el año.");

            if (year.HasValue && (year.Value < 2000 || year.Value > 2100))
                throw new ArgumentException("El año indicado no es válido.");

            if (month.HasValue && (month.Value < 1 || month.Value > 12))
                throw new ArgumentException("El mes debe estar entre 1 y 12.");

            Guid? filterUserId = userId.HasValue && userId.Value != Guid.Empty ? userId : null;

            if (filterUserId.HasValue)
            {
                var user = await userRepository.GetByIdAsync(filterUserId.Value, cancellationToken);
                if (user is null)
                    throw new KeyNotFoundException("El usuario especificado no existe.");
            }

            // Rango de fechas a partir de año y/o mes
            DateTime? startDate = null;
            DateTime? endDate = null;

            if (year.HasValue && month.HasValue)
            {
                startDate = new DateTime(year.Value, month.Value, 1);
                endDate = startDate.Value.AddMonths(1).AddDays(-1);
            }
            else if (year.HasValue)
            {
                startDate = new DateTime(year.Value, 1, 1);
                endDate = new DateTime(year.Value, 12, 31);
            }

            var movements = await movementRepository.GetForAnalyticsAsync(
                startDate, endDate, filterUserId, cancellationToken);

            return new AdminMovementsAnalyticsResponseDTO
            {
                Year = year,
                Month = month,
                UserId = filterUserId,
                TotalsByCurrency = BuildTotalsByCurrency(movements),
                Monthly = BuildMonthly(movements),
                Daily = month.HasValue ? BuildDaily(movements) : new List<AnalyticsDailyItemDTO>(),
                ByCategory = BuildByCategory(movements),
                ByUser = BuildByUser(movements)
            };
        }

        private static decimal Income(IEnumerable<Movement> movements) =>
            movements.Where(m => m.MovementType == "Ingreso").Sum(m => m.Amount);

        private static decimal Expenses(IEnumerable<Movement> movements) =>
            movements.Where(m => m.MovementType == "Gasto").Sum(m => m.Amount);

        private static string CurrencyName(Movement movement) =>
            movement.Currency?.Description ?? UnknownCurrency;

        private static List<AnalyticsCurrencyTotalDTO> BuildTotalsByCurrency(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new { m.CurrencyId, CurrencyDescription = CurrencyName(m) })
                .Select(g =>
                {
                    var income = Income(g);
                    var expenses = Expenses(g);

                    return new AnalyticsCurrencyTotalDTO
                    {
                        CurrencyId = g.Key.CurrencyId,
                        CurrencyDescription = g.Key.CurrencyDescription,
                        TotalIncome = income,
                        TotalExpenses = expenses,
                        Balance = income - expenses,
                        MovementCount = g.Count()
                    };
                })
                .OrderBy(x => x.CurrencyDescription)
                .ToList();

        private static List<AnalyticsMonthlyItemDTO> BuildMonthly(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new { m.Date.Year, m.Date.Month, m.CurrencyId, CurrencyDescription = CurrencyName(m) })
                .Select(g => new AnalyticsMonthlyItemDTO
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    CurrencyId = g.Key.CurrencyId,
                    CurrencyDescription = g.Key.CurrencyDescription,
                    TotalIncome = Income(g),
                    TotalExpenses = Expenses(g),
                    MovementCount = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ThenBy(x => x.CurrencyDescription)
                .ToList();

        private static List<AnalyticsDailyItemDTO> BuildDaily(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new { Date = m.Date.Date, m.CurrencyId, CurrencyDescription = CurrencyName(m) })
                .Select(g => new AnalyticsDailyItemDTO
                {
                    Date = g.Key.Date,
                    CurrencyId = g.Key.CurrencyId,
                    CurrencyDescription = g.Key.CurrencyDescription,
                    TotalIncome = Income(g),
                    TotalExpenses = Expenses(g),
                    MovementCount = g.Count()
                })
                .OrderBy(x => x.Date)
                .ThenBy(x => x.CurrencyDescription)
                .ToList();

        // Las categorías son propias de cada usuario, por eso se agrupan por nombre y tipo (no por Id).
        private static List<AnalyticsCategoryItemDTO> BuildByCategory(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new
                {
                    CategoryDescription = m.Category?.Description ?? string.Empty,
                    m.MovementType,
                    m.CurrencyId,
                    CurrencyDescription = CurrencyName(m)
                })
                .Select(g => new AnalyticsCategoryItemDTO
                {
                    CategoryDescription = g.Key.CategoryDescription,
                    CategoryType = g.Key.MovementType,
                    CurrencyId = g.Key.CurrencyId,
                    CurrencyDescription = g.Key.CurrencyDescription,
                    TotalAmount = g.Sum(m => m.Amount),
                    MovementCount = g.Count()
                })
                .OrderBy(x => x.CategoryDescription)
                .ThenBy(x => x.CategoryType)
                .ThenBy(x => x.CurrencyDescription)
                .ToList();

        private static List<AnalyticsUserItemDTO> BuildByUser(IReadOnlyList<Movement> movements) =>
            movements
                .GroupBy(m => new { m.UserId, m.CurrencyId, CurrencyDescription = CurrencyName(m) })
                .Select(g =>
                {
                    var user = g.First().User;

                    return new AnalyticsUserItemDTO
                    {
                        UserId = g.Key.UserId,
                        UserFullName = user is null ? string.Empty : $"{user.Name} {user.Surname}".Trim(),
                        Email = user?.Email ?? string.Empty,
                        CurrencyId = g.Key.CurrencyId,
                        CurrencyDescription = g.Key.CurrencyDescription,
                        TotalIncome = Income(g),
                        TotalExpenses = Expenses(g),
                        MovementCount = g.Count()
                    };
                })
                .OrderBy(x => x.UserFullName)
                .ThenBy(x => x.CurrencyDescription)
                .ToList();
    }
}
```

---

## `Finanzas.Application/Services/AuthService.cs`

```csharp
using Finanzas.Application.DTOs.Request.Auth;
using Finanzas.Application.DTOs.Response.Auth;
using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Application.Services
{
    public class AuthService : IAuthService
    {
        private const string ActiveStatus = "Activo";
        private const string BlockedStatus = "Bloqueado";

        private readonly IUserRepository userRepository;
        private readonly ITokenService tokenService;
        private readonly IPasswordHasher passwordHasher;
        private readonly ITokenRevocationStore tokenRevocationStore;

        public AuthService(
            IUserRepository userRepository,
            ITokenService tokenService,
            IPasswordHasher passwordHasher,
            ITokenRevocationStore tokenRevocationStore)
        {
            this.userRepository = userRepository;
            this.tokenService = tokenService;
            this.passwordHasher = passwordHasher;
            this.tokenRevocationStore = tokenRevocationStore;
        }

        public async Task<LoginResult> AuthenticateAsync(LoginRequestDTO request, CancellationToken cancellationToken = default)
        {
            var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken);

            if (user == null || !passwordHasher.Verify(request.Password, user.PasswordHash))
            {
                return new LoginResult(LoginStatus.InvalidCredentials);
            }

            // CU02 alternativa 4.b y CU18: un usuario Inactivo o Bloqueado no puede iniciar sesión.
            // Se verifica DESPUÉS de validar la contraseña para no revelar el estado a quien no conoce las credenciales.
            if (!string.Equals(user.Status, ActiveStatus, StringComparison.OrdinalIgnoreCase))
            {
                var reason = string.Equals(user.Status, BlockedStatus, StringComparison.OrdinalIgnoreCase)
                    ? "bloqueado"
                    : "inactivo";

                return new LoginResult(
                    LoginStatus.AccessDenied,
                    Message: $"El usuario se encuentra {reason}. No puede iniciar sesión; contacte a un administrador.");
            }

            // Obtenemos el rol desde la entidad TypeOfUser (ej: "Administrator", "Customer")
            var roleName = user.TypeOfUser?.Description ?? "Customer";
            var token = tokenService.GenerateToken(user.Email, roleName);

            return new LoginResult(LoginStatus.Success, new LoginResponse(token, MapUser(user)));
        }


        public async Task<bool> RegisterAsync(RegisterRequestDTO request, CancellationToken cancellationToken = default)
        {
            // 1. Validar si ya existe un usuario con ese email
            if (await userRepository.ExistsEmailAsync(request.Email, cancellationToken))
            {
                return false;
            }

            // 2. Buscar el tipo de usuario por defecto ("Customer") o crearlo si no existe
            var customerRole = await userRepository.GetTypeOfUserByDescriptionAsync("Customer", cancellationToken);
            if (customerRole == null)
            {
                customerRole = new TypeOfUser("Customer");
                await userRepository.AddTypeOfUserAsync(customerRole, cancellationToken);
                await userRepository.SaveChangesAsync(cancellationToken);
            }

            // 3. Hashear la contraseña recibida
            var passwordHash = passwordHasher.Hash(request.Password);

            // 4. Instanciar la entidad User
            var user = new User(
                request.Email,
                passwordHash,
                request.Name,
                request.Surname,
                customerRole.Id);

            // 5. Guardar en la base de datos
            await userRepository.AddAsync(user, cancellationToken);
            await userRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<UserResponseDTO> GetProfileAsync(string userEmail, CancellationToken cancellationToken = default)
        {
            var user = await userRepository.GetByEmailAsync(userEmail, cancellationToken)
                ?? throw new UnauthorizedAccessException("El usuario autenticado no existe en el sistema.");

            return MapUser(user);
        }

        // CU03: el token queda registrado como revocado hasta su vencimiento natural.
        public Task LogoutAsync(string accessToken, CancellationToken cancellationToken = default)
        {
            if (tokenService.TryReadTokenInfo(accessToken, out var tokenId, out var expiresAtUtc))
            {
                tokenRevocationStore.Revoke(tokenId, expiresAtUtc);
            }

            return Task.CompletedTask;
        }

        private static UserResponseDTO MapUser(User user) => new()
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            Surname = user.Surname,
            Status = user.Status,
            Role = user.TypeOfUser?.Description ?? "Customer"
        };
    }
}
```

---

## `Finanzas.Application/Services/CategoryService.cs`

```csharp
using Finanzas.Application.DTOs.Request.Categories;
using Finanzas.Application.DTOs.Response.Categories;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Domain.Interfaces;

namespace Finanzas.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository categoryRepository;
        private readonly IUserService userService;

        public CategoryService(ICategoryRepository categoryRepository, IUserService userService)
        {
            this.categoryRepository = categoryRepository;
            this.userService = userService;
        }

        public async Task<IReadOnlyList<CategoryResponseDTO>> GetAllAsync(string userEmail, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var categories = await categoryRepository.GetAllByUserIdAsync(user.Id, cancellationToken);

            return categories.Select(item => new CategoryResponseDTO
            {
                CategoryId = item.CategoryId,
                Description = item.Description,
                CategoryType = item.CategoryType,
                Active = item.Active
            }).ToList();
        }

        public async Task<CategoryResponseDTO> CreateAsync(string userEmail, CategoryRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);

            var description = request.Description.Trim();

            if (description.Length is 0 or > 100 || request.CategoryType is not ("Ingreso" or "Gasto"))
            {
                throw new ArgumentException("La descripción y el tipo de categoría no son válidos.");
            }

            if (await categoryRepository.ExistsByDescriptionAndTypeAndUserAsync(description, request.CategoryType, user.Id, cancellationToken))
            {
                throw new InvalidOperationException("Ya existe una categoría con esa descripción y tipo para este usuario.");
            }

            // Uso del constructor blindado de la entidad Category
            var category = new Category(description, request.CategoryType, user.Id);

            categoryRepository.Add(category);
            await categoryRepository.SaveChangesAsync(cancellationToken);

            return new CategoryResponseDTO
            {
                CategoryId = category.CategoryId,
                Description = category.Description,
                CategoryType = category.CategoryType,
                Active = category.Active
            };
        }

        public async Task<CategoryResponseDTO> UpdateAsync(string userEmail, Guid categoryId, CategoryRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var category = await categoryRepository.GetByIdAndUserIdAsync(categoryId, user.Id, cancellationToken);

            if (category is null)
                throw new KeyNotFoundException("La categoría no existe o no pertenece al usuario.");

            var description = request.Description.Trim();

            if (description.Length is 0 or > 100 || request.CategoryType is not ("Ingreso" or "Gasto"))
            {
                throw new ArgumentException("La descripción y el tipo de categoría no son válidos.");
            }

            // Validar unicidad excluyendo la categoría actual
            if (await categoryRepository.ExistsByDescriptionAndTypeAndUserExcludingIdAsync(description, request.CategoryType, user.Id, categoryId, cancellationToken))
            {
                throw new InvalidOperationException("Ya existe otra categoría con esa descripción y tipo para este usuario.");
            }

            // CU09 (Alternativa 4.b): Verificar compatibilidad del nuevo tipo con movimientos existentes
            if (category.CategoryType != request.CategoryType)
            {
                bool hasMovements = await categoryRepository.HasMovementsAsync(categoryId, cancellationToken);
                if (hasMovements)
                {
                    throw new InvalidOperationException("El cambio de tipo dejaría movimientos existentes con una categoría incompatible.");
                }
            }

            category.Update(description, request.CategoryType);
            await categoryRepository.SaveChangesAsync(cancellationToken);

            return MapToResponseDTO(category);
        }

        public async Task<bool> DeactivateAsync(string userEmail, Guid categoryId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var category = await categoryRepository.GetByIdAndUserIdAsync(categoryId, user.Id, cancellationToken);

            if (category is null) return false;

            // Baja lógica exigida por el CU10 (conservando el historial de movimientos)
            category.Deactivate();

            await categoryRepository.SaveChangesAsync(cancellationToken);

            return true;
        }
        // Reactiva una categoría que fue desactivada (CU10 en sentido inverso)
        public async Task<bool> ActivateAsync(string userEmail, Guid categoryId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var category = await categoryRepository.GetByIdAndUserIdAsync(categoryId, user.Id, cancellationToken);

            if (category is null) return false;

            category.Activate();

            await categoryRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        // Eliminación física: solo permitida si la categoría no tiene movimientos (no se pierde historial).
        public async Task<bool> DeleteAsync(string userEmail, Guid categoryId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var category = await categoryRepository.GetByIdAndUserIdAsync(categoryId, user.Id, cancellationToken);

            if (category is null) return false;

            if (await categoryRepository.HasMovementsAsync(categoryId, cancellationToken))
            {
                throw new InvalidOperationException(
                    "No se puede eliminar una categoría que tiene movimientos asociados. Desactívela para conservar su historial.");
            }

            categoryRepository.Remove(category);
            await categoryRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        private static CategoryResponseDTO MapToResponseDTO(Category category) => new()
        {
            CategoryId = category.CategoryId,
            Description = category.Description,
            CategoryType = category.CategoryType,
            Active = category.Active
        };
    }
}
```

---

## `Finanzas.Application/Services/CurrencyService.cs`

```csharp
using Finanzas.Application.DTOs.Response.Currencies;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly ICurrencyRepository currencyRepository;

        public CurrencyService(ICurrencyRepository currencyRepository)
        {
            this.currencyRepository = currencyRepository;
        }

        public async Task<IReadOnlyList<CurrencyResponseDTO>> GetAllAsync(CancellationToken cancellationToken)
        {
            var currencies = await currencyRepository.GetAllAsync(cancellationToken);

            return currencies.Select(c => new CurrencyResponseDTO
            {
                Id = c.Id,
                Description = c.Description
            }).ToList();
        }
    }
}
```

---

## `Finanzas.Application/Services/ExchangeRateService.cs`

```csharp
using Finanzas.Application.DTOs.Request.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRate;
using Finanzas.Application.DTOs.Response.ExchangeRates;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class ExchangeRateService : IExchangeRateService
    {
        private readonly IExchangeRateRepository exchangeRateRepository;
        private readonly IMovementRepository movementRepository;
        private readonly ICurrencyRepository currencyRepository;
        private readonly IUserService userService;
        private readonly IDollarQuoteProvider dollarQuoteProvider;
        private const string DollarDescription = "Dólar Estadounidense";
        private const string PesoDescription = "Pesos Argentinos";
        // Evita que el endpoint y la tarea automática creen la misma fila a la vez
        // dentro de una instancia de la API.
        private static readonly SemaphoreSlim ImportGate = new(1, 1);
        private static readonly TimeZoneInfo ArgentinaTimeZone =
            TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");

        public ExchangeRateService(
            IExchangeRateRepository exchangeRateRepository,
            IMovementRepository movementRepository,
            ICurrencyRepository currencyRepository,
            IUserService userService,
            IDollarQuoteProvider dollarQuoteProvider)
        {
            this.exchangeRateRepository = exchangeRateRepository;
            this.movementRepository = movementRepository;
            this.currencyRepository = currencyRepository;
            this.userService = userService;
            this.dollarQuoteProvider = dollarQuoteProvider;
        }

        public async Task<ImportedDollarQuoteResponseDTO> ImportLatestDollarAsync(CancellationToken cancellationToken)
        {
            await ImportGate.WaitAsync(cancellationToken);
            try
            {
                return await ImportLatestDollarCoreAsync(cancellationToken);
            }
            finally
            {
                ImportGate.Release();
            }
        }

        private async Task<ImportedDollarQuoteResponseDTO> ImportLatestDollarCoreAsync(CancellationToken cancellationToken)
        {
            // Consultar primero: si falla el proveedor no se alteran los datos locales.
            var quote = await dollarQuoteProvider.GetLatestAsync(cancellationToken);
            var quoteDate = TimeZoneInfo.ConvertTime(quote.UpdatedAt, ArgentinaTimeZone).Date;
            var today = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, ArgentinaTimeZone).Date;
            var currencies = await currencyRepository.GetAllAsync(cancellationToken);

            Currency ResolveCurrency(string description)
            {
                var currency = currencies.FirstOrDefault(c => c.Description == description);
                if (currency is not null) return currency;
                currency = new Currency(description);
                currencyRepository.Add(currency);
                return currency;
            }

            var dollar = ResolveCurrency(DollarDescription);
            var peso = ResolveCurrency(PesoDescription);
            // El mismo DbContext scoped guarda monedas y cotización en una transacción.
            var saved = await UpsertAsync(new ExchangeRateRequestDTO
            {
                BaseCurrencyId = dollar.Id,
                TargetCurrencyId = peso.Id,
                Date = quoteDate,
                Value = quote.PesosPerDollar
            }, cancellationToken);

            return new ImportedDollarQuoteResponseDTO(saved, quote.UpdatedAt, quoteDate < today);
        }

        //CU19  Supervisar la disponibilidad de las cotizaciones
        public async Task<ExchangeRateResponseDTO> UpsertAsync(ExchangeRateRequestDTO request, CancellationToken cancellationToken)
        {
            if (request.Value <= 0)
                throw new ArgumentException("El valor de la cotización debe ser mayor a cero.");

            var existingRate = await exchangeRateRepository.GetByCompositeKeyAsync(
                request.BaseCurrencyId, request.TargetCurrencyId, request.Date, cancellationToken);

            ExchangeRate exchangeRate;
            if (existingRate is null)
            {
                exchangeRate = new ExchangeRate(request.BaseCurrencyId, request.TargetCurrencyId, request.Date, request.Value);
                exchangeRateRepository.Add(exchangeRate);
            }
            else
            {
                existingRate.UpdateValue(request.Value);
                exchangeRate = existingRate;
            }

            await exchangeRateRepository.SaveChangesAsync(cancellationToken);

            var savedRate = await exchangeRateRepository.GetByCompositeKeyAsync(
                exchangeRate.BaseCurrencyId, exchangeRate.TargetCurrencyId, exchangeRate.Date, cancellationToken);

            return new ExchangeRateResponseDTO
            {
                BaseCurrencyId = savedRate!.BaseCurrencyId,
                BaseCurrencyDescription = savedRate.BaseCurrency?.Description ?? string.Empty,
                TargetCurrencyId = savedRate.TargetCurrencyId,
                TargetCurrencyDescription = savedRate.TargetCurrency?.Description ?? string.Empty,
                Date = savedRate.Date,
                Value = savedRate.Value
            };
        }

        // Historial de cotizaciones persistidas (solo lectura)
        public async Task<IReadOnlyList<ExchangeRateResponseDTO>> GetAllAsync(
            Guid? baseCurrencyId,
            Guid? targetCurrencyId,
            DateTime? startDate,
            DateTime? endDate,
            CancellationToken cancellationToken)
        {
            if (startDate.HasValue && endDate.HasValue && startDate.Value.Date > endDate.Value.Date)
                throw new ArgumentException("La fecha desde no puede ser posterior a la fecha hasta.");

            var rates = await exchangeRateRepository.GetAllAsync(
                baseCurrencyId, targetCurrencyId, startDate, endDate, cancellationToken);

            return rates.Select(MapToResponseDTO).ToList();
        }

        // Última cotización del dólar (base: Dólar Estadounidense, cotizada: Pesos Argentinos). Solo lectura.
        public async Task<ExchangeRateResponseDTO?> GetLatestDollarAsync(CancellationToken cancellationToken)
        {
            var currencies = await currencyRepository.GetAllAsync(cancellationToken);
            var dollar = currencies.FirstOrDefault(c => c.Description == DollarDescription);
            var peso = currencies.FirstOrDefault(c => c.Description == PesoDescription);

            if (dollar is null || peso is null) return null;

            var rate = await exchangeRateRepository.GetLatestAsync(dollar.Id, peso.Id, cancellationToken);

            return rate is null ? null : MapToResponseDTO(rate);
        }

        // CU19: Supervisar la disponibilidad de una cotización. No crea ni modifica nada.
        public async Task<ExchangeRateAvailabilityResponseDTO> CheckAvailabilityAsync(
            Guid baseCurrencyId,
            Guid targetCurrencyId,
            DateTime date,
            CancellationToken cancellationToken)
        {
            // Alternativa 4.a: criterios incompletos o inválidos
            if (baseCurrencyId == Guid.Empty || targetCurrencyId == Guid.Empty)
                throw new ArgumentException("Debe indicar la moneda base y la moneda cotizada.");

            if (baseCurrencyId == targetCurrencyId)
                throw new ArgumentException("La moneda base y la moneda cotizada deben ser distintas.");

            if (date == default)
                throw new ArgumentException("Debe indicar la fecha de referencia.");

            var currencies = await currencyRepository.GetAllAsync(cancellationToken);
            if (!currencies.Any(c => c.Id == baseCurrencyId) || !currencies.Any(c => c.Id == targetCurrencyId))
                throw new ArgumentException("Alguna de las monedas indicadas no existe.");

            // Última cotización de la fecha indicada o anterior
            var rate = await exchangeRateRepository.GetLatestPriorAsync(
                baseCurrencyId, targetCurrencyId, date, cancellationToken);

            // Alternativa 4.c: no existe cotización aplicable
            if (rate is null)
            {
                return new ExchangeRateAvailabilityResponseDTO
                {
                    Available = false,
                    Message = "No existe una cotización aplicable para los criterios indicados."
                };
            }

            // Alternativa 4.b: no hay cotización exacta, se informa la última anterior
            var isEarlier = rate.Date.Date < date.Date;

            return new ExchangeRateAvailabilityResponseDTO
            {
                Available = true,
                Value = rate.Value,
                RateDate = rate.Date,
                IsFromEarlierDate = isEarlier,
                Message = isEarlier
                    ? "No hay cotización para la fecha indicada; se informa la última anterior disponible."
                    : "Cotización disponible para la fecha indicada."
            };
        }

        private static ExchangeRateResponseDTO MapToResponseDTO(ExchangeRate rate) => new()
        {
            BaseCurrencyId = rate.BaseCurrencyId,
            BaseCurrencyDescription = rate.BaseCurrency?.Description ?? string.Empty,
            TargetCurrencyId = rate.TargetCurrencyId,
            TargetCurrencyDescription = rate.TargetCurrency?.Description ?? string.Empty,
            Date = rate.Date,
            Value = rate.Value
        };

        public async Task<IReadOnlyList<MovementDollarEquivalentResponseDTO>> GetMovementsDollarEquivalentsAsync(string userEmail, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movements = await movementRepository.GetAllByUserIdAsync(user.Id, cancellationToken);

            // Usar la misma moneda canónica que registra la importación.
            var currencies = await currencyRepository.GetAllAsync(cancellationToken);
            var dollarCurrency = currencies.FirstOrDefault(c => c.Description == DollarDescription);

            Guid dollarId = dollarCurrency?.Id ?? Guid.Empty;

            var results = new List<MovementDollarEquivalentResponseDTO>();

            foreach (var m in movements)
            {
                // Alternativa 3.a del CU16: El movimiento ya está expresado en dólares
                if (dollarId != Guid.Empty && m.CurrencyId == dollarId)
                {
                    results.Add(new MovementDollarEquivalentResponseDTO
                    {
                        MovementId = m.MovementId,
                        Description = m.Description,
                        OriginalAmount = m.Amount,
                        OriginalCurrency = m.Currency?.Description ?? "Dólar",
                        EquivalentInDollars = m.Amount,
                        MovementDate = m.Date,
                        ExchangeRateDateUsed = m.Date,
                        Status = "Convertido (Moneda Destino)"
                    });
                    continue;
                }

                // Buscar cotización exacta para la fecha del movimiento
                var rate = dollarId == Guid.Empty ? null : await exchangeRateRepository.GetByCompositeKeyAsync(dollarId, m.CurrencyId, m.Date, cancellationToken);
                DateTime? rateDateUsed = rate?.Date;

                // Alternativa 3.b del CU16: Buscar la última cotización anterior disponible
                if (rate is null && dollarId != Guid.Empty)
                {
                    rate = await exchangeRateRepository.GetLatestPriorAsync(dollarId, m.CurrencyId, m.Date, cancellationToken);
                    rateDateUsed = rate?.Date;
                }

                // Alternativa 3.c del CU16: No existe cotización aplicable
                if (rate is null)
                {
                    results.Add(new MovementDollarEquivalentResponseDTO
                    {
                        MovementId = m.MovementId,
                        Description = m.Description,
                        OriginalAmount = m.Amount,
                        OriginalCurrency = m.Currency?.Description ?? string.Empty,
                        EquivalentInDollars = null,
                        MovementDate = m.Date,
                        ExchangeRateDateUsed = null,
                        Status = "Sin cotización aplicable"
                    });
                }
                else
                {
                    decimal equivalent = decimal.Round(m.Amount / rate.Value, 2, MidpointRounding.AwayFromZero);
                    results.Add(new MovementDollarEquivalentResponseDTO
                    {
                        MovementId = m.MovementId,
                        Description = m.Description,
                        OriginalAmount = m.Amount,
                        OriginalCurrency = m.Currency?.Description ?? string.Empty,
                        EquivalentInDollars = equivalent,
                        MovementDate = m.Date,
                        ExchangeRateDateUsed = rateDateUsed,
                        Status = rateDateUsed?.Date == m.Date.Date
                            ? "Convertido"
                            : "Convertido con última cotización anterior"
                    });
                }
            }

            return results;
        }
    }
}
```

---

## `Finanzas.Application/Services/FinancialSummaryService.cs`

```csharp
using Finanzas.Application.DTOs.Request;
using Finanzas.Application.DTOs.Response;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class FinancialSummaryService : IFinancialSummaryService
    {
        private readonly IMovementRepository movementRepository;
        private readonly IUserService userService;

        public FinancialSummaryService(
            IMovementRepository movementRepository,
            IUserService userService)
        {
            this.movementRepository = movementRepository;
            this.userService = userService;
        }

        public async Task<FinancialSummaryResponseDTO> GetSummaryAsync(string userEmail, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken)
        {
            if (startDate.HasValue && endDate.HasValue && startDate.Value.Date > endDate.Value.Date)
                throw new ArgumentException("La fecha desde no puede ser posterior a la fecha hasta.");

            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);

            // Obtener los movimientos propios del usuario dentro del período indicado (o todo el historial si no hay fechas)
            var movements = await movementRepository.GetFilteredByUserIdAsync(
                userId: user.Id,
                movementType: null,
                startDate: startDate,
                endDate: endDate,
                accountId: null,
                categoryId: null,
                cancellationToken: cancellationToken);

            if (!movements.Any())
            {
                return new FinancialSummaryResponseDTO
                {
                    SummariesByCurrency = new List<CurrencySummaryDTO>()
                };
            }

            // Agrupar movimientos por moneda
            var summariesByCurrency = movements
                .GroupBy(m => new { m.CurrencyId, CurrencyDescription = m.Currency?.Description ?? "Moneda Desconocida" })
                .Select(group =>
                {
                    decimal totalIncome = group
                        .Where(m => m.MovementType == "Ingreso")
                        .Sum(m => m.Amount);

                    decimal totalExpenses = group
                        .Where(m => m.MovementType == "Gasto")
                        .Sum(m => m.Amount);

                    // Regla de Negocio: El balance se calcula restando el total de gastos al total de ingresos
                    decimal balance = totalIncome - totalExpenses;

                    return new CurrencySummaryDTO
                    {
                        CurrencyId = group.Key.CurrencyId,
                        CurrencyDescription = group.Key.CurrencyDescription,
                        TotalIncome = totalIncome,
                        TotalExpenses = totalExpenses,
                        Balance = balance
                    };
                })
                .OrderBy(s => s.CurrencyDescription)
                .ToList();

            return new FinancialSummaryResponseDTO
            {
                SummariesByCurrency = summariesByCurrency
            };
        }
    }
}
```

---

## `Finanzas.Application/Services/MovementService.cs`

```csharp
using Finanzas.Application.DTOs.Response.Movements;
using Finanzas.Application.DTOs.Request.Movements;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class MovementService : IMovementService
    {
        private readonly IMovementRepository movementRepository;
        private readonly IAccountRepository accountRepository;
        private readonly ICategoryRepository categoryRepository;
        private readonly IUserService userService;

        public MovementService(
            IMovementRepository movementRepository,
            IAccountRepository accountRepository,
            ICategoryRepository categoryRepository,
            IUserService userService)
        {
            this.movementRepository = movementRepository;
            this.accountRepository = accountRepository;
            this.categoryRepository = categoryRepository;
            this.userService = userService;
        }



        public async Task<IReadOnlyList<MovementResponseDTO>> GetFilteredAsync(string userEmail, MovementFilterDTO filter, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);

            var movements = await movementRepository.GetFilteredByUserIdAsync(
                user.Id,
                filter.MovementType,
                filter.StartDate,
                filter.EndDate,
                filter.AccountId,
                filter.CategoryId,
                cancellationToken);

            return movements.Select(MapToResponseDTO).ToList();
        }


        public async Task<IReadOnlyList<MovementResponseDTO>> GetAllAsync(string userEmail, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movements = await movementRepository.GetAllByUserIdAsync(user.Id, cancellationToken);

            return movements.Select(MapToResponseDTO).ToList();
        }

        public async Task<MovementResponseDTO?> GetByIdAsync(string userEmail, Guid movementId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movement = await movementRepository.GetByIdAndUserIdAsync(movementId, user.Id, cancellationToken);
            return movement is null ? null : MapToResponseDTO(movement);
        }

        public async Task<MovementResponseDTO> CreateAsync(string userEmail, MovementRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);

            // Validar existencia y pertenencia de la cuenta activa al usuario
            var account = await accountRepository.GetByIdAndUserIdAsync(request.AccountId, user.Id, cancellationToken);
            if (account is null || !account.Active)
            {
                throw new InvalidOperationException("La cuenta no existe, está inactiva o no pertenece al usuario.");
            }

            // Validar existencia, pertenencia y compatibilidad de la categoría activa con el tipo de movimiento
            var category = await categoryRepository.GetByIdAndUserIdAsync(request.CategoryId, user.Id, cancellationToken);
            if (category is null || !category.Active || category.CategoryType != request.MovementType)
            {
                throw new InvalidOperationException("La categoría no existe, está inactiva o su tipo no coincide con el movimiento.");
            }

            // Instanciar el movimiento usando su constructor blindado.
            // La moneda se hereda automáticamente de la cuenta asociada.
            var movement = new Movement(
                request.Description,
                request.Amount,
                request.Date,
                request.MovementType,
                user.Id,
                account.AccountId,
                category.CategoryId,
                account.CurrencyId,
                request.Note);

            // Actualización del saldo de la cuenta (CU11)
            decimal balanceImpact = movement.MovementType == "Ingreso" ? movement.Amount : -movement.Amount;
            account.UpdateBalance(balanceImpact);

            movementRepository.Add(movement);
            await movementRepository.SaveChangesAsync(cancellationToken);

            var createdMovement = await movementRepository.GetByIdAndUserIdAsync(movement.MovementId, user.Id, cancellationToken);
            return MapToResponseDTO(createdMovement!);
        }

        public async Task<MovementResponseDTO?> UpdateAsync(string userEmail, Guid movementId, MovementRequestDTO request, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movement = await movementRepository.GetByIdAndUserIdAsync(movementId, user.Id, cancellationToken);
            if (movement is null) return null;

            // Obtener cuenta anterior para revertir impacto en saldo si cambió la cuenta o el importe
            var oldAccount = await accountRepository.GetByIdAndUserIdAsync(movement.AccountId, user.Id, cancellationToken);
            var newAccount = await accountRepository.GetByIdAndUserIdAsync(request.AccountId, user.Id, cancellationToken);

            if (newAccount is null || !newAccount.Active)
            {
                throw new InvalidOperationException("La cuenta especificada no existe o está inactiva.");
            }

            var category = await categoryRepository.GetByIdAndUserIdAsync(request.CategoryId, user.Id, cancellationToken);
            if (category is null || !category.Active || category.CategoryType != request.MovementType)
            {
                throw new InvalidOperationException("La categoría especificada no existe, está inactiva o no coincide con el tipo de movimiento.");
            }

            // 1. Revertir saldo anterior
            if (oldAccount != null)
            {
                decimal oldBalanceImpact = movement.MovementType == "Ingreso" ? -movement.Amount : movement.Amount;
                oldAccount.UpdateBalance(oldBalanceImpact);
            }

            // 2. Reemplazar por la entidad modificada conservando auditorías
            movementRepository.Remove(movement);

            var updatedMovement = new Movement(
                request.Description,
                request.Amount,
                request.Date,
                request.MovementType,
                user.Id,
                newAccount.AccountId,
                category.CategoryId,
                newAccount.CurrencyId,
                request.Note);

            // 3. Aplicar nuevo saldo
            decimal newBalanceImpact = updatedMovement.MovementType == "Ingreso" ? updatedMovement.Amount : -updatedMovement.Amount;
            newAccount.UpdateBalance(newBalanceImpact);

            movementRepository.Add(updatedMovement);
            await movementRepository.SaveChangesAsync(cancellationToken);

            var refreshed = await movementRepository.GetByIdAndUserIdAsync(updatedMovement.MovementId, user.Id, cancellationToken);
            return MapToResponseDTO(refreshed!);
        }

        public async Task<bool> DeleteAsync(string userEmail, Guid movementId, CancellationToken cancellationToken)
        {
            var user = await userService.GetValidUserAsync(userEmail, cancellationToken);
            var movement = await movementRepository.GetByIdAndUserIdAsync(movementId, user.Id, cancellationToken);
            if (movement is null) return false;

            // Revertir el saldo de la cuenta al eliminar el movimiento (CU13)
            var account = await accountRepository.GetByIdAndUserIdAsync(movement.AccountId, user.Id, cancellationToken);
            if (account != null)
            {
                decimal balanceImpact = movement.MovementType == "Ingreso" ? -movement.Amount : movement.Amount;
                account.UpdateBalance(balanceImpact);
            }

            movementRepository.Remove(movement);
            await movementRepository.SaveChangesAsync(cancellationToken);

            return true;
        }

        private static MovementResponseDTO MapToResponseDTO(Movement movement) => new()
        {
            MovementId = movement.MovementId,
            Description = movement.Description,
            Amount = movement.Amount,
            Date = movement.Date,
            MovementType = movement.MovementType,
            CategoryId = movement.CategoryId,
            CategoryDescription = movement.Category?.Description ?? string.Empty,
            AccountId = movement.AccountId,
            AccountDescription = movement.Account?.Description ?? string.Empty,
            CurrencyId = movement.CurrencyId,
            Note = movement.Note,
            CreationDate = movement.CreationDate
        };
    }
}
```

---

## `Finanzas.Application/Services/UserService.cs`

```csharp
using Finanzas.Application.DTOs.Response.Users;
using Finanzas.Application.Interfaces;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository userRepository;

        public UserService(IUserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        public async Task<User> GetValidUserAsync(string userEmail, CancellationToken cancellationToken)
        {
            var user = await userRepository.GetByEmailAsync(userEmail, cancellationToken);
            if (user == null)
            {
                throw new UnauthorizedAccessException("El usuario autenticado no existe en el sistema.");
            }
            return user;
        }

        // CU17: Obtener todos los usuarios sin exponer contraseñas ni hashes
        public async Task<IReadOnlyList<UserResponseDTO>> GetAllAsync(CancellationToken cancellationToken)
        {
            var users = await userRepository.GetAllAsync(cancellationToken);

            return users.Select(u => new UserResponseDTO
            {
                Id = u.Id,
                Email = u.Email,
                Name = u.Name,
                Surname = u.Surname,
                Status = u.Status,
                Role = u.TypeOfUser?.Description ?? "Customer"
            }).ToList();
        }

        // CU18: Activar, desactivar o bloquear un usuario usando el método de dominio ChangeStatus
        public async Task<bool> UpdateStatusAsync(Guid userId, string newStatus, CancellationToken cancellationToken)
        {
            var validStatuses = new[] { "Activo", "Inactivo", "Bloqueado" };

            if (string.IsNullOrWhiteSpace(newStatus) || !validStatuses.Contains(newStatus, StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException("El estado especificado no es válido. Debe ser 'Activo', 'Inactivo' o 'Bloqueado'.");
            }

            var user = await userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null) return false;

            // Invoca la encapsulación del dominio
            user.ChangeStatus(newStatus);

            await userRepository.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
```

---

## `Finanzas.Domain/Finanzas.Domain.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

</Project>
```

---

## `Finanzas.Domain/Interfaces/IAccountRepository.cs`

```csharp
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface IAccountRepository
    {
        Task<IReadOnlyList<Account>> GetAllByUserIdAsync(Guid userId, bool active, CancellationToken cancellationToken);
        Task<Account?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAndUserAsync(string description, Guid userId, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAndUserExcludingIdAsync(string description, Guid userId, Guid accountId, CancellationToken cancellationToken);
        Task<bool> HasMovementsAsync(Guid accountId, CancellationToken cancellationToken);
        void Add(Account account);
        void Remove(Account account);
        Task SaveChangesAsync(CancellationToken cancellationToken);
        Task<Currency?> GetCurrencyByIdAsync(Guid currencyId, CancellationToken ct);

    }
}
```

---

## `Finanzas.Domain/Interfaces/ICategoryRepository.cs`

```csharp
using Finanzas.Domain.Models;

namespace Finanzas.Domain.Interfaces
{
    public interface ICategoryRepository
    {
        Task<IReadOnlyList<Category>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken);
        Task<Category?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAndTypeAndUserAsync(string description, string categoryType, Guid userId, CancellationToken cancellationToken);
        Task<bool> ExistsByDescriptionAndTypeAndUserExcludingIdAsync(string description, string categoryType, Guid userId, Guid categoryId, CancellationToken cancellationToken);
        Task<bool> HasMovementsAsync(Guid categoryId, CancellationToken cancellationToken);
        void Add(Category category);
        void Remove(Category category);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Domain/Interfaces/ICurrencyRepository.cs`

```csharp
using Finanzas.Domain.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Domain.Interfaces
{
    public interface ICurrencyRepository
    {
        void Add(Currency currency);
        Task<IReadOnlyList<Currency>> GetAllAsync(CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Domain/Interfaces/IDollarQuoteProvider.cs`

```csharp
using Finanzas.Domain.Models;

namespace Finanzas.Domain.Interfaces;

public interface IDollarQuoteProvider
{
    Task<DollarQuote> GetLatestAsync(CancellationToken cancellationToken);
}
```

---

## `Finanzas.Domain/Interfaces/IExchangeRateRepository.cs`

```csharp
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Domain.Interfaces
{
    public interface IExchangeRateRepository
    {
        Task<ExchangeRate?> GetByCompositeKeyAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken);
        Task<ExchangeRate?> GetLatestPriorAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken);
        Task<ExchangeRate?> GetLatestAsync(Guid baseCurrencyId, Guid targetCurrencyId, CancellationToken cancellationToken);
        Task<IReadOnlyList<ExchangeRate>> GetAllAsync(Guid? baseCurrencyId, Guid? targetCurrencyId, DateTime? startDate, DateTime? endDate, CancellationToken cancellationToken);
        void Add(ExchangeRate exchangeRate);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
```

---

## `Finanzas.Domain/Interfaces/IMovementRepository.cs`

```csharp
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface IMovementRepository
    {
        Task<IReadOnlyList<Movement>> GetFilteredByUserIdAsync(
                                                                Guid userId,
                                                                string? movementType,
                                                                DateTime? startDate,
                                                                DateTime? endDate,
                                                                Guid? accountId,
                                                                Guid? categoryId,
                                                                CancellationToken cancellationToken);

        Task<IReadOnlyList<Movement>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken);

        // Panel de administración: movimientos de TODOS los usuarios (o de uno) en un rango de fechas, solo lectura.
        Task<IReadOnlyList<Movement>> GetForAnalyticsAsync(DateTime? startDate, DateTime? endDate, Guid? userId, CancellationToken cancellationToken);

        Task<Movement?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken);
        void Add(Movement movement);
        void Remove(Movement movement);
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }

}
```

---

## `Finanzas.Domain/Interfaces/IPasswordHasher.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface IPasswordHasher
    {
        string Hash(string password);

        bool Verify(string password, string passwordHash);
    }
}
```

---

## `Finanzas.Domain/Interfaces/ITokenRevocationStore.cs`

```csharp
namespace Finanzas.Domain.Interfaces
{
    // Registro de tokens JWT revocados (CU03: cerrar sesión invalida el token en el servidor).
    public interface ITokenRevocationStore
    {
        void Revoke(string tokenId, DateTime expiresAtUtc);
        bool IsRevoked(string tokenId);
    }
}
```

---

## `Finanzas.Domain/Interfaces/ITokenService.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(string username, string role);

        // Lee el identificador (jti) y el vencimiento de un token ya emitido. Devuelve false si el token es inválido.
        bool TryReadTokenInfo(string token, out string tokenId, out DateTime expiresAtUtc);
    }
}
```

---

## `Finanzas.Domain/Interfaces/IUserRepository.cs`

```csharp
using Finanzas.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<bool> ExistsEmailAsync(string email, CancellationToken cancellationToken = default);
        Task AddAsync(User user, CancellationToken cancellationToken = default);
        Task<TypeOfUser?> GetTypeOfUserByDescriptionAsync(string description, CancellationToken cancellationToken = default);
        Task AddTypeOfUserAsync(TypeOfUser typeOfUser, CancellationToken cancellationToken = default);
        Task SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
```

---

## `Finanzas.Domain/Models/Account.cs`

```csharp
namespace Finanzas.Domain.Models;


// Representa el lugar donde se registra el dinero, como efectivo o una cuenta bancaria.
public class Account
{

    // Clave primaria que corresponde a Cuentas.ID_Cuenta.
    public Guid AccountId { get; private set; }

    
    // Nombre visible de la cuenta.
    public string Description { get; private set; } = string.Empty;

    
    // Clasifica la cuenta como efectivo, bancaria o billetera virtual.
    public string AccountType { get; private set; } = string.Empty;


    // Permite dejar de utilizar la cuenta sin borrar movimientos anteriores.
    public bool Active { get; private set; } = true;

    public decimal Balance { get; private set; } = 0;




    // Navegación hacia los movimientos registrados en esta cuenta.
    // El saldo se calcula desde esta relación y no se almacena en Cuenta.
    public ICollection<Movement> Movements { get; private set; } = new List<Movement>();


    // Foreign Key a User
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    // Foreign Key a Moneda 
    public Guid CurrencyId { get; private set; }
    public Currency Currency { get; private set; } = null!;




    // Constructor sin parámetros requerido por Entity Framework Core
    protected Account() { }

    //Constructor
    public Account(string description, string accountType, Guid userId, Guid currencyId)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("La descripción de la cuenta es obligatoria.", nameof(description));

        if (string.IsNullOrWhiteSpace(accountType))
            throw new ArgumentException("El tipo de cuenta es obligatorio.", nameof(accountType));

        if (userId == Guid.Empty)
            throw new ArgumentException("La cuenta debe pertenecer a un usuario válido.", nameof(userId));

        if (currencyId == Guid.Empty)
            throw new ArgumentException("La cuenta debe tener una moneda asociada.", nameof(currencyId));

        AccountId = Guid.NewGuid();
        Description = description.Trim();
        AccountType = accountType.Trim();
        UserId = userId;
        CurrencyId = currencyId;
    }

    // Métodos de comportamiento opcionales para alterar estado de forma controlada
    public void UpdateDescription(string newDescription)
    {
        if (string.IsNullOrWhiteSpace(newDescription))
            throw new ArgumentException("La descripción no puede estar vacía.", nameof(newDescription));
        Description = newDescription.Trim();
    }

    public void Update(string description, string accountType, Guid currencyId)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("La descripción de la cuenta es obligatoria.", nameof(description));

        if (string.IsNullOrWhiteSpace(accountType))
            throw new ArgumentException("El tipo de cuenta es obligatorio.", nameof(accountType));

        if (currencyId == Guid.Empty)
            throw new ArgumentException("La cuenta debe tener una moneda asociada.", nameof(currencyId));

        Description = description.Trim();
        AccountType = accountType.Trim();
        CurrencyId = currencyId;
    }

    public void UpdateBalance(decimal amountChange)
    {
         Balance += amountChange;
    }

    public void Deactivate() => Active = false;
    public void Activate() => Active = true;
}
```

---

## `Finanzas.Domain/Models/AccountTypes.cs`

```csharp
namespace Finanzas.Domain.Models;

// Valores permitidos para Account.AccountType.
// Deben coincidir EXACTAMENTE con el CHECK CK_Accounts_AccountType de SQL Server:
//   AccountType IN ('Efectivo', 'Cuenta Bancaria', 'Billetera Virtual')
public static class AccountTypes
{
    public const string Cash = "Efectivo";
    public const string BankAccount = "Cuenta Bancaria";
    public const string VirtualWallet = "Billetera Virtual";

    // Acepta el valor con o sin espacios y sin distinguir mayúsculas
    // ("CuentaBancaria", "Cuenta Bancaria", "cuenta bancaria") y devuelve la forma canónica que exige SQL Server.
    public static bool TryNormalize(string? value, out string normalized)
    {
        normalized = string.Empty;

        if (string.IsNullOrWhiteSpace(value)) return false;

        var key = new string(value.Where(c => !char.IsWhiteSpace(c)).ToArray());

        if (key.Equals("Efectivo", StringComparison.OrdinalIgnoreCase))
            normalized = Cash;
        else if (key.Equals("CuentaBancaria", StringComparison.OrdinalIgnoreCase))
            normalized = BankAccount;
        else if (key.Equals("BilleteraVirtual", StringComparison.OrdinalIgnoreCase))
            normalized = VirtualWallet;
        else
            return false;

        return true;
    }
}
```

---

## `Finanzas.Domain/Models/Category.cs`

```csharp
namespace Finanzas.Domain.Models;


// Clasifica un movimiento como ingreso o gasto.
public class Category
{
    // Clave primaria que corresponde a Categorias.ID_Categoria.
    public Guid CategoryId { get; private set; }

    
    // Nombre que se muestra al seleccionar la categoría.
    public string Description { get; private set; } = string.Empty;

    
    // Indica si la categoría se utiliza con movimientos de ingreso o gasto.
    public string CategoryType { get; private set; } = string.Empty;


    // Permite ocultar una categoría sin eliminar su historial.
    public bool Active { get; private set; } = true;

   
    // Navegación hacia los movimientos clasificados con esta categoría.
    // No representa una columna adicional en la base de datos.
    public ICollection<Movement> Movements { get; private set; } = new List<Movement>();


    // Foreign Key a User
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    protected Category() { }

    public Category(string description, string categoryType, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("La descripción de la categoría es obligatoria.", nameof(description));

        if (string.IsNullOrWhiteSpace(categoryType))
            throw new ArgumentException("El tipo de categoría es obligatorio.", nameof(categoryType));

        if (userId == Guid.Empty)
            throw new ArgumentException("La categoría debe pertenecer a un usuario válido.", nameof(userId));

        CategoryId = Guid.NewGuid();
        Description = description.Trim();
        CategoryType = categoryType.Trim();
        UserId = userId;
    }


    public void Update(string description, string categoryType)
    {
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("La descripción de la categoría es obligatoria.", nameof(description));

        if (string.IsNullOrWhiteSpace(categoryType))
            throw new ArgumentException("El tipo de categoría es obligatorio.", nameof(categoryType));

        Description = description.Trim();
        CategoryType = categoryType.Trim();
    }

    public void Deactivate() => Active = false;
    public void Activate() => Active = true;
}
```

---

## `Finanzas.Domain/Models/Currency.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Models
{
    // Representa una MONEDA utilizada en las cuentas y movimientos financieros.
    public class Currency
    {
        public Guid Id { get; private set; }
        public string Description { get; private set; } = string.Empty; // Ej: "Peso Argentino", "Dólar Estadounidense"

        public ICollection<Account> Accounts { get; private set; } = new List<Account>();
        public ICollection<Movement> Movements { get; private set; } = new List<Movement>();

        protected Currency() { }

        public Currency(string description)
        {
            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("La descripción de la moneda es obligatoria.", nameof(description));

            Id = Guid.NewGuid();
            Description = description.Trim();
        }
    }
}
```

---

## `Finanzas.Domain/Models/DollarQuote.cs`

```csharp
namespace Finanzas.Domain.Models;

// Resultado del proveedor: pesos argentinos por un dólar oficial, precio de venta.
// No es una entidad persistida: ExchangeRate representa el registro en la base.
public sealed record DollarQuote(decimal PesosPerDollar, DateTimeOffset UpdatedAt);
```

---

## `Finanzas.Domain/Models/ExchangeRate.cs`

```csharp
using System;

namespace Finanzas.Domain.Models
{

    //Representa la COTIZACION de una moneda base frente a una moneda cotizada en una fecha específica.
    public class ExchangeRate
    {
        public Guid BaseCurrencyId { get; private set; }
        public Currency BaseCurrency { get; private set; } = null!;

        public Guid TargetCurrencyId { get; private set; }
        public Currency TargetCurrency { get; private set; } = null!;

        public DateTime Date { get; private set; }
        public decimal Value { get; private set; }

        protected ExchangeRate() { }

        public ExchangeRate(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, decimal value)
        {
            if (baseCurrencyId == Guid.Empty)
                throw new ArgumentException("La moneda base es obligatoria.", nameof(baseCurrencyId));
            if (targetCurrencyId == Guid.Empty)
                throw new ArgumentException("La moneda cotizada es obligatoria.", nameof(targetCurrencyId));
            if (value <= 0)
                throw new ArgumentException("El valor de la cotización debe ser mayor a cero.", nameof(value));

            BaseCurrencyId = baseCurrencyId;
            TargetCurrencyId = targetCurrencyId;
            Date = date.Date; // Se guarda solo la fecha sin horas
            Value = value;
        }

        public void UpdateValue(decimal newValue)
        {
            if (newValue <= 0)
                throw new ArgumentException("El valor de la cotización debe ser mayor a cero.", nameof(newValue));

            Value = newValue;
        }
    }
}
```

---

## `Finanzas.Domain/Models/Movement.cs`

```csharp
namespace Finanzas.Domain.Models;


// Representa un ingreso o gasto asociado a una categoría y una cuenta.
public class Movement
{

    // Clave primaria que corresponde a Movimientos.ID_Movimiento.
    public Guid MovementId { get; private set; }

    // Motivo del movimiento.
    public string Description { get; private set; } = string.Empty;

   
    // Importe positivo del movimiento. TipoMovimiento determina si suma o resta.
    public decimal Amount { get; private set; }

   
    // Fecha financiera en la que ocurrió el movimiento.
    public DateTime Date { get; private set; }

   
    // Indica si el movimiento es un ingreso o un gasto.
    public string MovementType { get; private set; } = string.Empty;
   
    // Información adicional opcional.
    public string? Note { get; private set; }

    public DateTime CreationDate { get; private set; }

    // Foreign Keys
    public Guid UserId { get; private set; }
    public Guid AccountId { get; private set; }
    public Guid CategoryId { get; private set; }
    public Guid CurrencyId { get; private set; }

    // Navegaciones
    public User User { get; private set; } = null!;
    public Account Account { get; private set; } = null!;
    public Category Category { get; private set; } = null!;

    public Currency Currency { get; private set; } = null!;

    protected Movement() { }

    public Movement(
            string description,
            decimal amount,
            DateTime date,
            string movementType,
            Guid userId,
            Guid accountId,
            Guid categoryId,
            Guid currencyId,
            string? note = null)
    {
        
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("La descripción del movimiento es obligatoria.", nameof(description));
        
        if (amount <= 0)
            throw new ArgumentException("El importe debe ser mayor a cero.", nameof(amount));
        
        if (string.IsNullOrWhiteSpace(movementType))
            throw new ArgumentException("El tipo de movimiento es obligatorio.", nameof(movementType));
        
        if (userId == Guid.Empty)
            throw new ArgumentException("El movimiento debe estar asociado a un usuario.", nameof(userId));
        
        if (accountId == Guid.Empty)
            throw new ArgumentException("Debe asociar una cuenta válida.", nameof(accountId));
        
        if (categoryId == Guid.Empty)
            throw new ArgumentException("Debe asociar una categoría válida.", nameof(categoryId));
        
        if (currencyId == Guid.Empty)
            throw new ArgumentException("Debe especificar la moneda del movimiento.", nameof(currencyId));

        MovementId = Guid.NewGuid();
        Description = description.Trim();
        Amount = amount;
        Date = date;
        MovementType = movementType.Trim();
        UserId = userId;
        AccountId = accountId;
        CategoryId = categoryId;
        CurrencyId = currencyId;
        Note = note?.Trim();
        CreationDate = DateTime.UtcNow; // Auditoría 
    }
}
```

---

## `Finanzas.Domain/Models/QuoteProviderException.cs`

```csharp
namespace Finanzas.Domain.Models;

public sealed class QuoteProviderException(string message, Exception? innerException = null)
    : Exception(message, innerException);
```

---

## `Finanzas.Domain/Models/TypeOfUser.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Models
{
    public class TypeOfUser
    {
        public Guid Id { get; private set; } 
        public string Description { get; private set; } = string.Empty; // Ej: "Administrator", "Customer"

        // Propiedad de navegación
        public ICollection<User> Users { get; private set; } = new List<User>();

        protected TypeOfUser()
        {
        }

        public TypeOfUser(string description)
        {
            if (string.IsNullOrWhiteSpace(description))
                throw new ArgumentException("La descripción es obligatoria.", nameof(description));
            Id = Guid.NewGuid();
            Description = description;
        }
    }
}
```

---

## `Finanzas.Domain/Models/User.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Domain.Models
{
    public class User
    {
        public Guid Id { get; private set; }
        public string Email { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
        public string Name { get; private set; } = string.Empty;
        public string Surname { get; private set; } = string.Empty;
        public string Status { get; private set; } = "Activo"; // 'Activo', 'Inactivo', 'Bloqueado'

        // Relación con TypeOfUser (Foreign Key)
        public Guid TypeOfUserId { get; private set; }
        public TypeOfUser? TypeOfUser { get; set; }


     
        public ICollection<Account> Accounts { get; private set; } = new List<Account>();
        public ICollection<Category> Categories { get; private set; } = new List<Category>();
        public ICollection<Movement> Movements { get; private set; } = new List<Movement>();

        public User()
        {
        }

    public User(string email, string passwordHash, string name, string surname, Guid typeOfUserId)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("El email es obligatorio.", nameof(email));

        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("El hash del password es obligatorio.", nameof(passwordHash));

        if (typeOfUserId == Guid.Empty)
            throw new ArgumentException("El tipo de usuario es obligatorio.", nameof(typeOfUserId));

        Id = Guid.NewGuid();
        Email = email;
        PasswordHash = passwordHash;
        Name = name;
        Surname = surname;
        TypeOfUserId = typeOfUserId;
        
     }
        public void ChangeStatus(string newStatus)
        {
            if (string.IsNullOrWhiteSpace(newStatus))
                throw new ArgumentException("El estado es obligatorio.", nameof(newStatus));
            Status = newStatus.Trim();
        }
    }


}
```

---

## `Finanzas.Infrastructure/Finanzas.Infrastructure.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="BCrypt.Net-Next" Version="4.2.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.0.12" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="10.0.12">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.IdentityModel.JsonWebTokens" Version="8.23.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Finanzas.Application\Finanzas.Application.csproj" />
    <ProjectReference Include="..\Finanzas.Domain\Finanzas.Domain.csproj" />
  </ItemGroup>

</Project>
```

---

## `Finanzas.Infrastructure/ExternalServices/BCryptPasswordHasher.cs`

```csharp
using Finanzas.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Infrastructure.ExternalServices
{
    public class BCryptPasswordHasher : IPasswordHasher
    {
        public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

        public bool Verify(string password, string passwordHash) =>
            BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}
```

---

## `Finanzas.Infrastructure/ExternalServices/DollarApiQuoteProvider.cs`

```csharp
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;

namespace Finanzas.Infrastructure.ExternalServices;

public sealed class DollarApiQuoteProvider(HttpClient httpClient) : IDollarQuoteProvider
{
    public async Task<DollarQuote> GetLatestAsync(CancellationToken cancellationToken)
    {
        try
        {
            var response = await httpClient.GetFromJsonAsync<DollarApiResponse>(
                "v1/dolares/oficial", cancellationToken);

            if (response is null || response.Sell <= 0 || response.UpdatedAt == default
                || response.UpdatedAt > DateTimeOffset.UtcNow.AddMinutes(5)
                || response.Currency != "USD" || response.Market != "oficial")
            {
                throw new QuoteProviderException("El proveedor devolvió una cotización inválida o incompleta.");
            }

            return new DollarQuote(response.Sell, response.UpdatedAt);
        }
        catch (HttpRequestException ex)
        {
            throw new QuoteProviderException("No se pudo consultar el proveedor de cotizaciones.", ex);
        }
        catch (JsonException ex)
        {
            throw new QuoteProviderException("La respuesta del proveedor no tiene el formato esperado.", ex);
        }
        catch (OperationCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            throw new QuoteProviderException("El proveedor de cotizaciones superó el tiempo de espera.", ex);
        }
    }

    private sealed class DollarApiResponse
    {
        [JsonPropertyName("moneda")]
        public string? Currency { get; set; }
        [JsonPropertyName("casa")]
        public string? Market { get; set; }
        [JsonPropertyName("venta")]
        public decimal Sell { get; set; }
        [JsonPropertyName("fechaActualizacion")]
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
```

---

## `Finanzas.Infrastructure/ExternalServices/DollarApiSettings.cs`

```csharp
namespace Finanzas.Infrastructure.ExternalServices;

public sealed class DollarApiSettings
{
    public const string SectionName = "DollarApi";
    public string BaseUrl { get; set; } = "https://dolarapi.com/";
}
```

---

## `Finanzas.Infrastructure/ExternalServices/InMemoryTokenRevocationStore.cs`

```csharp
using Finanzas.Domain.Interfaces;
using System.Collections.Concurrent;

namespace Finanzas.Infrastructure.ExternalServices
{
    // Guarda en memoria los jti de los tokens revocados hasta que vencen.
    // Se registra como Singleton. Limitación: se pierde al reiniciar la API y no se comparte entre varias instancias.
    public sealed class InMemoryTokenRevocationStore : ITokenRevocationStore
    {
        private readonly ConcurrentDictionary<string, DateTime> revokedTokens = new();

        public void Revoke(string tokenId, DateTime expiresAtUtc)
        {
            PurgeExpired();
            revokedTokens[tokenId] = expiresAtUtc;
        }

        public bool IsRevoked(string tokenId) =>
            !string.IsNullOrEmpty(tokenId) && revokedTokens.ContainsKey(tokenId);

        // Un token vencido ya no es válido por sí mismo, así que no hace falta recordarlo.
        private void PurgeExpired()
        {
            var now = DateTime.UtcNow;
            foreach (var item in revokedTokens)
            {
                if (item.Value <= now)
                    revokedTokens.TryRemove(item.Key, out _);
            }
        }
    }
}
```

---

## `Finanzas.Infrastructure/ExternalServices/JwtSettings.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Infrastructure.ExternalServices
{
    public class JwtSettings
    {
        public const string SectionName = "Jwt";

        public string Key { get; set; } = string.Empty;

        public string Issuer { get; set; } = string.Empty;

        public string Audience { get; set; } = string.Empty;

        public int ExpirationMinutes { get; set; } = 60;
    }
}
```

---

## `Finanzas.Infrastructure/ExternalServices/JwtTokenService.cs`

```csharp
using Finanzas.Domain.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace Finanzas.Infrastructure.ExternalServices
{
    public class JwtTokenService : ITokenService
    {
        private readonly JwtSettings settings;

        public JwtTokenService(IOptions<JwtSettings> settings)
        {
            this.settings = settings.Value;
        }

        public string GenerateToken(string username, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key));

            var descriptor = new SecurityTokenDescriptor
            {
                Issuer = settings.Issuer,
                Audience = settings.Audience,
                Expires = DateTime.UtcNow.AddMinutes(settings.ExpirationMinutes),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, username),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Name, username),
                    new Claim(ClaimTypes.Role, role)
                })
            };

            return new JsonWebTokenHandler().CreateToken(descriptor);
        }

        public bool TryReadTokenInfo(string token, out string tokenId, out DateTime expiresAtUtc)
        {
            tokenId = string.Empty;
            expiresAtUtc = DateTime.MinValue;

            try
            {
                var jwt = new JsonWebTokenHandler().ReadJsonWebToken(token);

                if (string.IsNullOrWhiteSpace(jwt.Id)) return false;

                tokenId = jwt.Id;
                expiresAtUtc = jwt.ValidTo;
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
```

---

## `Finanzas.Infrastructure/Migrations/20260921014051_InitialEntities.cs`

```csharp
using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AccountType = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.AccountId);
                    table.CheckConstraint("CK_Accounts_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
                    table.CheckConstraint("CK_Accounts_AccountType", "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CategoryType = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryId);
                    table.CheckConstraint("CK_Categories_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
                    table.CheckConstraint("CK_Categories_CategoryType", "CategoryType IN ('Ingreso', 'Gasto')");
                });

            migrationBuilder.CreateTable(
                name: "Movements",
                columns: table => new
                {
                    MovementId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    MovementType = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AdditionalInformation = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreationDate = table.Column<DateTime>(type: "datetime2(0)", nullable: false, defaultValueSql: "SYSDATETIME()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Movements", x => x.MovementId);
                    table.CheckConstraint("CK_Movements_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
                    table.CheckConstraint("CK_Movements_Amount", "Amount > 0");
                    table.CheckConstraint("CK_Movements_MovementType", "MovementType IN ('Ingreso', 'Gasto')");
                    table.ForeignKey(
                        name: "FK_Movements_Categories",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "CategoryId");
                    table.ForeignKey(
                        name: "FK_Movements_Accounts",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "AccountId");
                });

            migrationBuilder.CreateIndex(
                name: "UQ_Accounts_Description",
                table: "Accounts",
                column: "Description",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_Categories_Description_CategoryType",
                table: "Categories",
                columns: new[] { "Description", "CategoryType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Movements_Date",
                table: "Movements",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Movements_CategoryId",
                table: "Movements",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Movements_AccountId",
                table: "Movements",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Movements_MovementType_Date",
                table: "Movements",
                columns: new[] { "MovementType", "Date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Movements");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Accounts");
        }
    }
}
```

---

## `Finanzas.Infrastructure/Migrations/20261018201328_AddUsersAndTypeOfUsers.cs`

```csharp
using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUsersAndTypeOfUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TypeOfUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TypeOfUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "varchar(150)", unicode: false, maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Surname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    TypeOfUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.CheckConstraint("CK_Users_Email", "LEN(LTRIM(RTRIM(Email))) > 0");
                    table.ForeignKey(
                        name: "FK_Users_TypeOfUsers",
                        column: x => x.TypeOfUserId,
                        principalTable: "TypeOfUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "UQ_TypeOfUsers_Description",
                table: "TypeOfUsers",
                column: "Description",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_TypeOfUserId",
                table: "Users",
                column: "TypeOfUserId");

            migrationBuilder.CreateIndex(
                name: "UQ_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "TypeOfUsers");
        }
    }
}
```

---

## `Finanzas.Infrastructure/Migrations/20261026034227_InitialCreate.cs`

```csharp
using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Categories",
                table: "Movements");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Accounts",
                table: "Movements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Movements",
                table: "Movements");

            migrationBuilder.DropIndex(
                name: "IX_Movements_MovementType_Date",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_Description",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_Amount",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_MovementType",
                table: "Movements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categories",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "UQ_Categories_Description_CategoryType",
                table: "Categories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Categories_Description",
                table: "Categories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Categories_CategoryType",
                table: "Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts");

            migrationBuilder.DropIndex(
                name: "UQ_Accounts_Description",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_Description",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "Active",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AdditionalInformation",
                table: "Movements");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Activo");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Movements",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrencyId",
                table: "Movements",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Movements",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Movements",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<decimal>(
                name: "Balance",
                table: "Accounts",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrencyId",
                table: "Accounts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Accounts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_Movements",
                table: "Movements",
                column: "MovementId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categories",
                table: "Categories",
                column: "CategoryId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts",
                column: "AccountId");

            migrationBuilder.CreateTable(
                name: "Currencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Currencies", x => x.Id);
                    table.CheckConstraint("CK_Currencies_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
                });

            migrationBuilder.CreateTable(
                name: "ExchangeRates",
                columns: table => new
                {
                    BaseCurrencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetCurrencyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeRates", x => new { x.BaseCurrencyId, x.TargetCurrencyId, x.Date });
                    table.CheckConstraint("CK_ExchangeRates_Value", "Value > 0");
                    table.ForeignKey(
                        name: "FK_ExchangeRates_BaseCurrency",
                        column: x => x.BaseCurrencyId,
                        principalTable: "Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExchangeRates_TargetCurrency",
                        column: x => x.TargetCurrencyId,
                        principalTable: "Currencies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Users_Status",
                table: "Users",
                sql: "Status IN ('Activo', 'Inactivo', 'Bloqueado')");

            migrationBuilder.CreateIndex(
                name: "IX_Movements_CurrencyId",
                table: "Movements",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_Movements_UserId",
                table: "Movements",
                column: "UserId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_Amount",
                table: "Movements",
                sql: "Amount > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_Description",
                table: "Movements",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_MovementType",
                table: "Movements",
                sql: "MovementType IN ('Ingreso', 'Gasto')");

            migrationBuilder.CreateIndex(
                name: "UQ_Categories_User_Description_Type",
                table: "Categories",
                columns: new[] { "UserId", "Description", "CategoryType" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Categories_CategoryType",
                table: "Categories",
                sql: "CategoryType IN ('Ingreso', 'Gasto')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Categories_Description",
                table: "Categories",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_CurrencyId",
                table: "Accounts",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "UQ_Accounts_User_Description",
                table: "Accounts",
                columns: new[] { "UserId", "Description" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts",
                sql: "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_Description",
                table: "Accounts",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.CreateIndex(
                name: "UQ_Currencies_Description",
                table: "Currencies",
                column: "Description",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TargetCurrencyId",
                table: "ExchangeRates",
                column: "TargetCurrencyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Currencies",
                table: "Accounts",
                column: "CurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Users",
                table: "Accounts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Users",
                table: "Categories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Accounts",
                table: "Movements",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "AccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Categories",
                table: "Movements",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Currencies",
                table: "Movements",
                column: "CurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Users",
                table: "Movements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Currencies",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Users",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Users",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Accounts",
                table: "Movements");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Categories",
                table: "Movements");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Currencies",
                table: "Movements");

            migrationBuilder.DropForeignKey(
                name: "FK_Movements_Users",
                table: "Movements");

            migrationBuilder.DropTable(
                name: "ExchangeRates");

            migrationBuilder.DropTable(
                name: "Currencies");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Users_Status",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Movements",
                table: "Movements");

            migrationBuilder.DropIndex(
                name: "IX_Movements_CurrencyId",
                table: "Movements");

            migrationBuilder.DropIndex(
                name: "IX_Movements_UserId",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_Amount",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_Description",
                table: "Movements");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movements_MovementType",
                table: "Movements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categories",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "UQ_Categories_User_Description_Type",
                table: "Categories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Categories_CategoryType",
                table: "Categories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Categories_Description",
                table: "Categories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts");

            migrationBuilder.DropIndex(
                name: "IX_Accounts_CurrencyId",
                table: "Accounts");

            migrationBuilder.DropIndex(
                name: "UQ_Accounts_User_Description",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_Description",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "Movements");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Movements");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Movements");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "Balance",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Accounts");

            migrationBuilder.AddColumn<bool>(
                name: "Active",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Movements",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<string>(
                name: "AdditionalInformation",
                table: "Movements",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Movements",
                table: "Movements",
                column: "MovementId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categories",
                table: "Categories",
                column: "CategoryId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Accounts",
                table: "Accounts",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Movements_MovementType_Date",
                table: "Movements",
                columns: new[] { "MovementType", "Date" });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_Description",
                table: "Movements",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_Amount",
                table: "Movements",
                sql: "Amount > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movements_MovementType",
                table: "Movements",
                sql: "MovementType IN ('Ingreso', 'Gasto')");

            migrationBuilder.CreateIndex(
                name: "UQ_Categories_Description_CategoryType",
                table: "Categories",
                columns: new[] { "Description", "CategoryType" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Categories_Description",
                table: "Categories",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Categories_CategoryType",
                table: "Categories",
                sql: "CategoryType IN ('Ingreso', 'Gasto')");

            migrationBuilder.CreateIndex(
                name: "UQ_Accounts_Description",
                table: "Accounts",
                column: "Description",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_Description",
                table: "Accounts",
                sql: "LEN(LTRIM(RTRIM(Description))) > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts",
                sql: "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Categories",
                table: "Movements",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Movements_Accounts",
                table: "Movements",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "AccountId");
        }
    }
}
```

---

## `Finanzas.Infrastructure/Migrations/20261027025456_AddNewTables.cs`

```csharp
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNewTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
```

---

## `Finanzas.Infrastructure/Migrations/20261111003821_NuevaMigracion.cs`

```csharp
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NuevaMigracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
```

---

## `Finanzas.Infrastructure/Migrations/20261111004435_SeedBaseCurrencies.cs`

```csharp
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedBaseCurrencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Datos de referencia: conservar los IDs si la moneda ya existe.
            migrationBuilder.Sql("""
                IF NOT EXISTS (
                    SELECT 1 FROM dbo.Currencies WITH (UPDLOCK, HOLDLOCK)
                    WHERE Description = N'Pesos Argentinos')
                BEGIN
                    INSERT INTO dbo.Currencies (Id, Description)
                    VALUES (NEWID(), N'Pesos Argentinos');
                END;

                IF NOT EXISTS (
                    SELECT 1 FROM dbo.Currencies WITH (UPDLOCK, HOLDLOCK)
                    WHERE Description = N'Dólar Estadounidense')
                BEGIN
                    INSERT INTO dbo.Currencies (Id, Description)
                    VALUES (NEWID(), N'Dólar Estadounidense');
                END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Se conservan: podrían existir antes de la migración o estar usadas
            // por cuentas, movimientos y cotizaciones. No borrar datos de negocio.
        }
    }
}
```

---

## `Finanzas.Infrastructure/Migrations/20261111040117_UpdateAccountTypeCheckConstraint.cs`

```csharp
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAccountTypeCheckConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts",
                sql: "AccountType IN ('Efectivo', 'Cuenta Bancaria', 'Billetera Virtual')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Accounts_AccountType",
                table: "Accounts",
                sql: "AccountType IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual')");
        }
    }
}
```

---

## `Finanzas.Infrastructure/Migrations/20261125221955_AgregoMetodos.cs`

```csharp
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Finanzas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AgregoMetodos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
```

---

## `Finanzas.Infrastructure/Persistence/FinanzasDbContext.cs`

```csharp
using Finanzas.Domain.Models;
using Microsoft.EntityFrameworkCore;


namespace Finanzas.Infrastructure.Persistence;

// Representa una sesión de trabajo de Entity Framework Core con la base FinanzasPersonales.
public class FinanzasDbContext(DbContextOptions<FinanzasDbContext> options)
    : DbContext(options)
{




    // Conjunto consultable asociado a la tabla Categorias.
    public DbSet<Category> Categories => Set<Category>();


    // Conjunto consultable asociado a la tabla Cuentas.
    public DbSet<Account> Accounts => Set<Account>();

    
    // Conjunto consultable asociado a la tabla Movimientos.
    public DbSet<Movement> Movements => Set<Movement>();


    
    // Conjunto consultable asociado a la tabla Usuarios.
    public DbSet<User> Users => Set<User>();

   
    // Conjunto consultable asociado a la tabla Tipos de Usuario.
    public DbSet<TypeOfUser> TypeOfUsers => Set<TypeOfUser>();


    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<ExchangeRate> ExchangeRates => Set<ExchangeRate>();



    // Describe explícitamente cómo se relacionan las clases C# con el esquema SQL existente.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureCategory(modelBuilder);
        ConfigureAccount(modelBuilder);
        ConfigureMovement(modelBuilder);
        ConfigureTypeOfUser(modelBuilder); 
        ConfigureUser(modelBuilder);
        ConfigureCurrency(modelBuilder);
        ConfigureExchangeRate(modelBuilder);
    }

    private static void ConfigureCategory(ModelBuilder modelBuilder)
    {
        var category = modelBuilder.Entity<Category>();

        category.ToTable("Categories", tabla =>
        {
            tabla.HasCheckConstraint("CK_Categories_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
            tabla.HasCheckConstraint("CK_Categories_CategoryType", "CategoryType IN ('Ingreso', 'Gasto')");
        });

        category.HasKey(item => item.CategoryId)
            .HasName("PK_Categories");

        category.Property(item => item.CategoryId)
            .ValueGeneratedOnAdd();

        category.Property(item => item.Description)
            .HasMaxLength(100)
            .IsRequired();

        category.Property(item => item.CategoryType)
            .HasMaxLength(10)
            .IsUnicode(false)
            .IsRequired();

        category.Property(item => item.Active)
            .HasDefaultValue(true)
            .IsRequired();

        // Relación con User
        category.HasOne(item => item.User)
            .WithMany(user => user.Categories)
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Categories_Users");

        // Índice único por usuario, nombre y tipo de categoría
        category.HasIndex(item => new { item.UserId, item.Description, item.CategoryType })
            .IsUnique()
            .HasDatabaseName("UQ_Categories_User_Description_Type");
    }

    private static void ConfigureAccount(ModelBuilder modelBuilder)
    {
        var account = modelBuilder.Entity<Account>();

        account.ToTable("Accounts", tabla =>
        {
            tabla.HasCheckConstraint("CK_Accounts_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
            tabla.HasCheckConstraint("CK_Accounts_AccountType", "AccountType IN ('Efectivo', 'Cuenta Bancaria', 'Billetera Virtual')");
        });

        account.HasKey(item => item.AccountId)
            .HasName("PK_Accounts");

        account.Property(item => item.AccountId)
            .ValueGeneratedOnAdd();

        account.Property(item => item.Description)
            .HasMaxLength(100)
            .IsRequired();

        account.Property(item => item.AccountType)
            .HasMaxLength(20)
            .IsUnicode(false)
            .IsRequired();

        account.Property(item => item.Balance)
            .HasPrecision(18, 2)
            .IsRequired()
            .HasDefaultValue(0);

        account.Property(item => item.Active)
            .HasDefaultValue(true)
            .IsRequired();

        // Relación con User
        account.HasOne(item => item.User)
            .WithMany(user => user.Accounts)
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Accounts_Users");

        // Relación con Currency
        account.HasOne(item => item.Currency)
            .WithMany(currency => currency.Accounts)
            .HasForeignKey(item => item.CurrencyId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Accounts_Currencies");

        // Índice único por usuario y nombre de cuenta
        account.HasIndex(item => new { item.UserId, item.Description })
            .IsUnique()
            .HasDatabaseName("UQ_Accounts_User_Description");
    }

    private static void ConfigureMovement(ModelBuilder modelBuilder)
    {
        var movement = modelBuilder.Entity<Movement>();

        movement.ToTable("Movements", tabla =>
        {
            tabla.HasCheckConstraint("CK_Movements_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
            tabla.HasCheckConstraint("CK_Movements_Amount", "Amount > 0");
            tabla.HasCheckConstraint("CK_Movements_MovementType", "MovementType IN ('Ingreso', 'Gasto')");
        });

        movement.HasKey(item => item.MovementId)
            .HasName("PK_Movements");

        movement.Property(item => item.MovementId)
            .ValueGeneratedOnAdd();

        movement.Property(item => item.Description)
            .HasMaxLength(255)
            .IsRequired();

        movement.Property(item => item.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        movement.Property(item => item.Date)
            .HasColumnType("date")
            .IsRequired();

        movement.Property(item => item.MovementType)
            .HasMaxLength(10)
            .IsUnicode(false)
            .IsRequired();

        movement.Property(item => item.Note)
            .HasMaxLength(255);

        movement.Property(item => item.CreationDate)
            .HasColumnType("datetime2(0)")
            .HasDefaultValueSql("SYSDATETIME()")
            .ValueGeneratedOnAdd();

        // Relaciones: 

        //User
        movement.HasOne(item => item.User)
            .WithMany(user => user.Movements)
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Movements_Users");

        //Account
        movement.HasOne(item => item.Account)
            .WithMany(account => account.Movements)
            .HasForeignKey(item => item.AccountId)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Movements_Accounts");

        //Category
        movement.HasOne(item => item.Category)
            .WithMany(category => category.Movements)
            .HasForeignKey(item => item.CategoryId)
            .OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("FK_Movements_Categories");
        //Currency
        movement.HasOne(item => item.Currency)
            .WithMany(currency => currency.Movements)
            .HasForeignKey(item => item.CurrencyId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_Movements_Currencies");

        // Índices de rendimiento
        movement.HasIndex(item => item.Date)
            .HasDatabaseName("IX_Movements_Date");

        movement.HasIndex(item => item.UserId)
            .HasDatabaseName("IX_Movements_UserId");

        movement.HasIndex(item => item.AccountId)
            .HasDatabaseName("IX_Movements_AccountId");

        movement.HasIndex(item => item.CategoryId)
            .HasDatabaseName("IX_Movements_CategoryId");
    }

    private static void ConfigureTypeOfUser(ModelBuilder modelBuilder)
    {
        var typeOfUser = modelBuilder.Entity<TypeOfUser>();

        typeOfUser.ToTable("TypeOfUsers");

        typeOfUser.HasKey(item => item.Id)
            .HasName("PK_TypeOfUsers");

        typeOfUser.Property(item => item.Id)
            .ValueGeneratedOnAdd();

        typeOfUser.Property(item => item.Description)
            .HasMaxLength(50)
            .IsRequired();

        typeOfUser.HasIndex(item => item.Description)
            .IsUnique()
            .HasDatabaseName("UQ_TypeOfUsers_Description");
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        var user = modelBuilder.Entity<User>();

        user.ToTable("Users", tabla =>
        {
            tabla.HasCheckConstraint("CK_Users_Email", "LEN(LTRIM(RTRIM(Email))) > 0");
            tabla.HasCheckConstraint("CK_Users_Status", "Status IN ('Activo', 'Inactivo', 'Bloqueado')");
        });

        user.HasKey(item => item.Id)
            .HasName("PK_Users");

        user.Property(item => item.Id)
            .ValueGeneratedOnAdd();

        user.Property(item => item.Email)
            .HasMaxLength(150)
            .IsUnicode(false)
            .IsRequired();

        user.Property(item => item.PasswordHash)
            .HasMaxLength(255)
            .IsRequired();

        user.Property(item => item.Name)
            .HasMaxLength(100)
            .IsRequired();

        user.Property(item => item.Surname)
            .HasMaxLength(100)
            .IsRequired();

        user.Property(item => item.Status)
                        .HasMaxLength(20)
                        .IsRequired()
                        .HasDefaultValue("Activo");

        // Relación con TypeOfUser
        user.HasOne(item => item.TypeOfUser)
                        .WithMany(type => type.Users)
                        .HasForeignKey(item => item.TypeOfUserId)
                        .OnDelete(DeleteBehavior.Restrict)
                        .HasConstraintName("FK_Users_TypeOfUsers");

        user.HasIndex(item => item.Email)
            .IsUnique()
            .HasDatabaseName("UQ_Users_Email");
    }

    private static void ConfigureCurrency(ModelBuilder modelBuilder)
    {
        var currency = modelBuilder.Entity<Currency>();

        currency.ToTable("Currencies", tabla =>
        {
            tabla.HasCheckConstraint("CK_Currencies_Description", "LEN(LTRIM(RTRIM(Description))) > 0");
        });

        currency.HasKey(item => item.Id)
            .HasName("PK_Currencies");

        currency.Property(item => item.Id)
            .ValueGeneratedOnAdd();

        currency.Property(item => item.Description)
            .HasMaxLength(50)
            .IsRequired();

        currency.HasIndex(item => item.Description)
            .IsUnique()
            .HasDatabaseName("UQ_Currencies_Description");
    }

    private static void ConfigureExchangeRate(ModelBuilder modelBuilder)
    {
        var exchangeRate = modelBuilder.Entity<ExchangeRate>();

        exchangeRate.ToTable("ExchangeRates", tabla =>
        {
            tabla.HasCheckConstraint("CK_ExchangeRates_Value", "Value > 0");
        });

        // Clave Primaria Compuesta 
        exchangeRate.HasKey(item => new { item.BaseCurrencyId, item.TargetCurrencyId, item.Date })
            .HasName("PK_ExchangeRates");

        exchangeRate.Property(item => item.Date)
            .HasColumnType("date")
            .IsRequired();

        exchangeRate.Property(item => item.Value)
            .HasPrecision(18, 6)
            .IsRequired();

        exchangeRate.HasOne(item => item.BaseCurrency)
            .WithMany()
            .HasForeignKey(item => item.BaseCurrencyId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_ExchangeRates_BaseCurrency");

        exchangeRate.HasOne(item => item.TargetCurrency)
            .WithMany()
            .HasForeignKey(item => item.TargetCurrencyId)
            .OnDelete(DeleteBehavior.Restrict)
            .HasConstraintName("FK_ExchangeRates_TargetCurrency");
    }
}
```

---

## `Finanzas.Infrastructure/Repositories/AccountRepository.cs`

```csharp
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Finanzas.Infrastructure.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly FinanzasDbContext context;

        public AccountRepository(FinanzasDbContext context)
        {
            this.context = context;
        }


        public async Task<IReadOnlyList<Account>> GetAllByUserIdAsync(Guid userId, bool onlyActive, CancellationToken ct) =>
       await context.Accounts
           .AsNoTracking()
           .Include(item => item.Currency)
           .Where(item => item.UserId == userId && (!onlyActive || item.Active))
           .OrderBy(item => item.Description)
           .ToListAsync(ct);

        public async Task<Account?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken ct) =>
    await context.Accounts
        .Include(item => item.Currency)
        .FirstOrDefaultAsync(item => item.AccountId == id && item.UserId == userId, ct);

        public async Task<Currency?> GetCurrencyByIdAsync(Guid currencyId, CancellationToken ct) =>
            await context.Currencies.FirstOrDefaultAsync(item => item.Id == currencyId, ct);

        public async Task<bool> ExistsByDescriptionAndUserAsync(string description, Guid userId, CancellationToken cancellationToken) =>
            await context.Accounts
                .AnyAsync(item => item.UserId == userId && item.Description == description, cancellationToken);


        public async Task<bool> ExistsByDescriptionAndUserExcludingIdAsync(string description, Guid userId, Guid accountId, CancellationToken cancellationToken) =>
            await context.Accounts
                .AnyAsync(item => item.UserId == userId && item.Description == description && item.AccountId != accountId, cancellationToken);

        public async Task<bool> HasMovementsAsync(Guid accountId, CancellationToken cancellationToken) =>
            await context.Movements
                .AnyAsync(item => item.AccountId == accountId, cancellationToken);

        public void Add(Account account) => context.Accounts.Add(account);

        public void Remove(Account account) => context.Accounts.Remove(account);


        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}
```

---

## `Finanzas.Infrastructure/Repositories/CategoryRepository.cs`

```csharp
using Finanzas.Domain.Models;
using Finanzas.Domain.Interfaces;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly FinanzasDbContext context;

        public CategoryRepository(FinanzasDbContext context)
        {
            this.context = context;
        }

        public async Task<IReadOnlyList<Category>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
            await context.Categories
                .AsNoTracking()
                .Where(item => item.UserId == userId)
                .OrderBy(item => item.Description)
                .ToListAsync(cancellationToken);

        public async Task<Category?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
            await context.Categories
                .FirstOrDefaultAsync(item => item.CategoryId == id && item.UserId == userId, cancellationToken);

        public async Task<bool> ExistsByDescriptionAndTypeAndUserAsync(string description, string categoryType, Guid userId, CancellationToken cancellationToken) =>
            await context.Categories
                .AnyAsync(item => item.UserId == userId && item.Description == description && item.CategoryType == categoryType, cancellationToken);
        public async Task<bool> ExistsByDescriptionAndTypeAndUserExcludingIdAsync(string description, string categoryType, Guid userId, Guid categoryId, CancellationToken cancellationToken) =>
            await context.Categories
                .AnyAsync(item => item.UserId == userId && item.Description == description && item.CategoryType == categoryType && item.CategoryId != categoryId, cancellationToken);

        public async Task<bool> HasMovementsAsync(Guid categoryId, CancellationToken cancellationToken) =>
            await context.Movements
                .AnyAsync(item => item.CategoryId == categoryId, cancellationToken);

        public void Add(Category category) => context.Categories.Add(category);

        public void Remove(Category category) => context.Categories.Remove(category);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}
```

---

## `Finanzas.Infrastructure/Repositories/CurrencyRepository.cs`

```csharp
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Infrastructure.Repositories
{
    public class CurrencyRepository : ICurrencyRepository
    {
        private readonly FinanzasDbContext context;

        public CurrencyRepository(FinanzasDbContext context)
        {
            this.context = context;
        }

        public void Add(Currency currency) => context.Currencies.Add(currency);

        public async Task<IReadOnlyList<Currency>> GetAllAsync(CancellationToken cancellationToken) =>
            await context.Currencies
                .AsNoTracking()
                .OrderBy(c => c.Description)
                .ToListAsync(cancellationToken);
    }
}
```

---

## `Finanzas.Infrastructure/Repositories/ExchangeRateRepository.cs`

```csharp
using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Finanzas.Infrastructure.Repositories
{
    public class ExchangeRateRepository : IExchangeRateRepository
    {
        private readonly FinanzasDbContext context;

        public ExchangeRateRepository(FinanzasDbContext context)
        {
            this.context = context;
        }

        public async Task<ExchangeRate?> GetByCompositeKeyAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken) =>
            await context.ExchangeRates
                .Include(e => e.BaseCurrency)
                .Include(e => e.TargetCurrency)
                .FirstOrDefaultAsync(e => e.BaseCurrencyId == baseCurrencyId &&
                                          e.TargetCurrencyId == targetCurrencyId &&
                                          e.Date.Date == date.Date, cancellationToken);

        public async Task<ExchangeRate?> GetLatestPriorAsync(Guid baseCurrencyId, Guid targetCurrencyId, DateTime date, CancellationToken cancellationToken) =>
            await context.ExchangeRates
                .Include(e => e.BaseCurrency)
                .Include(e => e.TargetCurrency)
                .Where(e => e.BaseCurrencyId == baseCurrencyId &&
                            e.TargetCurrencyId == targetCurrencyId &&
                            e.Date.Date <= date.Date)
                .OrderByDescending(e => e.Date)
                .FirstOrDefaultAsync(cancellationToken);

        // Última cotización guardada para el par, sin importar la fecha.
        public async Task<ExchangeRate?> GetLatestAsync(Guid baseCurrencyId, Guid targetCurrencyId, CancellationToken cancellationToken) =>
            await context.ExchangeRates
                .AsNoTracking()
                .Include(e => e.BaseCurrency)
                .Include(e => e.TargetCurrency)
                .Where(e => e.BaseCurrencyId == baseCurrencyId &&
                            e.TargetCurrencyId == targetCurrencyId)
                .OrderByDescending(e => e.Date)
                .FirstOrDefaultAsync(cancellationToken);

        // Historial de cotizaciones con filtros opcionales (solo lectura).
        public async Task<IReadOnlyList<ExchangeRate>> GetAllAsync(
            Guid? baseCurrencyId,
            Guid? targetCurrencyId,
            DateTime? startDate,
            DateTime? endDate,
            CancellationToken cancellationToken)
        {
            var query = context.ExchangeRates
                .AsNoTracking()
                .Include(e => e.BaseCurrency)
                .Include(e => e.TargetCurrency)
                .AsQueryable();

            if (baseCurrencyId.HasValue && baseCurrencyId.Value != Guid.Empty)
                query = query.Where(e => e.BaseCurrencyId == baseCurrencyId.Value);

            if (targetCurrencyId.HasValue && targetCurrencyId.Value != Guid.Empty)
                query = query.Where(e => e.TargetCurrencyId == targetCurrencyId.Value);

            if (startDate.HasValue)
                query = query.Where(e => e.Date >= startDate.Value.Date);

            if (endDate.HasValue)
                query = query.Where(e => e.Date <= endDate.Value.Date);

            return await query
                .OrderByDescending(e => e.Date)
                .ThenBy(e => e.BaseCurrency.Description)
                .ThenBy(e => e.TargetCurrency.Description)
                .ToListAsync(cancellationToken);
        }

        public void Add(ExchangeRate exchangeRate) => context.ExchangeRates.Add(exchangeRate);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}
```

---

## `Finanzas.Infrastructure/Repositories/MovementRepository.cs`

```csharp
using Finanzas.Domain.Models;
using Finanzas.Domain.Interfaces;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Infrastructure.Repositories
{
    public class MovementRepository : IMovementRepository
    {
        private readonly FinanzasDbContext context;

        public MovementRepository(FinanzasDbContext context)
        {
            this.context = context;
        }



        public async Task<IReadOnlyList<Movement>> GetFilteredByUserIdAsync(
            Guid userId,
            string? movementType,
            DateTime? startDate,
            DateTime? endDate,
            Guid? accountId,
            Guid? categoryId,
            CancellationToken cancellationToken)
        {
            var query = context.Movements
                .AsNoTracking()
                .Include(m => m.Category)
                .Include(m => m.Account)
                .Include(m => m.Currency)
                .Where(m => m.UserId == userId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(movementType))
            {
                query = query.Where(m => m.MovementType == movementType);
            }

            if (startDate.HasValue)
            {
                query = query.Where(m => m.Date >= startDate.Value.Date);
            }

            if (endDate.HasValue)
            {
                query = query.Where(m => m.Date <= endDate.Value.Date);
            }

            if (accountId.HasValue && accountId.Value != Guid.Empty)
            {
                query = query.Where(m => m.AccountId == accountId.Value);
            }

            if (categoryId.HasValue && categoryId.Value != Guid.Empty)
            {
                query = query.Where(m => m.CategoryId == categoryId.Value);
            }

            return await query
                .OrderByDescending(m => m.Date)
                .ThenByDescending(m => m.CreationDate)
                .ToListAsync(cancellationToken);
        }


        public async Task<IReadOnlyList<Movement>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken) =>
            await context.Movements
                .AsNoTracking()
                .Include(m => m.Category)
                .Include(m => m.Account)
                .Include(m => m.Currency)
                .Where(m => m.UserId == userId)
                .OrderByDescending(movement => movement.Date)
                .ThenByDescending(movement => movement.CreationDate)
                .ToListAsync(cancellationToken);

        public async Task<IReadOnlyList<Movement>> GetForAnalyticsAsync(
            DateTime? startDate,
            DateTime? endDate,
            Guid? userId,
            CancellationToken cancellationToken)
        {
            var query = context.Movements
                .AsNoTracking()
                .Include(m => m.User)
                .Include(m => m.Category)
                .Include(m => m.Currency)
                .AsQueryable();

            if (userId.HasValue && userId.Value != Guid.Empty)
            {
                query = query.Where(m => m.UserId == userId.Value);
            }

            if (startDate.HasValue)
            {
                query = query.Where(m => m.Date >= startDate.Value.Date);
            }

            if (endDate.HasValue)
            {
                query = query.Where(m => m.Date <= endDate.Value.Date);
            }

            return await query
                .OrderBy(m => m.Date)
                .ToListAsync(cancellationToken);
        }

        public async Task<Movement?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
            await context.Movements
                .Include(m => m.Category)
                .Include(m => m.Account)
                .Include(m => m.Currency)
                .FirstOrDefaultAsync(m => m.MovementId == id && m.UserId == userId, cancellationToken);

        public void Add(Movement movement) => context.Movements.Add(movement);

        public void Remove(Movement movement) => context.Movements.Remove(movement);

        public async Task SaveChangesAsync(CancellationToken cancellationToken) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}
```

---

## `Finanzas.Infrastructure/Repositories/UserRepository.cs`

```csharp

using Finanzas.Domain.Interfaces;
using Finanzas.Domain.Models;
using Finanzas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Finanzas.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly FinanzasDbContext context;

        public UserRepository(FinanzasDbContext context)
        {
            this.context = context;
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
            await context.Users
                .Include(u => u.TypeOfUser) // Traemos el rol asociado
                .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            await context.Users
                .Include(u => u.TypeOfUser)
                .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default) =>
            await context.Users
                .AsNoTracking()
                .Include(u => u.TypeOfUser)
                .OrderBy(u => u.Surname)
                .ThenBy(u => u.Name)
                .ToListAsync(cancellationToken);

        public async Task<bool> ExistsEmailAsync(string email, CancellationToken cancellationToken = default) =>
            await context.Users.AnyAsync(u => u.Email == email, cancellationToken);

        public async Task AddAsync(User user, CancellationToken cancellationToken = default) =>
            await context.Users.AddAsync(user, cancellationToken);

        public async Task<TypeOfUser?> GetTypeOfUserByDescriptionAsync(string description, CancellationToken cancellationToken = default) =>
            await context.TypeOfUsers.FirstOrDefaultAsync(t => t.Description == description, cancellationToken);

        public async Task AddTypeOfUserAsync(TypeOfUser typeOfUser, CancellationToken cancellationToken = default) =>
            await context.TypeOfUsers.AddAsync(typeOfUser, cancellationToken);

        public async Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
            await context.SaveChangesAsync(cancellationToken);
    }
}
```

---

## `database/README.md`

```markdown
# Base de datos

El esquema actual se administra con **Entity Framework Core y migraciones**, según el [README principal](../README.md#ejecutar-la-api-localmente).

- `Finanzas.Infrastructure/Migrations` contiene las migraciones y el snapshot actual.
- `SeedBaseCurrencies` agrega Pesos Argentinos y Dólar Estadounidense solo si faltan, sin cambiar los IDs existentes. Al revertir esta migración se conservan las monedas para proteger las referencias de cuentas, movimientos y cotizaciones. No inserta cotizaciones ni usuarios.
- `scripts/001_crear_estructura_inicial.sql` y `scripts/002_cargar_datos_iniciales.sql` son material histórico del modelo inicial en español. **No usarlos para instalar la API actual.**
- `traslado-datos-prueba.sql` documenta el traspaso local desde aquellas tablas antiguas. Requiere las tablas antiguas, destinos vacíos y el usuario indicado previamente registrado. No es un seed general ni corresponde a una instalación nueva.

Las cuentas actuales conservan un saldo que los servicios ajustan al crear, editar y eliminar movimientos. No se distribuyen backups ni credenciales de usuarios en el repositorio.
```

---

## `database/traslado-datos-prueba.sql`

```sql
-- Traslado local de datos antiguos. Requiere migraciones aplicadas y usuario registrado.
SET XACT_ABORT ON;
BEGIN TRANSACTION;
DECLARE @usuario uniqueidentifier=(SELECT Id FROM dbo.Users WHERE Email='demo.finanzas@example.test');
IF @usuario IS NULL THROW 50001, 'Falta registrar el usuario de prueba.', 1;
IF EXISTS(SELECT 1 FROM dbo.Accounts) OR EXISTS(SELECT 1 FROM dbo.Categories) OR EXISTS(SELECT 1 FROM dbo.Movements)
    THROW 50002, 'El destino debe estar vacio para evitar duplicaciones.', 1;
DECLARE @ars uniqueidentifier=NEWID();
INSERT dbo.Currencies(Id,Description) VALUES(@ars,N'Pesos Argentinos');
DECLARE @cuentas TABLE(Anterior int PRIMARY KEY, Nuevo uniqueidentifier);
DECLARE @categorias TABLE(Anterior int PRIMARY KEY, Nuevo uniqueidentifier);
INSERT @cuentas SELECT ID_Cuenta,NEWID() FROM dbo.Cuentas;
INSERT @categorias SELECT ID_Categoria,NEWID() FROM dbo.Categorias;
INSERT dbo.Accounts(AccountId,Description,AccountType,Active,Balance,CurrencyId,UserId)
SELECT m.Nuevo,c.Descripcion,c.TipoCuenta,c.Activa,0,@ars,@usuario FROM dbo.Cuentas c JOIN @cuentas m ON m.Anterior=c.ID_Cuenta;
INSERT dbo.Categories(CategoryId,Description,CategoryType,Active,UserId)
SELECT m.Nuevo,c.Descripcion,c.TipoCategoria,c.Activa,@usuario FROM dbo.Categorias c JOIN @categorias m ON m.Anterior=c.ID_Categoria;
IF EXISTS(SELECT 1 FROM dbo.Movimientos WHERE LEN(Nota)>255)
    THROW 50003, 'Una nota supera la longitud del modelo nuevo.', 1;
INSERT dbo.Movements(MovementId,Description,Amount,Date,MovementType,CategoryId,AccountId,Note,CreationDate,CurrencyId,UserId)
SELECT NEWID(),m.Descripcion,m.Importe,m.Fecha,m.TipoMovimiento,c.Nuevo,a.Nuevo,m.Nota,m.FechaCreacion,@ars,@usuario
FROM dbo.Movimientos m JOIN @categorias c ON c.Anterior=m.ID_Categoria JOIN @cuentas a ON a.Anterior=m.ID_Cuenta;
IF (SELECT COUNT(*) FROM dbo.Movements)<>(SELECT COUNT(*) FROM dbo.Movimientos)
    THROW 50004, 'No coinciden las cantidades de movimientos.', 1;
UPDATE a SET Balance=COALESCE((SELECT SUM(CASE WHEN m.MovementType='Ingreso' THEN m.Amount ELSE -m.Amount END) FROM dbo.Movements m WHERE m.AccountId=a.AccountId),0)
FROM dbo.Accounts a WHERE a.UserId=@usuario;
IF EXISTS(SELECT 1 FROM dbo.Movements m JOIN dbo.Categories c ON c.CategoryId=m.CategoryId WHERE c.CategoryType<>m.MovementType)
    THROW 50005, 'Hay tipos de movimiento incompatibles con su categoria.', 1;
COMMIT;
```

---

## `database/scripts/001_crear_estructura_inicial.sql`

```sql
/*
    Script 001 - Estructura inicial
    Motor: SQL Server

    Crea la base de datos solamente si todavía no existe. Luego crea las tablas
    Categorias, Cuentas y Movimientos con las reglas aprobadas para la versión 1.
*/

USE [master];
GO

IF DB_ID(N'FinanzasPersonales') IS NULL
BEGIN
    CREATE DATABASE [FinanzasPersonales];
END;
GO

USE [FinanzasPersonales];
GO

/*
    Categorias clasifica los movimientos como ingresos o gastos.
    Activa permite dejar de usar una categoría sin eliminar su historial.
*/
IF OBJECT_ID(N'dbo.Categorias', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categorias
    (
        ID_Categoria int IDENTITY(1,1) NOT NULL,
        Descripcion nvarchar(100) NOT NULL,
        TipoCategoria varchar(10) NOT NULL,
        Activa bit NOT NULL
            CONSTRAINT DF_Categorias_Activa DEFAULT (1),

        CONSTRAINT PK_Categorias
            PRIMARY KEY (ID_Categoria),

        CONSTRAINT UQ_Categorias_Descripcion_TipoCategoria
            UNIQUE (Descripcion, TipoCategoria),

        CONSTRAINT CK_Categorias_Descripcion
            CHECK (LEN(LTRIM(RTRIM(Descripcion))) > 0),

        CONSTRAINT CK_Categorias_TipoCategoria
            CHECK (TipoCategoria IN ('Ingreso', 'Gasto'))
    );
END;
GO

/*
    Cuentas representa dónde se encuentra el dinero. No contiene una columna de
    saldo porque ese valor siempre se calcula a partir de sus movimientos.
*/
IF OBJECT_ID(N'dbo.Cuentas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Cuentas
    (
        ID_Cuenta int IDENTITY(1,1) NOT NULL,
        Descripcion nvarchar(100) NOT NULL,
        TipoCuenta varchar(20) NOT NULL,
        Activa bit NOT NULL
            CONSTRAINT DF_Cuentas_Activa DEFAULT (1),

        CONSTRAINT PK_Cuentas
            PRIMARY KEY (ID_Cuenta),

        CONSTRAINT UQ_Cuentas_Descripcion
            UNIQUE (Descripcion),

        CONSTRAINT CK_Cuentas_Descripcion
            CHECK (LEN(LTRIM(RTRIM(Descripcion))) > 0),

        CONSTRAINT CK_Cuentas_TipoCuenta
            CHECK (TipoCuenta IN ('Efectivo', 'CuentaBancaria', 'BilleteraVirtual'))
    );
END;
GO

/*
    Movimientos es la fuente de verdad para ingresos y gastos. El importe siempre
    es positivo; TipoMovimiento determina cómo participa en los cálculos.
*/
IF OBJECT_ID(N'dbo.Movimientos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Movimientos
    (
        ID_Movimiento int IDENTITY(1,1) NOT NULL,
        Descripcion nvarchar(200) NOT NULL,
        Importe decimal(18,2) NOT NULL,
        Fecha date NOT NULL,
        TipoMovimiento varchar(10) NOT NULL,
        ID_Categoria int NOT NULL,
        ID_Cuenta int NOT NULL,
        Nota nvarchar(500) NULL,
        FechaCreacion datetime2(0) NOT NULL
            CONSTRAINT DF_Movimientos_FechaCreacion DEFAULT (SYSDATETIME()),

        CONSTRAINT PK_Movimientos
            PRIMARY KEY (ID_Movimiento),

        CONSTRAINT CK_Movimientos_Descripcion
            CHECK (LEN(LTRIM(RTRIM(Descripcion))) > 0),

        CONSTRAINT CK_Movimientos_Importe
            CHECK (Importe > 0),

        CONSTRAINT CK_Movimientos_TipoMovimiento
            CHECK (TipoMovimiento IN ('Ingreso', 'Gasto')),

        CONSTRAINT FK_Movimientos_Categorias
            FOREIGN KEY (ID_Categoria)
            REFERENCES dbo.Categorias (ID_Categoria),

        CONSTRAINT FK_Movimientos_Cuentas
            FOREIGN KEY (ID_Cuenta)
            REFERENCES dbo.Cuentas (ID_Cuenta)
    );
END;
GO

/* Los índices acompañan los filtros y cálculos que necesita el frontend. */
IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Movimientos_Fecha'
      AND object_id = OBJECT_ID(N'dbo.Movimientos')
)
BEGIN
    CREATE INDEX IX_Movimientos_Fecha
        ON dbo.Movimientos (Fecha);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Movimientos_ID_Categoria'
      AND object_id = OBJECT_ID(N'dbo.Movimientos')
)
BEGIN
    CREATE INDEX IX_Movimientos_ID_Categoria
        ON dbo.Movimientos (ID_Categoria);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Movimientos_ID_Cuenta'
      AND object_id = OBJECT_ID(N'dbo.Movimientos')
)
BEGIN
    CREATE INDEX IX_Movimientos_ID_Cuenta
        ON dbo.Movimientos (ID_Cuenta);
END;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Movimientos_TipoMovimiento_Fecha'
      AND object_id = OBJECT_ID(N'dbo.Movimientos')
)
BEGIN
    CREATE INDEX IX_Movimientos_TipoMovimiento_Fecha
        ON dbo.Movimientos (TipoMovimiento, Fecha);
END;
GO
```

---

## `database/scripts/002_cargar_datos_iniciales.sql`

```sql
/*
    Script 002 - Datos iniciales
    Motor: SQL Server

    Codificación del archivo: UTF-8. Con sqlcmd debe utilizarse la opción -f 65001.

    Incorpora los datos demostrativos utilizados por el frontend. El script puede
    ejecutarse nuevamente: cada INSERT comprueba primero que el registro no exista.
*/

USE [FinanzasPersonales];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    /* Categorías necesarias para clasificar los tres movimientos iniciales. */
    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Categorias
        WHERE Descripcion = N'Alimentación' AND TipoCategoria = 'Gasto'
    )
    BEGIN
        INSERT INTO dbo.Categorias (Descripcion, TipoCategoria)
        VALUES (N'Alimentación', 'Gasto');
    END;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Categorias
        WHERE Descripcion = N'Transporte' AND TipoCategoria = 'Gasto'
    )
    BEGIN
        INSERT INTO dbo.Categorias (Descripcion, TipoCategoria)
        VALUES (N'Transporte', 'Gasto');
    END;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Categorias
        WHERE Descripcion = N'Sueldo' AND TipoCategoria = 'Ingreso'
    )
    BEGIN
        INSERT INTO dbo.Categorias (Descripcion, TipoCategoria)
        VALUES (N'Sueldo', 'Ingreso');
    END;

    /* Las cuentas no almacenan saldo; solo identifican dónde ocurrió el movimiento. */
    IF NOT EXISTS (SELECT 1 FROM dbo.Cuentas WHERE Descripcion = N'Efectivo')
    BEGIN
        INSERT INTO dbo.Cuentas (Descripcion, TipoCuenta)
        VALUES (N'Efectivo', 'Efectivo');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Cuentas WHERE Descripcion = N'Cuenta bancaria')
    BEGIN
        INSERT INTO dbo.Cuentas (Descripcion, TipoCuenta)
        VALUES (N'Cuenta bancaria', 'CuentaBancaria');
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Cuentas WHERE Descripcion = N'Billetera virtual')
    BEGIN
        INSERT INTO dbo.Cuentas (Descripcion, TipoCuenta)
        VALUES (N'Billetera virtual', 'BilleteraVirtual');
    END;

    /* Se obtienen los identificadores generados en vez de suponer valores fijos. */
    DECLARE @ID_CategoriaAlimentacion int =
    (
        SELECT ID_Categoria FROM dbo.Categorias
        WHERE Descripcion = N'Alimentación' AND TipoCategoria = 'Gasto'
    );
    DECLARE @ID_CategoriaTransporte int =
    (
        SELECT ID_Categoria FROM dbo.Categorias
        WHERE Descripcion = N'Transporte' AND TipoCategoria = 'Gasto'
    );
    DECLARE @ID_CategoriaSueldo int =
    (
        SELECT ID_Categoria FROM dbo.Categorias
        WHERE Descripcion = N'Sueldo' AND TipoCategoria = 'Ingreso'
    );
    DECLARE @ID_CuentaEfectivo int =
        (SELECT ID_Cuenta FROM dbo.Cuentas WHERE Descripcion = N'Efectivo');
    DECLARE @ID_CuentaBancaria int =
        (SELECT ID_Cuenta FROM dbo.Cuentas WHERE Descripcion = N'Cuenta bancaria');
    DECLARE @ID_CuentaBilletera int =
        (SELECT ID_Cuenta FROM dbo.Cuentas WHERE Descripcion = N'Billetera virtual');

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Movimientos
        WHERE Descripcion = N'Supermercado'
          AND Fecha = '2026-08-15'
          AND TipoMovimiento = 'Gasto'
          AND ID_Categoria = @ID_CategoriaAlimentacion
          AND ID_Cuenta = @ID_CuentaEfectivo
    )
    BEGIN
        INSERT INTO dbo.Movimientos
            (Descripcion, Importe, Fecha, TipoMovimiento, ID_Categoria, ID_Cuenta)
        VALUES
            (N'Supermercado', 25000.00, '2026-08-15', 'Gasto',
             @ID_CategoriaAlimentacion, @ID_CuentaEfectivo);
    END;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Movimientos
        WHERE Descripcion = N'Sueldo'
          AND Fecha = '2026-08-10'
          AND TipoMovimiento = 'Ingreso'
          AND ID_Categoria = @ID_CategoriaSueldo
          AND ID_Cuenta = @ID_CuentaBancaria
    )
    BEGIN
        INSERT INTO dbo.Movimientos
            (Descripcion, Importe, Fecha, TipoMovimiento, ID_Categoria, ID_Cuenta)
        VALUES
            (N'Sueldo', 400000.00, '2026-08-10', 'Ingreso',
             @ID_CategoriaSueldo, @ID_CuentaBancaria);
    END;

    IF NOT EXISTS
    (
        SELECT 1 FROM dbo.Movimientos
        WHERE Descripcion = N'Transporte'
          AND Fecha = '2026-08-08'
          AND TipoMovimiento = 'Gasto'
          AND ID_Categoria = @ID_CategoriaTransporte
          AND ID_Cuenta = @ID_CuentaBilletera
    )
    BEGIN
        INSERT INTO dbo.Movimientos
            (Descripcion, Importe, Fecha, TipoMovimiento, ID_Categoria, ID_Cuenta)
        VALUES
            (N'Transporte', 5000.00, '2026-08-08', 'Gasto',
             @ID_CategoriaTransporte, @ID_CuentaBilletera);
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO

/* Resultado visible para comprobar qué datos quedaron almacenados. */
SELECT ID_Categoria, Descripcion, TipoCategoria, Activa
FROM dbo.Categorias
ORDER BY ID_Categoria;

SELECT ID_Cuenta, Descripcion, TipoCuenta, Activa
FROM dbo.Cuentas
ORDER BY ID_Cuenta;

SELECT
    m.ID_Movimiento,
    m.Descripcion,
    m.Importe,
    m.Fecha,
    m.TipoMovimiento,
    c.Descripcion AS Categoria,
    cu.Descripcion AS Cuenta
FROM dbo.Movimientos AS m
INNER JOIN dbo.Categorias AS c ON c.ID_Categoria = m.ID_Categoria
INNER JOIN dbo.Cuentas AS cu ON cu.ID_Cuenta = m.ID_Cuenta
ORDER BY m.Fecha DESC, m.ID_Movimiento DESC;
GO
```
