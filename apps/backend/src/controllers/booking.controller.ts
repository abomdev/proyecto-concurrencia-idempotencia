import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { crearReserva, confirmarReserva } from '../services/booking.service'
import { getIo } from '../socket/io'

export async function createReserva(req: AuthRequest, res: Response): Promise<void> {
  const { showtimeId, asientos } = req.body as { showtimeId: string; asientos: string[] }

  if (!showtimeId || !Array.isArray(asientos) || asientos.length === 0) {
    res.status(400).json({ error: 'showtimeId y asientos son requeridos.' })
    return
  }
  if (asientos.length > 8) {
    res.status(400).json({ error: 'Máximo 8 asientos por reserva.' })
    return
  }

  try {
    const result = await crearReserva(req.userId!, showtimeId, asientos, req.body.precioBase ?? 0)

    const io = getIo()
    for (const asiento of result.asientos) {
      io.to(`showtime:${showtimeId}`).emit('seat:updated', { showtimeId, asiento, estado: 'held' })
    }

    res.status(201).json(result)
  } catch (err: any) {
    const status = err.statusCode ?? 500
    res.status(status).json({ error: err.message })
  }
}

export async function confirmReserva(req: AuthRequest, res: Response): Promise<void> {
  const { codigoReserva } = req.params

  try {
    await confirmarReserva(codigoReserva, req.userId!)
    res.json({ codigoReserva, estado: 'confirmed' })
  } catch (err: any) {
    const status = err.statusCode ?? 500
    res.status(status).json({ error: err.message })
  }
}
