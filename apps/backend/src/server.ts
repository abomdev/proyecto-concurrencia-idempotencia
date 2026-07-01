import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db'
import authRoutes from './routes/auth.routes'
import moviesRoutes from './routes/movies.routes'
import showtimesRoutes from './routes/showtimes.routes'
import ticketsRoutes from './routes/tickets.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'crunchymark-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/peliculas', moviesRoutes)
app.use('/api/funciones', showtimesRoutes)
app.use('/api/mis-tickets', ticketsRoutes)

connectDB()
  .then(() => {
    app.listen(process.env.PORT ?? 3000, () => {
      console.log(`Crunchymark API corriendo en http://localhost:${process.env.PORT ?? 3000}`)
    })
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err)
    process.exit(1)
  })
