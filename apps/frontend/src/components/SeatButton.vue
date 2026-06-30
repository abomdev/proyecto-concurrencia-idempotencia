<template>
  <button
    :class="['seat', `seat--${estadoVisual}`]"
    :disabled="estado !== 'available'"
    :title="asiento"
    :aria-label="`Butaca ${asiento}: ${estadoLabel}`"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SeatState } from '../stores/booking'

const props = defineProps<{
  asiento: string
  estado: SeatState
  seleccionado: boolean
}>()

const emit = defineEmits<{ click: [] }>()

// 'selected' tiene prioridad sobre el estado del backend
const estadoVisual = computed(() =>
  props.seleccionado ? 'selected' : props.estado,
)

const estadoLabel = computed(() => {
  if (props.seleccionado) return 'seleccionada'
  if (props.estado === 'available') return 'disponible'
  if (props.estado === 'held') return 'en proceso'
  return 'ocupada'
})

function handleClick() {
  if (props.estado === 'available') {
    emit('click')
  }
}
</script>

<style scoped>
.seat {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.1s;
  flex-shrink: 0;
}

.seat:not(:disabled):hover {
  transform: scale(1.15);
}

.seat:disabled {
  cursor: not-allowed;
}

.seat--available {
  background-color: #22c55e;
}

.seat--selected {
  background-color: #3b82f6;
}

.seat--held {
  background-color: #f59e0b;
  opacity: 0.85;
}

.seat--occupied {
  background-color: #6b7280;
  opacity: 0.6;
}
</style>
