import { Schema, model } from 'mongoose'

const showtimeSchema = new Schema({
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  sala: { type: String, required: true },
  fechaHora: { type: Date, required: true },
  precioBase: { type: Number, required: true },
  totalAsientos: { type: Number, required: true },
  filas: { type: Number, required: true },
  columnasPorFila: { type: Number, required: true },
})

export const Showtime = model('Showtime', showtimeSchema)
