# Plan secuencial de diseño e implementación

## Propósito

Esta hoja de ruta ordena el desarrollo de **Finanzas Personales** para que cada etapa
produzca un resultado pequeño, comprensible y verificable. El objetivo no es completar
varias fases juntas, sino aprender los conceptos que justifican cada cambio.

## Regla para avanzar

Un paso se considera terminado solamente cuando:

1. El problema que resuelve está entendido.
2. El código compila y la aplicación se puede ejecutar.
3. La petición o interacción fue probada manualmente.
4. La respuesta obtenida coincide con la esperada.
5. Los errores principales también fueron probados.
6. La documentación y `progreso.md` están actualizados.
7. Se realizó un commit de Git cuando el repositorio ya está disponible.

No se comienza una fase nueva mientras quede sin verificar el paso actual.

## Cambio de secuencia aprobado

Después de aprobar y probar el frontend, se decidió diseñar y crear la base de datos antes
de implementar el backend funcional. El recorrido vigente es:

```text
Frontend aprobado -> modelo conceptual -> diseño relacional -> SQL Server
-> Entity Framework Core -> API REST -> integración con React
```

Las fases siguientes conservan su contenido como referencia, pero se ejecutarán según este
orden acordado cuando exista una dependencia entre ellas.

---

## Fase 0 — Preparación y organización

### Objetivo

Contar con una base de trabajo reproducible antes de agregar funcionalidades.

### Pasos

1. Revisar la solución y el proyecto existentes.
2. Confirmar la instalación de Git y configurar la identidad del autor si falta.
3. Inicializar Git en la raíz de `FinanzasPersonales`.
4. Crear un `.gitignore` adecuado para .NET, Visual Studio, React y Vite.
5. Revisar exactamente qué archivos quedarán incluidos en el primer commit.
6. Definir `main` como rama principal local.
7. Crear el commit inicial con una versión compilable y documentada.
8. Crear el repositorio remoto en GitHub, definiendo previamente nombre y visibilidad.
9. Conectar el repositorio local con GitHub mediante el remoto `origin`.
10. Publicar `main` y configurar su seguimiento remoto.
11. Verificar en GitHub que no se hayan publicado archivos generados ni información sensible.
12. Definir una estrategia sencilla de ramas para el aprendizaje:
    - `main` conserva estados verificados.
    - Cada paso nuevo se realiza en una rama breve, por ejemplo
      `feature/listar-movimientos` o `docs/mapa-paginas`.
    - La rama se integra después de compilar, probar y revisar el cambio.
13. Practicar el ciclo mínimo: crear rama, modificar, revisar `status` y `diff`, hacer commit,
    publicar y fusionar.
14. Registrar las versiones de .NET, Node.js y SQL Server usadas.
15. Resolver o documentar advertencias de dependencias conocidas.
16. Confirmar que `/weatherforecast` funciona mediante HTTP y HTTPS.

### Resultado verificable

- El proyecto compila desde una copia limpia.
- `bin`, `obj`, `.vs` y `node_modules` no se versionan.
- Existe un primer commit estable en la rama local `main`.
- El repositorio de GitHub tiene configurado el remoto `origin`.
- `main` local y `origin/main` están sincronizadas.
- Se completó al menos una práctica controlada del ciclo de ramas.

---

## Fase 1 — Descubrimiento funcional

### Objetivo

Definir qué problemas resolverá la primera versión antes de diseñar pantallas o tablas.

### Pasos

1. Identificar el usuario principal de la aplicación.
2. Escribir historias de usuario breves.
3. Separar el producto mínimo de las ideas futuras.
4. Definir reglas financieras iniciales.
5. Acordar términos del dominio mediante un glosario.

### Alcance de la primera versión

- Consultar movimientos.
- Registrar ingresos y gastos.
- Editar y eliminar movimientos.
- Administrar categorías.
- Administrar cuentas financieras.
- Filtrar movimientos.
- Mostrar ingresos, gastos y balance.

