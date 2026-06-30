# Design: Confirmación de compra

## Estado
- [x] Borrador
- [x] Aprobado por el usuario

---

## Problema de datos: ¿cómo llega la info a la pantalla de confirmación?

Este es el problema principal del diseño. El flujo actual en `CheckoutView` es:

```
confirmar() → clearSelection() → router.push('confirmation')
```

`clearSelection()` vacía `selectedSeats` y `currentShowtimeId`. Si `ConfirmationView` intenta leer esos datos del store, ya no existen. **La confirmación quedaría vacía.**

### Solución: `lastPurchase` en el booking store

Antes de limpiar, el checkout guarda un resumen de la compra en el store bajo la clave `lastPurchase`. Este campo **no** se limpia con `clearSelection()` — persiste hasta que el usuario inicia una nueva compra o cierra el navegador.

```
confirmar() → savePurchase({...}) → clearSelection() → router.push('confirmation')
```

`ConfirmationView` solo lee `lastPurchase`. Si es `null`, muestra la vista de "No hay compra reciente."

---

## Cambios en el store `booking.ts`

### Nuevo campo de estado

```typescript
lastPurchase: null as {
  movieTitle: string
  sala: string
  fechaHora: string   // ISO string — se formatea en la vista
  seats: string[]     // ej: ['A1', 'B5']
  precioBase: number  // precio por butaca
} | null
```

### Nueva acción `savePurchase()`

```typescript
savePurchase(data: {
  movieTitle: string
  sala: string
  fechaHora: string
  seats: string[]
  precioBase: number
}) {
  this.lastPurchase = { ...data }
}
```

`clearSelection()` **no toca** `lastPurchase`. Solo limpia `selectedSeats` y `currentShowtimeId`.

---

## Cambio en `CheckoutView.vue`

En `confirmar()`, antes del `clearSelection()`:

```typescript
async function confirmar() {
  if (!formularioValido.value) return
  cargando.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Guardar resumen ANTES de limpiar
  bookingStore.savePurchase({
    movieTitle: movie.value!.titulo,
    sala: showtime.value!.sala,
    fechaHora: showtime.value!.fechaHora,
    seats: [...bookingStore.selectedSeats],
    precioBase: showtime.value!.precioBase,
  })

  bookingStore.clearSelection()
  router.push({ name: 'confirmation' })
}
```

---

## Layout de `ConfirmationView.vue`

```
┌──────────────────────────────────────────────┐
│  Navbar                                      │
├──────────────────────────────────────────────┤
│                                              │
│  ✅  ¡Compra confirmada!                    │
│      Tu reserva fue procesada exitosamente.  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 🎬  El último horizonte               │  │
│  │     Sala 1  ·  sáb. 5 de julio, 20:30 │  │
│  │ ────────────────────────────────────── │  │
│  │  Butaca A1                   $4.500   │  │
│  │  Butaca B5                   $4.500   │  │
│  │ ────────────────────────────────────── │  │
│  │  Total                       $9.000   │  │
│  │                                        │  │
│  │  Código de reserva                     │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │         CRK-A4F2B8              │  │  │
│  │  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│           [ Volver al inicio ]               │
│                                              │
└──────────────────────────────────────────────┘
```

### Vista alternativa (sin compra previa)

```
┌──────────────────────────────────────────────┐
│  Navbar                                      │
├──────────────────────────────────────────────┤
│                                              │
│       No hay compra reciente.                │
│                                              │
│           [ Volver al inicio ]               │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Generación del código de reserva

El código se genera **una sola vez en `onMounted`** con `Math.random()` y se guarda en un `ref`. No se regenera en re-renders.

```typescript
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function generarCodigo(): string {
  return 'CRK-' + Array.from(
    { length: 6 },
    () => CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

const codigoReserva = ref('')

onMounted(() => {
  if (bookingStore.lastPurchase) {
    codigoReserva.value = generarCodigo()
  }
})
```

**Por qué en `onMounted` y no como inicializador del `ref`:** si inicializamos el ref fuera del lifecycle, el código se genera al importar el módulo, no cuando el usuario llega a la pantalla. Con `onMounted`, el código se produce exactamente cuando el usuario ve la confirmación.

**En Fase E:** `codigoReserva` será reemplazado por el `_id` del documento `Booking` que devuelva el backend. No se necesita el generador aleatorio.

---

## Componentes utilizados

| Componente | Fuente | Rol |
|---|---|---|
| `Navbar` | local | barra de navegación superior |
| `Card` | PrimeVue | contenedor del ticket visual |
| `Divider` | PrimeVue | separadores entre secciones |
| `Button` | PrimeVue | botón "Volver al inicio" |

No se necesitan componentes nuevos.

---

## Formateo de datos

Mismo patrón ya establecido en el proyecto:

```typescript
// Fecha y hora de la función
new Intl.DateTimeFormat('es-CL', {
  weekday: 'short', day: 'numeric', month: 'long',
  hour: '2-digit', minute: '2-digit',
}).format(new Date(fechaHora))

// Precio por butaca y total
new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
}).format(precio)
```

---

## Flujo completo del feature

```
SeatsView
  └─ usuario selecciona butacas
       └─ "Ir al checkout"
            └─ CheckoutView
                 └─ usuario completa formulario
                      └─ confirmar()
                           ├─ savePurchase({ movieTitle, sala, fechaHora, seats, precioBase })
                           ├─ clearSelection()      ← selectedSeats = [], currentShowtimeId = null
                           └─ router.push('confirmation')
                                └─ ConfirmationView
                                     ├─ onMounted: lee bookingStore.lastPurchase
                                     │   ├─ null → muestra "No hay compra reciente."
                                     │   └─ datos → genera codigoReserva, muestra ticket
                                     └─ "Volver al inicio" → router.push('/')
```

---

## Decisiones tomadas vs alternativas descartadas

### `lastPurchase` en el booking store vs. router state

Vue Router permite pasar datos en `router.push({ name: '...', state: { ... } })`. Sin embargo, este estado se pierde si el usuario recarga la página. El store de Pinia también se pierde al recargar (sin persistencia), pero el comportamiento es el mismo y el código es más consistente con el patrón ya establecido en el proyecto.

### `lastPurchase` en el booking store vs. store separado `confirmationStore`

Un store separado sería la elección correcta si la confirmación tuviera lógica propia compleja. Aquí solo necesitamos guardar un snapshot de los datos de compra. Agregar `lastPurchase` al booking store existente es más simple y mantiene la cohesión: el booking store ya conoce seats, showtimeId, y precioBase.

### Código aleatorio en el cliente vs. código generado en el servidor

En esta fase no hay backend. El código es puro display. Usando `Math.random()` es suficiente para la demo. En Fase E el backend devolverá el `_id` real del booking (o un código formateado derivado de él), y este generador del cliente desaparece.
