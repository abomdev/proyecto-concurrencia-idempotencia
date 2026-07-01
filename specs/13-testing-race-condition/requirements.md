# Spec 13 — Testing y demostración del race condition

## Contexto

Este spec tiene dos objetivos distintos:

1. **Demostración ejecutable** del race condition y la idempotencia: scripts que cualquier reclutador puede correr para ver con sus propios ojos que el sistema se comporta correctamente bajo condiciones extremas.

2. **Tests unitarios** del servicio de reserva: verifican la lógica de negocio de `booking.service.ts` en memoria (sin necesidad de MongoDB Atlas).

---

## Requisitos

### RF-01 — Script de race condition
El proyecto DEBE incluir un script `apps/backend/src/seed/raceConditionTest.ts` que:
- Lanza **10 requests concurrentes** al mismo `{showtimeId, asiento}` con `Promise.all`
- Imprime cuántas respondieron 201 (éxito) y cuántas respondieron 409 (conflicto)
- El resultado esperado es exactamente **1 éxito y 9 rechazos**

### RF-02 — Script de idempotencia
El proyecto DEBE incluir un script `apps/backend/src/seed/idempotencyTest.ts` que:
- Envía la **misma request 5 veces** con el mismo `Idempotency-Key`
- Verifica que solo existe **1 documento** en la colección `bookings`
- Imprime las 5 respuestas y confirma que son idénticas (mismo `codigoReserva`)

### RF-03 — Tests unitarios con MongoMemoryServer
El proyecto DEBE incluir tests en `apps/backend/src/services/booking.service.test.ts` que cubran:
- Reserva exitosa de un asiento libre
- Rechazo (error 409) al reservar un asiento ya ocupado
- Idempotencia: dos llamadas con el mismo idempotency key devuelven la misma respuesta

### RF-04 — Comandos en package.json
Los scripts DEBEN ser ejecutables con:
- `pnpm race-test` (desde `apps/backend`)
- `pnpm idempotency-test` (desde `apps/backend`)
- `pnpm test` (desde `apps/backend`)

---

## Criterios de aceptación

**CA-01 — Race condition demostrado**
DADO el script `raceConditionTest.ts` corriendo contra el backend real
CUANDO se ejecuta `pnpm race-test`
ENTONCES el output muestra "✅ 1 éxito" y "❌ 9 rechazados (409)"

**CA-02 — Idempotencia demostrada**
DADO el script `idempotencyTest.ts` corriendo contra el backend real
CUANDO se ejecuta `pnpm idempotency-test`
ENTONCES el output muestra "5 respuestas con el mismo codigoReserva" y "1 documento en DB"

**CA-03 — Tests pasan en CI**
DADO el entorno de test con MongoMemoryServer (sin conexión a Atlas)
CUANDO se ejecuta `pnpm test`
ENTONCES todos los tests pasan en verde
