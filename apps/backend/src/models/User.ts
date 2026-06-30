import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const User = model('User', userSchema)
