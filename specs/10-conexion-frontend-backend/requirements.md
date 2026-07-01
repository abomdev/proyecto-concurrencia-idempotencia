# Feature: Conexión frontend-backend

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [ ] En implementación
- [ ] Completado

## Contexto
El frontend actualmente usa datos mock hardcodeados en los stores de Pinia. Esta spec reemplaza esos mocks por llamadas reales a la API del backend. Al terminar, el flujo completo (cartelera → detalle → butacas → checkout → confirmación) funciona con datos reales de MongoDB.

## Requisitos funcionales

### Servicio de API

1. DEBE existir un módulo `services/api.ts` que cree una instancia de Axios con la URL base del backend.

2. Un interceptor DEBE agregar automáticamente el header `Authorization: Bearer <token>` en cada request si el usuario está autenticado.

### Stores conectados a la API

3. `stores/movies.ts` DEBE obtener las películas del endpoint `GET /api/peliculas` en lugar de usar el array mock.

4. `stores/showtimes.ts` DEBE obtener las funciones de una película del endpoint `GET /api/peliculas/:id/funciones`.

5. `stores/booking.ts` DEBE obtener los estados de butacas del endpoint `GET /api/funciones/:id/butacas` en lugar del `MOCK_SEAT_STATES` hardcodeado.

6. `stores/auth.ts` DEBE usar los endpoints reales `POST /api/auth/login` y `POST /api/auth/registro` en lugar del mock de 1 segundo.

7. `stores/tickets.ts` DEBE obtener los tickets del endpoint `GET /api/mis-tickets`.

### Variables de entorno del frontend

8. La URL del backend DEBE configurarse con la variable `VITE_API_URL` en `apps/frontend/.env`. En desarrollo apunta a `http://localhost:3000`.

### Estados de carga y error

9. Los stores que hacen llamadas a la API DEBEN tener estado `loading: boolean`. Las vistas muestran un `ProgressSpinner` mientras cargan.

10. Si una llamada falla, DEBE mostrarse un mensaje de error en la vista en lugar de una pantalla en blanco.

## Requisitos no funcionales

- **Axios:** instalar en el frontend con `pnpm add axios --filter frontend`.
- **Sin cambiar las interfaces:** las interfaces TypeScript (`Movie`, `Showtime`, `Ticket`) ya son compatibles con lo que devuelve el backend — solo se reemplaza la fuente de datos.
- **`_id` de MongoDB:** el backend devuelve `_id` como string (mismo campo que usan las vistas). No requiere transformación.

## Criterios de aceptación

- DADO que el frontend carga CUANDO llega a la cartelera ENTONCES ve las 4 películas de anime reales (no el mock).
- DADO que selecciona una película ENTONCES ve las 3 funciones reales de esa película.
- DADO que entra al mapa de butacas ENTONCES el estado de las butacas viene del backend (vacío al principio).
- DADO que hace login con credenciales reales ENTONCES el backend emite un JWT real que se usa en requests posteriores.
- DADO que tiene tickets confirmados CUANDO va a "Mis tickets" ENTONCES ve sus compras reales.

## Fuera de alcance

- El endpoint `POST /api/reservas` con lógica de concurrencia (Spec 11).
- El header `Idempotency-Key` (Spec 11).
- Socket.io para estados en tiempo real (Spec 12).
