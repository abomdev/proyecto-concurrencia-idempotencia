# Spec 14 — Dockerización

## Contexto

El proyecto necesita correr en contenedores para el despliegue en AWS. Docker permite que el mismo código funcione igual en cualquier máquina: la de desarrollo, CI, y producción.

---

## Requisitos

### RF-01 — Dockerfile del backend
El proyecto DEBE incluir un `docker/backend.Dockerfile` que construya una imagen de producción del backend Node.js usando un build multi-stage: compilar TypeScript en una etapa y correr solo el JS compilado en la etapa final (imagen más pequeña, sin devDependencies).

### RF-02 — Dockerfile del frontend
El proyecto DEBE incluir un `docker/frontend.Dockerfile` que construya una imagen de producción del frontend usando multi-stage: compilar con Node.js y servir el `dist/` resultante con nginx.

### RF-03 — docker-compose para desarrollo
El proyecto DEBE incluir un `docker-compose.yml` en la raíz que levante frontend + backend con un solo comando `docker-compose up`. Las variables de entorno del backend se leen desde `apps/backend/.env`. El frontend se conecta al backend via la URL correcta.

### RF-04 — Variables de entorno de producción
Las imágenes NO DEBEN contener secrets hardcodeados. Las variables de entorno (`MONGODB_URI`, `JWT_SECRET`) se pasan al contenedor en tiempo de ejecución.

### RF-05 — .dockerignore
Cada servicio DEBE tener un `.dockerignore` apropiado para excluir `node_modules`, `.env`, archivos de test y otros archivos innecesarios en la imagen de producción.

---

## Criterios de aceptación

**CA-01 — Build exitoso**
DADO el proyecto con los Dockerfiles
CUANDO se ejecuta `docker-compose build`
ENTONCES ambas imágenes se construyen sin errores

**CA-02 — Stack funcional en contenedores**
DADO las imágenes construidas
CUANDO se ejecuta `docker-compose up`
ENTONCES el frontend es accesible en `http://localhost:5173` y el backend en `http://localhost:3000`

**CA-03 — Sin secrets en las imágenes**
DADO que se inspecciona la imagen con `docker inspect`
ENTONCES no hay credenciales de MongoDB ni JWT_SECRET hardcodeados en las capas de la imagen
