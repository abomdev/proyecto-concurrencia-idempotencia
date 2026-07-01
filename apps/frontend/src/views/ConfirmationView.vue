<template>
  <div>
    <Navbar />

    <main class="confirmacion">
      <!-- Sin compra previa -->
      <div v-if="!bookingStore.lastPurchase" class="confirmacion__vacia">
        <p class="confirmacion__vacia-texto">No hay compra reciente.</p>
        <Button label="Volver al inicio" @click="router.push('/')" />
      </div>

      <!-- Compra exitosa -->
      <div v-else class="confirmacion__contenido">
        <div class="confirmacion__exito">
          <span class="confirmacion__check">✓</span>
          <div>
            <h1 class="confirmacion__titulo">¡Compra confirmada!</h1>
            <p class="confirmacion__subtitulo">Tu reserva fue procesada exitosamente.</p>
          </div>
        </div>

        <Card class="confirmacion__ticket">
          <template #content>
            <div class="confirmacion__pelicula">
              <span class="confirmacion__pelicula-icono">🎬</span>
              <div>
                <p class="confirmacion__pelicula-titulo">{{ bookingStore.lastPurchase.movieTitle }}</p>
                <p class="confirmacion__pelicula-funcion">
                  {{ bookingStore.lastPurchase.sala }}&nbsp;·&nbsp;{{ formatearFecha(bookingStore.lastPurchase.fechaHora) }}
                </p>
              </div>
            </div>

            <Divider />

            <div class="confirmacion__butacas">
              <div
                v-for="asiento in bookingStore.lastPurchase.seats"
                :key="asiento"
                class="confirmacion__butaca-fila"
              >
                <span>Butaca {{ asiento }}</span>
                <span>{{ formatearPrecio(bookingStore.lastPurchase.precioBase) }}</span>
              </div>
            </div>

            <Divider />

            <div class="confirmacion__total">
              <strong>Total</strong>
              <strong>{{ formatearPrecio(bookingStore.lastPurchase.precioBase * bookingStore.lastPurchase.seats.length) }}</strong>
            </div>

            <div class="confirmacion__codigo-wrapper">
              <p class="confirmacion__codigo-label">Código de reserva</p>
              <div class="confirmacion__codigo">{{ bookingStore.lastPurchase.codigoReserva }}</div>
            </div>
          </template>
        </Card>

        <Button
          label="Volver al inicio"
          class="confirmacion__btn-volver"
          @click="router.push('/')"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import Navbar from '../components/Navbar.vue'
import { useBookingStore } from '../stores/booking'

const router = useRouter()
const bookingStore = useBookingStore()

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
.confirmacion {
  max-width: 560px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.confirmacion__vacia {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding-top: 4rem;
  text-align: center;
}

.confirmacion__vacia-texto {
  font-size: 1.1rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.confirmacion__contenido {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.confirmacion__exito {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.confirmacion__check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: #22c55e;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.confirmacion__titulo {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}

.confirmacion__subtitulo {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.confirmacion__pelicula {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.confirmacion__pelicula-icono {
  font-size: 1.4rem;
  line-height: 1;
  margin-top: 2px;
}

.confirmacion__pelicula-titulo {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.2rem;
}

.confirmacion__pelicula-funcion {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.confirmacion__butacas {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.confirmacion__butaca-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.confirmacion__total {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.confirmacion__codigo-wrapper {
  margin-top: 1.25rem;
}

.confirmacion__codigo-label {
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--p-text-muted-color);
  margin: 0 0 0.5rem;
}

.confirmacion__codigo {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-align: center;
  padding: 0.75rem 1rem;
  border: 2px dashed var(--p-content-border-color);
  border-radius: 8px;
}

.confirmacion__btn-volver {
  align-self: center;
}
</style>
