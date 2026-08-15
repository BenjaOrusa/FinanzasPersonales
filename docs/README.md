# Documentación de Finanzas Personales

Esta carpeta reúne las decisiones y los conceptos aplicados durante el desarrollo.
La documentación se actualizará de manera incremental junto con el código.

## Documentos

- [Plan de diseño e implementación](plan-diseno-implementacion.md): hoja de ruta secuencial completa.
- [Diseño funcional del frontend](diseno-frontend.md): mapa aprobado, páginas, estados y reglas visuales.
- [Sistema visual del frontend](sistema-visual.md): paleta, tipografía, espaciado y componentes comunes.
- [Diseño de base de datos](diseno-base-datos.md): tablas, relaciones, tipos, restricciones y cálculos.
- [Scripts de base de datos](../database/README.md): orden y ejecución de los scripts SQL versionados.
- [Convenciones de código](convenciones.md): nombres, organización y comentarios.
- [Referencia HTTP](http.md): métodos, rutas y códigos de estado que utilizaremos.
- [Progreso de aprendizaje](progreso.md): conceptos estudiados y funcionalidades terminadas.

## Estructura actual

```text
FinanzasPersonales/
|-- Finanzas.Api/          Proyecto ASP.NET Core Web API
|   |-- Controllers/       Controladores HTTP
|   |-- Models/            Clases que representan datos del dominio
|   `-- Program.cs         Configuración y punto de entrada de la API
|-- Finanzas.Web/          Proyecto independiente React, TypeScript y Vite
|-- docs/                  Documentación del proyecto
`-- FinanzasPersonales.slnx
```

El frontend se creará como un proyecto separado cuando corresponda comenzar esa etapa.
