<template>
  <div>
    <Navbar />

    <main class="mis-tickets">
      <h1 class="mis-tickets__titulo">Mis tickets de {{ authStore.user?.nombre }}</h1>

      <!-- Cargando -->
      <div v-if="ticketsStore.loading" class="mis-tickets__spinner">
        <ProgressSpinner />
      </div>

      <!-- Estado vacío -->
      <div v-else-if="ticketsStore.tickets.length === 0" class="mis-tickets__vacio">
        <p class="mis-tickets__vacio-texto">Aún no tienes tickets.</p>
        <p class="mis-tickets__vacio-subtexto">¡Compra tu primera entrada!</p>
        <Button label="Ver cartelera" @click="router.push('/')" />
      </div>

      <!-- Lista de tickets -->
      <div v-else-if="ticketsStore.tickets.length > 0" class="mis-tickets__lista">
        <Card v-for="ticket in ticketsStore.tickets" :key="ticket._id" class="mis-tickets__card">
          <template #content>
            <div class="mis-tickets__card-header">
              <div class="mis-tickets__card-pelicula">
                <span class="mis-tickets__card-icono">🎬</span>
                <div>
                  <p class="mis-tickets__card-titulo">{{ ticket.movieTitle }}</p>
                  <p class="mis-tickets__card-funcion">
                    {{ ticket.sala }}&nbsp;·&nbsp;{{ formatearFecha(ticket.fechaHora) }}
                  </p>
                </div>
              </div>
              <Chip
                :label="ticket.estado === 'confirmado' ? 'Confirmado' : 'Cancelado'"
                :class="[
                  'mis-tickets__chip',
                  ticket.estado === 'confirmado'
                    ? 'mis-tickets__chip--confirmado'
                    : 'mis-tickets__chip--cancelado',
                ]"
              />
            </div>

            <Divider />

            <div class="mis-tickets__butacas">
              <div
                v-for="asiento in ticket.seats"
                :key="asiento"
                class="mis-tickets__butaca-fila"
              >
                <span>Butaca {{ asiento }}</span>
                <span>{{ formatearPrecio(ticket.precioBase) }}</span>
              </div>
            </div>

            <Divider />

            <div class="mis-tickets__total">
              <strong>Total</strong>
              <strong>{{ formatearPrecio(ticket.precioBase * ticket.seats.length) }}</strong>
            </div>

            <div class="mis-tickets__codigo">
              <span class="mis-tickets__codigo-label">Código</span>
              <span class="mis-tickets__codigo-valor">{{ ticket.codigoReserva }}</span>
            </div>
          </template>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Divider from 'primevue/divider'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Navbar from '../components/Navbar.vue'
import { useAuthStore } from '../stores/auth'
import { useTicketsStore } from '../stores/tickets'

const router = useRouter()
const authStore = useAuthStore()
const ticketsStore = useTicketsStore()

onMounted(() => {
  ticketsStore.fetchMisTickets()
})

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
.mis-tickets {
  max-width: 680px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.mis-tickets__titulo {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  text-transform: capitalize;
}

.mis-tickets__spinner {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.mis-tickets__vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding-top: 3rem;
  text-align: center;
}

.mis-tickets__vacio-texto {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0;
}

.mis-tickets__vacio-subtexto {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
  margin: 0 0 0.75rem;
}

.mis-tickets__lista {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.mis-tickets__card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.mis-tickets__card-pelicula {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.mis-tickets__card-icono {
  font-size: 1.3rem;
  line-height: 1;
  margin-top: 2px;
}

.mis-tickets__card-titulo {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.2rem;
}

.mis-tickets__card-funcion {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.mis-tickets__chip {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  flex-shrink: 0;
}

.mis-tickets__chip--confirmado {
  background-color: #22c55e;
  color: #fff;
}

.mis-tickets__chip--cancelado {
  background-color: #6b7280;
  color: #fff;
}

.mis-tickets__butacas {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.mis-tickets__butaca-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.mis-tickets__total {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.mis-tickets__codigo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
}

.mis-tickets__codigo-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--p-text-muted-color);
}

.mis-tickets__codigo-valor {
  font-family: monospace;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}
</style>
