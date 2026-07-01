import 'dotenv/config'
import mongoose from 'mongoose'
import dns from 'dns'
import { Movie } from '../models/Movie'
import { Showtime } from '../models/Showtime'

dns.setServers(['8.8.8.8', '8.8.4.4'])

const PELICULAS = [
  {
    titulo: 'Kimetsu no Yaiba: El Castillo Infinito',
    descripcion:
      'Tanjiro y los Pilares del Cuerpo de Cazadores de Demonios enfrentan a Muzan Kibutsuji en una batalla épica dentro del castillo infinito.',
    generos: ['Acción', 'Animación', 'Fantasía'],
    duracionMinutos: 140,
    posterUrl: 'https://picsum.photos/seed/kimetsu/400/600',
    calificacion: '+14',
    activa: true,
  },
  {
    titulo: 'Jujutsu Kaisen: Ejecución',
    descripcion:
      'Yuji Itadori enfrenta su destino final mientras Ryomen Sukuna desata su verdadero poder sobre el mundo.',
    generos: ['Acción', 'Animación', 'Sobrenatural'],
    duracionMinutos: 112,
    posterUrl: 'https://picsum.photos/seed/jujutsu/400/600',
    calificacion: '+16',
    activa: true,
  },
  {
    titulo: 'Chainsaw Man: Reze',
    descripcion:
      'Denji conoce a Reze, la chica bomba, y debe elegir entre sus sentimientos y su deber como Cazador de Demonios.',
    generos: ['Acción', 'Animación', 'Terror'],
    duracionMinutos: 98,
    posterUrl: 'https://picsum.photos/seed/chainsawman/400/600',
    calificacion: '+18',
    activa: true,
  },
  {
    titulo: 'Dragon Ball Super: Super Hero',
    descripcion:
      'Piccolo y Gohan despiertan poderes ocultos para enfrentar los nuevos androides de la organización Red Ribbon.',
    generos: ['Acción', 'Animación', 'Aventura'],
    duracionMinutos: 100,
    posterUrl: 'https://picsum.photos/seed/dragonball/400/600',
    calificacion: 'ATP',
    activa: true,
  },
]

function buildFunciones(movieIds: mongoose.Types.ObjectId[]) {
  const [kimetsu, jujutsu, chainsaw, dragonball] = movieIds
  return [
    { movieId: kimetsu,    sala: 'Sala 1', fechaHora: new Date('2026-07-10T20:30:00'), precioBase: 5500, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: kimetsu,    sala: 'Sala 2', fechaHora: new Date('2026-07-11T18:00:00'), precioBase: 5000, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: kimetsu,    sala: 'Sala 3', fechaHora: new Date('2026-07-12T15:30:00'), precioBase: 4500, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: jujutsu,    sala: 'Sala 1', fechaHora: new Date('2026-07-10T18:00:00'), precioBase: 5500, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: jujutsu,    sala: 'Sala 2', fechaHora: new Date('2026-07-11T21:00:00'), precioBase: 5000, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: jujutsu,    sala: 'Sala 3', fechaHora: new Date('2026-07-13T16:00:00'), precioBase: 4500, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: chainsaw,   sala: 'Sala 2', fechaHora: new Date('2026-07-11T20:30:00'), precioBase: 6000, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: chainsaw,   sala: 'Sala 1', fechaHora: new Date('2026-07-12T18:00:00'), precioBase: 5500, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: chainsaw,   sala: 'Sala 3', fechaHora: new Date('2026-07-14T15:00:00'), precioBase: 5000, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: dragonball, sala: 'Sala 3', fechaHora: new Date('2026-07-10T16:00:00'), precioBase: 4500, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: dragonball, sala: 'Sala 1', fechaHora: new Date('2026-07-13T20:30:00'), precioBase: 5000, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
    { movieId: dragonball, sala: 'Sala 2', fechaHora: new Date('2026-07-14T18:00:00'), precioBase: 4500, totalAsientos: 80, filas: 8, columnasPorFila: 10 },
  ]
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI ?? '')
  console.log('MongoDB conectado')

  await Movie.deleteMany({})
  await Showtime.deleteMany({})
  console.log('Colecciones limpiadas')

  const movies = await Movie.insertMany(PELICULAS)
  const movieIds = movies.map((m) => m._id as mongoose.Types.ObjectId)

  await Showtime.insertMany(buildFunciones(movieIds))

  console.log('Seed completado: 4 películas, 12 funciones')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Error en seed:', err)
  process.exit(1)
})
