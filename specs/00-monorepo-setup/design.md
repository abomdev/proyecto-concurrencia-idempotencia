# Diseño: Scaffolding del monorepo

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [ ] En implementación
- [ ] Completado

---

## ¿Por qué un monorepo con pnpm workspaces?

Un **monorepo** es un único repositorio Git que contiene múltiples proyectos. En vez de tener dos repos separados (uno para frontend, uno para backend), lo tenemos todo junto. Ventajas concretas para este proyecto:

- Un solo `git clone` descarga todo
- Scripts globales: `pnpm dev` desde la raíz lanza los dos servicios
- Las dependencias compartidas (tipos TypeScript, por ejemplo) se pueden reutilizar sin publicar paquetes

**pnpm workspaces** es la funcionalidad de pnpm que hace posible esto: le dice al gestor de paquetes que `apps/frontend` y `apps/backend` son proyectos independientes dentro del mismo repo, pero que comparten el `node_modules` de la raíz cuando pueden.

---

## Estructura de archivos a crear

```
Proyecto-Idempotencia/           ← carpeta que ya existe en disco
│
├── pnpm-workspace.yaml          ← le dice a pnpm que apps/* son workspaces
├── package.json                 ← scripts globales (dev, build, lint)
├── .npmrc                       ← bloquea npm, configura pnpm para Vite
├── .gitignore
├── .env.example
├── README.md
│
├── apps/
│   ├── frontend/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.node.json
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.ts
│   │       ├── App.vue
│   │       ├── router/
│   │       │   └── index.ts
│   │       ├── stores/          ← vacío por ahora
│   │       ├── views/
│   │       │   └── HomeView.vue ← muestra "Crunchymark — Frontend listo"
│   │       ├── components/      ← vacío por ahora
│   │       ├── composables/     ← vacío por ahora
│   │       ├── services/        ← vacío por ahora
│   │       ├── types/           ← vacío por ahora
│   │       └── assets/
│   │           └── main.css
│   │
│   └── backend/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── server.ts        ← entry point, endpoint /health
│           ├── config/          ← vacío por ahora
│           ├── models/          ← vacío por ahora
│           ├── routes/          ← vacío por ahora
│           ├── controllers/     ← vacío por ahora
│           ├── middleware/      ← vacío por ahora
│           ├── services/        ← vacío por ahora
│           ├── socket/          ← vacío por ahora
│           └── seed/            ← vacío por ahora
│
└── specs/
    ├── 00-monorepo-setup/       ← este spec
    ├── 01-frontend-cartelera/
    ├── 02-frontend-detalle-pelicula/
    ├── 03-frontend-seleccion-butacas/
    ├── 04-frontend-checkout/
    ├── 05-frontend-confirmacion/
    ├── 06-frontend-auth/
    ├── 07-frontend-mis-tickets/
    ├── 08-backend-auth-jwt/
    ├── 09-backend-api-rest/
    ├── 10-conexion-frontend-backend/
    ├── 11-concurrencia-idempotencia/
    ├── 12-socket-tiempo-real/
    ├── 13-testing-race-condition/
    ├── 14-dockerizacion/
    └── 15-despliegue-aws/
```

---

