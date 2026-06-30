import { defineStore } from 'pinia'

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

const MOCK_MOVIES: Movie[] = [
  {
    _id: 'mock-1',
    titulo: 'El último horizonte',
    descripcion: 'Un piloto espacial descubre una señal desconocida al borde del sistema solar.',
    generos: ['Ciencia Ficción', 'Aventura'],
    duracionMinutos: 132,
    posterUrl: 'https://picsum.photos/seed/movie1/400/600',
    calificacion: 'PG-13',
    activa: true,
  },
  {
    _id: 'mock-2',
    titulo: 'Sombras del norte',
    descripcion: 'Una detective enfrenta su caso más oscuro en una ciudad siempre cubierta de nieve.',
    generos: ['Thriller', 'Drama'],
    duracionMinutos: 118,
    posterUrl: 'https://picsum.photos/seed/movie2/400/600',
    calificacion: '+16',
    activa: true,
  },
  {
    _id: 'mock-3',
    titulo: 'La forja del campeón',
    descripcion: 'Un joven boxeador de barrio busca su oportunidad en el torneo nacional.',
    generos: ['Drama', 'Deporte'],
    duracionMinutos: 105,
    posterUrl: 'https://picsum.photos/seed/movie3/400/600',
    calificacion: 'ATP',
    activa: true,
  },
  {
    _id: 'mock-4',
    titulo: 'Familia en caos',
    descripcion: 'Las vacaciones perfectas se convierten en el desastre más divertido del año.',
    generos: ['Comedia', 'Familia'],
    duracionMinutos: 95,
    posterUrl: 'https://picsum.photos/seed/movie4/400/600',
    calificacion: 'ATP',
    activa: true,
  },
]

export const useMoviesStore = defineStore('movies', {
  state: () => ({
    movies: MOCK_MOVIES as Movie[],
  }),
  getters: {
    peliculasActivas: (state): Movie[] => state.movies.filter((m) => m.activa),
  },
})
