import { Schema, model } from 'mongoose'

const idempotencyKeySchema = new Schema({
  key: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseBody: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
})

// Índice único: misma key + usuario + endpoint = misma operación
idempotencyKeySchema.index({ key: 1, userId: 1, endpoint: 1 }, { unique: true })

// TTL: las claves de idempotencia expiran a las 24 horas
idempotencyKeySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

export const IdempotencyKey = model('IdempotencyKey', idempotencyKeySchema)
