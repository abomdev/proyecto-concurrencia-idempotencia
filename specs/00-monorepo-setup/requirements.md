# Feature: Scaffolding del monorepo

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [ ] En implementación
- [ ] Completado

## Contexto
Antes de escribir una sola línea de la aplicación, necesitamos un monorepo bien estructurado. Un monorepo es un único repositorio Git que contiene múltiples proyectos relacionados (en este caso, el frontend y el backend). Usar pnpm workspaces nos permite que ambos compartan dependencias, tengan scripts globales y se lancen con un solo comando desde la raíz. Esta base determina la calidad de todo lo que viene después: si está bien hecha, nunca vamos a tener que tocarla de nuevo.

## Requisitos funcionales

1. El repositorio DEBE tener una carpeta raíz `Proyecto-Concurrencia-Idempotencia/` con los archivos de configuración del monorepo: `pnpm-workspace.yaml`, `package.json`, `.npmrc`, `.gitignore`, `.env.example`, `README.md`.

2. La raíz DEBE contener una carpeta `apps/` con dos subcarpetas: `frontend/` y `backend/`, cada una con su propio `package.json`.

3. `apps/frontend/` DEBE tener un proyecto Vue 3 + Vite inicializado con:
   - Vue 3 en Composition API (con TypeScript)
   - PrimeVue (librería de componentes) con su tema por defecto
   - PrimeIcons (iconos de PrimeVue)
   - Pinia (manejo de estado global)
   - Vue Router 4 (navegación entre páginas)
   - Una página de inicio vacía que muestre el texto "Crunchymark — Frontend listo" para confirmar que funciona

4. `apps/backend/` DEBE tener un servidor Express inicializado con:
   - Node.js 20 + TypeScript (con ts-node-dev para hot reload en desarrollo)
   - Un endpoint `GET /health` que responda `{ "status": "ok", "service": "crunchymark-api" }`
   - Estructura de carpetas vacías: `models/`, `routes/`, `controllers/`, `middleware/`, `services/`, `socket/`, `config/`, `seed/`

5. El monorepo DEBE tener scripts globales en el `package.json` raíz que permitan:
   - `pnpm dev` — lanzar frontend y backend simultáneamente en desarrollo
   - `pnpm build` — construir frontend y backend para producción
   - `pnpm lint` — correr el linter en ambos proyectos

6. La raíz DEBE tener la carpeta `specs/` con la estructura de carpetas para los 16 specs del proyecto (00 al 15), cada una inicialmente vacía.

7. El archivo `.gitignore` DEBE excluir: `node_modules/`, `.env`, `dist/`, `*.local`.

8. El archivo `.env.example` DEBE documentar todas las variables de entorno que el proyecto necesitará (sin valores reales), con comentarios que expliquen para qué sirve cada una.

9. El archivo `README.md` DEBE incluir: nombre del proyecto, descripción técnica breve, requisitos previos (Node 20, pnpm), y cómo levantar el entorno de desarrollo.

10. El proyecto DEBE usar `pnpm` exclusivamente. El archivo `.npmrc` DEBE incluir la configuración necesaria para que pnpm funcione correctamente con Vite y Vue.

## Requisitos no funcionales

- **Seguridad:** el archivo `.env` nunca debe existir en el repositorio (cubierto por `.gitignore`). El `.env.example` documenta las variables sin valores reales.
- **Reproducibilidad:** cualquier persona que clone el repo y ejecute `pnpm install && pnpm dev` desde la raíz debe poder levantar el proyecto sin pasos adicionales.

## Criterios de aceptación

- DADO que el repositorio está clonado y se ejecutó `pnpm install` desde la raíz CUANDO se corre `pnpm dev` ENTONCES el frontend abre en `http://localhost:5173` y el backend en `http://localhost:3000` sin errores.
- DADO que el frontend está corriendo CUANDO se abre `http://localhost:5173` en el navegador ENTONCES se ve el texto "Crunchymark — Frontend listo".
- DADO que el backend está corriendo CUANDO se hace una petición GET a `http://localhost:3000/health` ENTONCES se recibe `{ "status": "ok", "service": "crunchymark-api" }`.
- DADO que se intenta ejecutar `npm install` en cualquier subcarpeta ENTONCES pnpm lo intercepta y muestra un error indicando que solo pnpm está permitido.

## Fuera de alcance

- Lógica de negocio de cualquier tipo (películas, reservas, usuarios).
- Conexión a base de datos (MongoDB se agrega en Fase C).
- Estilos o diseño visual (la página de inicio es solo texto plano).
- Docker (se agrega en Fase H).
- GitHub Actions / CI (se agrega en Fase G).
