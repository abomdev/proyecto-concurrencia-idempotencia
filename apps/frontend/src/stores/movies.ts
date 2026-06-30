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
    titulo: 'Kimetsu no Yaiba: El Castillo Infinito',
    descripcion:
      'Tanjiro y los Pilares del Cuerpo de Cazadores de Demonios se enfrentan a Muzan Kibutsuji en una batalla épica dentro del castillo infinito.',
    generos: ['Acción', 'Animación', 'Fantasía'],
    duracionMinutos: 140,
    posterUrl: 'https://picsum.photos/seed/kimetsu/400/600',
    calificacion: '+14',
    activa: true,
  },
  {
    _id: 'mock-2',
    titulo: 'Jujutsu Kaisen: Ejecución',
    descripcion:
      'Yuji Itadori enfrenta su destino final mientras el mundo de los hechiceros se desmorona ante la amenaza de Ryomen Sukuna.',
    generos: ['Acción', 'Animación', 'Sobrenatural'],
    duracionMinutos: 112,
    posterUrl: 'https://picsum.photos/seed/jujutsu/400/600',
    calificacion: '+16',
    activa: true,
  },
  {
    _id: 'mock-3',
    titulo: 'Chainsaw Man: Reze',
    descripcion:
      'Denji conoce a Reze, una misteriosa chica con poderes de bomba, y deberá elegir entre sus sentimientos y su deber como Cazador de Demonios.',
    generos: ['Acción', 'Animación', 'Terror'],
    duracionMinutos: 98,
    posterUrl: 'https://picsum.photos/seed/chainsawman/400/600',
    calificacion: '+18',
    activa: true,
  },
  {
    _id: 'mock-4',
    titulo: 'Dragon Ball Super: Super Hero',
    descripcion:
      'La organización Red Ribbon ha creado dos nuevos androides. Piccolo y Gohan deben despertar poderes ocultos para salvar a la humanidad.',
    generos: ['Acción', 'Animación', 'Aventura'],
    duracionMinutos: 100,
    posterUrl: 'https://picsum.photos/seed/dragonball/400/600',
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
