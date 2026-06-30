import { Schema, model } from 'mongoose'

const movieSchema = new Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  generos: [String],
  duracionMinutos: Number,
  posterUrl: String,
  calificacion: String,
  activa: { type: Boolean, default: true },
})

export const Movie = model('Movie', movieSchema)
