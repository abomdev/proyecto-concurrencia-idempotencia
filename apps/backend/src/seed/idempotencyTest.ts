import 'dotenv/config'
import dns from 'dns'
import axios from 'axios'
import { randomUUID } from 'crypto'

dns.setServers(['8.8.8.8', '8.8.4.4'])

const BASE_URL = process.env.API_URL ?? 'http://localhost:3000'
const TEST_EMAIL = 'idempotencytest@crunchymark.dev'
const TEST_PASSWORD = 'TestPass123!'
const TEST_ASIENTO = 'IDEM-Z1'

async function ensureUser(): Promise<string> {
  try {
    const { data } = await axios.post(`${BASE_URL}/api/auth/registro`, {
      nombre: 'Idempotency Test Bot',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })
    return data.token
  } catch {
    const { data } = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    })
    return data.token
  }
}

async function getFirstShowtimeId(token: string): Promise<string> {
  const { data: peliculas } = await axios.get(`${BASE_URL}/api/peliculas`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const { data: funciones } = await axios.get(
    `${BASE_URL}/api/peliculas/${peliculas[0]._id}/funciones`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return funciones[0]._id
}

async function main() {
  console.log('\n🔑  Idempotency test — Crunchymark')
  console.log('─'.repeat(45))

  let token: string
  try {
    token = await ensureUser()
  } catch {
    console.error('❌ No se pudo conectar al servidor. ¿Está corriendo el backend?')
    process.exit(1)
  }

  const showtimeId = await getFirstShowtimeId(token)
  const idempotencyKey = randomUUID()

  console.log(`Función:  ${showtimeId}`)
  console.log(`Asiento:  ${TEST_ASIENTO}`)
  console.log(`Key:      ${idempotencyKey}`)
  console.log(`\nEnviando 5 requests secuenciales con la misma Idempotency-Key...`)

  const respuestas: { status: number; codigoReserva: string }[] = []

  for (let i = 1; i <= 5; i++) {
    const r = await axios.post(
      `${BASE_URL}/api/reservas`,
      { showtimeId, asientos: [TEST_ASIENTO], precioBase: 5500 },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': idempotencyKey,
        },
        validateStatus: () => true,
      },
    )
    respuestas.push({ status: r.status, codigoReserva: r.data.codigoReserva })
  }

  console.log('\nRespuestas:')
  respuestas.forEach((r, i) => {
    console.log(`  Request ${i + 1}: ${r.status} | ${r.codigoReserva}`)
  })

  const codigosUnicos = new Set(respuestas.map((r) => r.codigoReserva))

  // Verificar en DB
  const { default: mongoose } = await import('mongoose')
  const { Booking } = await import('../models/Booking')
  await mongoose.connect(process.env.MONGODB_URI!)
  const count = await Booking.countDocuments({ asiento: TEST_ASIENTO, showtimeId })
  console.log(`\nDocumentos en DB con ese asiento: ${count}`)

  if (codigosUnicos.size === 1 && count === 1) {
    console.log('✓ Idempotencia funciona correctamente\n')
  } else {
    console.log('✗ Resultado inesperado — revisar implementación\n')
  }

  await Booking.deleteMany({ asiento: TEST_ASIENTO })
  await mongoose.disconnect()
  console.log('Limpieza completada.')
}

main().catch((err) => {
  console.error('Error inesperado:', err.message)
  process.exit(1)
})
