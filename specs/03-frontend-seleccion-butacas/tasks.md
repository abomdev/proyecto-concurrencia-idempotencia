# Tareas: Selección de butacas

## Estado
- [ ] En implementación
- [ ] Completado

## Prerequisitos
- [x] `specs/03-frontend-seleccion-butacas/requirements.md` aprobado
- [x] `specs/03-frontend-seleccion-butacas/design.md` aprobado
- [x] Spec 02 completado (store de showtimes existente)

---

## Tareas

### Bloque 1 — Store de reservas

- [ ] **TASK-03-01:** Crear `src/stores/booking.ts` con mock de estados de butacas, selectedSeats, getter `getEstado` y acciones `toggleSeat` / `clearSelection`
  - Archivo: `apps/frontend/src/stores/booking.ts`

### Bloque 2 — Componentes

- [ ] **TASK-03-02:** Crear `src/components/SeatButton.vue` con los 4 estados visuales (selected/available/held/occupied) y emisión de click solo cuando está disponible
  - Archivo: `apps/frontend/src/components/SeatButton.vue`

- [ ] **TASK-03-03:** Crear `src/components/SeatMap.vue` con la pantalla de cine, etiquetas de filas/columnas y la grilla de SeatButtons
  - Archivo: `apps/frontend/src/components/SeatMap.vue`

### Bloque 3 — Vista y router

- [ ] **TASK-03-04:** Crear `src/views/CheckoutView.vue` vacía (placeholder para Spec 04)
  - Archivo: `apps/frontend/src/views/CheckoutView.vue`

- [ ] **TASK-03-05:** Actualizar `src/router/index.ts` agregando la ruta `/checkout` → `CheckoutView`
  - Archivo: `apps/frontend/src/router/index.ts`

- [ ] **TASK-03-06:** Reemplazar `src/views/SeatsView.vue` con la implementación real: info de función, SeatMap, leyenda y panel de resumen
  - Archivo: `apps/frontend/src/views/SeatsView.vue`

### Bloque 4 — Verificación (la hace el usuario)

- [ ] **TASK-03-07:** Verificar que el mapa de `showtime-1` muestra A1/A2/A3/B1/B2 en gris (ocupadas) y C4/C5/D7 en amarillo (en proceso), el resto en verde
- [ ] **TASK-03-08:** Verificar que click en butaca verde la pone azul y aparece en el panel de resumen con precio calculado
- [ ] **TASK-03-09:** Verificar que click de nuevo en butaca azul la deselecciona
- [ ] **TASK-03-10:** Verificar que click en butaca amarilla o gris no tiene efecto
- [ ] **TASK-03-11:** Verificar que con 0 butacas seleccionadas el botón "Ir al checkout" está deshabilitado
- [ ] **TASK-03-12:** Verificar que con butacas seleccionadas el botón está activo y navega a `/checkout`

### Bloque 5 — Git (lo ejecuta el usuario)

- [ ] **TASK-03-13:** Commit y push de la selección de butacas
