import { defineStore } from 'pinia'
import api from '../services/api'

export interface Showtime {
  _id: string
  movieId: string
  sala: string
  fechaHora: string
  precioBase: number
  totalAsientos: number
  filas: number
  columnasPorFila: number
}

export const useShowtimesStore = defineStore('showtimes', {
  state: () => ({
    showtimes: [] as Showtime[],
    loading: false,
  }),
  actions: {
    async fetchFuncionesPorPelicula(movieId: string) {
      this.loading = true
      try {
        const { data } = await api.get<Showtime[]>(`/api/peliculas/${movieId}/funciones`)
        this.showtimes = data
      } finally {
        this.loading = false
      }
    },
  },
})
