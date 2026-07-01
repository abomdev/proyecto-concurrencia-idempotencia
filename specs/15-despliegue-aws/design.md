# Spec 15 — Design

## Arquitectura de producción

```
Internet
   │
   │  http://<ip-publica>
   ▼
┌─────────────────────────────────────────┐
│  EC2 t2.micro (Amazon Linux 2023)        │
│                                           │
│  ┌─────────────┐      ┌───────────────┐ │
│  │  frontend   │      │   backend     │ │
│  │  nginx :80  │─────►│  node :3000   │ │
│  │  (público)  │ proxy│  (interno)    │ │
│  └─────────────┘      └───────┬───────┘ │
└────────────────────────────────┼─────────┘
                                  │
                                  ▼
                        MongoDB Atlas (M0)
                        (en la nube, fuera de EC2)
```

Solo el puerto 80 del frontend está expuesto a Internet. El backend es alcanzable únicamente dentro de la red interna de Docker (`docker-compose` los conecta por nombre de servicio). Esto reduce la superficie de ataque: nadie puede pegarle directamente al puerto 3000 desde fuera.

---

## Cambio de código necesario: URLs relativas en producción

Actualmente el frontend usa:
```typescript
// api.ts
baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
```

En desarrollo esto apunta al backend en `localhost:3000`. En producción, gracias al proxy de nginx (`/api/` → `backend:3000`, configurado en Spec 14), el frontend NO necesita conocer la IP del backend — puede usar rutas relativas y dejar que nginx resuelva el proxy.

**Cambio:** si `VITE_API_URL` no está definida en build time, usar cadena vacía (`''`) en vez de `localhost:3000`. Con baseURL `''`, Axios arma URLs relativas (`/api/peliculas`) que el navegador resuelve contra el mismo origen (`http://<ip-publica>/api/peliculas`) — nginx las intercepta y hace proxy al backend interno.

```typescript
// api.ts (actualizado)
baseURL: import.meta.env.VITE_API_URL ?? '',
```

Mismo criterio para Socket.io:
```typescript
// useSocket.ts (actualizado)
socket = io(import.meta.env.VITE_API_URL || undefined)
```//io() sin argumento se conecta al mismo origen que sirvió la página — correcto detrás de nginx.

**En desarrollo local** seguimos pasando `VITE_API_URL=http://localhost:3000` explícitamente (ya está en `apps/frontend/.env` y en el build arg de `docker-compose.yml`), así que el comportamiento de dev no cambia.

**En producción (EC2)** construimos el frontend SIN pasar `VITE_API_URL` (o pasándola vacía), para que use rutas relativas.

---

## docker-compose.prod.yml

Variante del compose para producción: sin bind mounts, sin build args de localhost.

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: docker/backend.Dockerfile
    env_file:
      - apps/backend/.env
    restart: unless-stopped
    expose:
      - "3000"          # solo accesible dentro de la red de Docker

  frontend:
    build:
      context: .
      dockerfile: docker/frontend.Dockerfile
      # sin VITE_API_URL → usa rutas relativas + proxy de nginx
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

Diferencia clave con el compose de desarrollo: `backend` usa `expose` (solo red interna) en vez de `ports` (que lo publicaría también al host/Internet).

---

## Pasos de aprovisionamiento en AWS (ejecutados por el usuario)

### 1. Crear la instancia EC2
- AMI: **Amazon Linux 2023**
- Tipo: **t2.micro** (Free Tier elegible)
- Par de claves: crear uno nuevo, descargar el `.pem` (es la única vez que se puede descargar)
- Security Group: crear uno nuevo con las reglas:
  | Tipo | Puerto | Origen |
  |---|---|---|
  | SSH | 22 | Mi IP (no "Anywhere") |
  | HTTP | 80 | Anywhere (0.0.0.0/0) |

### 2. Conectarse por SSH
```
chmod 400 crunchymark-key.pem
ssh -i crunchymark-key.pem ec2-user@<ip-publica>
```

### 3. Instalar Docker en la instancia
```
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
# cerrar sesión SSH y volver a conectar para que el grupo tome efecto
```

Instalar Docker Compose plugin:
```
sudo mkdir -p /usr/libexec/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose
```

### 4. Clonar el repo y configurar el .env
```
git clone https://github.com/<usuario>/Proyecto-Idempotencia.git
cd Proyecto-Idempotencia
nano apps/backend/.env
# pegar MONGODB_URI, JWT_SECRET, PORT=3000
```

### 5. Levantar el stack
```
docker compose -f docker-compose.prod.yml up -d --build
```

### 6. Verificar
```
docker compose -f docker-compose.prod.yml ps
curl http://localhost/api/peliculas
```
Y desde cualquier navegador: `http://<ip-publica>`

---

## Decisiones de diseño

| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| Rutas relativas + proxy nginx | IP pública hardcodeada en VITE_API_URL | La IP pública de EC2 cambia si se reinicia la instancia (a menos que se reserve una Elastic IP, que tiene costo si no está asociada). Las rutas relativas funcionan sin importar la IP |
| `expose` en vez de `ports` para backend | Publicar el 3000 también | Reduce superficie de ataque: el backend solo es alcanzable a través del proxy de nginx, nunca directamente desde Internet |
| MongoDB Atlas (no contenedor) | Mongo en un contenedor EC2 con volumen | t2.micro tiene 1GB de RAM; correr Mongo ahí compite por recursos con la app. Atlas M0 ya está listo y es gratuito |
| SSH restringido a "Mi IP" | SSH abierto a 0.0.0.0/0 | Reduce drásticamente los intentos de fuerza bruta automatizados contra el puerto 22 |
| `.env` creado manualmente en el servidor | Subir `.env` por SCP o commitearlo | Nunca debe pasar por el repositorio ni por history de git, ni siquiera temporalmente |
