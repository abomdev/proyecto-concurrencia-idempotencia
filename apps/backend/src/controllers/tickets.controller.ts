import { Response } from 'express'
import { Booking } from '../models/Booking'
import { AuthRequest } from '../middleware/auth.middleware'

export async function getMisTickets(req: AuthRequest, res: Response): Promise<void> {
  const tickets = await Booking.find({ userId: req.userId, estado: 'confirmed' })
    .populate('showtimeId')
    .sort({ createdAt: -1 })
    .lean()
  res.json(tickets)
}
