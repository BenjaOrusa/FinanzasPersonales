# Finanzas Personales — Programación IV

API para administrar cuentas, categorías y movimientos por usuario, consultar saldos y convertir movimientos a dólares con cotizaciones históricas. Alumnos: **Matías Soria y Benjamín Orusa**.

## Versión para evaluar

**`main` es la rama de versiones y de entrega.** Los cambios se integran primero en **`desarrollo`** y luego se pasan a `main` para publicar una versión. La API incluye DolarApi y actualización automática. La demostración funcional se realiza desde Swagger. El frontend está en desarrollo: todavía no tiene login ni envío de JWT.

```powershell
git clone --branch main https://github.com/BenjaOrusa/FinanzasPersonales.git
cd FinanzasPersonales
```

## Arquitectura

| Proyecto | Responsabilidad |
|---|---|
| `Finanzas.Api/Finanzas.Presentation.csproj` | Controladores, JWT, Swagger, inyección y tarea automática. |
| `Finanzas.Application` | Casos de uso, servicios y DTOs. |
| `Finanzas.Domain` | Entidades y contratos. |
| `Finanzas.Infrastructure` | EF Core, SQL Server, repositorios y clientes externos. |
| `finanzas.web` | React, TypeScript y Vite; interfaz en desarrollo. |

Entidades: User, TypeOfUser, Account, Category, Movement, Currency y ExchangeRate. La cotización tiene clave compuesta por moneda base, moneda destino y fecha.

## Ejecutar la API localmente

Requisitos: **SDK .NET 10**, **SQL Server** y certificado HTTPS de desarrollo confiable. Node.js y Visual Studio no son necesarios para evaluar solamente la API.

1. Restaurar el backend y la herramienta de migraciones:

   ```powershell
   dotnet restore .\Finanzas.Api\Finanzas.Presentation.csproj
   dotnet tool restore
   dotnet dev-certs https --trust
   ```

2. Configurar SQL Server. Development apunta a `localhost\SQL2022`, base `FinanzasPersonales`, con autenticación integrada. Si tu instancia es distinta, guardar la cadena localmente:

   ```powershell
   dotnet user-secrets set "ConnectionStrings:FinanzasPersonales" "Server=localhost;Database=FinanzasPersonales;Trusted_Connection=True;TrustServerCertificate=True" --project .\Finanzas.Api\Finanzas.Presentation.csproj
   ```

   Development incluye una clave JWT de ejemplo exclusivamente para pruebas locales. Se puede reemplazar con `dotnet user-secrets`, clave `Jwt:Key` (al menos 32 bytes). **No reutilizar la clave de ejemplo en Azure.**

3. Crear o actualizar la base mediante **migraciones EF Core**:

   ```powershell
   $env:ASPNETCORE_ENVIRONMENT = "Development"
   dotnet ef database update --project .\Finanzas.Infrastructure\Finanzas.Infrastructure.csproj --startup-project .\Finanzas.Api\Finanzas.Presentation.csproj
   ```

   La migración `SeedBaseCurrencies` crea Pesos Argentinos y Dólar Estadounidense si faltan, conservando los IDs de las monedas existentes. No depende de DolarApi ni carga cotizaciones. No ejecutar los scripts antiguos de `database/scripts`: pertenecen al modelo inicial en español. Las migraciones no crean usuarios ni contraseñas de prueba.

