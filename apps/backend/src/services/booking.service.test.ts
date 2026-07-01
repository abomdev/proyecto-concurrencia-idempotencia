import { describe, it, expect, vi, beforeEach } from 'vitest'
import mongoose from 'mongoose'

// Mock del modelo Booking antes de importar el servicio
vi.mock('../models/Booking', () => {
  const mockBooking = {
    findOneAndUpdate: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  }
  return { Booking: mockBooking }
})

import { crearReserva, confirmarReserva } from './booking.service'
import { Booking } from '../models/Booking'

const fakeUserId = new mongoose.Types.ObjectId().toString()
const fakeUserId2 = new mongoose.Types.ObjectId().toString()
const fakeShowtimeId = new mongoose.Types.ObjectId().toString()

const mockBooking = Booking as unknown as {
  findOneAndUpdate: ReturnType<typeof vi.fn>
  updateMany: ReturnType<typeof vi.fn>
  deleteMany: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('crearReserva', () => {
  it('crea una reserva exitosa para un asiento libre', async () => {
    mockBooking.findOneAndUpdate.mockResolvedValueOnce({ asiento: 'A1', estado: 'held' })

    const result = await crearReserva(fakeUserId, fakeShowtimeId, ['A1'], 5500)

    expect(result.codigoReserva).toMatch(/^CRK-[A-Z0-9]{6}$/)
    expect(result.asientos).toEqual(['A1'])
    expect(result.precioTotal).toBe(5500)
    expect(result.holdExpiresAt.getTime()).toBeGreaterThan(Date.now())
    expect(mockBooking.findOneAndUpdate).toHaveBeenCalledTimes(1)
  })

  it('calcula precioTotal correctamente para múltiples asientos', async () => {
    mockBooking.findOneAndUpdate.mockResolvedValue({ asiento: 'X', estado: 'held' })

    const result = await crearReserva(fakeUserId, fakeShowtimeId, ['A1', 'A2', 'A3'], 5500)

    expect(result.precioTotal).toBe(16500)
    expect(result.asientos).toHaveLength(3)
    expect(mockBooking.findOneAndUpdate).toHaveBeenCalledTimes(3)
  })

  it('todos los asientos comparten el mismo codigoReserva', async () => {
    mockBooking.findOneAndUpdate.mockResolvedValue({ asiento: 'X', estado: 'held' })

    const result = await crearReserva(fakeUserId, fakeShowtimeId, ['A1', 'A2'], 5500)

    expect(result.codigoReserva).toMatch(/^CRK-/)
    // Ambas llamadas a findOneAndUpdate recibieron el mismo codigoReserva
    const call1Args = mockBooking.findOneAndUpdate.mock.calls[0][1].$set.codigoReserva
    const call2Args = mockBooking.findOneAndUpdate.mock.calls[1][1].$set.codigoReserva
    expect(call1Args).toBe(call2Args)
  })

  it('lanza error 409 cuando MongoDB retorna DuplicateKeyError (11000)', async () => {
    const duplicateError = Object.assign(new Error('E11000 duplicate key'), { code: 11000 })
    mockBooking.findOneAndUpdate.mockRejectedValueOnce(duplicateError)
    mockBooking.deleteMany.mockResolvedValue({ deletedCount: 0 })

    await expect(
      crearReserva(fakeUserId2, fakeShowtimeId, ['A1'], 5500),
    ).rejects.toMatchObject({ statusCode: 409, message: expect.stringContaining('A1') })
  })

  it('hace rollback de asientos creados antes del conflicto', async () => {
    const duplicateError = Object.assign(new Error('E11000 duplicate key'), { code: 11000 })
    // Primer asiento OK, segundo falla
    mockBooking.findOneAndUpdate
      .mockResolvedValueOnce({ asiento: 'B1', estado: 'held' })
      .mockRejectedValueOnce(duplicateError)
    mockBooking.deleteMany.mockResolvedValue({ deletedCount: 1 })

    await expect(
      crearReserva(fakeUserId2, fakeShowtimeId, ['B1', 'B2'], 5500),
    ).rejects.toMatchObject({ statusCode: 409 })

    // Debe llamar deleteMany para revertir B1
    expect(mockBooking.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ asiento: { $in: ['B1'] } }),
    )
  })
})

describe('confirmarReserva', () => {
  it('confirma reserva cuando matchedCount > 0', async () => {
    mockBooking.updateMany.mockResolvedValueOnce({ matchedCount: 2, modifiedCount: 2 })

    await expect(confirmarReserva('CRK-ABCDEF', fakeUserId)).resolves.toBeUndefined()
    expect(mockBooking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ codigoReserva: 'CRK-ABCDEF' }),
      expect.objectContaining({ $set: { estado: 'confirmed', confirmedAt: expect.any(Date) } }),
    )
  })

  it('lanza error 404 cuando matchedCount es 0', async () => {
    mockBooking.updateMany.mockResolvedValueOnce({ matchedCount: 0, modifiedCount: 0 })

    await expect(
      confirmarReserva('CRK-NOEXIST', fakeUserId),
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})
