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
- [ ] Commit inicial creado.
- [ ] Repositorio remoto creado en GitHub.
- [ ] Remoto `origin` configurado.
- [ ] Rama `main` publicada y verificada en GitHub.
- [ ] Ciclo de trabajo con una rama practicado.
- [ ] Historias de usuario y alcance de la primera versión.
- [ ] Mapa de páginas y navegación.
- [ ] Wireframes de baja fidelidad.
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

Continuar la Fase 0 comenzando por verificar la instalación y configuración de Git.
Después se inicializará el repositorio local, se revisará el `.gitignore` y se creará el
primer commit. La creación y publicación del repositorio de GitHub se realizará como un
paso posterior y verificable, antes de comenzar el diseño funcional.
