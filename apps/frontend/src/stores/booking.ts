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
  codigoReserva: string
}

interface ReservaResponse {
  codigoReserva: string
  asientos: string[]
  holdExpiresAt: string
  precioTotal: number
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    selectedSeats: [] as string[],
    seatStates: {} as Record<string, Record<string, SeatState>>,
    currentShowtimeId: null as string | null,
    lastPurchase: null as LastPurchase | null,
    pendingCodigoReserva: null as string | null,
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
    async crearReserva(
      showtimeId: string,
      asientos: string[],
      precioBase: number,
      idempotencyKey: string,
    ): Promise<string> {
      const { data } = await api.post<ReservaResponse>(
        '/api/reservas',
        { showtimeId, asientos, precioBase },
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )
      this.pendingCodigoReserva = data.codigoReserva
      return data.codigoReserva
    },
    async confirmarReserva(
      codigoReserva: string,
      purchaseData: Omit<LastPurchase, 'codigoReserva'>,
    ): Promise<void> {
      await api.post(`/api/reservas/${codigoReserva}/confirmar`)
      this.lastPurchase = { ...purchaseData, codigoReserva }
      this.pendingCodigoReserva = null
    },
    clearSelection() {
      this.selectedSeats = []
      this.currentShowtimeId = null
    },
  },
})
