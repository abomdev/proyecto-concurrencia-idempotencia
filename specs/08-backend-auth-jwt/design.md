# Design: Backend — Modelos Mongoose + Auth JWT

## Estado
- [x] Borrador
- [x] Aprobado por el usuario

---

## Dependencias nuevas a instalar

```bash
# En apps/backend:
pnpm add mongoose bcryptjs jsonwebtoken dotenv
pnpm add -D @types/bcryptjs @types/jsonwebtoken
```

- **mongoose** — ODM para MongoDB. Define los esquemas, tipos y índices.
- **bcryptjs** — hashea contraseñas antes de guardarlas. El número `10` es el "cost factor" — cuántas rondas de hashing se aplican. 10 es el estándar para producción (lento para atacantes, rápido para usuarios legítimos).
- **jsonwebtoken** — firma y verifica JWTs. El token viaja en el header `Authorization: Bearer <token>` en cada request autenticada.
- **dotenv** — carga el archivo `.env` en `process.env` al arrancar el servidor.

---

## Archivos nuevos

```
apps/backend/src/
├── config/
│   ├── env.ts               ← variables de entorno tipadas
│   └── db.ts                ← conexión a MongoDB
├── models/
│   ├── User.ts
│   ├── Movie.ts
│   ├── Showtime.ts
│   ├── Booking.ts
│   └── IdempotencyKey.ts
├── middleware/
│   └── auth.middleware.ts   ← verifyToken
├── routes/
│   └── auth.routes.ts
└── controllers/
    └── auth.controller.ts
```

## Archivos modificados

```
apps/backend/src/server.ts   ← agrega dotenv, connectDB y auth routes
.env.example                 ← documenta las variables requeridas
.env                         ← valores reales (gitignoreado)
```

---

## MongoDB Atlas para desarrollo

Antes de levantar el backend necesitamos una base de datos. En esta fase usamos **MongoDB Atlas Free Tier** (512 MB, gratis para siempre) para no tener que instalar MongoDB localmente. Docker con MongoDB local llega en Spec 14.

Pasos para obtener la URI (se detallan en las tareas):
1. Crear cuenta en mongodb.com/atlas
2. Crear cluster gratuito (M0)
3. Crear usuario de base de datos
4. Obtener la URI de conexión (formato: `mongodb+srv://usuario:password@cluster.mongodb.net/crunchymark`)

---

## `config/env.ts` — variables de entorno tipadas

Centralizar todas las variables de entorno en un solo lugar. Si falta alguna variable crítica, falla rápido al arrancar en lugar de fallar tarde en runtime.

```typescript
export const env = {
  PORT: process.env.PORT ?? '3000',
  MONGODB_URI: process.env.MONGODB_URI ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
}
```

---

## `config/db.ts` — conexión a MongoDB

```typescript
import mongoose from 'mongoose'
import { env } from './env'

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI)
  console.log('MongoDB conectado')
}
```

`server.ts` llama `connectDB()` antes de `app.listen()`. Si la conexión falla, mongoose lanza una excepción que se propaga y termina el proceso — comportamiento correcto: no tiene sentido servir requests sin base de datos.

---

## Modelos Mongoose

### `User.ts`

```typescript
const userSchema = new Schema({
  nombre:       { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } })
```

`lowercase: true` normaliza el email antes de guardarlo — `Test@test.com` y `test@test.com` son el mismo usuario.

### `Movie.ts`

```typescript
const movieSchema = new Schema({
  titulo:           { type: String, required: true },
  descripcion:      String,
  generos:          [String],
  duracionMinutos:  Number,
  posterUrl:        String,
  calificacion:     String,
  activa:           { type: Boolean, default: true },
})
```

### `Showtime.ts`

```typescript
const showtimeSchema = new Schema({
  movieId:          { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  sala:             { type: String, required: true },
  fechaHora:        { type: Date, required: true },
  precioBase:       { type: Number, required: true },
  totalAsientos:    { type: Number, required: true },
  filas:            { type: Number, required: true },
  columnasPorFila:  { type: Number, required: true },
})
```

### `Booking.ts` — el modelo más importante

