<template>
  <div>
    <Navbar />

    <main class="detalle">
      <!-- Estado de error -->
      <div v-if="!moviesStore.loading && !movie" class="detalle__error">
        <p>Película no encontrada.</p>
        <Button label="← Volver a cartelera" severity="secondary" @click="router.push('/')" />
      </div>

      <!-- Cargando -->
      <div v-else-if="showtimesStore.loading || moviesStore.loading" class="detalle__spinner">
        <ProgressSpinner />
      </div>

      <!-- Contenido normal -->
      <template v-else>
        <Button
          label="← Volver a cartelera"
          severity="secondary"
          text
          class="detalle__volver"
          @click="router.push('/')"
        />

        <!-- Info de la película -->
        <section class="detalle__info">
          <img :src="movie.posterUrl" :alt="movie.titulo" class="detalle__poster" />

          <div class="detalle__datos">
            <h1 class="detalle__titulo">{{ movie.titulo }}</h1>

            <div class="detalle__meta">
              <span><i class="pi pi-clock" /> {{ movie.duracionMinutos }} min</span>
              <span><i class="pi pi-tag" /> {{ movie.calificacion }}</span>
            </div>

            <p class="detalle__descripcion">{{ movie.descripcion }}</p>

            <div class="detalle__generos">
              <Chip v-for="genero in movie.generos" :key="genero" :label="genero" />
            </div>
          </div>
        </section>

        <Divider />

        <!-- Funciones disponibles -->
        <section class="detalle__funciones">
          <h2>Funciones disponibles</h2>

          <div class="detalle__funciones-lista">
            <div
              v-for="funcion in funciones"
              :key="funcion._id"
              class="detalle__funcion-fila"
              @click="seleccionarFuncion(funcion._id)"
            >
              <span class="detalle__funcion-fecha">
                <i class="pi pi-calendar" />
                {{ formatearFecha(funcion.fechaHora) }}
              </span>
              <span class="detalle__funcion-sala">
                <i class="pi pi-map-marker" />
                {{ funcion.sala }}
              </span>
              <span class="detalle__funcion-precio">
                {{ formatearPrecio(funcion.precioBase) }}
              </span>
              <i class="pi pi-chevron-right detalle__funcion-icono" />
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import Navbar from '../components/Navbar.vue'
import { useMoviesStore } from '../stores/movies'
import { useShowtimesStore } from '../stores/showtimes'

const route = useRoute()
const router = useRouter()
const movieId = route.params.id as string

const moviesStore = useMoviesStore()
const movie = computed(() => moviesStore.movies.find((m) => m._id === movieId) ?? null)

const showtimesStore = useShowtimesStore()
const funciones = computed(() => showtimesStore.showtimes)

onMounted(async () => {
  if (moviesStore.movies.length === 0) {
    await moviesStore.fetchPeliculas()
  }
  showtimesStore.fetchFuncionesPorPelicula(movieId)
})

function seleccionarFuncion(showtimeId: string) {
  router.push({ name: 'seats', params: { showtimeId } })
}

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(precio)
}
</script>

<style scoped>
.detalle {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.detalle__spinner {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.detalle__error {
  text-align: center;
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
}

.detalle__volver {
  margin-bottom: 1.5rem;
}

.detalle__info {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
  align-items: start;
}

.detalle__poster {
  width: 100%;
  border-radius: 8px;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}

.detalle__titulo {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.detalle__meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  color: var(--p-text-muted-color);
}

.detalle__meta span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.detalle__descripcion {
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.detalle__generos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detalle__funciones h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.detalle__funciones-lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detalle__funcion-fila {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.detalle__funcion-fila:hover {
  background-color: var(--p-content-hover-background);
}

.detalle__funcion-fecha {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.detalle__funcion-sala {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--p-text-muted-color);
  min-width: 120px;
}

.detalle__funcion-precio {
  font-weight: 600;
  min-width: 80px;
  text-align: right;
}

.detalle__funcion-icono {
  color: var(--p-text-muted-color);
}

@media (max-width: 768px) {
  .detalle__info {
    grid-template-columns: 1fr;
  }

  .detalle__funcion-fila {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .detalle__funcion-sala {
    min-width: unset;
  }
}
</style>
