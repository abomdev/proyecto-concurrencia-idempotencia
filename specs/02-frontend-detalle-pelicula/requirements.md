# Feature: Detalle de película + selección de horarios

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [x] En implementación
- [x] Completado

## Contexto
Cuando el usuario hace click en una película de la cartelera, llega a esta pantalla. Su función es dos cosas: mostrar la información completa de la película y permitir al usuario elegir una función (día + horario + sala) para continuar al selector de butacas. Es el puente entre la cartelera y la pantalla de reserva.

## Requisitos funcionales

1. La página DEBE mostrar la información completa de la película seleccionada:
   - Póster grande
   - Título
   - Descripción completa
   - Géneros (chips)
   - Duración
   - Calificación de edad

2. La página DEBE mostrar una sección "Funciones disponibles" con las funciones mock de esa película.

3. Cada función DEBE mostrar:
   - Fecha y hora (ej: "Sábado 5 de julio — 20:30")
   - Nombre de la sala (ej: "Sala 1", "Sala IMAX")
   - Precio base (ej: "$2.500")

4. Al hacer click en una función, el usuario DEBE ser redirigido a la pantalla de selección de butacas (`/funciones/:showtimeId/butacas`). La ruta se crea vacía por ahora — se implementa en Spec 03.

5. Si el `id` de la URL no corresponde a ninguna película del store, DEBE mostrarse un mensaje de error: "Película no encontrada." con un botón para volver a la cartelera.

6. La página DEBE tener la Navbar en la parte superior (mismo componente del Spec 01).

7. DEBE haber un botón o link "← Volver a cartelera" que lleve de vuelta a `/`.

8. Los datos mock de funciones DEBE estar en un store separado (`showtimes.ts`) con al menos 3 funciones para la película, en distintos horarios.

9. La estructura del dato mock de función DEBE coincidir con el modelo real de MongoDB que se definirá en Fase C.

## Requisitos no funcionales

- **Componentes:** usar componentes de PrimeVue. El listado de funciones puede usar `DataTable` o una lista de `Card` pequeñas.
- **Sin conexión al backend:** todos los datos vienen del store de Pinia.

## Estructura del dato mock (una función)

```typescript
{
  _id: string,              // "showtime-1", "showtime-2", etc.
  movieId: string,          // referencia al _id de la película
  sala: string,             // "Sala 1", "Sala IMAX"
  fechaHora: string,        // ISO 8601: "2026-07-05T20:30:00"
  precioBase: number,       // en pesos: 2500
  totalAsientos: number,    // 80
  filas: number,            // 8
  columnasPorFila: number   // 10
}
```

## Criterios de aceptación

- DADO que el usuario viene de la cartelera CUANDO llega al detalle ENTONCES ve el título, descripción, géneros, duración y calificación de la película correcta.
- DADO que hay 3 funciones mock para esa película CUANDO el usuario ve la sección de funciones ENTONCES ve las 3 con fecha, sala y precio.
- DADO que el usuario hace click en una función ENTONCES la URL cambia a `/funciones/:showtimeId/butacas`.
- DADO que la URL contiene un id que no existe CUANDO carga la página ENTONCES ve "Película no encontrada." y un botón para volver.
- DADO que el usuario hace click en "← Volver a cartelera" ENTONCES navega a `/`.

## Fuera de alcance

- Filtrar funciones por fecha.
- Mostrar cuántos asientos quedan disponibles (se muestra en Spec 03).
- Trailer de la película.
- Puntuación o reseñas.
