# Feature: Checkout (pago simulado)

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [x] En implementación
- [x] Completado

## Contexto
El checkout es la pantalla donde el usuario revisa su compra y completa el pago. En esta fase el pago es completamente simulado — no hay integración con ninguna pasarela real. El objetivo es construir el flujo visual y la experiencia de usuario completa, para que en Fase E solo se reemplace la simulación por la llamada real al backend. También es acá donde en el futuro vivirá la lógica de idempotencia del lado del cliente (el header `Idempotency-Key`).

## Requisitos funcionales

1. La página DEBE mostrar un resumen de la compra con:
   - Nombre de la película
   - Sala y fecha/hora de la función
   - Lista de butacas seleccionadas
   - Precio por butaca
   - Total a pagar

2. La página DEBE mostrar un formulario de pago simulado con los campos:
   - Nombre en la tarjeta (texto)
   - Número de tarjeta (texto, máximo 16 dígitos, con formato visual `XXXX XXXX XXXX XXXX`)
   - Fecha de vencimiento (MM/AA)
   - CVV (3 dígitos)

3. Todos los campos del formulario DEBEN ser requeridos. El botón "Confirmar compra" DEBE estar deshabilitado si algún campo está vacío.

4. Al hacer click en "Confirmar compra" con el formulario válido, DEBE mostrarse un estado de carga ("Procesando pago...") durante 1.5 segundos.

5. Tras los 1.5 segundos, DEBE redirigir automáticamente a `/confirmacion`.

6. Si el usuario llega a `/checkout` sin butacas seleccionadas en el store (por ejemplo, navegando directo por URL), DEBE redirigir automáticamente a `/`.

7. La página DEBE tener la Navbar y un botón "← Volver" que regrese a la pantalla de butacas del showtime actual.

8. Los datos del formulario NO se envían a ningún servidor en esta fase — son solo visuales.

## Requisitos no funcionales

- **Seguridad visual:** el campo de número de tarjeta DEBE mostrar los dígitos agrupados de a 4 (`XXXX XXXX XXXX XXXX`), nunca el número completo en texto plano en el resumen.
- **Sin validación real de tarjeta:** cualquier combinación de 16 dígitos se acepta como válida. El objetivo es el flujo UX, no la seguridad del pago.
- **Componentes:** usar `InputText`, `Button` y `ProgressSpinner` de PrimeVue.

## Criterios de aceptación

- DADO que el usuario llega con 2 butacas seleccionadas CUANDO ve el checkout ENTONCES el resumen muestra las 2 butacas, el precio unitario y el total correcto.
- DADO que el formulario tiene todos los campos completos CUANDO el usuario hace click en "Confirmar compra" ENTONCES aparece el estado de carga "Procesando pago...".
- DADO que pasaron 1.5 segundos ENTONCES el usuario es redirigido a `/confirmacion`.
- DADO que el usuario navega directamente a `/checkout` sin butacas en el store ENTONCES es redirigido a `/`.
- DADO que algún campo del formulario está vacío ENTONCES el botón "Confirmar compra" está deshabilitado.

## Fuera de alcance

- Integración con pasarela de pago real (Stripe, Transbank, etc.).
- Validación real del número de tarjeta (algoritmo de Luhn).
- Guardar los datos de la tarjeta.
- El header `Idempotency-Key` (se implementa en Fase D cuando conectemos el backend).
