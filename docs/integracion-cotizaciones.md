# Importación de dólar oficial

La integración sigue el cliente HTTP tipado del ejemplo Gestión Complejo.

## Recorrido

1. `ExchangeRateController` recibe `POST /api/ExchangeRate/import-latest-dollar`, protegido por la política `AdminsOnly`.
2. `ExchangeRateService` solicita la última cotización mediante `IDollarQuoteProvider` (Domain).
3. `DollarApiQuoteProvider` (Infrastructure) recibe `HttpClient` por constructor y consulta `GET v1/dolares/oficial`. Interpreta el JSON con `GetFromJsonAsync`.
4. Application usa `venta` como pesos por dólar y convierte `fechaActualizacion` al día de Argentina.
5. El servicio resuelve las monedas `Dólar Estadounidense` y `Pesos Argentinos` y guarda mediante el repositorio. La migración `SeedBaseCurrencies` ya deja ambas monedas disponibles, sin necesitar una consulta externa; el servicio conserva la creación si faltan como respaldo. El DbContext compartido persiste los cambios juntos.

`Program.cs` registra el cliente con `AddHttpClient<IDollarQuoteProvider, DollarApiQuoteProvider>`, URL base desde `DollarApi:BaseUrl` y timeout de diez segundos. La configuración predeterminada es `https://dolarapi.com/`.

## Guardado y conversión

Cada registro corresponde a USD → ARS y una fecha; su valor expresa cuántos pesos vale un dólar oficial de venta. Una importación repetida actualiza la fila de ese día. El proveedor de datos actual se limita al dólar oficial venta: no se deben mezclar valores blue o MEP en ese par.

La respuesta incluye `ProviderUpdatedAt` e `IsFromPreviousDay`: una fecha anterior no se reemplaza por la fecha de consulta. No se generan filas ficticias para los días que el proveedor no informa.

Para equivalencias se busca USD → moneda del movimiento, con fecha exacta o última anterior disponible, y se divide el importe por ese valor. Se redondea el resultado a dos decimales. Los movimientos en USD conservan su importe. Si no hay cotización aplicable, `EquivalentInDollars` y `ExchangeRateDateUsed` son `null` y el estado lo indica.

## Errores y prueba manual

Los errores HTTP, timeout o JSON inválido del proveedor producen una respuesta 502 desde la importación. No se guardan cotizaciones inválidas. La cancelación de la petición se propaga.

En Swagger, autenticarse con un usuario de rol `Administrator` y ejecutar el POST. Un usuario `Customer` recibe 403 y una petición sin token recibe 401. Consultar equivalencias con `GET /api/ExchangeRate/movements-dollar-equivalent` usando el usuario propietario de los movimientos.

## Actualización automática

`DollarQuoteRefreshWorker` consulta al iniciar la API y luego cada 60 minutos, todos los días mientras la API esté ejecutándose. Usa el mismo servicio de Application que el endpoint manual y crea un scope nuevo (y un DbContext nuevo) por intento. El intervalo permite recoger cambios publicados durante el día y reintentar tras un fallo. No depende de abrir Swagger ni de consultar movimientos.

Se configura en `appsettings.json`:

```json
"DollarQuoteRefresh": {
  "Enabled": true,
  "IntervalMinutes": 60
}
```

Un fallo queda registrado y no detiene la API ni borra cotizaciones; se reintenta al siguiente intervalo. Una respuesta antigua se guarda con su fecha real y genera una advertencia, nunca una fila artificial con fecha de hoy. El guardado mantiene una fila por fecha y par de monedas. Las importaciones manuales y automáticas se serializan dentro del proceso para evitar carreras. Esta configuración está pensada para una instancia de la API; desplegar varias requiere coordinación distribuida.

La aplicación debe permanecer encendida para consultar automáticamente. Al reiniciarla consulta nuevamente la última cotización, pero este endpoint del proveedor no recupera los días que la aplicación estuvo apagada. La recuperación histórica anterior sigue pendiente. Importar la última cotización no permite convertir movimientos anteriores a todo el historial disponible.

## Regla histórica y ejemplo

Si el 9 de enero se guardó 1 USD = 1.000 ARS y el 11 de enero 1 USD = 2.000 ARS, un movimiento de 10.000 ARS del día 9 equivale a USD 10 y otro del 11 a USD 5. Uno del día 10 usa la cotización del 9 y responde `Convertido con última cotización anterior`, junto con la fecha utilizada. Uno anterior al 9 queda `Sin cotización aplicable`. Nunca se usa la cotización futura del 11 para esos movimientos anteriores.

## Inicio y comprobación manual

En Visual Studio seleccionar el perfil compartido `Finanzas - API y Web` y ejecutar con F5. Inicia Presentación y Web y abre Swagger y el frontend. Los perfiles de Presentación tienen `launchBrowser: true` y `launchUrl: swagger`. Compilar sin ejecutar no inicia servidores.

Desde Swagger: importar como administrador, repetir la operación y comprobar que se conserva una fila por fecha y par de monedas. Consultar las equivalencias con el propietario de los movimientos y comparar importe, fecha usada y estado. Sin token se espera 401; con un usuario Customer, la importación devuelve 403. El circuito real se verificó contra DolarApi y SQL Server local. El proyecto de pruebas automáticas se conserva aparte para desarrollo y no forma parte de esta entrega ni de su workflow.

Documentación del proveedor: https://dolarapi.com/docs/argentina/operations/get-dolar-oficial
