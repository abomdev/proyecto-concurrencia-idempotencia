# Spec 11 — Concurrencia + Idempotencia

## Contexto

Este es el feature técnicamente diferenciador del proyecto. Resuelve dos problemas distintos:

1. **Concurrencia**: dos usuarios distintos intentan reservar la misma butaca al mismo tiempo → solo uno debe tener éxito.
2. **Idempotencia**: el mismo usuario reintenta la misma operación (doble clic, red inestable, retry automático) → la operación se ejecuta una sola vez, pero el cliente recibe la misma respuesta exitosa en todos los intentos.

---

## Requisitos

### RF-01 — Endpoint de reserva
El sistema DEBE exponer `POST /api/reservas` que recibe `{ showtimeId, asientos: string[] }` y crea una reserva en estado `"held"` con expiración de 10 minutos.

### RF-02 — Control de concurrencia atómico
El sistema DEBE rechazar con HTTP 409 cualquier intento de reservar un asiento que ya está `"held"` o `"occupied"` para la misma función. La verificación y escritura DEBEN ocurrir en una única operación atómica en MongoDB (sin posibilidad de race condition entre la lectura y la escritura).

### RF-03 — Idempotencia por header
El sistema DEBE aceptar un header `Idempotency-Key: <uuid>` en `POST /api/reservas`. Si la misma combinación `(key, userId, endpoint)` ya fue procesada, DEBE devolver la respuesta original cacheada sin volver a ejecutar la lógica de negocio.

### RF-04 — Endpoint de confirmación
El sistema DEBE exponer `POST /api/reservas/:id/confirmar` que cambia el estado de una reserva de `"held"` a `"confirmed"` y elimina `holdExpiresAt` (para que el TTL index no la borre).

### RF-05 — Conexión desde el frontend
El checkout DEBE enviar `POST /api/reservas` con un `Idempotency-Key` generado automáticamente. La confirmación DEBE enviar `POST /api/reservas/:id/confirmar`. Ambas llamadas reemplazan la lógica simulada actual en `booking.store.ts`.

### RF-06 — Endpoint "Mis Tickets" real
`GET /api/mis-tickets` DEBE devolver las reservas `"confirmed"` del usuario autenticado, incluyendo los datos de película y función (populate).

---

## Criterios de aceptación

**CA-01 — Race condition bloqueado**
DADO dos requests simultáneos al mismo `{showtimeId, asiento}`
CUANDO ambos llegan al servidor al mismo tiempo
ENTONCES exactamente uno recibe HTTP 201 y el otro recibe HTTP 409

**CA-02 — Idempotencia funcional**
DADO una request `POST /api/reservas` con `Idempotency-Key: abc-123`
CUANDO la misma request se envía 3 veces seguidas
ENTONCES se crea exactamente 1 documento en MongoDB y las 3 respuestas son idénticas (mismo body, mismo status)

**CA-03 — Confirmación de reserva**
DADO una reserva en estado `"held"` con `holdExpiresAt` en 10 minutos
CUANDO se llama `POST /api/reservas/:id/confirmar`
ENTONCES el estado cambia a `"confirmed"` y `holdExpiresAt` se elimina

**CA-04 — TTL libera butaca expirada**
DADO una reserva `"held"` cuyo `holdExpiresAt` ya venció
CUANDO el TTL worker de MongoDB la elimina (hasta ~60s después)
ENTONCES la butaca vuelve a aparecer como `"available"` en `GET /api/funciones/:id/butacas`

**CA-05 — Flujo de compra funcional**
DADO un usuario autenticado en el frontend
CUANDO completa el flujo Cartelera → Función → Butacas → Checkout
ENTONCES la reserva se crea en MongoDB y aparece en "Mis Tickets"
