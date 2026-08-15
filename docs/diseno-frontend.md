# Diseño funcional del frontend

## Objetivo visual

La interfaz combinará una apariencia profesional con explicaciones educativas. Debe ser
clara, fácil de recorrer y evitar presentar demasiada información al mismo tiempo.

Reglas generales:

- Cada página tendrá un objetivo principal.
- Cada pantalla destacará una sola acción principal.
- Los filtros permanecerán plegados mientras no se utilicen.
- El diseño será adaptable a escritorio y dispositivos móviles.
- Los colores no serán el único medio para distinguir ingresos y gastos.
- Todas las páginas contemplarán estados de carga, vacío, error y datos disponibles.

## Mapa de navegación aprobado

```text
Aplicación
|-- Resumen
|-- Movimientos
|   |-- Listado
|   |-- Nuevo movimiento
|   `-- Editar movimiento
|-- Categorías
`-- Cuentas
```

Rutas previstas:

| Ruta | Objetivo |
|---|---|
| `/` | Consultar el resumen financiero. |
| `/movimientos` | Consultar y filtrar movimientos. |
| `/movimientos/nuevo` | Registrar un ingreso o gasto. |
| `/movimientos/:id/editar` | Modificar un movimiento existente. |
| `/categorias` | Administrar categorías. |
| `/cuentas` | Administrar cuentas financieras. |

## Resumen

La página inicial mostrará solamente:

- Balance del período.
- Total de ingresos.
- Total de gastos.
- Los cinco movimientos más recientes.
- Selector de período.
- Acción para registrar un movimiento.
- Acceso al historial completo.

Los gráficos, presupuestos, comparaciones y recomendaciones quedan fuera de la primera
versión para conservar una pantalla despejada.

## Movimientos

El listado tendrá búsqueda por descripción y filtros plegables por tipo, categoría,
cuenta y rango de fechas. En escritorio utilizará una tabla y en móvil, tarjetas.

Datos visibles:

- Fecha.
- Descripción.
- Categoría.
- Cuenta.
- Tipo.
- Importe.
- Acciones de edición y eliminación.

La eliminación siempre requerirá confirmación. También se diferenciará entre una lista
vacía y una búsqueda sin resultados.

## Formulario de movimiento

El mismo formulario servirá para crear y editar. Tendrá los campos:

- Tipo: ingreso o gasto.
- Descripción.
- Importe positivo.
- Fecha.
- Categoría.
- Cuenta.
- Nota opcional.

La validación aparecerá junto a cada campo. El frontend ofrecerá respuesta inmediata,
pero el backend repetirá las reglas porque será la fuente autoritativa.

## Categorías

La página separará visualmente las categorías de ingresos y gastos. La creación y
edición utilizarán un formulario breve superpuesto al listado.

Reglas iniciales:

- El nombre es obligatorio.
- Una categoría pertenece a ingresos o a gastos.
- El nombre no se repite dentro del mismo tipo.
- Una categoría asociada a movimientos no se elimina silenciosamente.
- Los colores e iconos quedan fuera de la primera versión.

## Cuentas

Las cuentas representan dónde se encuentra el dinero, sin conexiones bancarias reales.
Los tipos iniciales serán efectivo, cuenta bancaria y billetera virtual.

Cada cuenta tendrá:

- Nombre.
- Tipo.
- Saldo inicial.
- Saldo actual calculado.

```text
Saldo actual = saldo inicial + ingresos - gastos
```

La primera versión usará solamente pesos argentinos. Las tarjetas de crédito y el manejo
de varias monedas quedan postergados. Una cuenta asociada a movimientos no se eliminará
silenciosamente.

## Fuera del alcance visual inicial

- Inicio de sesión y perfil.
- Presupuestos y metas de ahorro.
- Estadísticas avanzadas.
- Transferencias y movimientos recurrentes.
- Exportación de datos.
- Conexiones bancarias.
- Tarjetas de crédito y múltiples monedas.

## Próxima decisión

Definir el sistema visual común: colores, tipografía, espaciado, botones, campos,
tarjetas y comportamiento de la navegación adaptable.
