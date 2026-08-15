# Sistema visual del frontend

## Objetivo

La interfaz tendrá una apariencia profesional y educativa, con poca información por
pantalla, jerarquía clara y acciones fáciles de reconocer.

## Paleta de colores

| Uso | Color | Código |
|---|---|---|
| Fondo general | Gris muy claro | `#F8FAFC` |
| Superficies | Blanco | `#FFFFFF` |
| Acción principal | Azul | `#2563EB` |
| Acción principal activa | Azul oscuro | `#1D4ED8` |
| Texto principal | Gris azulado oscuro | `#0F172A` |
| Texto secundario | Gris | `#64748B` |
| Bordes | Gris claro | `#E2E8F0` |
| Ingresos y éxito | Verde | `#15803D` |
| Gastos y errores | Rojo | `#B91C1C` |
| Advertencias | Ámbar | `#B45309` |

El significado nunca dependerá solamente del color. Los importes también usarán signos,
texto o iconos para diferenciar ingresos, gastos y estados.

## Tipografía

Se utilizarán inicialmente fuentes disponibles en el sistema:

```css
font-family: Inter, "Segoe UI", Arial, sans-serif;
```

No se incorporará una fuente externa durante la primera etapa.

## Espaciado

La escala base será múltiplo de ocho:

| Valor | Uso orientativo |
|---|---|
| `8px` | Separación pequeña. |
| `16px` | Separación normal. |
| `24px` | Separación entre grupos. |
| `32px` | Separación entre secciones. |

## Componentes básicos

- Botón principal azul.
- Botón secundario blanco con borde.
- Botón destructivo rojo.
- Campos con etiquetas siempre visibles.
- Tarjetas blancas con borde suave.
- Bordes redondeados de `8px`.
- Sombras discretas o inexistentes.
- Altura mínima aproximada de `40px` a `44px` para controles interactivos.

## Distribución adaptable

### Escritorio

- Menú lateral de aproximadamente `240px`.
- Contenido principal con ancho máximo cercano a `1200px`.
- Separación clara entre secciones y tarjetas.

### Dispositivos móviles

- Contenido en una columna.
- Campos ocupando el ancho disponible.
- Navegación principal inferior.
- Tabla de movimientos reemplazada por tarjetas.
- Controles con superficie suficiente para interacción táctil.

## Criterios de consistencia

- Cada página tendrá una única acción principal destacada.
- Los títulos describirán claramente el objetivo de la pantalla.
- Los filtros secundarios permanecerán plegados mientras no se utilicen.
- Los mensajes de error indicarán el problema y una acción posible.
- Los mismos componentes conservarán apariencia y comportamiento en todas las páginas.
