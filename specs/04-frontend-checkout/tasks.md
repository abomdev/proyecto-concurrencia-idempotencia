# Tareas: Checkout (pago simulado)

## Estado
- [ ] En implementación
- [ ] Completado

## Prerequisitos
- [x] `specs/04-frontend-checkout/requirements.md` aprobado
- [x] `specs/04-frontend-checkout/design.md` aprobado
- [x] Spec 03 completado (booking store existente con selectedSeats)

---

## Tareas

### Bloque 1 — Actualizar store

- [ ] **TASK-04-01:** Agregar `currentShowtimeId` al estado y a la acción `clearSelection` del store de booking
  - Archivo: `apps/frontend/src/stores/booking.ts`

- [ ] **TASK-04-02:** Setear `bookingStore.currentShowtimeId = showtimeId` en `onMounted` de SeatsView
  - Archivo: `apps/frontend/src/views/SeatsView.vue`

### Bloque 2 — Vista y router

- [ ] **TASK-04-03:** Crear `src/views/ConfirmationView.vue` vacía (placeholder para Spec 05)
  - Archivo: `apps/frontend/src/views/ConfirmationView.vue`

- [ ] **TASK-04-04:** Actualizar `src/router/index.ts` agregando la ruta `/confirmacion` → `ConfirmationView`
  - Archivo: `apps/frontend/src/router/index.ts`

- [ ] **TASK-04-05:** Reemplazar `src/views/CheckoutView.vue` con la implementación real: guard de redirección, resumen de compra y formulario de pago simulado
  - Archivo: `apps/frontend/src/views/CheckoutView.vue`

### Bloque 3 — Verificación (la hace el usuario)

- [ ] **TASK-04-06:** Verificar que navegar directo a `/checkout` sin butacas redirige a `/`
- [ ] **TASK-04-07:** Verificar que el resumen muestra las butacas seleccionadas con precio y total correcto
- [ ] **TASK-04-08:** Verificar que el botón "Confirmar compra" está deshabilitado con campos vacíos
- [ ] **TASK-04-09:** Verificar que al completar el formulario y confirmar aparece el spinner "Procesando pago..."
- [ ] **TASK-04-10:** Verificar que tras 1.5 segundos redirige a `/confirmacion`

### Bloque 4 — Git (lo ejecuta el usuario)

- [ ] **TASK-04-11:** Commit y push del checkout
