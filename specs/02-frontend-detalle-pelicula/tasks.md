# Tareas: Detalle de película + selección de horarios

## Estado
- [ ] En implementación
- [ ] Completado

## Prerequisitos
- [x] `specs/02-frontend-detalle-pelicula/requirements.md` aprobado
- [x] `specs/02-frontend-detalle-pelicula/design.md` aprobado
- [x] Spec 01 completado (cartelera funcionando, store de películas existente)

---

## Tareas

### Bloque 1 — Store de funciones

- [ ] **TASK-02-01:** Crear `src/stores/showtimes.ts` con la interfaz `Showtime`, 12 funciones mock (3 por película) y getter `porPelicula`
  - Archivo: `apps/frontend/src/stores/showtimes.ts`

### Bloque 2 — Vista y router

- [ ] **TASK-02-02:** Crear `src/views/SeatsView.vue` vacía (placeholder para Spec 03)
  - Archivo: `apps/frontend/src/views/SeatsView.vue`

- [ ] **TASK-02-03:** Actualizar `src/router/index.ts` agregando la ruta `/funciones/:showtimeId/butacas` → `SeatsView`
  - Archivo: `apps/frontend/src/router/index.ts`

- [ ] **TASK-02-04:** Reemplazar `src/views/MovieDetailView.vue` con el detalle real: Navbar, info de película, lista de funciones, estado de error
  - Archivo: `apps/frontend/src/views/MovieDetailView.vue`

### Bloque 3 — Verificación (la hace el usuario)

- [ ] **TASK-02-05:** Verificar que al hacer click en una película desde la cartelera se ve su detalle completo (póster, título, descripción, géneros, duración)
- [ ] **TASK-02-06:** Verificar que se listan 3 funciones con fecha, sala y precio formateados en CLP
- [ ] **TASK-02-07:** Verificar que al hacer click en una función la URL cambia a `/funciones/:showtimeId/butacas`
- [ ] **TASK-02-08:** Verificar el estado de error: ingresar manualmente `/peliculas/id-inexistente` → debe mostrar "Película no encontrada."
- [ ] **TASK-02-09:** Verificar que "← Volver a cartelera" regresa a `/`

### Bloque 4 — Git (lo ejecuta el usuario)

- [ ] **TASK-02-10:** Commit y push del detalle de película
