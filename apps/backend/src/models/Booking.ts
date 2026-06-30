import { Schema, model } from 'mongoose'

const bookingSchema = new Schema(
  {
    showtimeId: { type: Schema.Types.ObjectId, ref: 'Showtime', required: true },
    asiento: { type: String, required: true },
    estado: {
      type: String,
      enum: ['held', 'confirmed', 'cancelled'],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    holdExpiresAt: { type: Date },
    confirmedAt: { type: Date },
    idempotencyKey: { type: String },
    precioFinal: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

// Índice único: previene la doble reserva del mismo asiento en la misma función
bookingSchema.index({ showtimeId: 1, asiento: 1 }, { unique: true })

// TTL: MongoDB borra automáticamente los holds cuando holdExpiresAt <= now
bookingSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0 })

bookingSchema.index({ userId: 1 })

export const Booking = model('Booking', bookingSchema)
