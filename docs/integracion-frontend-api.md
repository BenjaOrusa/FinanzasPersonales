# Primera integración entre React y ASP.NET Core

## Objetivo

La pantalla de movimientos deja de utilizar un arreglo demostrativo y obtiene sus datos
reales desde SQL Server mediante `GET /api/movimientos`.

## Recorrido de una petición

```text
React
  -> fetch HTTPS
  -> MovimientosController
  -> FinanzasDbContext
  -> SQL Server
  -> filas y relaciones
  -> MovimientoRespuesta
  -> JSON
  -> adaptación al modelo visual
  -> estado de React
  -> interfaz actualizada
```

## Petición

```http
GET https://localhost:7097/api/movimientos
Origin: http://localhost:59169
Accept: application/json
```

No contiene cuerpo porque `GET` solicita una representación sin crear ni modificar datos.

## Respuesta correcta

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: http://localhost:59169
```

Ejemplo abreviado:

```json
[
  {
    "ID_Movimiento": 1,
    "Descripcion": "Supermercado",
    "Importe": 25000.00,
    "Fecha": "2026-08-15",
    "TipoMovimiento": "Gasto",
    "ID_Categoria": 1,
    "Categoria": "Alimentación",
    "ID_Cuenta": 1,
    "Cuenta": "Efectivo",
    "Nota": null
  }
]
```

## Backend

`MovimientosController` recibe `FinanzasDbContext` mediante inyección de dependencias. La
consulta usa `AsNoTracking` porque no modificará las entidades y `Select` porque el JSON
debe responder a un contrato específico, no exponer directamente el modelo persistente.

`ToListAsync` ejecuta la consulta de forma asincrónica. EF Core traduce la proyección y las
navegaciones a SQL con relaciones entre `Movimientos`, `Categorias` y `Cuentas`.

## CORS

El navegador considera distintos estos orígenes:

```text
http://localhost:59169
https://localhost:7097
```

La diferencia de esquema y puerto activa la política del mismo origen. ASP.NET Core
autoriza de manera explícita solamente el origen local de `Finanzas.Web`. CORS es una
protección aplicada por el navegador; no reemplaza autenticación ni autorización.

## Frontend

`movementsApi.ts` concentra la URL y el uso de `fetch`. Comprueba `response.ok` porque
`fetch` no genera automáticamente una excepción por respuestas `404` o `500`.

El contrato JSON conserva la nomenclatura de la API. Después se adapta al modelo visual
actual de React. Esta frontera permite cambiar la presentación sin modificar el contrato
del backend.

`App.tsx` ejecuta la carga dentro de `useEffect`, guarda los movimientos en estado y
presenta estados separados de carga y error. `AbortController` cancela una petición si el
componente se desmonta antes de recibir la respuesta.

## Alcance actual

- La lectura `GET` usa datos reales.
- Categorías y cuentas continúan con datos temporales en React.
- Crear, editar y eliminar movimientos todavía modifica solamente el estado del frontend.
- Los siguientes contratos incorporarán esas operaciones una por vez.
