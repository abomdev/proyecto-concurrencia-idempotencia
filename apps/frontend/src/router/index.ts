import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
  ],
})

export default router