### Fuera del alcance inicial

- Conexiones bancarias y pagos reales.
- Autenticación.
- Transferencias entre cuentas.
- Movimientos recurrentes.
- Exportación de datos.
- Presupuestos y estadísticas avanzadas.

### Resultado verificable

Una lista priorizada de historias de usuario y reglas, sin código nuevo.

---

## Fase 2 — Arquitectura de información y navegación

### Objetivo

Definir qué páginas tendrá la aplicación y cómo se relacionan.

### Mapa inicial de páginas

1. **Resumen:** ingresos, gastos, balance y movimientos recientes.
2. **Movimientos:** listado, filtros y acciones de alta, edición y eliminación.
3. **Formulario de movimiento:** creación y edición.
4. **Categorías:** listado y administración.
5. **Cuentas:** listado, saldo informativo y administración.
6. **Presupuestos:** se incorpora en una versión posterior.
7. **Estadísticas:** se incorpora después de disponer de datos suficientes.

### Pasos

1. Definir el objetivo de cada página.
2. Enumerar datos, acciones y estados de cada una.
3. Diseñar la navegación principal.
4. Definir estados vacíos, de carga y de error.
5. Revisar accesibilidad básica: teclado, etiquetas y contraste.

### Resultado verificable

Un mapa de navegación aprobado y una ficha breve por página.

---

## Fase 3 — Wireframes y diseño visual

### Objetivo

Decidir la disposición de la interfaz antes de escribir componentes React.

### Orden de diseño

1. Wireframe de baja fidelidad para escritorio.
2. Adaptación para pantalla móvil.
3. Pantalla de movimientos como primer flujo detallado.
4. Formulario de movimiento.
5. Resumen y páginas administrativas.
6. Definición de colores, tipografía, espaciado y componentes reutilizables.

### Estados que debe mostrar cada wireframe

- Cargando.
- Sin datos.
- Datos disponibles.
- Error de comunicación.
- Error de validación.
- Confirmación de una operación destructiva.

### Resultado verificable

Wireframes aprobados que indiquen qué datos necesita cada pantalla.

---

## Fase 4 — Modelo conceptual del dominio

### Objetivo

Representar el negocio sin decidir todavía la estructura física de SQL Server.

### Entidades iniciales

- `Movimiento`.
- `Categoria`.
- `Cuenta`.

### Decisiones a estudiar

- Propiedades y responsabilidades de cada entidad.
- Diferencia entre ingreso, gasto y transferencia.
- Significado y precisión de los importes.
- Relación entre movimiento, categoría y cuenta.
- Fechas financieras frente a fechas de auditoría.
- Reglas que deben cumplirse independientemente del frontend.

### Resultado verificable

Un diagrama conceptual sencillo y ejemplos válidos e inválidos de cada entidad.

---

## Fase 5 — Contrato HTTP inicial

### Objetivo

Traducir las necesidades de las pantallas a operaciones de la API.

### Contratos iniciales previstos

```text
GET    /api/movimientos
GET    /api/movimientos/{id}
POST   /api/movimientos
PUT    /api/movimientos/{id}
PATCH  /api/movimientos/{id}
DELETE /api/movimientos/{id}
```

### Pasos por operación

1. Especificar ruta, método y parámetros.
2. Diseñar el JSON de solicitud y respuesta.
3. Enumerar validaciones.
4. Definir códigos de estado.
5. Documentar ejemplos exitosos y fallidos.
6. Recién entonces implementar el endpoint.

### Resultado verificable

Un contrato que pueda ser entendido tanto desde React como desde ASP.NET Core.

---

## Fase 6 — Primera entrega vertical en memoria

### Objetivo

Completar el flujo más pequeño desde la interfaz hasta el backend sin base de datos.

### Secuencia obligatoria

