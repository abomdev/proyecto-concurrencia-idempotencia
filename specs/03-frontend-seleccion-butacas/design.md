# Diseño: Selección de butacas

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [ ] En implementación
- [ ] Completado

---

## Diagrama de flujo

```
Usuario llega desde detalle de película
        │
        ▼
SeatsView.vue
        │
        ├── useShowtimesStore → obtiene showtime por id de la URL
        ├── useMoviesStore    → obtiene la película del showtime
        └── useBookingStore   → maneja selección y estados de butacas
                │
                ▼
        SeatMap.vue
                │
                └── SeatButton.vue (×80)
                        │
                        ├── estado: available → click → toggleSeat()
                        ├── estado: held      → click ignorado
                        └── estado: occupied  → click ignorado

        Panel de resumen (lateral desktop / abajo móvil)
                │
                └── botón "Ir al checkout" → router.push('/checkout')
```

---

## Componentes nuevos

| Archivo | Responsabilidad |
|---|---|
| `src/stores/booking.ts` | Estado de selección del usuario y estados mock de butacas por función |
| `src/components/SeatButton.vue` | Botón individual de butaca. Recibe estado + si está seleccionada. Solo emite evento si está disponible |
| `src/components/SeatMap.vue` | Grilla de butacas. Genera IDs (A1…H10), renderiza la pantalla de cine y las filas de SeatButtons |
| `src/views/SeatsView.vue` | Página completa: Navbar, info de función, SeatMap, panel de resumen |

---

## Store: `src/stores/booking.ts`

```typescript
type SeatState = 'available' | 'held' | 'occupied'

// Estado inicial de butacas por función (mock)
// Solo se listan las butacas con estado especial — las demás son 'available'
const MOCK_SEAT_STATES: Record<string, Record<string, SeatState>> = {
  'showtime-1': {
    'A1': 'occupied', 'A2': 'occupied', 'A3': 'occupied',
    'B1': 'occupied', 'B2': 'occupied',
    'C4': 'held',     'C5': 'held',
    'D7': 'held',
  },
}

defineStore('booking', {
  state: () => ({
    selectedSeats: [] as string[],          // butacas que el usuario seleccionó
    seatStates: MOCK_SEAT_STATES,           // estados por función (mock → luego viene del backend)
    currentShowtimeId: null as string | null,
  }),
  getters: {
    // Devuelve el estado de una butaca específica para la función actual
    getEstado: (state) => (showtimeId: string, asiento: string): SeatState => {
      return state.seatStates[showtimeId]?.[asiento] ?? 'available'
    },
    totalAsientos: (state) => state.selectedSeats.length,
  },
  actions: {
    // Selecciona o deselecciona una butaca (solo si está available)
    toggleSeat(asiento: string) {
      const idx = this.selectedSeats.indexOf(asiento)
      if (idx === -1) {
        if (this.selectedSeats.length < 8) {
          this.selectedSeats.push(asiento)
        }
      } else {
        this.selectedSeats.splice(idx, 1)
      }
    },
    // Limpia la selección al salir de la pantalla
    clearSelection() {
      this.selectedSeats = []
    },
  },
})
```

**¿Por qué `selectedSeats` es un array y no un Set?** Pinia serializa el estado a JSON para las DevTools y la persistencia. Los `Set` no son serializables a JSON directamente, mientras que los arrays sí. Es una restricción práctica, no un problema de diseño.

**¿Por qué máximo 8 butacas?** Es una restricción de negocio común en sistemas de tickets para evitar scalping. El límite se valida también en el backend en Fase E.

---

## Componente: `src/components/SeatButton.vue`

Props:
```typescript
defineProps<{
  asiento: string        // "A1", "B5", etc.
  estado: 'available' | 'held' | 'occupied'
  seleccionado: boolean
}>()

defineEmits<{
  click: []
}>()
```

Lógica:
- Solo emite `click` si `estado === 'available'`
- El color depende de `seleccionado` primero, luego de `estado`

Colores:
| Condición | Color | Significado |
|---|---|---|
| `seleccionado === true` | Azul (primary) | El usuario lo eligió |
| `estado === 'available'` | Verde | Libre para reservar |
| `estado === 'held'` | Amarillo/naranja | Otro usuario lo está reservando |
| `estado === 'occupied'` | Gris oscuro | Ya comprado |

Tamaño: 36×36px en desktop, 28×28px en móvil. Forma: cuadrado con bordes redondeados (simula una butaca vista desde arriba).

