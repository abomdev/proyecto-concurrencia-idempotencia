<template>
  <div>
    <Navbar />

    <main class="cartelera">
      <h2 class="cartelera__titulo">En cartelera</h2>

      <p v-if="peliculasActivas.length === 0" class="cartelera__vacio">
        No hay películas disponibles en cartelera.
      </p>

      <div v-else class="cartelera__grilla">
        <MovieCard
          v-for="movie in peliculasActivas"
          :key="movie._id"
          :movie="movie"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Navbar from '../components/Navbar.vue'
import MovieCard from '../components/MovieCard.vue'
import { useMoviesStore } from '../stores/movies'

const moviesStore = useMoviesStore()
const { peliculasActivas } = storeToRefs(moviesStore)
</script>

<style scoped>
.cartelera {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.cartelera__titulo {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.cartelera__vacio {
  text-align: center;
  color: var(--p-text-muted-color);
  padding: 4rem 0;
}

.cartelera__grilla {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .cartelera__grilla {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .cartelera__grilla {
    grid-template-columns: 1fr;
  }
}
</style>
