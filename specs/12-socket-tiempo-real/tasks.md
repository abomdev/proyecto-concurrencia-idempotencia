# Spec 12 — Tasks

## Instalación

- [ ] 1. Instalar dependencias: `socket.io` en backend, `socket.io-client` en frontend

## Backend

- [ ] 2. Crear `apps/backend/src/socket/io.ts` — instancia mutable para evitar circular import
- [ ] 3. Crear `apps/backend/src/socket/seatEvents.ts` — configura el servidor Socket.io con join/leave
- [ ] 4. Modificar `apps/backend/src/server.ts` — usar `http.createServer`, inicializar socket, exportar `io`
- [ ] 5. Modificar `apps/backend/src/controllers/booking.controller.ts` — emitir `seat:updated` tras reserva exitosa

## Frontend

- [ ] 6. Crear `apps/frontend/src/composables/useSocket.ts` — composable con singleton de socket
- [ ] 7. Modificar `apps/frontend/src/views/SeatsView.vue` — join/leave room + listener `seat:updated`
