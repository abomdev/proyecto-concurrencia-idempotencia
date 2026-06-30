# Design: Mis Tickets

## Estado
- [x] Borrador
- [x] Aprobado por el usuario

---

## Archivos nuevos

| Archivo | Descripción |
|---|---|
| `apps/frontend/src/stores/tickets.ts` | Store con interfaz `Ticket` y mock data |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `apps/frontend/src/views/MyTicketsView.vue` | Reemplaza el placeholder con la vista real |

---

## Store `tickets.ts`

### Interfaz

```typescript
export interface Ticket {
  _id: string
  movieTitle: string
  sala: string
  fechaHora: string        // ISO string — se formatea en la vista con Intl
  seats: string[]
  precioBase: number
  codigoReserva: string
  estado: 'confirmado' | 'cancelado'
}
```

`precioBase` es el precio por butaca. El total se calcula en la vista: `precioBase * seats.length`. Mismo patrón que en `CheckoutView` y `ConfirmationView`.

### Mock data (2 tickets)

```typescript
const MOCK_TICKETS: Ticket[] = [
  {
    _id: 'ticket-1',
    movieTitle: 'El último horizonte',
    sala: 'Sala 1',
    fechaHora: '2026-07-05T20:30:00',
    seats: ['A4', 'B6'],
    precioBase: 4500,
    codigoReserva: 'CRK-A4F2B8',
    estado: 'confirmado',
  },
  {
    _id: 'ticket-2',
    movieTitle: 'Sombras del norte',
    sala: 'Sala 2',
    fechaHora: '2026-06-28T18:00:00',
    seats: ['C7'],
    precioBase: 5000,
    codigoReserva: 'CRK-X9M3K1',
    estado: 'confirmado',
  },
]
```

**Por qué los títulos coinciden con `movies.ts`:** los datos de un ticket real son un snapshot histórico — guardan el nombre de la película al momento de la compra, igual que lo hace el `lastPurchase` del booking store. No se referencian por `_id` de película porque si la película se borra o cambia el nombre, el ticket histórico debe preservar lo que el usuario compró.

### En Fase D

La acción `fetchMisTickets()` reemplazará el mock:

```typescript
// Hoy (mock):
state: () => ({ tickets: MOCK_TICKETS })

// Fase D (real):
async fetchMisTickets() {
  const data = await api.get('/api/mis-tickets')
  this.tickets = data
}
```

---

## Layout de `MyTicketsView.vue`

### Con tickets

```
┌──────────────────────────────────────────────────────┐
│  Navbar                                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Mis tickets de francisco                            │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  🎬 El último horizonte        ● Confirmado   │  │
│  │     Sala 1  ·  sáb. 5 de julio, 20:30         │  │
│  │  ──────────────────────────────────────────── │  │
│  │   Butaca A4                        $4.500     │  │
│  │   Butaca B6                        $4.500     │  │
│  │  ──────────────────────────────────────────── │  │
│  │   Total                            $9.000     │  │
│  │   Código  CRK-A4F2B8                          │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  🎬 Sombras del norte          ● Confirmado   │  │
│  │     Sala 2  ·  sáb. 28 de junio, 18:00        │  │
│  │  ──────────────────────────────────────────── │  │
│  │   Butaca C7                        $5.000     │  │
│  │  ──────────────────────────────────────────── │  │
│  │   Total                            $5.000     │  │
│  │   Código  CRK-X9M3K1                          │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Sin tickets (estado vacío)

```
┌──────────────────────────────────────────────────────┐
│  Navbar                                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Mis tickets de francisco                            │
│                                                      │
│  Aún no tienes tickets.                              │
│  ¡Compra tu primera entrada!                         │
│                                                      │
│              [ Ver cartelera ]                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Componentes PrimeVue utilizados

| Componente | Uso |
|---|---|
| `Card` | contenedor de cada ticket |
| `Chip` | badge de estado (confirmado / cancelado) |
| `Divider` | separadores entre secciones del ticket |
| `Button` | botón "Ver cartelera" en estado vacío |

### Chip de estado

```vue
<Chip
  :label="ticket.estado === 'confirmado' ? 'Confirmado' : 'Cancelado'"
  :class="ticket.estado === 'confirmado' ? 'ticket__chip--confirmado' : 'ticket__chip--cancelado'"
/>
```

PrimeVue `Chip` no tiene prop `severity`. Se usa CSS scoped para el color:

```css
.ticket__chip--confirmado { background-color: #22c55e; color: #fff; }
.ticket__chip--cancelado  { background-color: #6b7280; color: #fff; }
```

---

## Flujo de datos

```
MyTicketsView (onMounted)
  └─ ticketsStore.tickets   ← array de Ticket[]
       ├─ length === 0  → estado vacío
       └─ length > 0    → v-for de Cards
            └─ cada Card usa:
                 - ticket.movieTitle
                 - ticket.sala + ticket.fechaHora  (formateado con Intl.DateTimeFormat es-CL)
                 - v-for ticket.seats  (con ticket.precioBase formateado con Intl.NumberFormat CLP)
                 - ticket.precioBase * ticket.seats.length  (total)
                 - ticket.codigoReserva
                 - ticket.estado  (Chip)
```

---

## Decisiones tomadas vs alternativas descartadas

### Store separado `tickets.ts` vs agregar tickets al `booking.ts`

El booking store maneja el flujo activo de una compra (selección, checkout, confirmación). Los tickets son el historial persistido post-compra. Son conceptos distintos con ciclos de vida distintos — mezclarlos en un mismo store violaría el principio de responsabilidad única y complicaría la migración a la API real en Fase D.

### `precioBase * seats.length` en vista vs campo `totalPagado` en el modelo

Guardar el total calculado en el modelo introduce redundancia y posibilidad de inconsistencia. El total siempre se puede derivar de `precioBase * seats.length`. Si en el futuro hay descuentos o precios distintos por butaca, se agrega `precioFinal` al modelo en ese momento — YAGNI por ahora.
