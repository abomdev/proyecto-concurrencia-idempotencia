# Feature: Selección de butacas

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [ ] En implementación
- [ ] Completado

## Contexto
Esta es la pantalla núcleo del proyecto. Es donde ocurre el problema que el sistema resuelve: dos usuarios eligiendo la misma butaca al mismo tiempo. Aunque en esta fase los datos son mock (sin backend todavía), el componente `SeatButton` ya debe soportar los tres estados visuales que existirán en producción. La pantalla muestra el mapa de la sala, permite seleccionar butacas disponibles, y lleva al checkout.

## Requisitos funcionales

1. La página DEBE mostrar el mapa de butacas de la función seleccionada, organizado en filas y columnas según los datos del showtime (`filas` × `columnasPorFila`).

2. Cada butaca DEBE tener uno de tres estados visuales:
   - **`available` (disponible):** el usuario puede seleccionarla. Color: verde.
   - **`held` (en proceso):** otro usuario la está reservando en este momento (hold activo). Color: amarillo. No se puede seleccionar.
   - **`occupied` (ocupada):** ya fue comprada y confirmada. Color: rojo/gris. No se puede seleccionar.

3. El usuario PUEDE seleccionar múltiples butacas disponibles en la misma sesión (máximo 8 por compra).

4. Al hacer click en una butaca `available`, DEBE cambiar a un estado visual de "seleccionada" (color azul/primario). Al hacer click de nuevo en una butaca ya seleccionada, DEBE deseleccionarse.

5. La página DEBE mostrar una leyenda con los colores y su significado.

6. La página DEBE mostrar un panel de resumen lateral (o inferior en móvil) con:
   - Lista de butacas seleccionadas (ej: "A1, B5, C3")
   - Precio total (cantidad de butacas × precio base del showtime)
   - Botón "Ir al checkout" — deshabilitado si no hay butacas seleccionadas, activo si hay al menos una

7. Al hacer click en "Ir al checkout", el usuario DEBE ser redirigido a `/checkout` pasando los IDs de las butacas seleccionadas y el showtimeId. La ruta se crea vacía por ahora — se implementa en Spec 04.

8. La página DEBE mostrar información de la función en la parte superior: nombre de la película, sala, fecha y hora.

9. La página DEBE tener la Navbar.

10. DEBE haber un link "← Volver" que regrese a la página de detalle de la película.

11. Los datos mock de estado de butacas DEBEN estar en el store `booking.ts`, mapeados como `{ [showtimeId]: { [asiento]: 'available' | 'held' | 'occupied' } }` para simular distintos estados por función.

## Requisitos no funcionales

- **Nomenclatura de asientos:** cada asiento se identifica con letra de fila + número de columna. Fila A = primera fila, columna 1 = primera columna. Ejemplos: "A1", "B5", "H10".
- **Pantalla de cine:** representar visualmente la pantalla del cine en la parte superior del mapa (un rectángulo con el texto "PANTALLA").
- **Responsivo:** en móvil el mapa se puede hacer scroll horizontal si no entra en pantalla. El panel de resumen va debajo del mapa.
- **Performance:** el mapa puede tener hasta 80 butacas (8×10). Usar `v-for` anidado (filas → columnas), sin necesidad de optimizaciones adicionales en esta escala.

## Estructura del dato mock (estado de butacas)

```typescript
// en el store booking.ts
seatStates: {
  'showtime-1': {
    'A1': 'occupied',
    'A2': 'occupied',
    'B5': 'held',
    'C3': 'held',
    // el resto son 'available' por defecto (no se listan)
  },
  // las demás funciones no tienen entradas → todas sus butacas son 'available'
}
```

## Criterios de aceptación

- DADO que el usuario llega a la pantalla de butacas de `showtime-1` CUANDO ve el mapa ENTONCES ve una grilla de 8 filas × 10 columnas (80 butacas), con A1, A2 en rojo y B5, C3 en amarillo, el resto en verde.
- DADO que el usuario hace click en una butaca verde ENTONCES cambia a azul (seleccionada) y aparece en el panel de resumen.
- DADO que el usuario hace click de nuevo en esa butaca azul ENTONCES vuelve a verde y desaparece del resumen.
- DADO que el usuario intenta hacer click en una butaca amarilla o roja ENTONCES no pasa nada (el click no tiene efecto).
- DADO que hay al menos una butaca seleccionada CUANDO el usuario ve el botón "Ir al checkout" ENTONCES está activo y se puede presionar.
- DADO que no hay butacas seleccionadas ENTONCES el botón "Ir al checkout" está deshabilitado.

## Fuera de alcance

- Actualización en tiempo real del estado de butacas (se agrega en Spec 12 con Socket.io).
- Comunicación real con el backend (se conecta en Fases D y E).
- Lógica de expiración del hold (se implementa en Fase E).
- Selección de tipo de asiento (preferencial, normal, etc.).
