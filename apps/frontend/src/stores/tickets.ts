import { defineStore } from 'pinia'
import api from '../services/api'

export interface Ticket {
  _id: string
  movieTitle: string
  sala: string
  fechaHora: string
  seats: string[]
  precioBase: number
  codigoReserva: string
  estado: 'confirmado' | 'cancelado'
}

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: [] as Ticket[],
    loading: false,
  }),
  actions: {
    async fetchMisTickets() {
      this.loading = true
      try {
        const { data } = await api.get<Ticket[]>('/api/mis-tickets')
        this.tickets = data
      } finally {
        this.loading = false
      }
    },
  },
})
