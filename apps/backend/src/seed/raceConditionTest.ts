import 'dotenv/config'
import dns from 'dns'
import axios from 'axios'

dns.setServers(['8.8.8.8', '8.8.4.4'])

const BASE_URL = process.env.API_URL ?? 'http://localhost:3000'
const TEST_EMAIL = 'racetest@crunchymark.dev'
const TEST_PASSWORD = 'TestPass123!'
const TEST_ASIENTO = 'RACE-Z1'

async function ensureUser(): Promise<string> {
  try {
    const { data } = await axios.post(`${BASE_URL}/api/auth/registro`, {
      nombre: 'Race Test Bot',
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
  console.log('\n🎬  Race condition test — Crunchymark')
  console.log('─'.repeat(45))

  let token: string
  try {
    token = await ensureUser()
  } catch {
    console.error('❌ No se pudo conectar al servidor. ¿Está corriendo el backend?')
    process.exit(1)
  }

  const showtimeId = await getFirstShowtimeId(token)
  console.log(`Función:  ${showtimeId}`)
  console.log(`Asiento:  ${TEST_ASIENTO}`)
  console.log(`\nLanzando 10 requests concurrentes al mismo asiento...`)

  const requests = Array.from({ length: 10 }, (_, i) =>
    axios
      .post(
        `${BASE_URL}/api/reservas`,
        { showtimeId, asientos: [TEST_ASIENTO], precioBase: 5500 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Idempotency-Key': `race-test-${i}-${Date.now()}`,
          },
          validateStatus: () => true,
        },
      )
      .then((r) => ({ status: r.status, data: r.data })),
  )

  const results = await Promise.all(requests)

  const exitos = results.filter((r) => r.status === 201)
  const rechazados = results.filter((r) => r.status === 409)
  const otros = results.filter((r) => r.status !== 201 && r.status !== 409)

  console.log('\nResultados:')
  results.forEach((r, i) => {
    const icon = r.status === 201 ? '✅' : r.status === 409 ? '❌' : '⚠️'
    const msg = r.status === 201 ? `CRK-${r.data.codigoReserva?.slice(-6) ?? '...'}` : r.data.error
    console.log(`  Request ${i + 1}: ${icon} ${r.status} — ${msg}`)
  })

  console.log(`\n  ✅ ${exitos.length} éxito(s) (201)`)
  console.log(`  ❌ ${rechazados.length} rechazado(s) (409)`)
  if (otros.length > 0) console.log(`  ⚠️  ${otros.length} otro(s)`)

  if (exitos.length === 1 && rechazados.length === 9) {
    console.log('\n✓ Concurrencia manejada correctamente\n')
  } else {
    console.log('\n✗ Resultado inesperado — revisar implementación\n')
  }

  // Cleanup: borrar bookings de test
  const { default: mongoose } = await import('mongoose')
  const { Booking } = await import('../models/Booking')
  await mongoose.connect(process.env.MONGODB_URI!)
  await Booking.deleteMany({ asiento: TEST_ASIENTO })
  await mongoose.disconnect()
  console.log('Limpieza completada.')
}

main().catch((err) => {
  console.error('Error inesperado:', err.message)
  process.exit(1)
})
