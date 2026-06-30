# Diseño: Cartelera (HomeView)

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [ ] En implementación
- [ ] Completado

---

## Diagrama de flujo

```
Usuario abre http://localhost:5173
        │
        ▼
App.vue → <RouterView /> → HomeView.vue
        │
        ▼
useMoviesStore() → lee movies[] del store (datos mock)
        │
        ├── movies.length === 0 → muestra mensaje vacío
        │
        └── movies.length > 0  → renderiza grilla de <MovieCard />
                                        │
                                        └── click en tarjeta
                                                │
                                                ▼
                                        router.push('/peliculas/:id')
```

---

## Componentes nuevos

| Archivo | Responsabilidad |
|---|---|
| `src/views/HomeView.vue` | Página principal. Obtiene datos del store, renderiza Navbar + grilla |
| `src/components/Navbar.vue` | Barra superior: logo Crunchymark + botón Login (sin acción por ahora) |
| `src/components/MovieCard.vue` | Tarjeta individual de película. Recibe una película por prop |
| `src/stores/movies.ts` | Store de Pinia con el array de películas mock y el getter `peliculasActivas` |

---

## Estructura de archivos nuevos

```
src/
├── stores/
│   └── movies.ts
├── components/
│   ├── Navbar.vue
│   └── MovieCard.vue
└── views/
    └── HomeView.vue     ← reemplaza el placeholder del Spec 00
```

También se actualiza `src/router/index.ts` para agregar la ruta `/peliculas/:id` vacía.

---

## Store: `src/stores/movies.ts`

```typescript
import { defineStore } from 'pinia'

export interface Movie {
  _id: string
  titulo: string
  descripcion: string
  generos: string[]
  duracionMinutos: number
  posterUrl: string
  calificacion: string
  activa: boolean
}

const MOCK_MOVIES: Movie[] = [
  {
    _id: 'mock-1',
    titulo: 'El último horizonte',
    descripcion: 'Un piloto espacial descubre una señal desconocida al borde del sistema solar.',
    generos: ['Ciencia Ficción', 'Aventura'],
    duracionMinutos: 132,
    posterUrl: 'https://picsum.photos/seed/movie1/400/600',
    calificacion: 'PG-13',
    activa: true,
  },
  {
    _id: 'mock-2',
    titulo: 'Sombras del norte',
    descripcion: 'Una detective enfrenta su caso más oscuro en una ciudad siempre cubierta de nieve.',
    generos: ['Thriller', 'Drama'],
    duracionMinutos: 118,
    posterUrl: 'https://picsum.photos/seed/movie2/400/600',
    calificacion: '+16',
    activa: true,
  },
  {
    _id: 'mock-3',
    titulo: 'La forja del campeón',
    descripcion: 'Un joven boxeador de barrio busca su oportunidad en el torneo nacional.',
    generos: ['Drama', 'Deporte'],
    duracionMinutos: 105,
    posterUrl: 'https://picsum.photos/seed/movie3/400/600',
    calificacion: 'ATP',
    activa: true,
  },
  {
    _id: 'mock-4',
    titulo: 'Familia en caos',
    descripcion: 'Las vacaciones perfectas se convierten en el desastre más divertido del año.',
    generos: ['Comedia', 'Familia'],
    duracionMinutos: 95,
    posterUrl: 'https://picsum.photos/seed/movie4/400/600',
    calificacion: 'ATP',
    activa: true,
  },
]

export const useMoviesStore = defineStore('movies', {
  state: () => ({
    movies: MOCK_MOVIES as Movie[],
  }),
  getters: {
    peliculasActivas: (state) => state.movies.filter((m) => m.activa),
  },
})
```

**¿Por qué `picsum.photos`?** Es un servicio gratuito que genera imágenes placeholder de cualquier tamaño. `seed/movie1` garantiza que siempre devuelve la misma imagen para el mismo seed, así los posters son consistentes entre recargas. No necesitamos imágenes reales en esta fase.

**¿Por qué el getter `peliculasActivas` en vez de filtrar en el componente?** La lógica de filtrado pertenece al store, no a la vista. El componente solo debería preguntar "dame las películas activas" y no saber cómo se determina eso. Cuando en Fase D conectemos el backend, solo cambia el estado del store — los componentes no se tocan.

---

## Componente: `src/components/Navbar.vue`

Barra superior fija. Usa el componente `Toolbar` de PrimeVue.

```
┌─────────────────────────────────────────────────────┐
│  🎬 Crunchymark                          [Iniciar sesión] │
└─────────────────────────────────────────────────────┘
```

Props: ninguna.
Emits: ninguno (el botón de login no tiene acción hasta Spec 06).

---

## Componente: `src/components/MovieCard.vue`

Usa el componente `Card` de PrimeVue.

```
┌──────────────────┐
│                  │
│    [PÓSTER]      │  ← imagen 400x600, ocupa todo el ancho de la tarjeta
│                  │
├──────────────────┤
│ Título película  │  ← texto grande, negrita
│                  │
│ [Acción] [Drama] │  ← Chip de PrimeVue por cada género
│                  │
│ ⏱ 132 min  🔞 PG-13 │  ← iconos de PrimeIcons
└──────────────────┘
```

Props:
```typescript
defineProps<{ movie: Movie }>()
```

Emits: ninguno. El click navega directamente con `useRouter().push()`.

---

## Vista: `src/views/HomeView.vue`

Layout general:

```
┌──────────────────────────────────────────────────────┐
│  Navbar                                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  En cartelera                                        │  ← título de sección
│                                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │ Card 1 │  │ Card 2 │  │ Card 3 │  │ Card 4 │    │  ← 4 columnas desktop
│  └────────┘  └────────┘  └────────┘  └────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Responsividad con CSS Grid:
- `grid-template-columns: repeat(4, 1fr)` en desktop (≥1024px)
- `repeat(2, 1fr)` en tablet (≥640px)
- `repeat(1, 1fr)` en móvil (<640px)

Estado vacío (cuando `peliculasActivas.length === 0`):
```
┌──────────────────────────────────────────────────────┐
│  Navbar                                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│       No hay películas disponibles en cartelera.    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Router: actualización de `src/router/index.ts`

Se agrega la ruta del detalle de película (vacía, se implementa en Spec 02):

```typescript
{
  path: '/peliculas/:id',
  name: 'movie-detail',
  component: () => import('../views/MovieDetailView.vue'),
}
```

Se crea `MovieDetailView.vue` con solo un `<h1>Detalle — próximamente</h1>` para que la navegación funcione sin errores.

---

## Decisiones de diseño

| Alternativa | Decisión | Razón |
|---|---|---|
| CSS personalizado para las tarjetas | Componente `Card` de PrimeVue | Reutilizamos lo que PrimeVue ya tiene pulido. El diseño visual se puede personalizar con el sistema de theming de PrimeVue sin reescribir el HTML |
| Filtrar películas activas en HomeView | Getter `peliculasActivas` en el store | La lógica de negocio va en el store, no en la vista. Más fácil de testear y de cambiar |
| Imágenes reales de películas | `picsum.photos` con seed fijo | Cero dependencias externas, imágenes consistentes, se reemplaza fácil en Fase C cuando el usuario provea los datos reales |
| `v-for` directo sobre `movies` en el template | `v-for` sobre `peliculasActivas` (getter) | El filtro de activa/inactiva no debería ser responsabilidad del template |
