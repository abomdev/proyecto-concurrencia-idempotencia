# Spec 14 — Design

## Arquitectura de contenedores

```
docker-compose up
  │
  ├─ frontend  (puerto 5173 → nginx)
  │    Imagen: nginx:alpine
  │    Sirve: dist/ de Vite
  │    Nginx proxy: /api/* → backend:3000
  │
  └─ backend   (puerto 3000 → Node.js)
       Imagen: node:20-alpine
       Corre: node dist/server.js
       Env:   MONGODB_URI, JWT_SECRET, PORT
       (MongoDB: Atlas en la nube, no hay contenedor de Mongo)
```

---

## docker/backend.Dockerfile

```dockerfile
# ── Etapa 1: build ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar manifiestos para aprovechar cache de capas
COPY package.json pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --filter backend --frozen-lockfile --prod=false

# Compilar TypeScript
COPY apps/backend ./apps/backend
RUN pnpm --filter backend build

# ── Etapa 2: producción ─────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN pnpm install --filter backend --frozen-lockfile --prod

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

EXPOSE 3000
CMD ["node", "apps/backend/dist/server.js"]
```

**Por qué multi-stage**: la etapa `builder` tiene TypeScript, ts-node, vitest y todas las devDependencies (~150MB extra). La etapa `runner` solo tiene las dependencias de producción y el JS compilado. La imagen final es ~3x más pequeña.

---

## docker/frontend.Dockerfile

```dockerfile
# ── Etapa 1: build ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
RUN pnpm install --filter frontend --frozen-lockfile

# VITE_API_URL se pasa como build arg para que quede embebido en el JS
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

COPY apps/frontend ./apps/frontend
RUN pnpm --filter frontend build

# ── Etapa 2: nginx ──────────────────────────────────────────
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Por qué nginx y no `vite preview`**: nginx es el estándar para servir SPAs en producción. Maneja correctamente el routing de Vue Router (todas las rutas no encontradas retornan `index.html`).

**VITE_API_URL como build arg**: Vite embebe las variables de entorno en el bundle en tiempo de build. No se pueden cambiar en runtime. Por eso se pasa como ARG del Dockerfile.

---

## docker/nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Vue Router: todas las rutas no encontradas sirven index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy al backend (solo necesario si frontend y backend comparten dominio)
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
    }

    location /socket.io/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Por qué proxy en nginx**: en producción, el frontend en el puerto 80 hace proxy de `/api/*` y `/socket.io/*` al backend. Así el browser solo habla con un origen (sin CORS) y la URL del backend no queda expuesta en el cliente.

---

## docker-compose.yml

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: docker/backend.Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - apps/backend/.env
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: docker/frontend.Dockerfile
      args:
        VITE_API_URL: http://localhost:3000
    ports:
      - "5173:80"    # nginx interno en 80, expuesto en 5173
    depends_on:
      - backend
    restart: unless-stopped
```

**`env_file`**: lee el `.env` del backend en runtime. Los secrets nunca se copian a la imagen.

---

## Archivos a crear

```
docker/
  backend.Dockerfile
  frontend.Dockerfile
  nginx.conf
docker-compose.yml
apps/backend/.dockerignore
apps/frontend/.dockerignore
```

---

## Decisiones de diseño

| Decisión | Alternativa | Por qué |
|---|---|---|
| MongoDB Atlas (sin contenedor) | `mongo` service en compose | Atlas M0 ya está configurado y es gratuito. Un contenedor de Mongo en dev requiere volúmenes y no refleja producción |
| nginx para frontend | `vite preview` | nginx es el estándar de producción; maneja SPA routing, compresión gzip, y actúa como proxy para el backend |
| Build args para VITE_API_URL | Runtime env vars | Vite embebe las vars en el bundle en build time. No hay forma de cambiarlas en runtime sin rebuilding |
| Context `.` en docker-compose | Context por servicio | Los Dockerfiles necesitan acceder tanto a `apps/backend` como a los manifiestos raíz (`package.json`, `pnpm-workspace.yaml`). El context debe ser la raíz del monorepo |
