import { Request, Response } from 'express'
import { Booking } from '../models/Booking'

export async function getButacas(req: Request, res: Response): Promise<void> {
  const ahora = new Date()
  const bookings = await Booking.find({
    showtimeId: req.params.showtimeId,
    $or: [
      { estado: 'confirmed' },
      { estado: 'held', holdExpiresAt: { $gt: ahora } },
    ],
  }).lean()

  const seatStates: Record<string, 'occupied' | 'held'> = {}
  for (const b of bookings) {
    seatStates[b.asiento] = b.estado === 'confirmed' ? 'occupied' : 'held'
  }

  res.json(seatStates)
}
