# Feature: Backend — Modelos Mongoose + Auth JWT

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [x] En implementación
- [x] Completado

## Contexto
Esta spec monta la base del backend: conexión a MongoDB, todos los modelos Mongoose con sus índices críticos, y el sistema de autenticación con JWT real. Es la fundación sobre la que se construyen los endpoints de negocio (Spec 09) y la lógica de concurrencia e idempotencia (Spec 11).

Los índices de MongoDB definidos aquí son el mecanismo central que resuelve la concurrencia — el índice único `{ showtimeId, asiento }` en la colección `Booking` garantiza que solo un documento puede existir por asiento por función, sin necesidad de locks en la aplicación.

## Requisitos funcionales

### Conexión a base de datos

1. El servidor DEBE conectarse a MongoDB al arrancar usando la URI definida en variable de entorno `MONGODB_URI`.
2. Si la conexión falla, el servidor DEBE imprimir el error y terminar el proceso.

### Modelos Mongoose

3. El modelo `User` DEBE tener los campos: `nombre`, `email` (único), `passwordHash`, `createdAt`.

4. El modelo `Movie` DEBE tener los campos: `titulo`, `descripcion`, `generos` (array), `duracionMinutos`, `posterUrl`, `calificacion`, `activa` (boolean, default true).

5. El modelo `Showtime` DEBE tener los campos: `movieId` (ref a Movie), `sala`, `fechaHora` (Date), `precioBase`, `totalAsientos`, `filas`, `columnasPorFila`.

6. El modelo `Booking` DEBE tener los campos: `showtimeId` (ref a Showtime), `asiento` (string, ej: "A1"), `estado` (`held` | `confirmed` | `cancelled`), `userId` (ref a User), `holdExpiresAt` (Date), `confirmedAt` (Date, opcional), `idempotencyKey` (string, opcional), `precioFinal`, `createdAt`.

7. El modelo `Booking` DEBE tener el índice único `{ showtimeId: 1, asiento: 1 }` — este es el mecanismo que previene la doble reserva del mismo asiento.

8. El modelo `Booking` DEBE tener el índice TTL `{ holdExpiresAt: 1 }` con `expireAfterSeconds: 0` — MongoDB borra automáticamente los holds vencidos.

9. El modelo `IdempotencyKey` DEBE tener los campos: `key`, `userId` (ref a User), `endpoint`, `statusCode`, `responseBody` (Mixed), `createdAt`.

10. El modelo `IdempotencyKey` DEBE tener el índice único `{ key: 1, userId: 1, endpoint: 1 }` y un índice TTL de 24 horas sobre `createdAt`.

### Endpoints de autenticación

11. `POST /api/auth/registro` DEBE recibir `{ nombre, email, password }`, hashear la contraseña con bcrypt (cost factor 10), guardar el usuario, y devolver `{ token, user: { _id, nombre, email } }` con status 201.

12. `POST /api/auth/login` DEBE recibir `{ email, password }`, verificar contra el hash en BD, y devolver `{ token, user: { _id, nombre, email } }` con status 200.

13. Si el email ya está registrado en `/registro`, DEBE devolver status 409 con `{ error: 'El email ya está registrado.' }`.

14. Si las credenciales son incorrectas en `/login`, DEBE devolver status 401 con `{ error: 'Credenciales incorrectas.' }`.

15. El token JWT DEBE tener expiración de 7 días y contener `{ userId, email }` en el payload.

### Middleware de autenticación

16. El middleware `verifyToken` DEBE leer el header `Authorization: Bearer <token>`, verificar la firma con `JWT_SECRET`, y agregar `req.userId` al objeto de la request.

17. Si el token está ausente, expirado o inválido, DEBE devolver status 401.

## Requisitos no funcionales

- **Variables de entorno:** `MONGODB_URI`, `JWT_SECRET`, `PORT`. Definidas en `.env` (nunca en el código). El archivo `.env.example` documenta las variables requeridas.
- **Sin exponer passwordHash:** ningún endpoint devuelve el campo `passwordHash` al cliente.
- **Validación de inputs:** los endpoints de auth DEBEN validar que los campos requeridos están presentes antes de intentar operaciones en BD.
- **Nuevas dependencias a instalar:** `mongoose`, `bcryptjs`, `jsonwebtoken`, `dotenv` y sus tipos `@types/bcryptjs`, `@types/jsonwebtoken`.

## Criterios de aceptación

- DADO que el servidor arranca CUANDO `MONGODB_URI` es válida ENTONCES imprime "MongoDB conectado" y el servidor responde en `/health`.
- DADO un `POST /api/auth/registro` con datos válidos ENTONCES se crea el usuario en BD, el passwordHash NO es el password en texto plano, y el response incluye un JWT válido.
- DADO un `POST /api/auth/login` con credenciales correctas ENTONCES el response incluye un JWT que contiene `userId` y `email` en el payload.
- DADO un `POST /api/auth/login` con password incorrecto ENTONCES el response es 401.
- DADO una request a una ruta protegida sin token ENTONCES el response es 401.

## Fuera de alcance

- Endpoints GET de películas, funciones y reservas (Spec 09).
- El endpoint de reserva `POST /api/reservas` (Spec 11).
- Refresh tokens.
- Recuperación de contraseña.
