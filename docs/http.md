# Referencia HTTP del proyecto

## Partes de una petición

Una petición HTTP puede incluir:

- **Método:** indica la intención (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Ruta:** identifica el recurso, por ejemplo `/api/movimientos/1`.
- **Query string:** agrega filtros u opciones, por ejemplo `?tipo=Gasto`.
- **Encabezados:** describen la petición, por ejemplo `Accept: application/json`.
- **Cuerpo:** contiene datos enviados al servidor, normalmente en JSON.

## Métodos previstos

| Método | Uso en el proyecto | Respuesta habitual |
|---|---|---|
| `GET` | Consultar movimientos | `200 OK` |
| `POST` | Crear un movimiento | `201 Created` |
| `PUT` | Reemplazar completamente un movimiento | `200 OK` o `204 No Content` |
| `PATCH` | Modificar parte de un movimiento | `200 OK` o `204 No Content` |
| `DELETE` | Eliminar un movimiento | `204 No Content` |

## Códigos iniciales

| Código | Significado | Ejemplo |
|---|---|---|
| `200 OK` | La consulta o actualización terminó correctamente | Se devuelve una lista de movimientos |
| `201 Created` | Se creó un recurso | Se creó un movimiento y se informa su ubicación |
| `204 No Content` | La operación terminó sin cuerpo de respuesta | Se eliminó un movimiento |
| `400 Bad Request` | La petición contiene datos inválidos | El importe es cero o negativo |
| `404 Not Found` | El recurso solicitado no existe | No existe el movimiento indicado |
| `500 Internal Server Error` | Ocurrió un error inesperado en el servidor | Fallo no controlado del backend |

## Primer endpoint planificado

```http
GET /api/movimientos HTTP/1.1
Host: localhost:7097
Accept: application/json
```

Respuesta esperada en una etapa posterior:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

```json
[
  {
    "id": 1,
    "descripcion": "Supermercado",
    "importe": 24500.75,
    "fecha": "2026-08-15",
    "tipo": "Gasto"
  }
]
```

Este endpoint todavía no está implementado. El ejemplo documenta el contrato que
comprobaremos cuando creemos el controlador.
