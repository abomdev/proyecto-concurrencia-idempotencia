# Tareas: Scaffolding del monorepo

## Estado
- [ ] En implementación
- [ ] Completado

## Prerequisitos
- [x] `specs/00-monorepo-setup/requirements.md` aprobado
- [x] `specs/00-monorepo-setup/design.md` aprobado

---

## Tareas

### Bloque 1 — Archivos de configuración raíz

- [ ] **TASK-00-01:** Crear `pnpm-workspace.yaml` en la raíz
  - Archivo: `pnpm-workspace.yaml`

- [ ] **TASK-00-02:** Crear `package.json` raíz con nombre `crunchymark`, scripts globales (`dev`, `build`, `lint`) y dependencia `concurrently`
  - Archivo: `package.json`

- [ ] **TASK-00-03:** Crear `.npmrc` con `engine-strict=true` y `shamefully-hoist=true`
  - Archivo: `.npmrc`

- [ ] **TASK-00-04:** Crear `.gitignore` (node_modules, .env, dist, *.local, .DS_Store)
  - Archivo: `.gitignore`

- [ ] **TASK-00-05:** Crear `.env.example` con todas las variables documentadas (PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, VITE_API_URL, VITE_SOCKET_URL)
  - Archivo: `.env.example`

- [ ] **TASK-00-06:** Crear `README.md` con nombre del proyecto, descripción, requisitos previos y comandos de arranque
  - Archivo: `README.md`

### Bloque 2 — Scaffolding del frontend

- [ ] **TASK-00-07:** Crear `apps/frontend/package.json` con dependencias de Vue 3, PrimeVue 4, Pinia, vue-router y devDependencies de Vite + TypeScript
  - Archivo: `apps/frontend/package.json`

- [ ] **TASK-00-08:** Crear `apps/frontend/index.html` (punto de entrada HTML de Vite)
  - Archivo: `apps/frontend/index.html`

- [ ] **TASK-00-09:** Crear configuración de TypeScript del frontend (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`)
  - Archivos: `apps/frontend/tsconfig.json`, `apps/frontend/tsconfig.app.json`, `apps/frontend/tsconfig.node.json`

- [ ] **TASK-00-10:** Crear `apps/frontend/vite.config.ts`
  - Archivo: `apps/frontend/vite.config.ts`

- [ ] **TASK-00-11:** Crear `apps/frontend/src/assets/main.css` (vacío, solo reset básico)
  - Archivo: `apps/frontend/src/assets/main.css`

- [ ] **TASK-00-12:** Crear `apps/frontend/src/App.vue` (componente raíz con `<RouterView />`)
  - Archivo: `apps/frontend/src/App.vue`

- [ ] **TASK-00-13:** Crear `apps/frontend/src/router/index.ts` con la ruta raíz `/` → `HomeView`
  - Archivo: `apps/frontend/src/router/index.ts`

- [ ] **TASK-00-14:** Crear `apps/frontend/src/views/HomeView.vue` con el texto "Crunchymark — Frontend listo"
  - Archivo: `apps/frontend/src/views/HomeView.vue`

- [ ] **TASK-00-15:** Crear `apps/frontend/src/main.ts` registrando Pinia, Router y PrimeVue con tema Aura
  - Archivo: `apps/frontend/src/main.ts`

- [ ] **TASK-00-16:** Crear carpetas vacías del frontend: `stores/`, `components/`, `composables/`, `services/`, `types/`
  - Carpetas: `apps/frontend/src/stores/`, `apps/frontend/src/components/`, `apps/frontend/src/composables/`, `apps/frontend/src/services/`, `apps/frontend/src/types/`

### Bloque 3 — Scaffolding del backend

- [ ] **TASK-00-17:** Crear `apps/backend/package.json` con Express, cors y devDependencies de TypeScript + ts-node-dev
  - Archivo: `apps/backend/package.json`

- [ ] **TASK-00-18:** Crear `apps/backend/tsconfig.json`
  - Archivo: `apps/backend/tsconfig.json`

- [ ] **TASK-00-19:** Crear `apps/backend/src/server.ts` con Express, middleware cors + json, y endpoint `GET /health`
  - Archivo: `apps/backend/src/server.ts`

- [ ] **TASK-00-20:** Crear carpetas vacías del backend: `config/`, `models/`, `routes/`, `controllers/`, `middleware/`, `services/`, `socket/`, `seed/`
  - Carpetas: bajo `apps/backend/src/`

### Bloque 4 — Estructura de specs

- [ ] **TASK-00-21:** Crear las carpetas de los 15 specs restantes dentro de `specs/` (01 al 15), cada una vacía
  - Carpetas: `specs/01-frontend-cartelera/` … `specs/15-despliegue-aws/`

### Bloque 5 — Instalación y verificación

- [ ] **TASK-00-22:** Ejecutar `pnpm install` desde la raíz para instalar todas las dependencias
  - Comando que ejecuta el usuario: `pnpm install`

- [ ] **TASK-00-23:** Verificar que `pnpm dev` lanza frontend y backend sin errores
  - Comando que ejecuta el usuario: `pnpm dev`
  - Esperado: frontend en `http://localhost:5173`, backend en `http://localhost:3000`

- [ ] **TASK-00-24:** Verificar el endpoint de salud del backend
  - Acción del usuario: abrir `http://localhost:3000/health` en el navegador o con Thunder Client
  - Esperado: `{ "status": "ok", "service": "crunchymark-api" }`

### Bloque 6 — Git (ejecutado por el usuario)

- [ ] **TASK-00-25:** Inicializar el repositorio Git local
  - Comando: `git init`

- [ ] **TASK-00-26:** Crear el repositorio en GitHub (vacío, sin README ni .gitignore)
  - Acción: ir a github.com → New repository → nombre: `crunchymark` → Create repository

- [ ] **TASK-00-27:** Conectar el repositorio local con GitHub y hacer el primer push
  - Comandos que ejecuta el usuario (después de crear el repo en GitHub):
    ```
    git remote add origin https://github.com/TU_USUARIO/crunchymark.git
    git add .
    git commit -m "chore: scaffolding inicial del monorepo"
    git branch -M main
    git push -u origin main
    ```

---

## Notas de implementación

- Las carpetas vacías de Git (como `stores/`, `models/`, etc.) necesitan un archivo `.gitkeep` para que Git las trackee. Sin ese archivo, Git ignora las carpetas vacías y no se suben al repositorio.
- El nombre del workspace (`"name": "frontend"` y `"name": "backend"` en los `package.json` de cada app) debe coincidir exactamente con lo que se usa en los scripts `pnpm --filter frontend dev` de la raíz.
- En TASK-00-27, reemplazar `TU_USUARIO` con el nombre de usuario de GitHub real.