1. Revisar y ajustar el modelo `Movimiento` según los wireframes.
2. Implementar `GET /api/movimientos` con una lista en memoria.
3. Probar la petición en el archivo `.http` o una herramienta equivalente.
4. Crear el proyecto React con TypeScript y Vite.
5. Crear una pantalla mínima de movimientos.
6. Consumir el endpoint mediante `fetch`.
7. Configurar y comprender CORS.
8. Mostrar carga, datos, lista vacía y error.
9. Probar el flujo completo en el navegador.

### Conceptos

HTTP, JSON, serialización, programación asincrónica, CORS, React, TypeScript y estado.

### Resultado verificable

El navegador muestra movimientos obtenidos realmente desde la API.

---

## Fase 7 — CRUD de movimientos en memoria

### Objetivo

Aprender las operaciones HTTP y las validaciones sin agregar aún persistencia.

### Orden

1. `GET /api/movimientos/{id}` y respuesta `404`.
2. `POST /api/movimientos` y respuesta `201` con encabezado `Location`.
3. Formulario React con validación orientativa.
4. Validación autoritativa en el backend.
5. `PUT` para reemplazo completo.
6. `PATCH` para actualización parcial, estudiando antes su semántica.
7. `DELETE` y confirmación en la interfaz.
8. Manejo uniforme de errores en frontend y backend.

### Resultado verificable

El usuario puede completar el CRUD durante una ejecución, sabiendo que los datos se
pierden al reiniciar la API.

---

## Fase 8 — Consultas, filtros y cálculos

### Objetivo

Aplicar LINQ y lógica financiera en el backend.

### Orden

1. Filtrar por tipo mediante query string.
2. Filtrar por rango de fechas.
3. Buscar por descripción.
4. Ordenar resultados.
5. Combinar filtros de forma controlada.
6. Calcular total de ingresos.
7. Calcular total de gastos.
8. Calcular balance.
9. Representar filtros y totales en el frontend.

### Resultado verificable

Los resultados y totales cambian de acuerdo con filtros enviados por HTTP.

---

## Fase 9 — Diseño relacional de la base de datos

### Objetivo

Transformar el modelo conceptual ya probado en un esquema relacional.

### Pasos

1. Repasar tablas, filas, columnas, claves y restricciones.
2. Diseñar tablas para movimientos, categorías y cuentas.
3. Definir claves primarias y foráneas.
4. Elegir tipos SQL apropiados, incluido `decimal(18,2)` o la precisión justificada.
5. Definir nulabilidad y restricciones.
6. Normalizar el modelo hasta un nivel adecuado.
7. Crear un diagrama entidad-relación.
8. Escribir y probar consultas SQL manuales básicas.

### Resultado verificable

El esquema explica cómo protege la integridad de los datos y satisface los casos de uso.

---

## Fase 10 — Entity Framework Core y persistencia

### Objetivo

Reemplazar el almacenamiento en memoria sin romper el contrato HTTP existente.

### Orden

1. Instalar y justificar los paquetes de EF Core para SQL Server.
2. Crear el `DbContext`.
3. Configurar la cadena de conexión de desarrollo sin versionar secretos.
4. Mapear las entidades.
5. Crear y revisar la primera migración.
6. Aplicar la migración.
7. Inspeccionar la base de datos resultante.
8. Reemplazar gradualmente la lista en memoria.
9. Usar operaciones asincrónicas de EF Core.
10. Volver a ejecutar todas las pruebas HTTP y del frontend.

### Resultado verificable

Los movimientos permanecen después de reiniciar la aplicación.

---

## Fase 11 — Categorías y cuentas

### Objetivo

Agregar entidades relacionadas usando lo aprendido con movimientos.

### Orden

1. Categorías: contrato, backend, pruebas y frontend.
2. Relacionar movimientos con categorías.
3. Cuentas: contrato, backend, pruebas y frontend.
4. Relacionar movimientos con cuentas.
5. Proteger eliminaciones que romperían relaciones.
6. Actualizar filtros y formularios.

