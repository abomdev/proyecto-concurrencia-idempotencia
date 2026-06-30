<template>
  <div class="seat-map">
    <!-- Pantalla de cine -->
    <div class="seat-map__screen">PANTALLA</div>

    <!-- Mapa de butacas -->
    <div class="seat-map__grid-wrapper">
      <!-- Números de columna -->
      <div class="seat-map__col-labels">
        <span class="seat-map__row-label-spacer" />
        <span
          v-for="col in columnasPorFila"
          :key="col"
          class="seat-map__col-label"
        >
          {{ col }}
        </span>
      </div>

      <!-- Filas de butacas -->
      <div v-for="(_, filaIdx) in filas" :key="filaIdx" class="seat-map__row">
        <!-- Letra de fila -->
        <span class="seat-map__row-label">{{ FILAS[filaIdx] }}</span>

        <!-- Butacas de la fila -->
        <SeatButton
          v-for="colIdx in columnasPorFila"
          :key="colIdx"
          :asiento="asientoId(filaIdx, colIdx - 1)"
          :estado="bookingStore.getEstado(showtimeId, asientoId(filaIdx, colIdx - 1))"
          :seleccionado="bookingStore.selectedSeats.includes(asientoId(filaIdx, colIdx - 1))"
          @click="bookingStore.toggleSeat(asientoId(filaIdx, colIdx - 1))"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SeatButton from './SeatButton.vue'
import { useBookingStore } from '../stores/booking'

defineProps<{
  showtimeId: string
  filas: number
  columnasPorFila: number
}>()

const bookingStore = useBookingStore()

const FILAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function asientoId(fila: number, columna: number): string {
  return `${FILAS[fila]}${columna + 1}`
}
</script>

<style scoped>
.seat-map {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.seat-map__screen {
  width: 70%;
  max-width: 400px;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--p-text-muted-color);
  border: 2px solid var(--p-content-border-color);
  border-radius: 4px;
  background: var(--p-content-hover-background);
}

.seat-map__grid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.seat-map__col-labels {
  display: flex;
  gap: 6px;
  padding-left: 0;
}

.seat-map__row-label-spacer {
  width: 24px;
  flex-shrink: 0;
}

.seat-map__col-label {
  width: 36px;
  text-align: center;
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
  flex-shrink: 0;
}

.seat-map__row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.seat-map__row-label {
  width: 24px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  text-align: center;
  flex-shrink: 0;
}
</style>
