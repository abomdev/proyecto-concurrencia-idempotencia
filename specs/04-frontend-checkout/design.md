# Diseño: Checkout (pago simulado)

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [ ] En implementación
- [ ] Completado

---

## Diagrama de flujo

```
SeatsView → router.push({ name: 'checkout' })
        │
        ▼
CheckoutView.vue
        │
        ├── onMounted: si bookingStore.selectedSeats.length === 0
        │       └── router.replace('/') ← redirige sin dejar historial
        │
        ├── muestra resumen (datos del bookingStore + showtimesStore)
        │
        └── usuario completa formulario y hace click en "Confirmar compra"
                │
                ▼
        cargando = true → espera 1500ms → router.push('/confirmacion')
```

---

## Cambio necesario en el store `booking.ts`

El checkout necesita saber qué función se está comprando para mostrar el resumen. Actualmente el store no guarda ese dato. Se agrega `currentShowtimeId` al estado:

```typescript
state: () => ({
  selectedSeats: [] as string[],
  seatStates: MOCK_SEAT_STATES,
  currentShowtimeId: null as string | null,   // ← nuevo
})
```

Y en `SeatsView.vue` se agrega al montar la pantalla:
```typescript
onMounted(() => {
  bookingStore.currentShowtimeId = showtimeId
})
```

Y se limpia junto con `clearSelection()`:
```typescript
clearSelection() {
  this.selectedSeats = []
  this.currentShowtimeId = null
}
```

**¿Por qué guardar el showtimeId en el store y no en la URL?** El checkout es una pantalla de un solo flujo: el usuario llega desde SeatsView, no desde un link externo. Guardar el showtimeId en la URL haría que la página parezca "shareable" (se puede compartir la URL), pero sin las butacas seleccionadas en el store la URL no sirve de nada — igual redirige a `/`. El store es la fuente de verdad para este flujo.

---

## Layout

### Desktop

```
┌──────────────────────────────────────────────────────────────┐
│  Navbar                                                      │
├──────────────────────────────────────────────────────────────┤
│  ← Volver                                                    │
│                                                              │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │  Resumen de compra      │  │  Datos de pago           │  │
│  │  ─────────────────────  │  │  ─────────────────────   │  │
│  │  El último horizonte    │  │  Nombre en la tarjeta    │  │
│  │  Sala 1 · sáb 5 julio  │  │  [________________]      │  │
│  │  20:30                  │  │                          │  │
│  │                         │  │  Número de tarjeta       │  │
│  │  Butaca A4   $4.500     │  │  [________________]      │  │
│  │  Butaca B6   $4.500     │  │                          │  │
│  │  ─────────────────────  │  │  Vencimiento   CVV       │  │
│  │  Total       $9.000     │  │  [________]  [____]      │  │
│  └─────────────────────────┘  │                          │  │
│                                │  [Confirmar compra]      │  │
│                                └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Móvil
Resumen arriba, formulario abajo.

### Estado de carga

El botón "Confirmar compra" se reemplaza por un `ProgressSpinner` de PrimeVue con el texto "Procesando pago..." mientras `cargando === true`. Todo el formulario queda deshabilitado durante la carga.

---

## Formulario y validación

```typescript
const form = reactive({
  nombre: '',
  numero: '',     // guardado sin espacios internamente: "1234567890123456"
  vencimiento: '',
  cvv: '',
})

// El botón se deshabilita si algún campo no cumple la longitud mínima
const formularioValido = computed(() =>
  form.nombre.trim().length > 0 &&
  form.numero.length === 16 &&           // 16 dígitos sin espacios
  form.vencimiento.length === 5 &&       // "MM/AA"
  form.cvv.length === 3
)
```

### Formateo del número de tarjeta

El input muestra `XXXX XXXX XXXX XXXX` mientras el usuario escribe, pero internamente el valor guardado en `form.numero` son los 16 dígitos sin espacios:

```typescript
// Valor que se muestra en el input (con espacios)
const numeroFormateado = computed(() =>
  form.numero.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
)

// Al escribir: se extraen solo dígitos, máximo 16
function onNumeroInput(e: Event) {
  const soloDigitos = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16)
  form.numero = soloDigitos
  // Forzar el display formateado en el input
  ;(e.target as HTMLInputElement).value = numeroFormateado.value
}
```

### Formateo de vencimiento

Auto-inserta el `/` al escribir el mes:
```typescript
function onVencimientoInput(e: Event) {
  let val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2)
  form.vencimiento = val
  ;(e.target as HTMLInputElement).value = val
}
```

---

## Componentes de PrimeVue usados

| Componente | Uso |
|---|---|
| `Card` | Resumen de compra y panel de formulario |
| `InputText` | Campos del formulario |
| `Button` | "← Volver" y "Confirmar compra" |
| `ProgressSpinner` | Indicador de carga durante el pago simulado |
| `Divider` | Separador visual en el resumen |

---

## Archivos modificados / creados

| Acción | Archivo |
|---|---|
| Modificar | `apps/frontend/src/stores/booking.ts` — agregar `currentShowtimeId` |
| Modificar | `apps/frontend/src/views/SeatsView.vue` — setear `currentShowtimeId` en `onMounted` |
| Reemplazar | `apps/frontend/src/views/CheckoutView.vue` |
| Crear | `apps/frontend/src/views/ConfirmationView.vue` (placeholder para Spec 05) |
| Modificar | `apps/frontend/src/router/index.ts` — agregar ruta `/confirmacion` |

---

## Decisiones de diseño

| Alternativa | Decisión | Razón |
|---|---|---|
| Validar tarjeta con algoritmo de Luhn | Aceptar cualquier combinación de 16 dígitos | El objetivo es el flujo UX, no la seguridad del pago. El backend real validará en Fase E |
| Mostrar número completo en el resumen | No mostrar el número de tarjeta en el resumen | Buena práctica de UX/seguridad: nunca mostrar datos de tarjeta en texto plano |
| `setTimeout` de 1500ms en el componente | `setTimeout` envuelto en una Promise reutilizable | Más limpio en el `async/await` del handler del botón |
| Usar librería de máscaras de input (vue-imask) | Formateo manual con `replace` | Sin dependencias extra para algo puntual. Si el proyecto crece y necesita más máscaras, ahí vale la pena agregar la librería |