### Resultado verificable

Cada movimiento referencia una categoría y una cuenta válidas.

---

## Fase 12 — Pruebas automatizadas y calidad

### Objetivo

Convertir verificaciones manuales importantes en pruebas repetibles.

### Capas

1. Pruebas unitarias de cálculos y reglas financieras.
2. Pruebas del backend para endpoints y validaciones.
3. Pruebas de integración con base de datos de prueba.
4. Pruebas de componentes React.
5. Pruebas del flujo principal del usuario.
6. Análisis de cobertura como guía, no como objetivo aislado.

### Resultado verificable

Una modificación incorrecta provoca una prueba fallida comprensible.

---

## Fase 13 — Autenticación y autorización

### Objetivo

Aislar los datos de cada usuario después de dominar CRUD, HTTP y persistencia.

### Orden

1. Modelar usuarios y propiedad de los recursos.
2. Estudiar hashing de contraseñas y gestión de identidad.
3. Implementar registro e inicio de sesión.
4. Emitir y validar JWT.
5. Diferenciar autenticación de autorización.
6. Proteger endpoints.
7. Asociar movimientos, categorías y cuentas al usuario autenticado.
8. Probar `401 Unauthorized` y `403 Forbidden`.
9. Analizar el almacenamiento seguro del token en el frontend.

### Resultado verificable

Un usuario no puede consultar ni modificar datos de otro usuario.

---

## Fase 14 — Presupuestos y estadísticas

### Objetivo

Construir funciones financieras sobre una base estable.

### Orden

1. Definir reglas de presupuesto mensual.
2. Diseñar su modelo y contrato.
3. Implementar presupuesto por categoría.
4. Comparar presupuesto con gasto real.
5. Crear consultas agregadas para estadísticas.
6. Mostrar gráficos accesibles y sus equivalentes textuales.
7. Verificar períodos, redondeos y zonas horarias.

### Resultado verificable

Los cálculos del frontend coinciden con los resultados autoritativos del backend.

---

## Fase 15 — Funciones posteriores y preparación de entrega

### Funciones opcionales, una por vez

1. Transferencias entre cuentas.
2. Movimientos recurrentes.
3. Exportación CSV.
4. Paginación.
5. Auditoría de cambios.

### Preparación técnica

1. Revisar seguridad, configuración y secretos.
2. Mejorar logs y manejo global de errores.
3. Documentar instalación y ejecución.
4. Crear una compilación limpia de frontend y backend.
5. Ejecutar todas las pruebas.
6. Preparar despliegue solo después de comprender el entorno elegido.

---

## Ciclo de trabajo para cada paso

Cada elemento anterior se ejecutará con el mismo ciclo:

1. **Problema:** qué necesidad se resolverá.
2. **Teoría:** conceptos de facultad y tecnología involucrados.
3. **Diseño:** contrato, reglas y archivos afectados.
4. **Intento:** ejercicio breve para que el estudiante escriba una parte útil.
5. **Implementación:** cambio mínimo necesario.
6. **Prueba:** caso exitoso y casos de error.
7. **Explicación HTTP:** petición, respuesta, JSON y código de estado.
8. **Revisión:** errores comunes y alternativas.
9. **Documentación:** actualizar decisiones y progreso.
10. **Confirmación:** no avanzar hasta verificar el resultado.

## Punto actual

El proyecto se encuentra en la **Fase 0: preparación y organización**. La solución y su
compilación ya fueron revisadas, pero todavía no existe un repositorio Git local ni un
repositorio remoto en GitHub. Tampoco se definieron la rama principal, el remoto o el
flujo de ramas. No se debe comenzar la Fase 1 hasta completar y verificar estos puntos.

El modelo `Movimiento` actual se considera una primera hipótesis y podrá ajustarse
después de diseñar las pantallas y reglas.
