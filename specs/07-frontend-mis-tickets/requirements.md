# Feature: Mis Tickets

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [x] En implementación
- [x] Completado

## Contexto
La pantalla "Mis Tickets" muestra el historial de compras del usuario autenticado. En esta fase los tickets son datos mock estáticos — en Fase D se reemplaza por la llamada real a `GET /api/mis-tickets`. La ruta ya está protegida por el guard de autenticación (Spec 06), así que esta pantalla solo es accesible con sesión activa.

## Requisitos funcionales

1. La página DEBE mostrar la lista de tickets comprados por el usuario.

2. Cada ticket DEBE mostrar:
   - Nombre de la película
   - Sala y fecha/hora de la función
   - Lista de butacas
   - Total pagado
   - Código de reserva (ej: `CRK-A4F2B8`)
   - Estado del ticket: `confirmado` (verde) o `cancelado` (gris)

3. Si el usuario no tiene tickets, DEBE mostrarse el mensaje "Aún no tienes tickets. ¡Compra tu primera entrada!" con un botón "Ver cartelera" que lleve a `/`.

4. La página DEBE tener la Navbar.

5. La página DEBE mostrar el nombre del usuario autenticado en el encabezado (ej: "Mis tickets de francisco").

## Requisitos no funcionales

- **Sin backend todavía:** los tickets son 2 o 3 objetos mock hardcodeados en un store de Pinia. En Fase D se reemplaza por llamada a la API real.
- **Acceso:** la ruta ya está protegida. Si el usuario no está autenticado, el guard de Spec 06 lo redirige a `/login`.
- **Componentes:** usar `Card`, `Chip`, `Divider` de PrimeVue.

## Criterios de aceptación

- DADO que el usuario está autenticado CUANDO navega a `/mis-tickets` ENTONCES ve el encabezado con su nombre y la lista de tickets mock.
- DADO que no hay tickets CUANDO navega a `/mis-tickets` ENTONCES ve el mensaje vacío con botón a la cartelera.
- DADO que el usuario no está autenticado CUANDO navega a `/mis-tickets` ENTONCES es redirigido a `/login` (ya implementado en Spec 06).

## Fuera de alcance

- Cancelar o modificar un ticket.
- Filtrar o paginar tickets.
- Código QR real del ticket.
- Integración con el backend (se implementa en Fase D).
