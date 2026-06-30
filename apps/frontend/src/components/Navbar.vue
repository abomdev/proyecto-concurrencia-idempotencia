<template>
  <Toolbar class="navbar">
    <template #start>
      <span class="navbar__logo">
        <i class="pi pi-video" />
        Crunchymark
      </span>
    </template>
    <template #end>
      <Button label="Iniciar sesión" icon="pi pi-user" severity="secondary" outlined />
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
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
}
</style>
