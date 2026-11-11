# Base de datos

El esquema actual se administra con **Entity Framework Core y migraciones**, según el [README principal](../README.md#ejecutar-la-api-localmente).

- `Finanzas.Infrastructure/Migrations` contiene las migraciones y el snapshot actual.
- `scripts/001_crear_estructura_inicial.sql` y `scripts/002_cargar_datos_iniciales.sql` son material histórico del modelo inicial en español. **No usarlos para instalar la API actual.**
- `traslado-datos-prueba.sql` documenta el traspaso local desde aquellas tablas antiguas. Requiere las tablas antiguas, destinos vacíos y el usuario indicado previamente registrado. No es un seed general ni corresponde a una instalación nueva.

Las cuentas actuales conservan un saldo que los servicios ajustan al crear, editar y eliminar movimientos. No se distribuyen backups ni credenciales de usuarios en el repositorio.
