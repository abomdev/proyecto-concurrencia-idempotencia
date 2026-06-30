# Design: Login y Registro (frontend con JWT mock)

## Estado
- [x] Borrador
- [x] Aprobado por el usuario

---

## Archivos nuevos

| Archivo | Descripción |
|---|---|
| `apps/frontend/src/stores/auth.ts` | Auth store con Pinia |
| `apps/frontend/src/views/LoginView.vue` | Página `/login` |
| `apps/frontend/src/views/RegistroView.vue` | Página `/registro` |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `apps/frontend/src/components/Navbar.vue` | Navbar dinámica según estado de autenticación |
| `apps/frontend/src/router/index.ts` | Rutas nuevas + guard de navegación |

---

## Auth store (`stores/auth.ts`)

### Estado inicial — restauración desde localStorage

El store lee `localStorage` al inicializarse. Así la sesión sobrevive recargas sin necesidad de volver a iniciar sesión.

```typescript
state: () => {
  const token = localStorage.getItem('crunchymark_token')
  const userRaw = localStorage.getItem('crunchymark_user')
  return {
    token,
    user: userRaw ? (JSON.parse(userRaw) as { nombre: string; email: string }) : null,
  }
}
```

### Getter

```typescript
isAuthenticated: (state): boolean => !!state.token
```

### Acción `login(email, password)`

```typescript
async login(email: string, _password: string) {
  await new Promise((r) => setTimeout(r, 1000))           // simula latencia de red
  const nombre = email.split('@')[0]
  const token = `mock.jwt.${btoa(email)}.${Date.now()}`
  this.token = token
  this.user = { nombre, email }
  localStorage.setItem('crunchymark_token', token)
  localStorage.setItem('crunchymark_user', JSON.stringify(this.user))
}
```

### Acción `registro(nombre, email, password)`

Idéntica a `login` pero usa el `nombre` real que escribió el usuario:

```typescript
async registro(nombre: string, email: string, _password: string) {
  await new Promise((r) => setTimeout(r, 1000))
  const token = `mock.jwt.${btoa(email)}.${Date.now()}`
  this.token = token
  this.user = { nombre, email }
  localStorage.setItem('crunchymark_token', token)
  localStorage.setItem('crunchymark_user', JSON.stringify(this.user))
}
```

### Acción `logout()`

```typescript
logout() {
  this.token = null
  this.user = null
  localStorage.removeItem('crunchymark_token')
  localStorage.removeItem('crunchymark_user')
}
```

**Por qué guardar también el user en localStorage:** el token mock no es un JWT real decodificable. Si solo guardáramos el token, al recargar no sabríamos el nombre del usuario para mostrarlo en la Navbar. En Fase C el token será un JWT real que el backend puede verificar y el frontend puede decodificar.

---

## Router — rutas nuevas y guard

### Rutas nuevas en `router/index.ts`

```typescript
{ path: '/login',    name: 'login',    component: () => import('../views/LoginView.vue'),    meta: { requiresGuest: true } },
{ path: '/registro', name: 'registro', component: () => import('../views/RegistroView.vue'), meta: { requiresGuest: true } },
{ path: '/mis-tickets', name: 'my-tickets', component: () => import('../views/MyTicketsView.vue'), meta: { requiresAuth: true } },
```

### Guard de navegación

```typescript
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})
```

**Por qué `beforeEach` y no `meta` en cada ruta:** Vue Router recomienda el guard global para no repetir lógica en cada ruta protegida. Cuando se agreguen más rutas protegidas en el futuro, solo hay que ponerles `meta: { requiresAuth: true }`.

---

## Navbar dinámica

```
┌──────────────────────────────────────────────────────────┐
│  🎬 Crunchymark                    [ Iniciar sesión ]    │  ← no autenticado
│  🎬 Crunchymark          Hola, francisco  [ Salir ⏏ ]   │  ← autenticado
└──────────────────────────────────────────────────────────┘
```