---

## Componente: `src/components/SeatMap.vue`

Props:
```typescript
defineProps<{
  showtimeId: string
  filas: number           // 8
  columnasPorFila: number // 10
}>()
```

**Generación de IDs de butacas:**
```typescript
// Letras para las filas: A, B, C, D, E, F, G, H...
const FILAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// Para fila 0, columna 2 → "A3"
function asientoId(fila: number, columna: number): string {
  return `${FILAS[fila]}${columna + 1}`
}
```

**Layout visual:**
```
         [ P A N T A L L A ]          ← rectángulo decorativo

    1  2  3  4  5  6  7  8  9 10     ← números de columna
A  [■][■][■][□][□][□][□][□][□][□]
B  [■][■][□][□][□][□][□][□][□][□]
C  [□][□][□][◈][◈][□][□][□][□][□]   ■ occupied (gris)
D  [□][□][□][□][□][□][◈][□][□][□]   ◈ held (amarillo)
E  [□][□][□][□][□][□][□][□][□][□]   □ available (verde)
F  [□][□][□][□][□][□][□][□][□][□]
G  [□][□][□][□][□][□][□][□][□][□]
H  [□][□][□][□][□][□][□][□][□][□]
```

Cada `SeatButton` obtiene su estado del store via `getEstado(showtimeId, asientoId)`.

---

## Vista: `src/views/SeatsView.vue`

### Layout desktop

```
┌─────────────────────────────────────────────────────────────┐
│  Navbar                                                     │
├─────────────────────────────────────────────────────────────┤
│  ← Volver                                                   │
│                                                             │
│  El último horizonte — Sala 1 — sáb. 5 de julio, 20:30     │
│                                                             │
│  ┌─────────────────────────────┐  ┌──────────────────────┐ │
│  │                             │  │  Resumen             │ │
│  │       SeatMap               │  │  ─────────────────   │ │
│  │    (mapa de butacas)        │  │  Butacas: A1, B3     │ │
│  │                             │  │  Total: $9.000       │ │
│  │                             │  │                      │ │
│  └─────────────────────────────┘  │  [Ir al checkout]    │ │
│                                   └──────────────────────┘ │
│  Leyenda: [■ Ocupado] [◈ En proceso] [□ Disponible] [● Tuyo]│
└─────────────────────────────────────────────────────────────┘
```

### Layout móvil
SeatMap arriba (con scroll horizontal si es necesario), panel de resumen abajo, leyenda entre ambos.

---

## Router: ruta nueva

```typescript
{
  path: '/checkout',
  name: 'checkout',
  component: () => import('../views/CheckoutView.vue'),
}
```

Se crea `CheckoutView.vue` como placeholder — se implementa en Spec 04.

Al navegar al checkout se pasan los datos via el store (no en la URL), ya que la lista de butacas puede ser larga y el store ya los tiene.

---

## Componentes de PrimeVue usados

| Componente | Uso |
|---|---|
| `Toolbar` | Navbar (existente) |
| `Button` | "← Volver", "Ir al checkout" |
| `Badge` | Contador de butacas seleccionadas en el botón de checkout |
| `Card` | Panel de resumen lateral |
| `Tag` | Leyenda de colores |

`SeatButton` NO usa un componente de PrimeVue internamente — es un `<button>` nativo con estilos propios, porque necesitamos control total sobre el color, tamaño y cursor según el estado.

---

## Decisiones de diseño

| Alternativa | Decisión | Razón |
|---|---|---|
| Pasar butacas seleccionadas por query params a checkout (`?seats=A1,B3`) | Usar el store de Pinia | La URL tiene límite de longitud y los datos ya están en el store. En Fase E el backend los recibirá en el body del POST, no en la URL |
| Generar asientos como objeto `{ id, fila, columna, estado }` | String simple `"A1"` | El backend usa el string como identificador único en el índice de MongoDB. Mantener la misma representación evita conversiones |
| `SeatButton` con `<Button>` de PrimeVue | `<button>` nativo | PrimeVue Button tiene estilos predefinidos difíciles de sobreescribir para este caso específico. Un `<button>` nativo con clases propias es más predecible |
| Mostrar número de columna en cada butaca | Solo color y posición | Con 80 butacas, mostrar texto dentro de cada una haría el mapa ilegible. Las etiquetas de fila (A–H) y columna (1–10) fuera del mapa son suficientes |
