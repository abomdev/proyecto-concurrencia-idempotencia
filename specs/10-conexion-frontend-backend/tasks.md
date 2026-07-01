# Tasks: Conexión frontend-backend

## Estado
- [ ] En implementación
- [ ] Completado

---

## Tarea 1 — Instalar Axios y crear `.env` del frontend (usuario)

```bash
pnpm add axios --filter frontend
```

Crear `apps/frontend/.env`:
```
VITE_API_URL=http://localhost:3000
```

## Tarea 2 — Crear `services/api.ts`
## Tarea 3 — Actualizar `stores/movies.ts`
## Tarea 4 — Actualizar `stores/showtimes.ts`
## Tarea 5 — Actualizar `stores/booking.ts`
## Tarea 6 — Actualizar `stores/auth.ts`
## Tarea 7 — Actualizar `stores/tickets.ts`
## Tarea 8 — Actualizar `views/HomeView.vue`
## Tarea 9 — Actualizar `views/MovieDetailView.vue`
## Tarea 10 — Actualizar `views/SeatsView.vue`
## Tarea 11 — Actualizar `views/MyTicketsView.vue`

---

## Verificación

1. Levantar frontend y backend en paralelo:
   ```bash
   pnpm --filter backend dev
   pnpm --filter frontend dev
   ```
2. Cartelera muestra las 4 películas de anime reales
3. Click en Kimetsu → ver 3 funciones reales con precios reales
4. Click en una función → mapa de butacas carga (todas libres)
5. Login con una cuenta registrada en Postman → Navbar muestra nombre real
6. Mis Tickets → muestra estado vacío (sin reservas aún)
