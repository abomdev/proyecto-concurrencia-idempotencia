import { defineStore } from 'pinia'
import api from '../services/api'

export type SeatState = 'available' | 'held' | 'occupied'

const MAX_SEATS_PER_ORDER = 8

export interface LastPurchase {
  movieTitle: string
  sala: string
  fechaHora: string
  seats: string[]
  precioBase: number
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    selectedSeats: [] as string[],
    seatStates: {} as Record<string, Record<string, SeatState>>,
    currentShowtimeId: null as string | null,
    lastPurchase: null as LastPurchase | null,
  }),
  getters: {
    totalAsientos: (state): number => state.selectedSeats.length,
    getEstado:
      (state) =>
      (showtimeId: string, asiento: string): SeatState =>
        state.seatStates[showtimeId]?.[asiento] ?? 'available',
  },
  actions: {
    async fetchSeatStates(showtimeId: string) {
      const { data } = await api.get<Record<string, SeatState>>(
        `/api/funciones/${showtimeId}/butacas`,
      )
      this.seatStates = { ...this.seatStates, [showtimeId]: data }
    },
    toggleSeat(asiento: string) {
      const idx = this.selectedSeats.indexOf(asiento)
      if (idx === -1) {
        if (this.selectedSeats.length < MAX_SEATS_PER_ORDER) {
          this.selectedSeats.push(asiento)
        }
      } else {
        this.selectedSeats.splice(idx, 1)
      }
    },
    savePurchase(data: LastPurchase) {
      this.lastPurchase = { ...data }
    },
    clearSelection() {
      this.selectedSeats = []
      this.currentShowtimeId = null
    },
  },
})
