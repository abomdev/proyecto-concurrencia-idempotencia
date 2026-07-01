# Spec 15 — Tasks

## Código (antes de desplegar)

- [ ] 1. Modificar `apps/frontend/src/services/api.ts` — baseURL vacío por defecto (rutas relativas)
- [ ] 2. Modificar `apps/frontend/src/composables/useSocket.ts` — conectar al mismo origen si no hay VITE_API_URL
- [ ] 3. Crear `docker-compose.prod.yml` — backend solo en red interna, sin build args de localhost

## AWS (manual, guiado paso a paso)

- [ ] 4. Verificar Free Tier / créditos (hecho)
- [ ] 5. Configurar Zero spend budget (hecho)
- [ ] 6. Crear instancia EC2 t2.micro (Amazon Linux 2023) con Security Group restringido
- [ ] 7. Conectarse por SSH
- [ ] 8. Instalar Docker + Docker Compose plugin en la instancia
- [ ] 9. Clonar el repositorio y crear `.env` de producción
- [ ] 10. Levantar el stack con `docker-compose.prod.yml`
- [ ] 11. Verificar acceso público y hacer la prueba end-to-end
