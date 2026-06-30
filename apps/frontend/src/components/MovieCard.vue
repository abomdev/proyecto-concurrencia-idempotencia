<template>
  <Card class="movie-card" @click="irAlDetalle">
    <template #header>
      <img :src="movie.posterUrl" :alt="movie.titulo" class="movie-card__poster" />
    </template>
    <template #title>
      {{ movie.titulo }}
    </template>
    <template #content>
      <div class="movie-card__generos">
        <Chip v-for="genero in movie.generos" :key="genero" :label="genero" class="movie-card__chip" />
      </div>
      <div class="movie-card__meta">
        <span>
          <i class="pi pi-clock" />
          {{ movie.duracionMinutos }} min
        </span>
        <span>
          <i class="pi pi-tag" />
          {{ movie.calificacion }}
        </span>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import type { Movie } from '../stores/movies'

const props = defineProps<{ movie: Movie }>()
const router = useRouter()

function irAlDetalle() {
  router.push({ name: 'movie-detail', params: { id: props.movie._id } })
}
</script>

<style scoped>
.movie-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.movie-card__poster {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  display: block;
}

.movie-card__generos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.movie-card__chip {
  font-size: 0.75rem;
}

.movie-card__meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.movie-card__meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
</style>
