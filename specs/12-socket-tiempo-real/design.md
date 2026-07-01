# Spec 12 — Design

## Arquitectura

```
Backend (Express + Socket.io)
  │
  ├─ HTTP server (mismo puerto 3000)
  │    ├─ REST API  /api/*
  │    └─ Socket.io /socket.io/*  ← mismo server
  │
  └─ io.on('connection', socket => {
       socket.on('join:showtime', showtimeId => socket.join(`showtime:${showtimeId}`))
       socket.on('leave:showtime', showtimeId => socket.leave(`showtime:${showtimeId}`))
     })
```

```
Frontend (Vue 3 + socket.io-client)
  │
  └─ SeatsView.vue
       onMounted  → socket.emit('join:showtime', showtimeId)
       onUnmounted → socket.emit('leave:showtime', showtimeId) + socket.disconnect()
       socket.on('seat:updated', ({ asiento, estado }) →
         bookingStore.seatStates[showtimeId][asiento] = estado
       )
```

---

## Flujo de reserva con socket

```
Usuario A (pestaña 1)              Backend                    Usuario B (pestaña 2)
     │                               │                               │
     │── POST /api/reservas ────────►│                               │
     │                               │ (Booking creado: held)        │
     │◄── 201 { codigoReserva } ─────│                               │
     │                               │── io.to('showtime:X').emit ──►│
     │  (estado ya actualizado        │   seat:updated                │
     │   por el store local)         │   { asiento:'A1', estado:'held'}
     │                               │                               │
     │                               │                  bookingStore.seatStates
     │                               │                  ['showtimX']['A1'] = 'held'
     │                               │                  SeatButton se repinta ✓
```

---

## Archivos a crear/modificar

### Backend

**`src/socket/seatEvents.ts`** — configura el servidor Socket.io
```typescript
export function initSocket(httpServer: Server): SocketIOServer {
  const io = new SocketIOServer(httpServer, { cors: { origin: '*' } })
  io.on('connection', (socket) => {
    socket.on('join:showtime', (id: string) => socket.join(`showtime:${id}`))
    socket.on('leave:showtime', (id: string) => socket.leave(`showtime:${id}`))
  })
  return io
}
```

**`src/server.ts`** — cambiar `app.listen` por `httpServer.listen` + inicializar socket
```typescript
import { createServer } from 'http'
const httpServer = createServer(app)
const io = initSocket(httpServer)
// Exportar io para usarlo en el controller
export { io }
httpServer.listen(PORT, ...)
```

**`src/controllers/booking.controller.ts`** — emitir evento después de crear reserva
```typescript
import { io } from '../server'  // ← circular import (se resuelve con lazy import)
// Después del crearReserva exitoso, por cada asiento:
io.to(`showtime:${showtimeId}`).emit('seat:updated', {
  showtimeId,
  asiento,
  estado: 'held',
})
```

> **Nota sobre circular imports**: `server.ts` importa `booking.controller.ts` (vía routes) y `booking.controller.ts` necesita importar `io` de `server.ts`. Se resuelve exportando `io` como un objeto mutable que se asigna tras inicializar, o pasando `io` como parámetro al controller vía middleware.
>
> **Solución elegida**: exportar un módulo `src/socket/io.ts` con una instancia mutable (`let io`) que se setea desde `server.ts` y se importa desde el controller. Evita el circular import.

**`src/socket/io.ts`** (nuevo, resuelve el circular import)
```typescript
import { Server } from 'socket.io'
let _io: Server | null = null
export const setIo = (io: Server) => { _io = io }
export const getIo = () => _io
```

### Frontend

**`src/composables/useSocket.ts`** — composable que encapsula la conexión
```typescript
import { io, Socket } from 'socket.io-client'
let socket: Socket | null = null

export function useSocket() {
  function connect() {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:3000')
    }
    return socket
  }
  function disconnect() {
    socket?.disconnect()
    socket = null
  }
  return { connect, disconnect }
}
```

**`src/views/SeatsView.vue`** — join/leave room + listener
```typescript
onMounted(() => {
  // ...código existente...
  const s = useSocket().connect()
  s.emit('join:showtime', showtimeId)
  s.on('seat:updated', ({ asiento, estado }) => {
    if (bookingStore.seatStates[showtimeId]) {
      bookingStore.seatStates[showtimeId][asiento] = estado
    }
  })
})
onUnmounted(() => {
  const { disconnect } = useSocket()
  socket?.emit('leave:showtime', showtimeId)
  disconnect()
})
```

---

## Paquetes necesarios

**Backend:** `socket.io`
**Frontend:** `socket.io-client`

```
pnpm add socket.io --filter backend
pnpm add socket.io-client --filter frontend
```

---

## Decisiones de diseño

| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| Módulo `io.ts` mutable | Pasar `io` por middleware | Más simple; el circular import con módulo mutable es un patrón común en Express+Socket.io |
| Socket compartido en módulo | Un socket por componente | Un solo WebSocket por pestaña es lo correcto; múltiples conexiones simultáneas serían un bug |
| Emitir solo `held` (no `confirmed`) | Emitir también `confirmed` | El estado `confirmed` reemplaza al `held` en el mismo asiento; el cliente ya lo muestra ocupado. Se puede ampliar en Spec 13. |
| `socket.emit('leave:showtime')` + `disconnect()` | Solo `disconnect()` | Limpieza explícita antes de desconectar garantiza que la room se abandona incluso si Socket.io tarda en procesar la desconexión |
