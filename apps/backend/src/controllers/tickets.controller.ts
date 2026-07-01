import { Response } from 'express'
import { Booking } from '../models/Booking'
import { AuthRequest } from '../middleware/auth.middleware'

export async function getMisTickets(req: AuthRequest, res: Response): Promise<void> {
  const bookings = await Booking.find({ userId: req.userId, estado: 'confirmed' })
    .populate({ path: 'showtimeId', populate: { path: 'movieId' } })
    .sort({ createdAt: -1 })
    .lean()

  // Agrupa por codigoReserva para devolver un ticket por compra
  const groups = new Map<string, object>()
  for (const b of bookings) {
    const st = b.showtimeId as any
    const movie = st?.movieId as any
    const code = b.codigoReserva as string
    if (!code) continue

    if (!groups.has(code)) {
      groups.set(code, {
        _id: String(b._id),
        movieTitle: movie?.titulo ?? '',
        sala: st?.sala ?? '',
        fechaHora: st?.fechaHora ?? '',
        seats: [b.asiento],
        precioBase: st?.precioBase ?? b.precioFinal,
        codigoReserva: code,
        estado: 'confirmado',
      })
    } else {
      const group = groups.get(code) as any
      group.seats.push(b.asiento)
    }
  }

  res.json([...groups.values()])
}
