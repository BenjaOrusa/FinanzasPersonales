# Documentación de Finanzas Personales

Esta carpeta reúne las decisiones y los conceptos aplicados durante el desarrollo.
La documentación se actualizará de manera incremental junto con el código.

## Documentos

- [Guía actual de instalación y evaluación](../README.md): ejecutar y probar esta entrega.
- [Integración de cotizaciones](integracion-cotizaciones.md): HttpClientFactory, actualización automática y pruebas.

Los documentos de planificación siguientes registran etapas anteriores; para el estado implementado prevalecen las dos guías anteriores.

- [Visión y potencial del producto](vision-y-potencial.md): evolución multiusuario, roles, propiedad, auditoría y hoja de ruta.
- [Plan de diseño e implementación](plan-diseno-implementacion.md): hoja de ruta secuencial completa.
- [Diseño funcional del frontend](diseno-frontend.md): mapa aprobado, páginas, estados y reglas visuales.
- [Sistema visual del frontend](sistema-visual.md): paleta, tipografía, espaciado y componentes comunes.
- [Diseño de base de datos](diseno-base-datos.md): tablas, relaciones, tipos, restricciones y cálculos.
- [Scripts de base de datos](../database/README.md): orden y ejecución de los scripts SQL versionados.
- [Convenciones de código](convenciones.md): nombres, organización y comentarios.
- [Referencia HTTP](http.md): métodos, rutas y códigos de estado que utilizaremos.
- [Integración React y API](integracion-frontend-api.md): recorrido de la primera petición real de extremo a extremo.
- [Progreso de aprendizaje](progreso.md): conceptos estudiados y funcionalidades terminadas.

## Estructura actual

```text
FinanzasPersonales/
|-- Finanzas.Api/          Proyecto ASP.NET Core Web API
|   |-- Controllers/       Controladores HTTP
|   `-- Program.cs         Configuración y punto de entrada de la API
|-- Finanzas.Domain/       Entidades y contratos
|-- Finanzas.Application/  Servicios y DTOs
|-- Finanzas.Infrastructure/ EF Core, repositorios y proveedores
|-- Finanzas.Tests/        Pruebas automatizadas
|-- finanzas.web/          Proyecto independiente React, TypeScript y Vite
|-- docs/                  Documentación del proyecto
`-- FinanzasPersonales.slnx
```

El frontend existe, pero su login y la integración completa con la API siguen pendientes.
