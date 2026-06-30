import { defineStore } from 'pinia'

export type SeatState = 'available' | 'held' | 'occupied'

const MAX_SEATS_PER_ORDER = 8

// Solo se listan butacas con estado especial — las demás son 'available' por defecto
const MOCK_SEAT_STATES: Record<string, Record<string, SeatState>> = {
  'showtime-1': {
    A1: 'occupied',
    A2: 'occupied',
    A3: 'occupied',
    B1: 'occupied',
    B2: 'occupied',
    C4: 'held',
    C5: 'held',
    D7: 'held',
  },
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    selectedSeats: [] as string[],
    seatStates: MOCK_SEAT_STATES as Record<string, Record<string, SeatState>>,
  }),
  getters: {
    totalAsientos: (state): number => state.selectedSeats.length,
    getEstado:
      (state) =>
      (showtimeId: string, asiento: string): SeatState =>
        state.seatStates[showtimeId]?.[asiento] ?? 'available',
  },
  actions: {
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
    clearSelection() {
      this.selectedSeats = []
    },
  },
})
