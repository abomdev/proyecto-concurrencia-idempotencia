import { Request, Response } from 'express'
import { Movie } from '../models/Movie'
import { Showtime } from '../models/Showtime'

export async function getPeliculas(_req: Request, res: Response): Promise<void> {
  const peliculas = await Movie.find({ activa: true }).lean()
  res.json(peliculas)
}

export async function getPelicula(req: Request, res: Response): Promise<void> {
  const pelicula = await Movie.findById(req.params.id).lean()
  if (!pelicula) {
    res.status(404).json({ error: 'Película no encontrada.' })
    return
  }
  res.json(pelicula)
}

export async function getFuncionesPorPelicula(req: Request, res: Response): Promise<void> {
  const funciones = await Showtime.find({ movieId: req.params.id })
    .sort({ fechaHora: 1 })
    .lean()
  res.json(funciones)
}
