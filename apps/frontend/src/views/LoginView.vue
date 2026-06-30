<template>
  <div>
    <Navbar />

    <main class="auth-page">
      <Card class="auth-card">
        <template #content>
          <div class="auth-card__header">
            <i class="pi pi-video auth-card__icono" />
            <h1 class="auth-card__titulo">Crunchymark</h1>
            <p class="auth-card__subtitulo">Inicia sesión para continuar</p>
          </div>

          <div class="auth-card__campos">
            <div class="auth-card__campo">
              <label for="email">Email</label>
              <InputText
                id="email"
                v-model="form.email"
                type="email"
                placeholder="tu@email.com"
                :disabled="cargando"
                class="auth-card__input"
              />
            </div>

            <div class="auth-card__campo">
              <label for="password">Contraseña</label>
              <Password
                id="password"
                v-model="form.password"
                placeholder="Mínimo 6 caracteres"
                :feedback="false"
                toggleMask
                :disabled="cargando"
                input-class="auth-card__input"
              />
            </div>
          </div>

          <div v-if="cargando" class="auth-card__cargando">
            <ProgressSpinner style="width: 36px; height: 36px" />
            <span>Iniciando sesión...</span>
          </div>

          <Button
            v-else
            label="Iniciar sesión"
            class="auth-card__btn"
            :disabled="!formularioValido"
            @click="iniciarSesion"
          />

          <p class="auth-card__link">
            ¿No tienes cuenta?
            <RouterLink to="/registro">Regístrate</RouterLink>
          </p>
        </template>
      </Card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Navbar from '../components/Navbar.vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const cargando = ref(false)
const form = reactive({ email: '', password: '' })

const formularioValido = computed(
  () => form.email.trim().length > 0 && form.password.length >= 6,
)

async function iniciarSesion() {
  if (!formularioValido.value) return
  cargando.value = true
  await authStore.login(form.email, form.password)
  router.push('/')
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1.5rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
}

.auth-card__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1.75rem;
  text-align: center;
}

.auth-card__icono {
  font-size: 2rem;
  color: var(--p-primary-color);
}

.auth-card__titulo {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0.25rem 0 0;
}

.auth-card__subtitulo {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.auth-card__campos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.auth-card__campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.auth-card__campo label {
  font-size: 0.875rem;
  font-weight: 500;
}

.auth-card__input {
  width: 100%;
}

.auth-card__cargando {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: var(--p-text-muted-color);
  margin-bottom: 1rem;
}

.auth-card__btn {
  width: 100%;
  margin-bottom: 1.25rem;
}

.auth-card__link {
  text-align: center;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.auth-card__link a {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 500;
}

.auth-card__link a:hover {
  text-decoration: underline;
}
</style>
