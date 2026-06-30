<template>
  <Toolbar class="navbar">
    <template #start>
      <RouterLink to="/" class="navbar__logo">
        <i class="pi pi-video" />
        Crunchymark
      </RouterLink>
    </template>
    <template #end>
      <Button
        v-if="!authStore.isAuthenticated"
        label="Iniciar sesión"
        icon="pi pi-user"
        severity="secondary"
        outlined
        @click="router.push('/login')"
      />

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
  </Toolbar>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function cerrarSesion() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar__logo {
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

.navbar__usuario {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar__nombre {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}
</style>
