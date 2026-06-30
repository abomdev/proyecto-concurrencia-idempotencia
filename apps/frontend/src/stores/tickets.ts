import { defineStore } from 'pinia'

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

const MOCK_TICKETS: Ticket[] = [
  {
    _id: 'ticket-1',
    movieTitle: 'El último horizonte',
    sala: 'Sala 1',
    fechaHora: '2026-07-05T20:30:00',
    seats: ['A4', 'B6'],
    precioBase: 4500,
    codigoReserva: 'CRK-A4F2B8',
    estado: 'confirmado',
  },
  {
    _id: 'ticket-2',
    movieTitle: 'Sombras del norte',
    sala: 'Sala 2',
    fechaHora: '2026-06-28T18:00:00',
    seats: ['C7'],
    precioBase: 5000,
    codigoReserva: 'CRK-X9M3K1',
    estado: 'confirmado',
  },
]

export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: MOCK_TICKETS as Ticket[],
  }),
})
