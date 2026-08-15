# Finanzas Personales

Proyecto educativo para aprender desarrollo web mediante una aplicación de finanzas
personales construida de forma incremental.

El objetivo principal es comprender cada decisión y verificar cada cambio, no completar
la aplicación lo más rápido posible.

## Tecnologías previstas

- Backend: C#, ASP.NET Core Web API y .NET 10.
- Frontend: React, TypeScript y Vite.
- Base de datos: SQL Server.
- Persistencia: Entity Framework Core.
- Comunicación: API REST mediante HTTP y JSON.

El frontend y el backend permanecerán como proyectos separados. Durante las primeras
etapas, el backend utilizará datos en memoria; SQL Server se incorporará después de
practicar CRUD y comunicación HTTP.

## Estado actual

- La solución backend está creada y compila con .NET 10.
- El endpoint de ejemplo `/weatherforecast` fue probado.
- Existe un primer modelo `Movimiento`.
- El proyecto se encuentra en la fase de preparación de Git y GitHub.
- Todavía no existe el frontend ni se configuró una base de datos.

## Estructura

```text
FinanzasPersonales/
|-- Finanzas.Api/          Proyecto ASP.NET Core Web API
|-- Finanzas.Web/          Proyecto React, TypeScript y Vite
|-- docs/                  Plan, convenciones y registro de aprendizaje
|-- FinanzasPersonales.slnx
`-- README.md
```

## Ejecutar el backend

Requisitos: SDK de .NET 10 y un certificado HTTPS de desarrollo confiable.

Desde la raíz del repositorio:

```powershell
dotnet restore .\FinanzasPersonales.slnx
dotnet run --project .\Finanzas.Api\Finanzas.Api.csproj --launch-profile https
```

Direcciones locales configuradas:

- `https://localhost:7097`
- `http://localhost:5056`

## Documentación

- [Índice de documentación](docs/README.md)
- [Plan secuencial de diseño e implementación](docs/plan-diseno-implementacion.md)
- [Convenciones de código](docs/convenciones.md)
- [Referencia HTTP](docs/http.md)
- [Progreso de aprendizaje](docs/progreso.md)

## Seguridad

No se deben versionar contraseñas, tokens, cadenas de conexión privadas ni archivos
`.env`. Cuando se necesiten valores locales, se documentará una plantilla sin secretos.

## Licencia

Todavía no se eligió una licencia. Mientras no exista un archivo `LICENSE`, el código no
debe considerarse publicado bajo una licencia de código abierto.
