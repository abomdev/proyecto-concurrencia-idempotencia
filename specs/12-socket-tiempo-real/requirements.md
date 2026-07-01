# Spec 12 — Socket.io en tiempo real

## Contexto

Cuando un usuario reserva una butaca, todos los demás usuarios que están viendo la misma función deben ver el cambio de color instantáneamente, sin recargar la página. Esto es lo que convierte el mapa de butacas en una experiencia de booking real.

---

## Requisitos

### RF-01 — Servidor Socket.io
El backend DEBE integrar Socket.io sobre el mismo servidor HTTP de Express. Al iniciar, el servidor expone tanto la API REST como el endpoint WebSocket en el mismo puerto.

### RF-02 — Rooms por función
Cada función (showtime) tiene su propia room con el identificador `showtime:${showtimeId}`. Un cliente que abre la vista de butacas DEBE unirse a esa room. Al salir de la vista, DEBE abandonar la room.

### RF-03 — Emisión de evento al reservar
Cuando `POST /api/reservas` tiene éxito, el backend DEBE emitir el evento `seat:updated` a todos los clientes en la room correspondiente (excepto al solicitante, para no duplicar el estado). El payload del evento es:
```json
{ "showtimeId": "...", "asiento": "A1", "estado": "held" }
```

### RF-04 — Recepción en el frontend
El cliente DEBE escuchar el evento `seat:updated` mientras está en la vista de butacas. Al recibirlo, DEBE actualizar el estado del asiento en el store de Pinia sin hacer una nueva llamada HTTP.

### RF-05 — Limpieza de conexión
Al navegar fuera de la vista de butacas (`onUnmounted`), el cliente DEBE desconectarse del socket para no acumular listeners.

---

## Criterios de aceptación

**CA-01 — Actualización en tiempo real**
DADO dos pestañas abiertas en la misma función
CUANDO el usuario de la pestaña A reserva la butaca B3
ENTONCES la butaca B3 cambia a color amarillo ("en proceso") en la pestaña B sin recargar

**CA-02 — Rooms aisladas**
DADO dos pestañas abiertas en funciones distintas
CUANDO el usuario reserva una butaca en la función X
ENTONCES la pestaña de la función Y no recibe el evento

**CA-03 — Sin duplicación de estado**
DADO que el usuario A acaba de reservar la butaca B3 (su pestaña ya tiene el estado correcto)
CUANDO el evento `seat:updated` llega desde el servidor
ENTONCES el estado del store en la pestaña A no cambia (ya era `held`)
