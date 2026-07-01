# Design: Conexión frontend-backend

## Estado
- [x] Borrador
- [x] Aprobado por el usuario

---

## Dependencia nueva

```bash
pnpm add axios --filter frontend
```

---

## Archivos nuevos

| Archivo | Descripción |
|---|---|
| `apps/frontend/src/services/api.ts` | Instancia Axios con base URL e interceptor JWT |
| `apps/frontend/.env` | Variable `VITE_API_URL` (el usuario la crea, no se commitea) |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `stores/movies.ts` | Reemplaza mock → `fetchPeliculas()` |
| `stores/showtimes.ts` | Reemplaza mock → `fetchFuncionesPorPelicula(movieId)` |
| `stores/booking.ts` | Reemplaza `MOCK_SEAT_STATES` → `fetchSeatStates(showtimeId)` |
| `stores/auth.ts` | Reemplaza mock timeout → llamadas reales al backend |
| `stores/tickets.ts` | Reemplaza mock → `fetchMisTickets()` |
| `views/HomeView.vue` | Llama `fetchPeliculas()` en `onMounted` + spinner |
| `views/MovieDetailView.vue` | Llama `fetchFuncionesPorPelicula()` en `onMounted` + spinner |
| `views/SeatsView.vue` | Llama `fetchSeatStates()` en `onMounted` |
| `views/MyTicketsView.vue` | Llama `fetchMisTickets()` en `onMounted` + spinner |

---

## `services/api.ts`

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crunchymark_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

El interceptor lee el token de `localStorage` y lo agrega a cada request. Las rutas públicas ignoran el header; las protegidas lo validan en el backend.

---

## `apps/frontend/.env`

El usuario crea este archivo (no va al repo):
```
VITE_API_URL=http://localhost:3000
```

Vite solo expone variables con prefijo `VITE_` al código del cliente. Sin este prefijo, `import.meta.env.VITE_API_URL` sería `undefined`.

---

## Cambios en los stores

### `movies.ts`

```typescript
state: () => ({
  movies: [] as Movie[],
  loading: false,
  error: null as string | null,
}),
actions: {
  async fetchPeliculas() {
    this.loading = true
    this.error = null
    try {
      const { data } = await api.get<Movie[]>('/api/peliculas')
      this.movies = data
    } catch {
      this.error = 'No se pudieron cargar las películas.'
    } finally {
      this.loading = false
    }
  },
}
```

El getter `peliculasActivas` no cambia — sigue filtrando `activa: true` del array.

---

### `showtimes.ts`

```typescript
state: () => ({
  showtimes: [] as Showtime[],
  loading: false,
}),
actions: {
  async fetchFuncionesPorPelicula(movieId: string) {
    this.loading = true
    try {
      const { data } = await api.get<Showtime[]>(`/api/peliculas/${movieId}/funciones`)
      this.showtimes = data
    } finally {
      this.loading = false
    }
  },
}
```

El getter `porPelicula` se elimina — `MovieDetailView` usa directamente `showtimesStore.showtimes` (ya vienen filtrados por película desde la API).

---

### `booking.ts`

Se elimina `MOCK_SEAT_STATES` y se agrega la acción:

```typescript
async fetchSeatStates(showtimeId: string) {
  const { data } = await api.get<Record<string, SeatState>>(`/api/funciones/${showtimeId}/butacas`)
  this.seatStates = { [showtimeId]: data }
}
```

El getter `getEstado` no cambia — sigue leyendo de `this.seatStates`.

---

### `auth.ts`

```typescript
async login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', { email, password })
  this.token = data.token
  this.user = data.user
  localStorage.setItem('crunchymark_token', data.token)
  localStorage.setItem('crunchymark_user', JSON.stringify(data.user))
},
async registro(nombre: string, email: string, password: string) {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/api/auth/registro', { nombre, email, password })
  this.token = data.token
  this.user = data.user
  localStorage.setItem('crunchymark_token', data.token)
  localStorage.setItem('crunchymark_user', JSON.stringify(data.user))
},
```

Se elimina el `setTimeout` mock. El spinner en las vistas de login/registro seguirá visible mientras dure la request real.

---

### `tickets.ts`

```typescript
state: () => ({
  tickets: [] as Ticket[],
  loading: false,
}),
actions: {
  async fetchMisTickets() {
    this.loading = true
    try {
      const { data } = await api.get<Ticket[]>('/api/mis-tickets')
      this.tickets = data
    } finally {
      this.loading = false
    }
  },
}
```

En esta fase `/api/mis-tickets` devuelve `[]` porque no hay reservas reales aún (el POST de reserva viene en Spec 11). La vista mostrará el estado vacío — comportamiento correcto.

---

## Cambios en las vistas

### `HomeView.vue`

```typescript
onMounted(() => {
  moviesStore.fetchPeliculas()
})
```

Mientras carga: reemplazar la grilla por un `ProgressSpinner` centrado.

### `MovieDetailView.vue`

```typescript
onMounted(async () => {
  // Si las películas no están cargadas (navegación directa por URL)
  if (moviesStore.movies.length === 0) {
    await moviesStore.fetchPeliculas()
  }
  showtimesStore.fetchFuncionesPorPelicula(movieId)
})
```

Cambiar `funciones` de `showtimesStore.porPelicula(movieId)` a `showtimesStore.showtimes`.

### `SeatsView.vue`

```typescript
onMounted(() => {
  if (bookingStore.currentShowtimeId !== showtimeId) {
    bookingStore.clearSelection()
  }
  bookingStore.currentShowtimeId = showtimeId
  bookingStore.fetchSeatStates(showtimeId)  // ← nuevo
})
```

### `MyTicketsView.vue`

```typescript
onMounted(() => {
  ticketsStore.fetchMisTickets()
})
```

---

## Flujo completo con backend real

```
HomeView (onMounted)
  └─ GET /api/peliculas → movies[]
       └─ click película
            └─ MovieDetailView (onMounted)
                 └─ GET /api/peliculas/:id/funciones → showtimes[]
                      └─ click función
                           └─ SeatsView (onMounted)
                                └─ GET /api/funciones/:id/butacas → seatStates{}
                                     └─ checkout → confirmación (mock por ahora)
```

---

## Decisiones tomadas vs alternativas descartadas

### Axios vs fetch nativo

`fetch` nativo requiere manualmente serializar JSON, agregar headers en cada llamada, y manejar errores HTTP (fetch no rechaza en 4xx/5xx). Axios tiene interceptores, serialización automática, y manejo de errores más ergonómico. Para este proyecto la diferencia es pequeña pero los interceptores son clave para el JWT.

### Interceptor de token vs pasar token manualmente

Pasar el token manualmente en cada llamada es repetitivo y propenso a olvidarse. El interceptor garantiza que todas las requests autenticadas siempre llevan el token sin que cada store lo tenga que recordar.

### Mantener getter `peliculasActivas` en movies.ts

El getter filtra `activa: true` del array local. Esto es correcto — la API ya filtra activas en el servidor, pero si en el futuro el admin desactiva una película en tiempo real, el filtro local sirve de segunda línea de defensa.
