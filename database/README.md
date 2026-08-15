# Base de datos

Esta carpeta contiene scripts SQL versionados y ordenados para construir la base de datos
de Finanzas Personales de manera reproducible.

## Convenciones

- Los scripts se numeran según su orden de ejecución.
- Un script ejecutado no se modifica para alterar una base existente; se agrega uno nuevo.
- Los scripts se revisan antes de ejecutarse.
- Los saldos y totales se calculan desde `Movimientos`; no se almacenan.
- Los datos de prueba se incorporarán en un script separado de la estructura.

## Scripts

1. [`001_crear_estructura_inicial.sql`](scripts/001_crear_estructura_inicial.sql): crea la
   base `FinanzasPersonales`, sus tres tablas, restricciones e índices iniciales.

## Ejecución

El primer script está diseñado para SQL Server y utiliza separadores `GO`. Puede abrirse
desde SQL Server Management Studio o Visual Studio y debe ejecutarse con un usuario que
tenga permiso para crear bases de datos.

Antes de ejecutarlo se debe comprobar que no exista otra base importante con el nombre
`FinanzasPersonales`.
