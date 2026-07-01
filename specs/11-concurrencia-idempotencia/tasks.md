# Spec 11 — Tasks

## Backend

- [ ] 1. Crear `apps/backend/src/services/booking.service.ts` — lógica atómica con `findOneAndUpdate`
- [ ] 2. Crear `apps/backend/src/middleware/idempotency.middleware.ts` — caché de respuestas por key
- [ ] 3. Crear `apps/backend/src/controllers/booking.controller.ts` — `createReserva` + `confirmarReserva`
- [ ] 4. Crear `apps/backend/src/routes/booking.routes.ts` — montar los dos endpoints
- [ ] 5. Modificar `apps/backend/src/server.ts` — registrar `bookingRoutes`
- [ ] 6. Modificar `apps/backend/src/routes/tickets.routes.ts` — devolver datos reales con populate

## Frontend

- [ ] 7. Modificar `apps/frontend/src/stores/booking.ts` — reemplazar `savePurchase` por `crearReserva` + `confirmarReserva` con llamadas reales a la API
- [ ] 8. Modificar `apps/frontend/src/views/CheckoutView.vue` — generar `Idempotency-Key`, llamar al store, manejar 409
