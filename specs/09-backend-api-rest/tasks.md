# Tasks: Backend — API REST + Seed

## Estado
- [x] En implementación
- [x] Completado

---

## Tarea 1 — Instalar ts-node en el backend
```bash
pnpm add -D ts-node --filter backend
```

## Tarea 2 — Agregar script "seed" en `package.json`
**Archivo:** `apps/backend/package.json`

## Tarea 3 — Crear controllers de películas, funciones y tickets
**Archivos:**
- `apps/backend/src/controllers/movies.controller.ts`
- `apps/backend/src/controllers/showtimes.controller.ts`
- `apps/backend/src/controllers/tickets.controller.ts`

## Tarea 4 — Crear rutas
**Archivos:**
- `apps/backend/src/routes/movies.routes.ts`
- `apps/backend/src/routes/showtimes.routes.ts`
- `apps/backend/src/routes/tickets.routes.ts`

## Tarea 5 — Actualizar `server.ts` con las rutas nuevas

## Tarea 6 — Crear el seed `src/seed/seed.ts`

## Verificación

1. Instalar ts-node (Tarea 1) y correr el seed:
   ```bash
   pnpm --filter backend seed
   ```
   Debe mostrar: `Seed completado: 4 películas, 12 funciones`

2. Probar endpoints en Postman:
   - `GET http://localhost:3000/api/peliculas` → array de 4 películas
   - `GET http://localhost:3000/api/peliculas/<id>/funciones` → array de 3 funciones
   - `GET http://localhost:3000/api/funciones/<showtimeId>/butacas` → `{}` (vacío, sin reservas aún)
   - `GET http://localhost:3000/api/mis-tickets` sin token → 401
   - `GET http://localhost:3000/api/mis-tickets` con `Authorization: Bearer <token>` → `[]`
