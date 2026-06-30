<template>
  <div>
    <Navbar />

    <main class="checkout">
      <Button
        label="← Volver"
        severity="secondary"
        text
        class="checkout__volver"
        @click="volver"
      />

      <div class="checkout__contenido">
        <!-- Resumen de compra -->
        <Card class="checkout__resumen">
          <template #title>Resumen de compra</template>
          <template #content>
            <div v-if="showtime && movie" class="checkout__resumen-info">
              <p class="checkout__pelicula">{{ movie.titulo }}</p>
              <p class="checkout__funcion">
                {{ showtime.sala }} &nbsp;·&nbsp; {{ formatearFecha(showtime.fechaHora) }}
              </p>
            </div>

            <Divider />

            <div class="checkout__resumen-filas">
              <div
                v-for="asiento in bookingStore.selectedSeats"
                :key="asiento"
                class="checkout__resumen-fila"
              >
                <span>Butaca {{ asiento }}</span>
                <span>{{ formatearPrecio(showtime?.precioBase ?? 0) }}</span>
              </div>
            </div>

            <Divider />

            <div class="checkout__total">
              <strong>Total</strong>
              <strong>{{ formatearPrecio((showtime?.precioBase ?? 0) * bookingStore.totalAsientos) }}</strong>
            </div>
          </template>
        </Card>

        <!-- Formulario de pago -->
        <Card class="checkout__formulario">
          <template #title>Datos de pago</template>
          <template #content>
            <div class="checkout__campos">
              <div class="checkout__campo">
                <label for="nombre">Nombre en la tarjeta</label>
                <InputText
                  id="nombre"
                  v-model="form.nombre"
                  placeholder="Juan Pérez"
                  :disabled="cargando"
                  class="checkout__input"
                />
              </div>

              <div class="checkout__campo">
                <label for="numero">Número de tarjeta</label>
                <InputText
                  id="numero"
                  :value="numeroFormateado"
                  placeholder="XXXX XXXX XXXX XXXX"
                  maxlength="19"
                  :disabled="cargando"
                  class="checkout__input"
                  @input="onNumeroInput"
                />
              </div>

              <div class="checkout__campo-fila">
                <div class="checkout__campo">
                  <label for="vencimiento">Vencimiento</label>
                  <InputText
                    id="vencimiento"
                    :value="form.vencimiento"
                    placeholder="MM/AA"
                    maxlength="5"
                    :disabled="cargando"
                    class="checkout__input"
                    @input="onVencimientoInput"
                  />
                </div>
                <div class="checkout__campo">
                  <label for="cvv">CVV</label>
                  <InputText
                    id="cvv"
                    v-model="form.cvv"
                    placeholder="123"
                    maxlength="3"
                    :disabled="cargando"
                    class="checkout__input"
                    @input="onCvvInput"
                  />
                </div>
              </div>
            </div>

            <!-- Estado de carga -->
            <div v-if="cargando" class="checkout__cargando">
              <ProgressSpinner style="width: 40px; height: 40px" />
              <span>Procesando pago...</span>
            </div>

            <Button
              v-else
              label="Confirmar compra"
              class="checkout__btn-confirmar"
              :disabled="!formularioValido"
              @click="confirmar"
            />
          </template>
        </Card>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import Navbar from '../components/Navbar.vue'
import { useBookingStore } from '../stores/booking'
import { useShowtimesStore } from '../stores/showtimes'
import { useMoviesStore } from '../stores/movies'

const router = useRouter()
const bookingStore = useBookingStore()
const showtimesStore = useShowtimesStore()
const moviesStore = useMoviesStore()

// Guard: redirige a inicio si no hay butacas seleccionadas
onMounted(() => {
  if (bookingStore.selectedSeats.length === 0) {
    router.replace('/')
  }
})

const showtime = computed(() =>
  bookingStore.currentShowtimeId
    ? showtimesStore.showtimes.find((s) => s._id === bookingStore.currentShowtimeId) ?? null
    : null,
)

const movie = computed(() =>
  showtime.value
    ? moviesStore.movies.find((m) => m._id === showtime.value!.movieId) ?? null
    : null,
)

const cargando = ref(false)

const form = reactive({
  nombre: '',
  numero: '',
  vencimiento: '',
  cvv: '',
})

const numeroFormateado = computed(() =>
  form.numero.replace(/(\d{4})(?=\d)/g, '$1 ').trim(),
)

const formularioValido = computed(() =>
  form.nombre.trim().length > 0 &&
  form.numero.length === 16 &&
  form.vencimiento.length === 5 &&
  form.cvv.length === 3,
)

function onNumeroInput(e: Event) {
  const soloDigitos = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16)
  form.numero = soloDigitos
  ;(e.target as HTMLInputElement).value = numeroFormateado.value
}

function onVencimientoInput(e: Event) {
  let val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2)
  form.vencimiento = val
  ;(e.target as HTMLInputElement).value = val
}

function onCvvInput(e: Event) {
  form.cvv = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 3)
}

function volver() {
  if (bookingStore.currentShowtimeId) {
    router.push({ name: 'seats', params: { showtimeId: bookingStore.currentShowtimeId } })
  } else {
    router.push('/')
  }
}

async function confirmar() {
  if (!formularioValido.value) return
  cargando.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500))
  bookingStore.clearSelection()
  router.push({ name: 'confirmation' })
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
.checkout {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
}

.checkout__volver {
  margin-bottom: 1rem;
}

.checkout__contenido {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.checkout__resumen-info {
  margin-bottom: 0.5rem;
}

.checkout__pelicula {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.checkout__funcion {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.checkout__resumen-filas {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.checkout__resumen-fila {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.checkout__total {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
}

.checkout__campos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.checkout__campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.checkout__campo label {
  font-size: 0.875rem;
  font-weight: 500;
}

.checkout__input {
  width: 100%;
}

.checkout__campo-fila {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkout__cargando {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: var(--p-text-muted-color);
}

.checkout__btn-confirmar {
  width: 100%;
}

@media (max-width: 768px) {
  .checkout__contenido {
    grid-template-columns: 1fr;
  }
}
</style>
