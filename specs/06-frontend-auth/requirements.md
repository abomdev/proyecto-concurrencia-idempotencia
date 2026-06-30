# Feature: Login y Registro (frontend con JWT mock)

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [x] En implementación
- [x] Completado

## Contexto
Esta pantalla implementa el flujo de autenticación completo en el frontend usando datos mock. No hay backend todavía — el "login" acepta cualquier email válido con contraseña de 6+ caracteres y genera un token falso. En Fase C (backend) solo se reemplaza la llamada simulada por la llamada real a `POST /api/auth/login` y `POST /api/auth/registro`, sin cambiar la estructura de stores ni vistas.

La decisión de usar "JWT real desde el principio" se aplica en Fase C. Aquí preparamos toda la infraestructura (auth store, guards de ruta, Navbar dinámica) para que ese reemplazo sea trivial.

## Requisitos funcionales

### Página de Login (`/login`)

1. La página DEBE mostrar un formulario con los campos:
   - Email (input type email)
   - Contraseña (input type password)

2. El botón "Iniciar sesión" DEBE estar deshabilitado si el email está vacío o la contraseña tiene menos de 6 caracteres.

3. Al hacer click con formulario válido, DEBE mostrarse un estado de carga durante 1 segundo simulando la llamada al servidor.

4. Tras el segundo, DEBE guardar en el auth store un usuario mock con el nombre derivado del email (lo que está antes del `@`) y un token falso, luego redirigir a `/`.

5. Si el usuario intenta ir a `/login` ya estando autenticado, DEBE ser redirigido automáticamente a `/`.

6. La página DEBE tener un enlace "¿No tenés cuenta? Registrate" que lleve a `/registro`.

7. La página DEBE tener la Navbar.

### Página de Registro (`/registro`)

8. La página DEBE mostrar un formulario con los campos:
   - Nombre completo (texto)
   - Email (input type email)
   - Contraseña (input type password, mínimo 6 caracteres)

9. El botón "Crear cuenta" DEBE estar deshabilitado si algún campo está vacío o la contraseña tiene menos de 6 caracteres.

10. El flujo de submit es idéntico al login: 1 segundo de carga → guardar usuario mock → redirigir a `/`.

11. La página DEBE tener un enlace "¿Ya tenés cuenta? Iniciá sesión" que lleve a `/login`.

12. La página DEBE tener la Navbar.

### Navbar dinámica

13. Cuando el usuario NO está autenticado, la Navbar DEBE mostrar el botón "Iniciar sesión" que navega a `/login`.

14. Cuando el usuario ESTÁ autenticado, la Navbar DEBE mostrar:
    - El nombre del usuario (ej: "Hola, francisco")
    - Un botón o ícono para cerrar sesión que limpia el store y redirige a `/`

### Auth store

15. El auth store DEBE exponer:
    - `isAuthenticated: boolean`
    - `user: { nombre: string; email: string } | null`
    - `token: string | null`
    - `login(email, password)` — acción async (1s delay en fase mock)
    - `registro(nombre, email, password)` — acción async (1s delay en fase mock)
    - `logout()` — limpia el estado

16. El token DEBE persistirse en `localStorage` para sobrevivir recargas de página.

### Guard de ruta

17. La ruta `/mis-tickets` (Spec 07) DEBE estar protegida: si el usuario no está autenticado, redirigir a `/login`.

18. Las rutas de la cartelera y el flujo de compra (`/`, `/peliculas/:id`, `/funciones/:id/butacas`, `/checkout`, `/confirmacion`) NO requieren autenticación en esta fase.

## Requisitos no funcionales

- **Sin validación de contraseña real:** cualquier email bien formado + 6+ chars se acepta.
- **Nombre en login:** se deriva como `email.split('@')[0]` — en Fase C vendrá del backend.
- **Persistencia:** `localStorage` con la clave `crunchymark_token`. Al montar la app, si existe esa clave, restaurar la sesión en el store.
- **Componentes:** `InputText`, `Password` (PrimeVue, con toggle de visibilidad), `Button`, `Card`.

## Criterios de aceptación

- DADO que el usuario no está autenticado CUANDO hace click en "Iniciar sesión" en la Navbar ENTONCES navega a `/login`.
- DADO que completa el formulario de login válido CUANDO hace click en "Iniciar sesión" ENTONCES ve el spinner 1 segundo y luego la Navbar muestra su nombre.
- DADO que está autenticado CUANDO hace click en "Cerrar sesión" ENTONCES la Navbar vuelve a mostrar "Iniciar sesión" y es redirigido a `/`.
- DADO que recarga la página estando autenticado ENTONCES sigue autenticado (persistencia en localStorage).
- DADO que navega a `/login` estando autenticado ENTONCES es redirigido a `/`.

## Fuera de alcance

- Recuperación de contraseña.
- Validación de email duplicado (no hay backend aún).
- Confirmación de contraseña (campo repetir contraseña) — se agrega en Fase C con backend real.
- Protección de `/checkout` con autenticación (se evalúa en Fase E junto con la reserva real).
