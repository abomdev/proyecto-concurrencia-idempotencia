# Diseño: Detalle de película + selección de horarios

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [ ] En implementación
- [ ] Completado

---

## Diagrama de flujo

```
Usuario hace click en MovieCard (cartelera)
        │
        ▼
router.push('/peliculas/:id')
        │
        ▼
MovieDetailView.vue
        │
        ├── useMoviesStore → busca película por id de la URL
        │       │
        │       ├── no encontrada → mensaje de error + botón volver
        │       │
        │       └── encontrada → muestra info + sección de funciones
        │
        └── useShowtimesStore → filtra funciones por movieId
                │
                └── click en función
                        │
                        ▼
                router.push('/funciones/:showtimeId/butacas')
```

---

## Componentes nuevos

| Archivo | Responsabilidad |
|---|---|
| `src/stores/showtimes.ts` | Store de Pinia con funciones mock y getter `porPelicula(movieId)` |
| `src/views/MovieDetailView.vue` | Reemplaza el placeholder del Spec 01 con el detalle real |

No se crean componentes nuevos reutilizables en este spec — `Navbar` ya existe del Spec 01.

---

## Store: `src/stores/showtimes.ts`

```typescript
export interface Showtime {
  _id: string
  movieId: string
  sala: string
  fechaHora: string       // ISO 8601
  precioBase: number      // en pesos enteros
  totalAsientos: number
  filas: number
  columnasPorFila: number
}
```

Mock: 3 funciones por película (las 4 películas mock tienen funciones, en total 12 showtimes).

Getter clave:
```typescript
porPelicula: (state) => (movieId: string) =>
  state.showtimes.filter((s) => s.movieId === movieId)
```

**¿Por qué `precioBase` en pesos enteros y no con decimales?** Los precios en software financiero/de ventas siempre se guardan como enteros (centavos o la unidad mínima de la moneda) para evitar errores de punto flotante. `2500` significa $2.500. La conversión a texto con formato ($2.500) la hace el componente con `Intl.NumberFormat`.

---

## Vista: `src/views/MovieDetailView.vue`

### Layout

```
┌──────────────────────────────────────────────────────┐
│  Navbar                                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ← Volver a cartelera                               │
│                                                      │
│  ┌───────────┐   Título de la película               │
│  │           │   ★ Calificación  ⏱ 132 min          │
│  │  PÓSTER   │                                       │
│  │  (grande) │   Descripción completa de la          │
│  │           │   película en varios párrafos.        │
│  └───────────┘                                       │
│               [Acción]  [Ciencia Ficción]            │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Funciones disponibles                               │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Sáb 5 julio — 20:30  │  Sala 1  │  $2.500  │ > │
│  ├──────────────────────────────────────────────┤   │
│  │ Dom 6 julio — 18:00  │  Sala IMAX │  $3.200 │ > │
│  ├──────────────────────────────────────────────┤   │
│  │ Dom 6 julio — 21:00  │  Sala 1  │  $2.500  │ > │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Layout responsivo

- **Desktop:** póster a la izquierda (30% del ancho), info a la derecha (70%) — dos columnas con CSS Grid
- **Móvil:** póster arriba a ancho completo, info abajo — una columna

### Estado de error (película no encontrada)

```
┌──────────────────────────────────────────────────────┐
│  Navbar                                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│         Película no encontrada.                      │
│         [← Volver a cartelera]                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Formateo de fecha y precio

**Fecha:** se formatea con la API nativa `Intl.DateTimeFormat` de JavaScript (sin librerías externas):
```typescript
function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
  // → "sáb., 5 de julio, 20:30"
}
```

**Precio:** también con `Intl.NumberFormat`:
```typescript
function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(precio)
  // → "$2.500"
}
```

**¿Por qué `Intl` y no una librería como `date-fns` o `dayjs`?** Para esta conversión puntual `Intl` hace exactamente lo que necesitamos sin agregar dependencias. Las librerías de fechas tienen valor cuando hay operaciones complejas (sumar días, zonas horarias, rangos). Agregar dependencias sin necesidad es un antipatrón.

---

## Lógica del componente

```typescript
// Obtiene el id de la URL
const route = useRoute()
const movieId = route.params.id as string

// Busca la película en el store
const moviesStore = useMoviesStore()
const movie = computed(() =>
  moviesStore.movies.find((m) => m._id === movieId) ?? null
)

// Obtiene las funciones filtradas por película
const showtimesStore = useShowtimesStore()
const funciones = computed(() => showtimesStore.porPelicula(movieId))

// Navega al selector de butacas
function seleccionarFuncion(showtimeId: string) {
  router.push({ name: 'seats', params: { showtimeId } })
}
```

---

## Router: ruta nueva agregada

```typescript
{
  path: '/funciones/:showtimeId/butacas',
  name: 'seats',
  component: () => import('../views/SeatsView.vue'),
}
```

Se crea `SeatsView.vue` con solo un placeholder — el contenido es el Spec 03.

---

## Componentes de PrimeVue usados

| Componente | Uso |
|---|---|
| `Toolbar` | Navbar (ya existente) |
| `Chip` | Géneros de la película |
| `Button` | "← Volver a cartelera" y el botón de cada función |
| `Divider` | Separador visual entre info de película y sección de funciones |

El listado de funciones se implementa con un `div` + `v-for` y estilos propios (no `DataTable`) porque necesitamos control total del layout de cada fila para que el click en toda la fila funcione correctamente.

---

## Decisiones de diseño

| Alternativa | Decisión | Razón |
|---|---|---|
| `DataTable` de PrimeVue para las funciones | Lista con `v-for` + estilos propios | `DataTable` es potente pero sobredimensionado para una lista de 3 items. El `v-for` sobre un array simple es más legible y permite hacer toda la fila clickeable fácilmente |
| `date-fns` para formatear fechas | `Intl.DateTimeFormat` nativo | Sin dependencias extra para algo que el navegador hace nativamente |
| Getter como método vs propiedad | `porPelicula` como getter que retorna una función | Permite filtrar por parámetro dinámico desde el template, que es el patrón recomendado en la documentación de Pinia |
