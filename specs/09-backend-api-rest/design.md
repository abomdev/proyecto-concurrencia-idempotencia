# Design: Backend — API REST + Seed

## Estado
- [x] Borrador
- [x] Aprobado por el usuario

---

## Dependencia nueva

```bash
pnpm add -D ts-node --filter backend
```

Necesaria para ejecutar el seed directamente sin el servidor. `ts-node-dev` incluye ts-node internamente pero no lo expone como comando independiente.

---

## Archivos nuevos

```
apps/backend/src/
├── controllers/
│   ├── movies.controller.ts
│   ├── showtimes.controller.ts
│   └── tickets.controller.ts
├── routes/
│   ├── movies.routes.ts
│   ├── showtimes.routes.ts
│   └── tickets.routes.ts
└── seed/
    └── seed.ts
```

## Archivos modificados

```
apps/backend/src/server.ts     ← montar las 3 rutas nuevas
apps/backend/package.json      ← agregar script "seed"
```

---

## Rutas y controllers

### `GET /api/peliculas`

```typescript
const peliculas = await Movie.find({ activa: true }).lean()
res.json(peliculas)
```

`.lean()` devuelve objetos JavaScript planos en lugar de documentos Mongoose — más rápido y sin métodos innecesarios.

---

### `GET /api/peliculas/:id`

```typescript
const pelicula = await Movie.findById(req.params.id).lean()
if (!pelicula) {
  res.status(404).json({ error: 'Película no encontrada.' })
  return
}
res.json(pelicula)
```

---

### `GET /api/peliculas/:id/funciones`

```typescript
const funciones = await Showtime.find({ movieId: req.params.id })
  .sort({ fechaHora: 1 })
  .lean()
res.json(funciones)
```

---

### `GET /api/funciones/:showtimeId/butacas`

Este es el endpoint más importante de los GET. El frontend lo llama al abrir el mapa de butacas para saber cuáles están ocupadas o en proceso.

```typescript
const ahora = new Date()
const bookings = await Booking.find({
  showtimeId: req.params.showtimeId,
  $or: [
    { estado: 'confirmed' },
    { estado: 'held', holdExpiresAt: { $gt: ahora } },
  ],
}).lean()

const seatStates: Record<string, 'occupied' | 'held'> = {}
for (const b of bookings) {
  seatStates[b.asiento] = b.estado === 'confirmed' ? 'occupied' : 'held'
}
res.json(seatStates)
```

**Ejemplo de respuesta:**
```json
{ "A1": "occupied", "A2": "occupied", "C4": "held" }
```

Las butacas que no aparecen en el objeto están disponibles. Este formato es idéntico al `MOCK_SEAT_STATES` del frontend — el reemplazo en Spec 10 será directo.

**Por qué filtrar `holdExpiresAt > ahora`:** los holds vencidos los borra MongoDB automáticamente cada ~60s. Pero durante esa ventana pueden quedar documentos con `estado: 'held'` y `holdExpiresAt` en el pasado. Este filtro los excluye para que no aparezcan como ocupadas butacas ya liberadas.

---

### `GET /api/mis-tickets` (protegida con `verifyToken`)

```typescript
const tickets = await Booking.find({
  userId: req.userId,
  estado: 'confirmed',
})
  .populate<{ showtimeId: ShowtimeDoc }>('showtimeId')
  .sort({ createdAt: -1 })
  .lean()
res.json(tickets)
```

Devuelve las reservas confirmadas del usuario con los datos de la función populados. En Spec 10 el frontend adapta la respuesta a la interfaz `Ticket`.

---

## Estructura de rutas en `server.ts`

```typescript
import moviesRoutes    from './routes/movies.routes'
import showtimesRoutes from './routes/showtimes.routes'
import ticketsRoutes   from './routes/tickets.routes'

app.use('/api/peliculas',   moviesRoutes)
app.use('/api/funciones',   showtimesRoutes)
app.use('/api/mis-tickets', ticketsRoutes)
```

---

## Script de seed (`seed/seed.ts`)

### Datos de las 4 películas

