# Tasks: Login y Registro (frontend con JWT mock)

## Estado
- [x] En implementación
- [x] Completado

---

## Tarea 1 — Crear `stores/auth.ts`
**Archivo:** `apps/frontend/src/stores/auth.ts`
- Estado inicial lee localStorage (`crunchymark_token`, `crunchymark_user`)
- Getter `isAuthenticated`
- Acciones: `login()`, `registro()`, `logout()`

## Tarea 2 — Actualizar router con rutas y guard
**Archivo:** `apps/frontend/src/router/index.ts`
- Agregar rutas `/login`, `/registro`, `/mis-tickets` con sus metas
- Agregar `router.beforeEach` con guard `requiresAuth` / `requiresGuest`

## Tarea 3 — Actualizar Navbar para mostrar estado de autenticación
**Archivo:** `apps/frontend/src/components/Navbar.vue`
- Si no autenticado: botón "Iniciar sesión" → `/login`
- Si autenticado: nombre del usuario + botón de logout

## Tarea 4 — Crear `LoginView.vue`
**Archivo:** `apps/frontend/src/views/LoginView.vue`
- Formulario: email + contraseña con toggle
- 1s de carga → `authStore.login()` → redirect `/`

## Tarea 5 — Crear `RegistroView.vue`
**Archivo:** `apps/frontend/src/views/RegistroView.vue`
- Formulario: nombre + email + contraseña con toggle
- 1s de carga → `authStore.registro()` → redirect `/`

## Tarea 6 — Crear `MyTicketsView.vue` (placeholder)
**Archivo:** `apps/frontend/src/views/MyTicketsView.vue`
- Vista mínima con Navbar y texto "Mis tickets — próximamente (Spec 07)"
- Sirve para verificar que el guard de ruta funciona

---

## Verificación

1. Click "Iniciar sesión" en la Navbar → va a `/login`
2. Enviar formulario con email `test@test.com` y contraseña `123456` → spinner 1s → Navbar muestra "Hola, test"
3. Recargar la página → sigue autenticado
4. Click botón de logout → Navbar vuelve a "Iniciar sesión", redirige a `/`
5. Intentar entrar a `/mis-tickets` sin autenticación → redirige a `/login`
6. Intentar entrar a `/login` estando autenticado → redirige a `/`
7. Probar `/registro` con nombre "Francisco", email y contraseña → Navbar muestra "Hola, Francisco"
