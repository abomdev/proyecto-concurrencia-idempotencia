# Tareas: Cartelera (HomeView)

## Estado
- [ ] En implementación
- [ ] Completado

## Prerequisitos
- [x] `specs/01-frontend-cartelera/requirements.md` aprobado
- [x] `specs/01-frontend-cartelera/design.md` aprobado
- [x] Spec 00 completado (monorepo funcionando)

---

## Tareas

### Bloque 1 — Store de películas

- [ ] **TASK-01-01:** Crear `src/stores/movies.ts` con la interfaz `Movie`, los datos mock (4 películas) y el getter `peliculasActivas`
  - Archivo: `apps/frontend/src/stores/movies.ts`

### Bloque 2 — Componentes

- [ ] **TASK-01-02:** Crear `src/components/Navbar.vue` con logo "Crunchymark" y botón "Iniciar sesión" (sin acción)
  - Archivo: `apps/frontend/src/components/Navbar.vue`

- [ ] **TASK-01-03:** Crear `src/components/MovieCard.vue` con prop `movie: Movie`, imagen del póster, título, chips de géneros, duración y calificación
  - Archivo: `apps/frontend/src/components/MovieCard.vue`

### Bloque 3 — Vistas y router

- [ ] **TASK-01-04:** Crear `src/views/MovieDetailView.vue` vacía (placeholder para que la navegación no rompa)
  - Archivo: `apps/frontend/src/views/MovieDetailView.vue`

- [ ] **TASK-01-05:** Actualizar `src/router/index.ts` agregando la ruta `/peliculas/:id` → `MovieDetailView`
  - Archivo: `apps/frontend/src/router/index.ts`

- [ ] **TASK-01-06:** Reemplazar `src/views/HomeView.vue` con la cartelera real: Navbar + grilla responsiva de MovieCard
  - Archivo: `apps/frontend/src/views/HomeView.vue`

### Bloque 4 — Verificación (la hace el usuario)

- [ ] **TASK-01-07:** Verificar que se ven 4 tarjetas de película en `http://localhost:5173`
- [ ] **TASK-01-08:** Verificar que el click en una tarjeta cambia la URL a `/peliculas/mock-1` (etc.)
- [ ] **TASK-01-09:** Verificar que en móvil (DevTools → toggle device) las tarjetas se apilan en 1 columna

### Bloque 5 — Git (lo ejecuta el usuario)

- [ ] **TASK-01-10:** Commit y push de la cartelera completa