```vue
<template #end>
  <!-- No autenticado -->
  <Button
    v-if="!authStore.isAuthenticated"
    label="Iniciar sesión"
    icon="pi pi-user"
    severity="secondary"
    outlined
    @click="router.push('/login')"
  />

  <!-- Autenticado -->
  <div v-else class="navbar__usuario">
    <span class="navbar__nombre">Hola, {{ authStore.user?.nombre }}</span>
    <Button
      icon="pi pi-sign-out"
      severity="secondary"
      text
      rounded
      aria-label="Cerrar sesión"
      @click="cerrarSesion"
    />
  </div>
</template>
```

`cerrarSesion()` llama `authStore.logout()` y luego `router.push('/')`.

---

## Layout de LoginView

```
┌──────────────────────────────────────────────┐
│  Navbar                                      │
├──────────────────────────────────────────────┤
│                                              │
│   ┌──────────────────────────────────────┐   │
│   │  🎬  Crunchymark                     │   │
│   │      Iniciá sesión para continuar    │   │
│   │                                      │   │
│   │  Email                               │   │
│   │  [________________________________]  │   │
│   │                                      │   │
│   │  Contraseña                          │   │
│   │  [____________________________] 👁   │   │
│   │                                      │   │
│   │  [spinner / Iniciar sesión ]         │   │
│   │                                      │   │
│   │  ¿No tenés cuenta? →  Registrate     │   │
│   └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

- Card centrada en la página (max-width: 420px)
- `Password` de PrimeVue con `toggleMask` (ícono ojo para mostrar/ocultar) y `:feedback="false"` (sin medidor de fortaleza)
- El botón muestra `ProgressSpinner` mientras carga, luego desaparece

---

## Layout de RegistroView

Idéntico al login, más el campo "Nombre completo" arriba del email:

```
│   │  Nombre completo                     │   │
│   │  [________________________________]  │   │
│   │                                      │   │
│   │  Email                               │   │
│   │  [________________________________]  │   │
│   │                                      │   │
│   │  Contraseña (mín. 6 caracteres)      │   │
│   │  [____________________________] 👁   │   │
│   │                                      │   │
│   │  [spinner / Crear cuenta ]           │   │
│   │                                      │   │
│   │  ¿Ya tenés cuenta? →  Iniciá sesión  │   │
```

---

## Flujo completo

```
Navbar (no autenticado)
  └─ click "Iniciar sesión"
       └─ /login
            ├─ formulario inválido → botón deshabilitado
            └─ formulario válido → click
                 ├─ cargando = true, spinner 1s
                 ├─ authStore.login(email, password)
                 │    ├─ genera token mock
                 │    ├─ guarda user + token en store
                 │    └─ persiste en localStorage
                 └─ router.push('/')
                      └─ Navbar muestra "Hola, [nombre]"

Navbar (autenticado)
  └─ click ícono salir
       ├─ authStore.logout()  (limpia store + localStorage)
       └─ router.push('/')
            └─ Navbar vuelve a "Iniciar sesión"
```

---

## Componentes PrimeVue utilizados

| Componente | Import | Uso |
|---|---|---|
| `Card` | `primevue/card` | contenedor del formulario |
| `InputText` | `primevue/inputtext` | email y nombre |
| `Password` | `primevue/password` | contraseña con toggle de visibilidad |
| `Button` | `primevue/button` | submit y logout |
| `ProgressSpinner` | `primevue/progressspinner` | estado de carga |

---

## Decisiones tomadas vs alternativas descartadas

### localStorage vs sessionStorage

`sessionStorage` se borra al cerrar la pestaña. `localStorage` es más amigable para el usuario (no necesita volver a loguearse cada vez). En producción habría que evaluar la política de expiración del token; aquí el token mock no expira.

### Guardar user separado en localStorage vs decodificar el token

Los JWTs reales son base64url-decodificables y contienen el payload (nombre, email, etc.). El mock no lo es. Se guarda `crunchymark_user` como JSON separado para simular el comportamiento real sin implementar un decodificador. En Fase C se reemplaza por `jwtDecode(token).user`.

### `MyTicketsView.vue` como placeholder en esta spec

La ruta `/mis-tickets` se registra en el router con su guard pero la vista es un placeholder vacío. Spec 07 la implementa. Esto permite que el guard sea testeable antes de que Spec 07 esté listo.
