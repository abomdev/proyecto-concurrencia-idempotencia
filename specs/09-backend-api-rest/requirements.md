# Feature: Backend — API REST + Seed

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [x] En implementación
- [x] Completado

## Contexto
Esta spec implementa los endpoints GET que el frontend consume y el script de seed que puebla la base de datos con las 4 películas de anime confirmadas por el usuario. Al terminar esta spec, el frontend puede conectarse al backend real y dejar de usar datos mock.

## Requisitos funcionales

### Endpoints públicos (sin autenticación)

1. `GET /api/peliculas` — devuelve todas las películas con `activa: true`.

2. `GET /api/peliculas/:id` — devuelve una película por su `_id`. Si no existe, responde 404.

3. `GET /api/peliculas/:id/funciones` — devuelve todas las funciones de una película ordenadas por `fechaHora` ascendente.

4. `GET /api/funciones/:showtimeId/butacas` — devuelve el estado actual de las butacas NO disponibles de una función. El response es un objeto `{ "A1": "occupied", "C4": "held" }`. Solo incluye butacas con hold vigente (`holdExpiresAt > now`) o confirmadas.

### Endpoint protegido (requiere token JWT)

5. `GET /api/mis-tickets` — devuelve las reservas confirmadas del usuario autenticado, con datos de película y función populados.

### Script de seed

6. El script `seed.ts` DEBE insertar las 4 películas y 3 funciones por película (12 funciones en total).

7. El seed DEBE ser idempotente: si se ejecuta dos veces, no duplica datos. Usa `deleteMany` antes de insertar.

8. El seed DEBE poder ejecutarse con: `pnpm --filter backend seed`

## Datos del seed

### Películas

| Título | Géneros | Duración | Calificación |
|---|---|---|---|
| Kimetsu no Yaiba: El Castillo Infinito | Acción, Animación, Fantasía | 140 min | +14 |
| Jujutsu Kaisen: Ejecución | Acción, Animación, Sobrenatural | 112 min | +16 |
| Chainsaw Man: Reze | Acción, Animación, Terror | 98 min | +18 |
| Dragon Ball Super: Super Hero | Acción, Animación, Aventura | 100 min | ATP |

### Funciones (3 por película, ficticias)

Cada película tendrá funciones en Sala 1, Sala 2 y Sala 3, en fechas futuras próximas, con precio base entre $4.500 y $6.000 CLP y configuración de 8 filas × 10 columnas (80 butacas).

## Requisitos no funcionales

- **Sin paginación por ahora:** las listas devuelven todos los resultados.
- **Poster URLs:** usar `https://picsum.photos/seed/<nombre>/400/600` como placeholder hasta tener imágenes reales.
- **Script de seed:** archivo `apps/backend/src/seed/seed.ts`, ejecutable con `ts-node`.

## Criterios de aceptación

- DADO un `GET /api/peliculas` ENTONCES responde 200 con array de 4 películas.
- DADO un `GET /api/peliculas/:id/funciones` ENTONCES responde 200 con array de 3 funciones de esa película.
- DADO un `GET /api/funciones/:id/butacas` ENTONCES responde 200 con objeto de butacas no disponibles (vacío si todas están libres).
- DADO un `GET /api/mis-tickets` sin token ENTONCES responde 401.
- DADO un `GET /api/mis-tickets` con token válido ENTONCES responde 200 con array de reservas del usuario.
- DADO ejecutar `pnpm --filter backend seed` dos veces ENTONCES la BD tiene exactamente 4 películas y 12 funciones (no duplica).

## Fuera de alcance

- `POST /api/reservas` — el endpoint de reserva con lógica de concurrencia (Spec 11).
- Filtros, búsqueda o paginación de películas.
- Subida de imágenes reales para posters.
