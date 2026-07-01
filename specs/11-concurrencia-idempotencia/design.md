# Spec 11 — Design

## Flujo completo de reserva

```
Frontend (CheckoutView)
  │
  ├─ genera uuid como Idempotency-Key (una vez, guardado en ref)
  │
  └─► POST /api/reservas
        headers: { Authorization: Bearer <jwt>, Idempotency-Key: <uuid> }
        body:    { showtimeId, asientos: ["A1","A2"] }
        │
        ├─ [middleware: verifyToken] → extrae userId del JWT
        │
        ├─ [middleware: idempotencyMiddleware]
        │     busca (key, userId, "/api/reservas") en colección IdempotencyKey
        │     ┌─ encontrado → devuelve respuesta cacheada (sin llegar al controller)
        │     └─ no encontrado → continúa al controller
        │
        └─ [controller: createReserva]
              para cada asiento en asientos[]:
                Booking.findOneAndUpdate(
                  { showtimeId, asiento, $or: [no existe, holdExpiresAt < now] },
                  { $setOnInsert: { userId, estado:"held", holdExpiresAt: now+10min } },
                  { upsert: true, new: true }
                )
                ┌─ éxito → continúa con el siguiente asiento
                └─ DuplicateKeyError (11000) → rollback + responde 409
              │
              si todos los asientos OK:
                guarda respuesta en IdempotencyKey
                responde 201 { reservaId, asientos, holdExpiresAt }
```

---

## Archivos a crear/modificar

### Backend — nuevos archivos

**`src/middleware/idempotency.middleware.ts`**
- Lee header `Idempotency-Key`
- Busca en MongoDB: `IdempotencyKey.findOne({ key, userId, endpoint })`
- Si existe → `res.status(doc.statusCode).json(doc.responseBody)` y corta
- Si no existe → `res.locals.idempotencyKey = key` y llama `next()`
- Tiene un hook `onFinish` que guarda la respuesta al terminar el request

**`src/services/booking.service.ts`**
- `createReserva(userId, showtimeId, asientos[])` — la lógica atómica
- Usa `findOneAndUpdate` con `upsert: true` por cada asiento
- Si algún asiento falla (DuplicateKeyError), hace rollback borrando los asientos ya creados en esta operación y lanza error con qué asiento estaba ocupado

**`src/controllers/booking.controller.ts`**
- `createReserva`: llama al service, guarda en IdempotencyKey, responde 201
- `confirmarReserva`: busca la reserva por id + userId, cambia estado a `"confirmed"`, `$unset: { holdExpiresAt: 1 }`

**`src/routes/booking.routes.ts`**
- `POST /api/reservas` → `[verifyToken, idempotencyMiddleware, createReserva]`
- `POST /api/reservas/:id/confirmar` → `[verifyToken, confirmarReserva]`

### Backend — modificar

**`src/routes/tickets.routes.ts`** (actualmente devuelve `[]`)
- Hacer populate de `movieId` y `showtimeId` en el modelo Booking
- Devolver bookings `confirmed` del usuario con los campos que espera el frontend:
  `{ _id, movieTitle, sala, fechaHora, seats, precioBase, codigoReserva, estado }`

**`src/server.ts`**
- Montar `app.use('/api/reservas', bookingRoutes)`

### Frontend — modificar

**`src/stores/booking.ts`**
- Reemplazar `savePurchase` (que era simulado) por llamada real:
  ```
  async crearReserva(showtimeId, asientos, precioBase)
  async confirmarReserva(reservaId)
  ```
- `lastPurchase` se setea con los datos de la respuesta real

**`src/views/CheckoutView.vue`**
- Generar `idempotencyKey = crypto.randomUUID()` una sola vez en `setup`
- Pasar la key a `bookingStore.crearReserva()`
- Si el backend responde 201 → llamar `confirmarReserva` → navegar a `/confirmacion`
- Si responde 409 → mostrar mensaje "Una o más butacas ya fueron reservadas"

---

## La operación atómica explicada

El problema de concurrencia ocurre cuando dos operaciones de lectura + escritura separadas se intercalan:

```
Usuario A: lee → asiento libre
Usuario B: lee → asiento libre (A aún no escribió)
Usuario A: escribe → OK
Usuario B: escribe → también OK ← BUG: doble reserva
```

`findOneAndUpdate` con `upsert: true` es una operación atómica a nivel de documento en MongoDB. El servidor de MongoDB adquiere un lock del documento antes de leer y escribir, garantizando que solo uno puede hacer el upsert exitoso. El segundo intento recibe el error de índice único (código 11000).

```typescript
await Booking.findOneAndUpdate(
  {
    showtimeId,
    asiento,
    $or: [
      { estado: { $exists: false } },
      { holdExpiresAt: { $lt: new Date() } },
    ],
  },
  {
    $setOnInsert: {
      userId,
      showtimeId,
      asiento,
      estado: 'held',
      holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      codigoReserva: generateCode(),
    },
  },
  { upsert: true, new: true },
)
```

Si el filtro no matchea ningún documento (asiento ocupado/held vigente), MongoDB intenta un insert. El índice único `{showtimeId, asiento}` rechaza el insert con error 11000. Esto se captura y se devuelve 409.

---

## Modelo de respuesta del endpoint

### POST /api/reservas → 201
```json
{
  "reservaId": "684abc...",
  "showtimeId": "683def...",
  "asientos": ["A1", "A2"],
  "holdExpiresAt": "2026-06-30T14:10:00Z",
  "precioTotal": 9000
}
```

### POST /api/reservas → 409
```json
{
  "error": "El asiento A1 ya está reservado"
}
```

### POST /api/reservas/:id/confirmar → 200
```json
{
  "reservaId": "684abc...",
  "estado": "confirmed",
  "codigoReserva": "CRK-7X2M"
}
```

---

## Decisiones de diseño

| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| `findOneAndUpdate + upsert` | `findOne` + `save` en dos pasos | El gap entre los dos pasos permite race condition |
| Idempotency-Key en header | Deduplicación por body hash | El header es el estándar (Stripe, PayPal). El hash de body no contempla reintentos con diferentes timestamps |
| Rollback manual si un asiento falla | Transacción MongoDB | Atlas M0 free tier no soporta transacciones multi-documento en replica set |
| `codigoReserva` generado en el insert | Generado al confirmar | Si el backend cae entre held y confirmed, el código ya existe para recuperación |
