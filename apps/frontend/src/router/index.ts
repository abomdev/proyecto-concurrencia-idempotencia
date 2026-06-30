import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/peliculas/:id',
      name: 'movie-detail',
      component: () => import('../views/MovieDetailView.vue'),
    },
    {
      path: '/funciones/:showtimeId/butacas',
      name: 'seats',
      component: () => import('../views/SeatsView.vue'),
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutView.vue'),
    },
    {
      path: '/confirmacion',
      name: 'confirmation',
      component: () => import('../views/ConfirmationView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('../views/RegistroView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/mis-tickets',
      name: 'my-tickets',
      component: () => import('../views/MyTicketsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
