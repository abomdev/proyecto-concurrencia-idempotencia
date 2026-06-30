# Tasks: Mis Tickets

## Estado
- [x] En implementación
- [x] Completado

---

## Tarea 1 — Crear `stores/tickets.ts`
**Archivo:** `apps/frontend/src/stores/tickets.ts`
- Interfaz `Ticket` con todos los campos
- 2 tickets mock hardcodeados

## Tarea 2 — Implementar `MyTicketsView.vue`
**Archivo:** `apps/frontend/src/views/MyTicketsView.vue`
- Reemplazar placeholder
- Encabezado con nombre del usuario autenticado
- Lista de tickets con Card + Chip + Divider
- Estado vacío con botón "Ver cartelera"

---

## Verificación

1. Navegar a `/mis-tickets` autenticado → ver 2 tickets con sus datos
2. Verificar que los precios se muestran en CLP (ej: $4.500, $9.000)
3. Verificar que la fecha muestra formato chileno (ej: "sáb. 5 de julio, 20:30")
4. Verificar el Chip verde "Confirmado" en cada ticket
5. Para probar estado vacío: cambiar temporalmente el mock a `[]` en el store → ver mensaje y botón
