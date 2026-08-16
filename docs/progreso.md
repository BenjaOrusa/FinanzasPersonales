# Progreso de aprendizaje

## Material considerado

- Programación, Semana 1: ecosistema .NET, fundamentos de C# y modelo cliente-servidor.
- Programación, Semana 2: Web API, controladores, REST, HTTP, JSON y LINQ.

Los materiales fuente se encuentran en `C:\TUP\Programacion`.

## Conceptos verificados

- [x] Crear y ejecutar una ASP.NET Core Web API con controladores.
- [x] Realizar una petición `GET` y recibir una respuesta JSON.
- [x] Diferenciar las direcciones HTTP y HTTPS locales.
- [x] Observar una redirección HTTP `307 Temporary Redirect` hacia HTTPS.
- [x] Compilar la solución con .NET 10.
- [x] Elegir `decimal` para representar importes monetarios en C#.
- [x] Crear un primer modelo del dominio.

## Funcionalidades

- [x] Proyecto backend inicial creado.
- [x] Endpoint de ejemplo `/weatherforecast` probado.
- [x] Modelo inicial `Movimiento` evaluado y retirado al quedar superado por el diseño funcional.
- [x] Plan secuencial de diseño e implementación documentado.
- [x] Repositorio Git local inicializado.
- [x] Archivo `.gitignore` creado y revisado.
- [x] Rama principal `main` definida.
- [x] Commit inicial creado.
- [x] Repositorio remoto creado en GitHub.
- [x] Remoto `origin` configurado.
- [x] Rama `main` publicada y verificada en GitHub.
- [x] Ramas `desarrollo` y `benjamin.orusa` creadas y publicadas.
- [ ] Historias de usuario y alcance de la primera versión.
- [x] Mapa de páginas y navegación.
- [x] Wireframes de baja fidelidad.
- [x] Sistema visual inicial aprobado.
- [ ] `GET /api/movimientos` con datos en memoria.
- [x] `GET /api/movimientos` conectado a SQL Server mediante Entity Framework Core.
- [x] Primera lectura real desde React mediante `fetch`, con carga, error y CORS.
- [ ] Consulta de un movimiento por identificador.
- [ ] Alta, modificación y eliminación de movimientos.
- [ ] Persistencia con SQL Server y Entity Framework Core.
- [x] Modelo relacional inicial de categorías, cuentas y movimientos aprobado y documentado.
- [x] Frontend React, TypeScript y Vite creado como proyecto separado.
- [x] Navegación entre Resumen, Movimientos, Categorías y Cuentas.
- [x] CRUD visual de movimientos con datos temporales en memoria.
- [x] Administración visual básica de categorías y cuentas en memoria.
- [ ] Autenticación y autorización.

## Decisiones vigentes

- Backend y frontend permanecerán separados.
- La lógica financiera importante estará en el backend.
- Los datos se almacenarán inicialmente en memoria.
- Los importes se representarán con `decimal` en C#.
- El modelo de datos definitivo se diseñará a partir de las pantallas aprobadas.
- Los importes se guardarán como valores positivos y el tipo indicará ingreso o gasto.
- La autenticación se incorporará después de aprender CRUD y comunicación HTTP.

## Próximo paso

Diseñar el modelo conceptual y relacional de movimientos, categorías y cuentas. Después se
definirán el esquema SQL y sus restricciones antes de crear las nuevas entidades del backend.