## Contenido de cada archivo de configuración

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
```

**¿Qué hace?** Le dice a pnpm que cualquier carpeta dentro de `apps/` es un workspace independiente con su propio `package.json`. Así `pnpm install` desde la raíz instala las dependencias de todos los proyectos a la vez.

---

### `package.json` (raíz)

```json
{
  "name": "crunchymark",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm --filter frontend dev\" \"pnpm --filter backend dev\"",
    "build": "pnpm --filter frontend build && pnpm --filter backend build",
    "lint": "pnpm --filter frontend lint && pnpm --filter backend lint"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

**¿Qué hace cada parte?**
- `"private": true` — evita que este paquete raíz se publique accidentalmente a npm
- `pnpm --filter frontend dev` — corre el script `dev` únicamente en el workspace cuyo `name` en `package.json` es `"frontend"`
- `concurrently` — herramienta que lanza múltiples procesos en paralelo en una sola terminal, mostrando la salida de los dos con colores distintos

---

### `.npmrc`

```ini
engine-strict=true
shamefully-hoist=true
```

**¿Qué hace cada línea?**
- `engine-strict=true` — si alguien intenta instalar con una versión de Node diferente a la especificada en `package.json`, pnpm arroja un error. Garantiza que todos usen Node 20.
- `shamefully-hoist=true` — Vite necesita que algunos paquetes estén en el `node_modules` raíz del proyecto. Esta opción le dice a pnpm que los "eleve" allí aunque técnicamente pertenezcan a un workspace hijo. Sin esto, Vite fallaría al encontrar sus plugins.

---

### `.gitignore`

```gitignore
# Dependencias
node_modules/

# Variables de entorno reales (nunca al repo)
.env
.env.*.local

# Builds
dist/
build/

# Archivos locales de editores
*.local
.DS_Store
Thumbs.db
```

---

### `.env.example`

```dotenv
# ─── BACKEND ────────────────────────────────────────────────

# Puerto donde corre el servidor Express
PORT=3000

# URI de conexión a MongoDB (se configura en Fase C)
# Formato: mongodb://usuario:password@host:puerto/nombre-db
MONGODB_URI=mongodb://localhost:27017/crunchymark

# Clave secreta para firmar los tokens JWT (se configura en Fase C)
# Usar un string largo y aleatorio, nunca una palabra simple
JWT_SECRET=reemplaza_esto_con_un_string_muy_largo_y_aleatorio

# Tiempo de expiración del token JWT
JWT_EXPIRES_IN=7d

# ─── FRONTEND ───────────────────────────────────────────────

# URL base de la API del backend (usada por Axios en Fase D)
VITE_API_URL=http://localhost:3000

# URL del servidor de WebSockets (usada por Socket.io en Fase F)
VITE_SOCKET_URL=http://localhost:3000
```

**Nota importante:** Las variables del frontend DEBEN empezar con `VITE_`. Vite solo expone al navegador las variables que tienen ese prefijo — es una medida de seguridad para evitar que variables privadas (como `JWT_SECRET`) lleguen accidentalmente al cliente.

---

### `apps/frontend/package.json`

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "lint": "eslint . --ext .vue,.ts,.tsx --fix",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.0",
    "pinia": "^2.2.0",
    "primevue": "^4.0.0",
    "primeicons": "^7.0.0",
    "@primevue/themes": "^4.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vue-tsc": "^2.1.0"
  }
}
```

---

### `apps/backend/package.json`

```json
{
  "name": "backend",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint . --ext .ts --fix"
  },
  "dependencies": {
    "express": "^4.19.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/node": "^20.0.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.5.0"
  }
}
```

**¿Qué es ts-node-dev?** Es el equivalente a `nodemon` para TypeScript. Observa los archivos `.ts`, los compila en memoria y reinicia el servidor automáticamente cuando detecta un cambio. No necesita un paso de build separado durante el desarrollo.

---

### `apps/frontend/src/main.ts`

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode'
    }
  }
})

app.mount('#app')
```

**¿Por qué este orden de `use()`?** Pinia debe registrarse antes que el router porque los guards de navegación (que verifican si el usuario está logueado) necesitan acceder a los stores de Pinia. PrimeVue va después porque solo registra componentes y no depende de los otros dos.

**¿Qué es Aura?** Es uno de los temas de diseño que viene incluido con PrimeVue 4. Da un aspecto moderno y limpio. Lo podemos cambiar o personalizar en Fase B cuando trabajemos el diseño visual.

---

### `apps/frontend/src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    }
  ]
})

export default router
```

Las rutas de las otras 6 páginas se agregan en Fase B, una por una junto con su spec.

---

### `apps/frontend/src/views/HomeView.vue`

```vue
<template>
  <main>
    <h1>Crunchymark — Frontend listo</h1>
  </main>
</template>
```

Solo texto, sin estilos. El diseño real de la cartelera se construye en Spec 01 (Fase B).

---

### `apps/backend/src/server.ts`

```typescript
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'crunchymark-api' })
})

app.listen(PORT, () => {
  console.log(`Crunchymark API corriendo en http://localhost:${PORT}`)
})
```

**¿Qué es CORS?** Cross-Origin Resource Sharing. Es una política de seguridad de los navegadores que bloquea peticiones entre dominios distintos. Sin `cors()`, cuando el frontend en `localhost:5173` intente hablar con el backend en `localhost:3000`, el navegador rechazaría la petición. El middleware `cors()` agrega los headers necesarios para permitirlo.

---

## Decisiones de diseño

| Alternativa considerada | Decisión tomada | Razón |
|---|---|---|
| Usar Vite para crear el proyecto frontend desde cero con `pnpm create vite` | Crear los archivos manualmente con las versiones exactas que necesitamos | El comando `create vite` hace muchas preguntas interactivas y genera archivos de ejemplo que después hay que limpiar. Crearlo manualmente da control total desde el inicio. |
| Usar JavaScript en el backend | TypeScript en ambos | Consistencia entre frontend y backend. El proyecto demuestra madurez técnica al usar el mismo lenguaje tipado en todo el stack. |
| Tema de PrimeVue: Material, Lara, Nora | Aura | Es el tema más moderno de PrimeVue 4 y el que mejor queda con un diseño oscuro de cine. Es también el que está documentado como "por defecto" en la documentación oficial. |
| Agregar ESLint desde el inicio | Incluido en el scaffolding | Un proyecto de portfolio que tiene linter configurado desde el principio demuestra buenas prácticas. Los errores de lint son visibles en VSCode en tiempo real. |

## Diagrama de arranque del proyecto

```
pnpm dev (desde raíz)
    │
    ├── concurrently lanza:
    │       │
    │       ├── pnpm --filter frontend dev
    │       │       └── vite → http://localhost:5173
    │       │
    │       └── pnpm --filter backend dev
    │               └── ts-node-dev → http://localhost:3000
    │
    └── terminal muestra output de ambos con colores distintos
```
