import { defineStore } from 'pinia'
import api from '../services/api'

export interface Movie {
  _id: string
  titulo: string
  descripcion: string
  generos: string[]
  duracionMinutos: number
  posterUrl: string
  calificacion: string
  activa: boolean
}

export const useMoviesStore = defineStore('movies', {
  state: () => ({
    movies: [] as Movie[],
    loading: false,
    error: null as string | null,
  }),
  getters: {
    peliculasActivas: (state): Movie[] => state.movies.filter((m) => m.activa),
  },
  actions: {
    async fetchPeliculas() {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get<Movie[]>('/api/peliculas')
        this.movies = data
      } catch {
        this.error = 'No se pudieron cargar las películas.'
      } finally {
        this.loading = false
      }
    },
  },
})
