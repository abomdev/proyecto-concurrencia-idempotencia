import mongoose from 'mongoose'
import dns from 'dns'
import { env } from './env'

// Fuerza a Node.js a usar Google DNS directamente, ignorando el DNS del sistema
dns.setServers(['8.8.8.8', '8.8.4.4'])

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI)
  console.log('MongoDB conectado')
}
