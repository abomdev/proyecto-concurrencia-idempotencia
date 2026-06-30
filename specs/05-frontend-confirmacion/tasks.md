# Tasks: Confirmación de compra

## Estado
- [x] En implementación
- [x] Completado

---

## Tarea 1 — Agregar `lastPurchase` al booking store

**Archivo:** `apps/frontend/src/stores/booking.ts`

- Agregar `lastPurchase: null` al `state()`
- Agregar la acción `savePurchase(data)` que persiste el snapshot
- `clearSelection()` NO toca `lastPurchase`

---

## Tarea 2 — Actualizar `CheckoutView` para guardar el snapshot antes de limpiar

**Archivo:** `apps/frontend/src/views/CheckoutView.vue`

- En `confirmar()`, llamar `bookingStore.savePurchase({...})` ANTES de `clearSelection()`

---

## Tarea 3 — Implementar `ConfirmationView.vue`

**Archivo:** `apps/frontend/src/views/ConfirmationView.vue`

- Leer `bookingStore.lastPurchase` en `onMounted`
- Si es `null`: mostrar "No hay compra reciente." + botón volver
- Si hay datos: mostrar ticket completo con código aleatorio `CRK-XXXXXX`
- Botón "Volver al inicio" navega a `/`

---

## Verificación

1. Seleccionar 2 butacas en la función `showtime-1` (ej: D1, D2)
2. Completar checkout con datos ficticios (ej: nombre "Test", número 1234567890123456, vencimiento 01/28, cvv 123)
3. Click "Confirmar compra" → ver spinner → redirigir automáticamente
4. En la pantalla de confirmación:
   - Ver ícono ✅ y "¡Compra confirmada!"
   - Ver el nombre de la película, sala, fecha/hora
   - Ver las 2 butacas con precio y total en CLP
   - Ver código en formato `CRK-XXXXXX` (6 caracteres aleatorios)
5. Click "Volver al inicio" → llega a `/`
6. Navegar directamente a `/confirmacion` → ver "No hay compra reciente."
