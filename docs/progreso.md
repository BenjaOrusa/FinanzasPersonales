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
- [x] Modelo inicial `Movimiento` creado.
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
- [ ] Consulta de un movimiento por identificador.
- [ ] Alta, modificación y eliminación de movimientos.
- [ ] Persistencia con SQL Server y Entity Framework Core.
- [ ] Frontend React y TypeScript.
- [ ] Autenticación y autorización.

## Decisiones vigentes

- Backend y frontend permanecerán separados.
- La lógica financiera importante estará en el backend.
- Los datos se almacenarán inicialmente en memoria.
- Los importes se representarán con `decimal` en C#.
- Inicialmente, `Tipo` será texto y el importe se guardará como valor positivo.
- La autenticación se incorporará después de aprender CRUD y comunicación HTTP.

## Próximo paso

Crear el proyecto separado de React, TypeScript y Vite dentro del mismo repositorio,
revisar su estructura generada y comprobar que pueda ejecutarse de forma independiente.
