# Spec 13 — Design

## Script raceConditionTest.ts

El script necesita un usuario autenticado y una función real de la DB para lanzar las requests. Flujo:

```
1. Conectar a MongoDB (mismo dns fix)
2. Obtener un showtimeId real de la DB
3. Registrar un usuario de test (o reusar si ya existe)
4. Hacer login → obtener JWT
5. Lanzar Promise.all con 10 requests POST /api/reservas al mismo asiento
6. Contar 201 vs 409
7. Imprimir resultado
8. Limpiar: borrar bookings de test
```

Output esperado:
```
🎬 Race condition test — Crunchymark
Función: 683abc... | Asiento: Z1 (test)
Lanzando 10 requests concurrentes...

Resultados:
  ✅ 1 éxito (201)
  ❌ 9 rechazados (409)

✓ Concurrencia manejada correctamente
Limpiando datos de test...
```

## Script idempotencyTest.ts

```
1. Conectar a MongoDB
2. Obtener showtimeId real
3. Login → JWT
4. Generar un UUID como idempotency key
5. Enviar 5 requests secuenciales (no paralelas) con la misma key
6. Contar documentos en DB con ese codigoReserva
7. Verificar que todas las respuestas tienen el mismo codigoReserva
8. Limpiar
```

Output esperado:
```
🔑 Idempotency test — Crunchymark
Key: a1b2c3d4-...
Enviando 5 requests con la misma Idempotency-Key...

Respuestas:
  Request 1: 201 | CRK-XXXXXX
  Request 2: 201 | CRK-XXXXXX  ← mismo código (cacheado)
  Request 3: 201 | CRK-XXXXXX
  Request 4: 201 | CRK-XXXXXX
  Request 5: 201 | CRK-XXXXXX

Documentos en DB con ese código: 1
✓ Idempotencia funciona correctamente
Limpiando datos de test...
```

> Nota: el middleware de idempotencia devuelve el statusCode cacheado (201), por eso todas responden 201.

## Tests unitarios — booking.service.test.ts

**Framework**: Vitest (ya instalado en el workspace) o Jest. Se usará **Vitest** porque es el estándar del ecosistema Vite y ya está disponible. Para el backend se instala `vitest` + `@vitest/coverage-v8` + `mongodb-memory-server`.

**Estructura del test:**
```typescript
describe('booking.service', () => {
  // beforeAll: conectar MongoMemoryServer
  // afterAll: desconectar
  // afterEach: limpiar colección Booking

  it('crea una reserva exitosamente', async () => {
    const result = await crearReserva(userId, showtimeId, ['A1'], 5500)
    expect(result.codigoReserva).toMatch(/^CRK-/)
    expect(result.asientos).toEqual(['A1'])
    // verificar que el documento existe en DB
    const booking = await Booking.findOne({ asiento: 'A1' })
    expect(booking?.estado).toBe('held')
  })

  it('rechaza reserva de asiento ocupado', async () => {
    await crearReserva(userId, showtimeId, ['A1'], 5500)
    await expect(crearReserva(userId2, showtimeId, ['A1'], 5500)).rejects.toMatchObject({
      statusCode: 409,
    })
  })

  it('permite confirmar una reserva held', async () => {
    const { codigoReserva } = await crearReserva(userId, showtimeId, ['A1'], 5500)
    await confirmarReserva(codigoReserva, userId)
    const booking = await Booking.findOne({ codigoReserva })
    expect(booking?.estado).toBe('confirmed')
    expect(booking?.holdExpiresAt).toBeUndefined()
  })
})
```

## Archivos a crear/modificar

### Backend

**`apps/backend/src/seed/raceConditionTest.ts`** — script demo concurrencia
**`apps/backend/src/seed/idempotencyTest.ts`** — script demo idempotencia
**`apps/backend/src/services/booking.service.test.ts`** — tests unitarios
**`apps/backend/package.json`** — agregar scripts `race-test`, `idempotency-test`, `test`

### Dependencias de test (backend)

```
pnpm add -D vitest mongodb-memory-server --filter backend
```

`mongodb-memory-server` descarga un binario de MongoDB la primera vez (~60MB). Las siguientes ejecuciones usan el caché.

## Decisiones de diseño

| Decisión | Alternativa | Por qué |
|---|---|---|
| Vitest para backend | Jest | Vitest es más rápido, mejor integración con ESM/TypeScript, y ya es conocido del ecosistema Vite |
| Scripts contra servidor real | Tests de integración con supertest | Los scripts son más impactantes visualmente para demos. Los tests unitarios usan MongoMemoryServer para velocidad y reproducibilidad |
| Asiento `Z1` para los tests | Asiento real del seed | Usar un identificador de asiento inexistente en el seed evita colisiones con datos reales |
| Limpieza post-test | Fixtures permanentes | Los scripts deben ser idempotentes: se pueden correr múltiples veces sin ensuciar la DB |