```typescript
const bookingSchema = new Schema({
  showtimeId:      { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
  asiento:         { type: String, required: true },
  estado:          { type: String, enum: ['held', 'confirmed', 'cancelled'], required: true },
  userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  holdExpiresAt:   { type: Date },
  confirmedAt:     { type: Date },
  idempotencyKey:  { type: String },
  precioFinal:     { type: Number, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } })

// ⬇️ EL ÍNDICE QUE RESUELVE LA CONCURRENCIA
bookingSchema.index({ showtimeId: 1, asiento: 1 }, { unique: true })

// ⬇️ EL ÍNDICE QUE LIBERA HOLDS AUTOMÁTICAMENTE
bookingSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0 })

bookingSchema.index({ userId: 1 })
```

**Por qué el índice único resuelve la concurrencia:**
Si dos usuarios intentan reservar el mismo asiento al mismo tiempo, ambas requests llegan al controller casi simultáneamente. El primer `insert` pasa. El segundo falla con error de MongoDB código `11000` (duplicate key). MongoDB garantiza esto a nivel de motor — es atómico. No se necesita ningún lock en la aplicación.

**Por qué `expireAfterSeconds: 0` en el TTL:**
El valor `0` no significa "expira inmediatamente". Significa "expira cuando `holdExpiresAt` sea igual o menor al tiempo actual". MongoDB tiene un proceso interno que corre cada ~60 segundos y borra los documentos vencidos. El campo `holdExpiresAt` se setea a `now + 10 minutos` cuando se crea un hold.

### `IdempotencyKey.ts`

```typescript
const idempotencyKeySchema = new Schema({
  key:          { type: String, required: true },
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint:     { type: String, required: true },
  statusCode:   { type: Number, required: true },
  responseBody: { type: Schema.Types.Mixed, required: true },
  createdAt:    { type: Date, default: Date.now },
})

idempotencyKeySchema.index({ key: 1, userId: 1, endpoint: 1 }, { unique: true })
idempotencyKeySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }) // 24h
```

---

## Flujo de autenticación

```
POST /api/auth/registro
  └─ valida campos presentes
       └─ bcrypt.hash(password, 10)
            └─ User.create({ nombre, email, passwordHash })
                 ├─ error 11000 (email duplicado) → 409
                 └─ éxito → jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
                              └─ 201 { token, user: { _id, nombre, email } }

POST /api/auth/login
  └─ valida campos presentes
       └─ User.findOne({ email })
            ├─ no encontrado → 401
            └─ encontrado → bcrypt.compare(password, user.passwordHash)
                 ├─ no coincide → 401
                 └─ coincide → jwt.sign(...)
                                └─ 200 { token, user: { _id, nombre, email } }
```

---

## `auth.middleware.ts` — `verifyToken`

```typescript
export interface AuthRequest extends Request {
  userId?: string
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido.' })
    return
  }
  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' })
  }
}
```

`AuthRequest` extiende `Request` de Express para agregar `userId`. Las rutas protegidas usan `AuthRequest` en lugar de `Request`.

---

## `server.ts` actualizado

```typescript
import 'dotenv/config'         // ← debe ser la primera línea
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db'
import authRoutes from './routes/auth.routes'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'crunchymark-api' }))
app.use('/api/auth', authRoutes)

connectDB().then(() => {
  app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Crunchymark API corriendo en http://localhost:${process.env.PORT ?? 3000}`)
  })
})
```

`import 'dotenv/config'` debe ser la primera línea para que las variables de entorno estén disponibles antes de que cualquier otro módulo las lea.

---

## `.env.example`

```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/crunchymark
JWT_SECRET=cambia_esto_por_una_cadena_larga_y_aleatoria
PORT=3000
```

---

## Decisiones tomadas vs alternativas descartadas

### bcryptjs vs bcrypt (nativo)

`bcrypt` nativo requiere compilar código C++ al instalar, lo que puede fallar en algunas configuraciones de Windows. `bcryptjs` es puro JavaScript, sin dependencias nativas, más fácil de instalar. La diferencia de rendimiento es irrelevante para el volumen de este proyecto.

### JWT en header `Authorization: Bearer` vs cookie httpOnly

Las cookies httpOnly son más seguras contra XSS porque JavaScript no puede leerlas. Sin embargo, requieren configuración de CORS más compleja (credentials: include) y manejar CSRF. Para este proyecto de portfolio, el header `Authorization: Bearer` es la convención más usada en APIs REST y es suficientemente seguro con HTTPS en producción.

### `AuthRequest extends Request` vs `declare global namespace Express`

Extender el namespace global de Express contamina todos los tipos del proyecto. `AuthRequest` es explícito — las rutas que no requieren auth siguen usando `Request` normal, las que sí requieren auth usan `AuthRequest`. Más claro y sin efectos secundarios.
