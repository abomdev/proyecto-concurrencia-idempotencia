import { defineStore } from 'pinia'

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

const MOCK_SHOWTIMES: Showtime[] = [
  // El último horizonte (mock-1)
  {
    _id: 'showtime-1',
    movieId: 'mock-1',
    sala: 'Sala 1',
    fechaHora: '2026-07-05T18:00:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
  {
    _id: 'showtime-2',
    movieId: 'mock-1',
    sala: 'Sala IMAX',
    fechaHora: '2026-07-05T21:00:00',
    precioBase: 7000,
    totalAsientos: 60,
    filas: 6,
    columnasPorFila: 10,
  },
  {
    _id: 'showtime-3',
    movieId: 'mock-1',
    sala: 'Sala 1',
    fechaHora: '2026-07-06T20:30:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
  // Sombras del norte (mock-2)
  {
    _id: 'showtime-4',
    movieId: 'mock-2',
    sala: 'Sala 2',
    fechaHora: '2026-07-05T19:30:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
  {
    _id: 'showtime-5',
    movieId: 'mock-2',
    sala: 'Sala 2',
    fechaHora: '2026-07-06T17:00:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
  {
    _id: 'showtime-6',
    movieId: 'mock-2',
    sala: 'Sala IMAX',
    fechaHora: '2026-07-06T22:00:00',
    precioBase: 7000,
    totalAsientos: 60,
    filas: 6,
    columnasPorFila: 10,
  },
  // La forja del campeón (mock-3)
  {
    _id: 'showtime-7',
    movieId: 'mock-3',
    sala: 'Sala 1',
    fechaHora: '2026-07-05T16:00:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
  {
    _id: 'showtime-8',
    movieId: 'mock-3',
    sala: 'Sala 3',
    fechaHora: '2026-07-05T20:00:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
  {
    _id: 'showtime-9',
    movieId: 'mock-3',
    sala: 'Sala 3',
    fechaHora: '2026-07-06T19:00:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
  // Familia en caos (mock-4)
  {
    _id: 'showtime-10',
    movieId: 'mock-4',
    sala: 'Sala 2',
    fechaHora: '2026-07-05T14:30:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
  {
    _id: 'showtime-11',
    movieId: 'mock-4',
    sala: 'Sala 2',
    fechaHora: '2026-07-05T17:00:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
  {
    _id: 'showtime-12',
    movieId: 'mock-4',
    sala: 'Sala 3',
    fechaHora: '2026-07-06T15:30:00',
    precioBase: 4500,
    totalAsientos: 80,
    filas: 8,
    columnasPorFila: 10,
  },
]

export const useShowtimesStore = defineStore('showtimes', {
  state: () => ({
    showtimes: MOCK_SHOWTIMES as Showtime[],
  }),
  getters: {
    porPelicula: (state) => (movieId: string): Showtime[] =>
      state.showtimes.filter((s) => s.movieId === movieId),
  },
})
