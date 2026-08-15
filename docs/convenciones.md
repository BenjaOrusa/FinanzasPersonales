# Convenciones de código

## Idioma

- Los conceptos del dominio se nombran en español: `Movimiento`, `Importe`, `Fecha`.
- Los nombres propios del framework permanecen en inglés: `Controller`, `HttpGet`, `ActionResult`.
- Un mismo concepto debe conservar el mismo nombre en todo el proyecto.

## C# y ASP.NET Core

- Clases, propiedades y métodos usan **PascalCase**: `Movimiento`, `Descripcion`.
- Las claves conservan exactamente la nomenclatura SQL acordada: `ID_Categoria`,
  `ID_Cuenta` e `ID_Movimiento`. Esta regla se aplica también a propiedades C#.
- Los campos de tipo incluyen la entidad singular: `TipoCategoria`, `TipoCuenta` y
  `TipoMovimiento`.
- Variables y parámetros usan **camelCase**: `movimiento`, `movimientoId`.
- Cada clase pública se guarda, normalmente, en un archivo con su mismo nombre.
- Los modelos del dominio se guardan en `Finanzas.Api/Models`.
- Los controladores se guardan en `Finanzas.Api/Controllers` y terminan en `Controller`.
- Se usa `decimal` para importes monetarios; no se usa `float` ni `double` para dinero.
- Se usa `DateOnly` cuando importa la fecha pero no la hora.
- Las operaciones de entrada/salida serán asincrónicas cuando exista una operación realmente
  asíncrona, como acceder a una base de datos. No se agregará `async` sin necesidad.

## Comentarios

- Los comentarios deben explicar el propósito, una decisión o una limitación temporal.
- No deben repetir literalmente lo que ya expresa el código.
- Las clases y propiedades importantes pueden usar comentarios XML con `///`.
- Un comentario desactualizado se considera un defecto y debe corregirse con el código.

## Rutas REST

- Las rutas representan recursos mediante sustantivos, no acciones.
- Las colecciones usan nombres plurales y minúsculos: `/api/movimientos`.
- Un recurso individual se identifica mediante la ruta: `/api/movimientos/{id}`.
- Los filtros se expresan mediante query string: `/api/movimientos?tipo=Gasto`.

## Git

Los mensajes de commit deben indicar una modificación concreta. Ejemplos:

```text
Agregar modelo Movimiento
Documentar convenciones iniciales del proyecto
Agregar endpoint para listar movimientos
```

El trabajo nuevo se realiza en `benjamin.orusa`, se integra en `desarrollo` y `main`
se reserva para versiones estables.