4. Iniciar:

   ```powershell
   dotnet run --project .\Finanzas.Api\Finanzas.Presentation.csproj --launch-profile https
   ```

   Abrir [Swagger local](https://localhost:7097/swagger). HTTPS: puerto 7097; HTTP: 5056. Desde la terminal puede ser necesario abrir el enlace manualmente.

## Probar desde Swagger

1. **POST `/api/Auth/register`**: registrar un usuario con `Email`, `Password`, `Name` y `Surname`. Su rol inicial es `Customer`.
2. **POST `/api/Auth/login`**: enviar `Email` y `Password`. Copiar solamente el valor de `Token`.
3. Pulsar **Authorize**, pegar el token sin comillas ni el prefijo `Bearer`, autorizar y cerrar el diálogo.
4. **GET `/api/Currency`**: consultar pesos argentinos y dólares, creados por las migraciones. Copiar el `Id` de la moneda para crear una cuenta. No es necesario importar cotizaciones antes de este paso.
5. **POST `/api/Account`** y **POST `/api/Category`**: crear una cuenta y una categoría. Usar sus identificadores para **POST `/api/Movement`**. Swagger muestra los campos requeridos.
6. **GET `/api/Movement`** y **GET `/api/FinancialSummary`**: consultar movimientos propios y resumen por moneda.
7. **GET `/api/ExchangeRate/movements-dollar-equivalent`**: consultar equivalencias históricas de los movimientos propios.

Para evaluar administración en una **base local propia**, registrar primero un usuario y ejecutar en SQL Server (reemplazar el email):

```sql
SET XACT_ABORT ON;
BEGIN TRANSACTION;
DECLARE @email varchar(150) = 'evaluador@example.test';
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = @email)
    THROW 50001, 'Primero registrar el usuario mediante la API.', 1;
DECLARE @role uniqueidentifier = (SELECT Id FROM dbo.TypeOfUsers WHERE Description = 'Administrator');
IF @role IS NULL
BEGIN
    SET @role = NEWID();
    INSERT INTO dbo.TypeOfUsers (Id, Description) VALUES (@role, 'Administrator');
END;
UPDATE dbo.Users SET TypeOfUserId = @role WHERE Email = @email;
COMMIT;
```

Volver a iniciar sesión después del cambio de rol y reemplazar el token en Swagger.

| Operación | Endpoint | Rol |
|---|---|---|
| Importar dólar oficial desde DolarApi, sin cuerpo | `POST /api/ExchangeRate/import-latest-dollar` | Administrator |
| Cargar o corregir una cotización por fecha | `POST /api/ExchangeRate` | Administrator |
| Consultar equivalencias propias | `GET /api/ExchangeRate/movements-dollar-equivalent` | Customer o Administrator |
| Consultar usuarios y modificar estado | `GET /api/User`, `PATCH /api/User/{userId}/status` | Administrator |

Sin token se responde 401; con rol insuficiente, 403.

## HTTPClient y cotización histórica

`Program.cs` registra `AddHttpClient<IDollarQuoteProvider, DollarApiQuoteProvider>`. El cliente tipado consulta el dólar oficial de [DolarApi](https://dolarapi.com/docs/argentina/operations/get-dolar-oficial), interpreta el JSON y entrega valor de venta y fecha al servicio de Application. Este guarda mediante el repositorio una fila USD → ARS por fecha.

- El valor expresa **pesos por dólar**: para convertir ARS a USD se divide el importe.
- Se usa la fecha del movimiento o la última cotización anterior disponible; nunca una posterior.
- Sin historial aplicable, la equivalencia es `null` y el estado lo explica.
- La fecha del proveedor se interpreta en horario argentino. Una respuesta antigua no se etiqueta como cotización de hoy.
- Se consulta al iniciar la API y cada 60 minutos mientras permanezca encendida. Configuración: `DollarQuoteRefresh`.
- Este endpoint del proveedor entrega la última cotización; no recupera días históricos faltantes. Se pueden incorporar con la carga manual.

Ver [el circuito completo y la guía de comprobación manual](docs/integracion-cotizaciones.md).

## Verificación

La entrega se verifica desde Swagger siguiendo los pasos anteriores. Comprobar el login, los permisos, la importación repetida sin duplicados y las equivalencias por fecha. El circuito con DolarApi y SQL Server se verificó localmente. El workflow restaura, compila y publica la API; esta versión de entrega no incluye un proyecto de pruebas automáticas.

## Frontend y Visual Studio

Seleccionar **Finanzas - API y Web** y pulsar F5 para iniciar ambos proyectos y abrir Swagger y el frontend. Para ejecutar Vite, instalar Node.js compatible con Vite 8, configurar `finanzas.web/.env` tomando `.env.example`, y ejecutar `npm ci` y `npm run dev` dentro de `finanzas.web`.

El frontend todavía necesita login, envío del token y adaptación de algunos contratos. **La evaluación de la API se puede realizar independientemente desde Swagger.**

## Despliegue y pendientes

El workflow está en `.github/workflows/deploy.yml`. Usa los secretos de GitHub `AZURE_WEBAPP_PUBLISH_PROFILE` y `DB_CONNECTION_STRING`. Azure debe configurar `ConnectionStrings__FinanzasPersonales`, `Jwt__Key`, `Jwt__Issuer` y `Jwt__Audience`; sus valores no deben guardarse en Git. Swagger solo está habilitado en Development.

La versión de esta rama se validó localmente; su despliegue externo debe verificarse antes de la defensa. Quedan pendientes la aplicación efectiva del bloqueo de usuarios al autenticar, el filtro de movimientos por descripción y el resumen agregado en dólares. La consulta individual de equivalencias ya está implementada.

[Documentación adicional](docs/README.md) · [Modelo y requisitos del proyecto](https://docs.google.com/document/d/1xi52OjGYQvuCaNKJFwmVZooCm0LKM_gQ-8Go5NzOvSM)
