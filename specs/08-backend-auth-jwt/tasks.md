# Tasks: Backend — Modelos Mongoose + Auth JWT

## Estado
- [x] En implementación
- [x] Completado

---

## Tarea 0 — Crear cluster en MongoDB Atlas (lo hace el usuario)

MongoDB Atlas ofrece un cluster gratuito (M0) sin tarjeta de crédito.

### Pasos:

1. Ir a [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) → click **"Try Free"**
2. Crear cuenta (puede ser con Google)
3. Al preguntar por el tipo de deployment → elegir **"M0 FREE"** (aparece como la opción gratuita)
4. En **Cloud Provider** elegir cualquiera (AWS, Google, Azure) → en región elegir la más cercana (ej: São Paulo para Sudamérica)
5. En **Cluster Name** poner `crunchymark` → click **"Create"** (tarda ~2 minutos)

### Crear usuario de base de datos:
6. En el menú lateral → **"Database Access"** → **"Add New Database User"**
7. Autenticación: **"Password"**
8. Username: `crunchymark-admin`
9. Password: generar una segura con el botón **"Autogenerate Secure Password"** → **copiarlo ahora**, no se vuelve a mostrar
10. Rol: **"Atlas Admin"** → click **"Add User"**

### Permitir conexiones desde tu IP:
11. Menú lateral → **"Network Access"** → **"Add IP Address"**
12. Click **"Allow Access From Anywhere"** (agrega `0.0.0.0/0`) → **"Confirm"**
    > En producción esto se restringe. Para desarrollo es conveniente.

### Obtener la URI de conexión:
13. Menú lateral → **"Database"** → click **"Connect"** en tu cluster
14. Elegir **"Drivers"**
15. Copiar la URI — tiene este formato:
    ```
    mongodb+srv://crunchymark-admin:<password>@crunchymark.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
16. Reemplazar `<password>` con la contraseña del paso 9
17. Agregar el nombre de la base de datos antes del `?` (ver `.env.example` como referencia)

Guarda esta URI — la vas a necesitar en el paso siguiente.

---

## Tarea 1 — Crear el archivo `.env`

Crear `apps/backend/.env` con las variables del `.env.example` y completar con tu URI y credenciales reales.

> **Importante:** `.env` ya está en el `.gitignore` — nunca se sube al repositorio.

---

## Tarea 2 — Instalar dependencias en el backend

```bash
cd apps/backend && pnpm add mongoose bcryptjs jsonwebtoken dotenv && pnpm add -D @types/bcryptjs @types/jsonwebtoken && cd ../..
```

---

## Tarea 3 — Crear `config/env.ts` y `config/db.ts`

El asistente escribe estos archivos.

---

## Tarea 4 — Crear los 5 modelos Mongoose

El asistente escribe: `User.ts`, `Movie.ts`, `Showtime.ts`, `Booking.ts`, `IdempotencyKey.ts`.

---

## Tarea 5 — Crear `middleware/auth.middleware.ts`

El asistente escribe el middleware `verifyToken`.

---

## Tarea 6 — Crear `controllers/auth.controller.ts` y `routes/auth.routes.ts`

El asistente escribe el controller y las rutas de auth.

---

## Tarea 7 — Actualizar `server.ts`

El asistente actualiza el servidor para conectar a MongoDB y montar las rutas.

---

## Tarea 8 — Actualizar `.env.example`

El asistente actualiza el archivo de documentación de variables de entorno.

---

## Verificación (la hace el usuario)

Una vez completadas todas las tareas:

### 1. Levantar el backend
```bash
pnpm --filter backend dev
```

Deberías ver:
```
MongoDB conectado
Crunchymark API corriendo en http://localhost:3000
```

### 2. Probar `/health`
Abrir en el navegador: `http://localhost:3000/health`
Debe responder: `{ "status": "ok", "service": "crunchymark-api" }`

### 3. Probar registro con Thunder Client o Postman
- Método: `POST`
- URL: `http://localhost:3000/api/auth/registro`
- Body (JSON):
  ```json
  { "nombre": "Francisco", "email": "test@test.com", "password": "123456" }
  ```
- Respuesta esperada (201):
  ```json
  { "token": "eyJ...", "user": { "_id": "...", "nombre": "Francisco", "email": "test@test.com" } }
  ```

### 4. Probar login
- Método: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body:
  ```json
  { "email": "test@test.com", "password": "123456" }
  ```
- Respuesta esperada (200): mismo formato con token

### 5. Probar email duplicado
- Repetir el registro con el mismo email
- Respuesta esperada (409):
  ```json
  { "error": "El email ya está registrado." }
  ```

### 6. Probar credenciales incorrectas
- Login con password equivocado
- Respuesta esperada (401):
  ```json
  { "error": "Credenciales incorrectas." }
  ```
