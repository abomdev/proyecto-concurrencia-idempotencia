# Spec 15 — Despliegue a AWS Free Tier

## Contexto

Último paso del proyecto: publicar Crunchymark en una URL pública y gratuita, usando el Free Tier de AWS. El resultado es un link que se puede poner en el CV/portfolio y que un reclutador puede abrir y usar de inmediato.

---

## Requisitos

### RF-01 — Instancia EC2
El proyecto DEBE desplegarse en una instancia **EC2 t2.micro** (Amazon Linux 2023), que está incluida en el Free Tier (750 horas/mes durante 12 meses).

### RF-02 — Docker en el servidor
La instancia DEBE tener Docker y Docker Compose instalados. El despliegue usa las mismas imágenes construidas en Spec 14.

### RF-03 — Base de datos
El servidor DEBE conectarse a **MongoDB Atlas** (el mismo cluster M0 usado en desarrollo, o un cluster separado de producción). No se despliega un contenedor de MongoDB en EC2 — usar el Free Tier de Atlas evita gestionar persistencia de datos en la instancia.

### RF-04 — Variables de entorno de producción
Las credenciales (`MONGODB_URI`, `JWT_SECRET`) DEBEN vivir únicamente en un archivo `.env` en el servidor, nunca en el repositorio ni en las imágenes Docker.

### RF-05 — Seguridad de red
El Security Group de la instancia DEBE permitir únicamente:
- Puerto 22 (SSH) — solo desde la IP del usuario
- Puerto 80 (HTTP) — público, para acceder a la app

### RF-06 — Acceso público
La aplicación DEBE ser accesible mediante la IP pública (o un dominio, si el usuario decide configurar uno) sin necesidad de VPN ni configuración adicional del lado del usuario final.

---

## Criterios de aceptación

**CA-01 — Instancia accesible por SSH**
DADO que la instancia EC2 está corriendo
CUANDO el usuario se conecta con `ssh -i clave.pem ec2-user@<ip-publica>`
ENTONCES obtiene acceso a la terminal del servidor

**CA-02 — Stack corriendo en el servidor**
DADO Docker instalado en la instancia
CUANDO se ejecuta `docker compose up -d`
ENTONCES ambos contenedores (frontend, backend) quedan corriendo en segundo plano

**CA-03 — Aplicación accesible públicamente**
DADO el stack corriendo
CUANDO cualquier persona abre `http://<ip-publica>` en su navegador
ENTONCES ve la cartelera de Crunchymark funcionando con datos reales de MongoDB Atlas

**CA-04 — Sin secrets expuestos**
DADO el repositorio público en GitHub
CUANDO se revisa el código fuente
ENTONCES no hay credenciales de MongoDB Atlas ni JWT_SECRET visibles en ningún archivo versionado
