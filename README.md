# Crunchymark

Sistema de venta de tickets de cine que demuestra el manejo de **concurrencia** e **idempotencia** en aplicaciones web modernas.

El problema central: dos usuarios hacen click en la misma butaca al mismo tiempo. Este proyecto implementa y demuestra las dos soluciones que los sistemas de producción usan para resolverlo.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 (Composition API) + Vite + PrimeVue |
| Backend | Node.js 20 + Express + TypeScript |
| Base de datos | MongoDB + Mongoose |
| Tiempo real | Socket.io |
| Infraestructura | Docker + AWS EC2 |

## Requisitos previos

- [Node.js 20+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/installation)

Verificar versiones instaladas:
```bash
node --version   # debe mostrar v20.x.x o superior
pnpm --version   # debe mostrar 9.x.x o superior
```

## Levantar el entorno de desarrollo

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/crunchymark.git
cd crunchymark

# 2. Instalar dependencias de todos los workspaces
pnpm install

# 3. Copiar variables de entorno y completarlas
cp .env.example .env

# 4. Levantar frontend y backend en paralelo
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/health

## Estructura del proyecto

```
apps/
  frontend/   Vue 3 + Vite + PrimeVue
  backend/    Node.js 20 + Express
specs/        Documentación por feature (estilo Kiro)
```

## Conceptos demostrados

- **Concurrencia:** índice único `{ showtimeId, asiento }` en MongoDB + `findOneAndUpdate` atómico previene que dos usuarios reserven la misma butaca simultáneamente.
- **Idempotencia:** middleware de `Idempotency-Key` garantiza que reintentos de la misma operación no generan reservas duplicadas.
