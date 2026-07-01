import { Types } from 'mongoose'
import { Booking } from '../models/Booking'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function generateCode(): string {
  return 'CRK-' + Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}

export interface ReservaResult {
  codigoReserva: string
  asientos: string[]
  holdExpiresAt: Date
  precioTotal: number
}

export async function crearReserva(
  userId: string,
  showtimeId: string,
  asientos: string[],
  precioBase: number,
): Promise<ReservaResult> {
  const codigoReserva = generateCode()
  const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
  const creados: string[] = []

  for (const asiento of asientos) {
    try {
      await Booking.findOneAndUpdate(
        {
          showtimeId: new Types.ObjectId(showtimeId),
          asiento,
          holdExpiresAt: { $lt: new Date() },
        },
        {
          $set: {
            userId: new Types.ObjectId(userId),
            showtimeId: new Types.ObjectId(showtimeId),
            asiento,
            estado: 'held',
            holdExpiresAt,
            codigoReserva,
            precioFinal: precioBase,
            confirmedAt: undefined,
          },
        },
        { upsert: true },
      )
      creados.push(asiento)
    } catch (err: any) {
      if (err.code === 11000) {
        // Rollback: eliminar los asientos ya creados en esta operación
        if (creados.length > 0) {
          await Booking.deleteMany({
            showtimeId: new Types.ObjectId(showtimeId),
            asiento: { $in: creados },
            codigoReserva,
          })
        }
        const conflictErr = new Error(`El asiento ${asiento} ya está reservado`) as any
        conflictErr.statusCode = 409
        throw conflictErr
      }
      throw err
    }
  }

  return { codigoReserva, asientos, holdExpiresAt, precioTotal: precioBase * asientos.length }
}

export async function confirmarReserva(codigoReserva: string, userId: string): Promise<void> {
  const result = await Booking.updateMany(
    { codigoReserva, userId: new Types.ObjectId(userId), estado: 'held' },
    {
      $set: { estado: 'confirmed', confirmedAt: new Date() },
      $unset: { holdExpiresAt: 1 },
    },
  )
  if (result.matchedCount === 0) {
    const err = new Error('Reserva no encontrada o expirada') as any
    err.statusCode = 404
    throw err
  }
}
