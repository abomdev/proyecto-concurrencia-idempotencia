# Feature: Confirmación de compra

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [x] En implementación
- [x] Completado

## Contexto
La confirmación es el final del flujo de compra. El usuario acaba de "pagar" y necesita ver una prueba visual de que la compra fue exitosa. En sistemas reales esta pantalla muestra el ticket con un código QR escaneable en la entrada del cine. En esta fase mostramos la información completa de la compra y un código de reserva generado aleatoriamente que simula lo que vendría del backend.

## Requisitos funcionales

1. La página DEBE mostrar un mensaje de éxito claro: ícono de check verde + texto "¡Compra confirmada!".

2. La página DEBE mostrar un "ticket visual" con:
   - Nombre de la película
   - Sala y fecha/hora de la función
   - Lista de butacas compradas
   - Total pagado
   - Código de reserva (string aleatorio de 8 caracteres en mayúsculas, ej: `CRK-A4F2B8`)

3. La página DEBE tener un botón "Volver al inicio" que lleve a `/` y limpie cualquier estado residual.

4. Si el usuario llega directamente a `/confirmacion` sin haber pasado por el checkout (sin datos de compra guardados), DEBE mostrar una vista mínima con el mensaje "No hay compra reciente." y el botón "Volver al inicio".

5. La página DEBE tener la Navbar.

6. El código de reserva DEBE generarse una sola vez al montar la página (no regenerarse en cada render).

## Requisitos no funcionales

- **Sin backend todavía:** el código de reserva es generado en el cliente con `Math.random()`. En Fase E será el `_id` real del documento `Booking` que devuelva el backend.
- **Componentes:** usar `Message` o un `Card` de PrimeVue para el área de éxito.

## Criterios de aceptación

- DADO que el usuario completó el pago CUANDO llega a la confirmación ENTONCES ve el ícono de check verde, "¡Compra confirmada!", los datos de su compra y el código de reserva.
- DADO que el usuario hace click en "Volver al inicio" ENTONCES navega a `/` y puede iniciar una nueva compra.
- DADO que el usuario navega directamente a `/confirmacion` sin compra previa ENTONCES ve "No hay compra reciente." con el botón de volver.

## Fuera de alcance

- Código QR real escaneable.
- Envío del ticket por email.
- Guardar el historial de compras (se implementa en Spec 07 — Mis Tickets).
