<template>
  <div>
    <Navbar />

    <main class="butacas">
      <!-- Info de la función -->
      <div class="butacas__header">
        <Button
          label="← Volver"
          severity="secondary"
          text
          @click="volver"
        />
        <div v-if="showtime && movie" class="butacas__info">
          <h1 class="butacas__titulo">{{ movie.titulo }}</h1>
          <p class="butacas__subtitulo">
            {{ showtime.sala }} &nbsp;·&nbsp; {{ formatearFecha(showtime.fechaHora) }}
          </p>
        </div>
      </div>

      <div class="butacas__contenido">
        <!-- Mapa + leyenda -->
        <div class="butacas__mapa-wrapper">
          <SeatMap
            v-if="showtime"
            :showtime-id="showtime._id"
            :filas="showtime.filas"
            :columnas-por-fila="showtime.columnasPorFila"
          />

          <!-- Leyenda -->
          <div class="butacas__leyenda">
            <span class="butacas__leyenda-item">
              <span class="butacas__leyenda-dot butacas__leyenda-dot--available" />
              Disponible
            </span>
            <span class="butacas__leyenda-item">
              <span class="butacas__leyenda-dot butacas__leyenda-dot--selected" />
              Seleccionada
            </span>
            <span class="butacas__leyenda-item">
              <span class="butacas__leyenda-dot butacas__leyenda-dot--held" />
              En proceso
            </span>
            <span class="butacas__leyenda-item">
              <span class="butacas__leyenda-dot butacas__leyenda-dot--occupied" />
              Ocupada
            </span>
          </div>
        </div>

        <!-- Panel de resumen -->
        <Card class="butacas__resumen">
          <template #title>Resumen</template>
          <template #content>
            <div v-if="bookingStore.totalAsientos === 0" class="butacas__resumen-vacio">
              Selecciona una butaca del mapa.
            </div>

            <div v-else class="butacas__resumen-lista">
              <div
                v-for="asiento in bookingStore.selectedSeats"
                :key="asiento"
                class="butacas__resumen-fila"
              >
                <span>Butaca {{ asiento }}</span>
                <span>{{ formatearPrecio(showtime?.precioBase ?? 0) }}</span>
              </div>

              <Divider />

              <div class="butacas__resumen-total">
                <strong>Total</strong>
                <strong>{{ formatearPrecio((showtime?.precioBase ?? 0) * bookingStore.totalAsientos) }}</strong>
              </div>
            </div>

            <Button
              label="Ir al checkout"
              class="butacas__btn-checkout"
              :disabled="bookingStore.totalAsientos === 0"
              :badge="bookingStore.totalAsientos > 0 ? String(bookingStore.totalAsientos) : undefined"
              @click="irAlCheckout"
            />
          </template>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import Navbar from '../components/Navbar.vue'
import SeatMap from '../components/SeatMap.vue'
import { useShowtimesStore } from '../stores/showtimes'
import { useMoviesStore } from '../stores/movies'
import { useBookingStore } from '../stores/booking'
import { useSocket } from '../composables/useSocket'
import type { SeatState } from '../stores/booking'

const route = useRoute()
const router = useRouter()
const showtimeId = route.params.showtimeId as string

const showtimesStore = useShowtimesStore()
const moviesStore = useMoviesStore()
const bookingStore = useBookingStore()

const showtime = computed(() =>
  showtimesStore.showtimes.find((s) => s._id === showtimeId) ?? null,
)

const movie = computed(() =>
  showtime.value ? moviesStore.movies.find((m) => m._id === showtime.value!.movieId) ?? null : null,
)

function volver() {
  if (movie.value) {
    router.push({ name: 'movie-detail', params: { id: movie.value._id } })
  } else {
    router.push('/')
  }
}

function irAlCheckout() {
  router.push({ name: 'checkout' })
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

const { connect, disconnect } = useSocket()

onMounted(() => {
  if (bookingStore.currentShowtimeId !== showtimeId) {
    bookingStore.clearSelection()
  }
  bookingStore.currentShowtimeId = showtimeId
  bookingStore.fetchSeatStates(showtimeId)

  const socket = connect()
  socket.emit('join:showtime', showtimeId)
  socket.on('seat:updated', ({ asiento, estado }: { asiento: string; estado: SeatState }) => {
    if (!bookingStore.seatStates[showtimeId]) {
      bookingStore.seatStates[showtimeId] = {}
    }
    bookingStore.seatStates[showtimeId][asiento] = estado
  })
})

onUnmounted(() => {
  const s = connect()
  s.emit('leave:showtime', showtimeId)
  disconnect()
})
</script>

<style scoped>
.butacas {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.butacas__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.butacas__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.butacas__titulo {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.butacas__subtitulo {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.butacas__contenido {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  align-items: start;
}

.butacas__mapa-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.butacas__leyenda {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.butacas__leyenda-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
}

.butacas__leyenda-dot {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.butacas__leyenda-dot--available  { background-color: #22c55e; }
.butacas__leyenda-dot--selected   { background-color: #3b82f6; }
.butacas__leyenda-dot--held       { background-color: #f59e0b; }
.butacas__leyenda-dot--occupied   { background-color: #6b7280; }

.butacas__resumen-vacio {
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.butacas__resumen-lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.butacas__resumen-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.butacas__resumen-total {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
}

.butacas__btn-checkout {
  width: 100%;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .butacas__contenido {
    grid-template-columns: 1fr;
  }
}
</style>