```typescript
const PELICULAS = [
  {
    titulo: 'Kimetsu no Yaiba: El Castillo Infinito',
    descripcion: 'Tanjiro y los Pilares enfrentan a Muzan Kibutsuji en una batalla épica dentro del castillo infinito.',
    generos: ['Acción', 'Animación', 'Fantasía'],
    duracionMinutos: 140,
    posterUrl: 'https://picsum.photos/seed/kimetsu/400/600',
    calificacion: '+14',
  },
  {
    titulo: 'Jujutsu Kaisen: Ejecución',
    descripcion: 'Yuji Itadori enfrenta su destino final mientras Ryomen Sukuna desata su verdadero poder.',
    generos: ['Acción', 'Animación', 'Sobrenatural'],
    duracionMinutos: 112,
    posterUrl: 'https://picsum.photos/seed/jujutsu/400/600',
    calificacion: '+16',
  },
  {
    titulo: 'Chainsaw Man: Reze',
    descripcion: 'Denji conoce a Reze, la chica bomba, y debe elegir entre sus sentimientos y su deber.',
    generos: ['Acción', 'Animación', 'Terror'],
    duracionMinutos: 98,
    posterUrl: 'https://picsum.photos/seed/chainsawman/400/600',
    calificacion: '+18',
  },
  {
    titulo: 'Dragon Ball Super: Super Hero',
    descripcion: 'Piccolo y Gohan despiertan poderes ocultos para enfrentar los nuevos androides de la Red Ribbon.',
    generos: ['Acción', 'Animación', 'Aventura'],
    duracionMinutos: 100,
    posterUrl: 'https://picsum.photos/seed/dragonball/400/600',
    calificacion: 'ATP',
  },
]
```

### Funciones (3 por película)

Cada película tiene funciones en Sala 1, Sala 2 y Sala 3, en fechas desde el 10 al 14 de julio de 2026, con 80 asientos (8 filas × 10 columnas):

| Película | Sala | Fecha/Hora | Precio |
|---|---|---|---|
| Kimetsu | Sala 1 | 10/07 20:30 | $5.500 |
| Kimetsu | Sala 2 | 11/07 18:00 | $5.000 |
| Kimetsu | Sala 3 | 12/07 15:30 | $4.500 |
| Jujutsu | Sala 1 | 10/07 18:00 | $5.500 |
| Jujutsu | Sala 2 | 11/07 21:00 | $5.000 |
| Jujutsu | Sala 3 | 13/07 16:00 | $4.500 |
| Chainsaw | Sala 2 | 11/07 20:30 | $6.000 |
| Chainsaw | Sala 1 | 12/07 18:00 | $5.500 |
| Chainsaw | Sala 3 | 14/07 15:00 | $5.000 |
| Dragon Ball | Sala 3 | 10/07 16:00 | $4.500 |
| Dragon Ball | Sala 1 | 13/07 20:30 | $5.000 |
| Dragon Ball | Sala 2 | 14/07 18:00 | $4.500 |

### Lógica del seed (idempotente)

```typescript
// 1. Borrar datos existentes para evitar duplicados
await Movie.deleteMany({})
await Showtime.deleteMany({})

// 2. Insertar películas y guardar sus IDs
const movies = await Movie.insertMany(PELICULAS)

// 3. Construir y insertar funciones referenciando los IDs reales
const funciones = buildFunciones(movies)
await Showtime.insertMany(funciones)

console.log('Seed completado: 4 películas, 12 funciones')
process.exit(0)
```

### Script `seed` en `package.json`

```json
"seed": "ts-node -r dotenv/config --transpile-only src/seed/seed.ts"
```

`-r dotenv/config` carga el `.env` antes de ejecutar el seed, para que `MONGODB_URI` esté disponible.

---

## Decisiones tomadas vs alternativas descartadas

### Un documento por butaca en Booking vs un documento por orden

El documento por butaca (`{ showtimeId, asiento }`) permite el índice único que resuelve la concurrencia atómicamente. Un documento por orden requeriría transacciones MongoDB para la misma garantía — más complejo y no disponible en M0 Free Tier.

La consecuencia es que `GET /api/mis-tickets` devuelve una entrada por butaca, no por orden. En Spec 10 el frontend agrupa visualmente las butacas del mismo showtime.

### `.lean()` en todas las queries GET

Mongoose por defecto devuelve documentos "hidratados" con métodos `.save()`, `.populate()`, etc. Para GETs que solo leen datos, `.lean()` devuelve objetos planos — más rápido y menor uso de memoria. Los documentos hidratados se necesitan solo cuando se va a modificar y guardar.
