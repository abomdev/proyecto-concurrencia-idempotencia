<template>
  <div>
    <Navbar />
    <main class="mis-tickets-placeholder">
      <p>Mis tickets — próximamente (Spec 07)</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.mis-tickets-placeholder {
  padding: 2rem;
  color: var(--p-text-muted-color);
}
</style>
