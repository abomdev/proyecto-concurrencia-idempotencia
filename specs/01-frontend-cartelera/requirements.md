# Feature: Cartelera (HomeView)

## Estado
- [x] Borrador
- [x] Aprobado por el usuario
- [x] En implementación
- [x] Completado

## Contexto
La cartelera es la pantalla de entrada del sistema. Es lo primero que ve cualquier usuario al abrir Crunchymark. Su función es mostrar las películas disponibles y permitir al usuario elegir cuál quiere ver. En esta fase los datos son mock (hardcodeados en el store de Pinia), sin conexión al backend todavía.

## Requisitos funcionales

1. La página DEBE mostrar una grilla de tarjetas, una por cada película disponible.

2. Cada tarjeta DEBE mostrar:
   - Póster de la película (imagen)
   - Título
   - Género(s) (ej: "Acción, Ciencia Ficción")
   - Duración en minutos (ej: "148 min")
   - Calificación de edad (ej: "PG-13", "+16")

3. Al hacer click en una tarjeta, el usuario DEBE ser redirigido a la página de detalle de esa película (`/peliculas/:id`). La ruta se crea vacía por ahora — se implementa en Spec 02.

4. La grilla DEBE ser responsiva: 4 columnas en pantallas grandes, 2 columnas en tablets, 1 columna en móvil.

5. Si no hay películas en el store, DEBE mostrarse un mensaje: "No hay películas disponibles en cartelera."

6. La página DEBE tener una barra de navegación superior (Navbar) con el logo/nombre "Crunchymark" y un botón de login visible (sin funcionalidad todavía — se conecta en Spec 06).

7. Los datos mock DEBE contener al menos 4 películas con estructura completa para que la grilla se vea poblada y representativa.

8. La estructura del dato mock DEBE coincidir con la que tendrá el modelo real de MongoDB, para que en Fase D solo se reemplace la fuente de datos sin tocar los componentes.

## Requisitos no funcionales

- **Componentes:** usar componentes de PrimeVue (Card, Button, Chip para géneros). No crear estilos desde cero para lo que PrimeVue ya provee.
- **Iconos:** usar PrimeIcons para los íconos de duración y calificación dentro de las tarjetas.

## Estructura del dato mock (una película)

```typescript
{
  _id: string,           // "mock-1", "mock-2", etc.
  titulo: string,
  descripcion: string,
  generos: string[],     // ["Acción", "Aventura"]
  duracionMinutos: number,
  posterUrl: string,     // URL de imagen placeholder (picsum.photos o similar)
  calificacion: string,  // "PG-13", "+16", "ATP"
  activa: boolean        // true = aparece en cartelera
}
```

## Criterios de aceptación

- DADO que hay 4 películas en el mock CUANDO el usuario abre `http://localhost:5173` ENTONCES ve 4 tarjetas de película en grilla.
- DADO que cada tarjeta tiene datos completos CUANDO el usuario la ve ENTONCES puede leer el título, géneros, duración y calificación.
- DADO que el usuario hace click en una tarjeta CUANDO la página redirige ENTONCES la URL cambia a `/peliculas/:id` (aunque la página de detalle esté vacía por ahora).
- DADO que la pantalla es de móvil CUANDO el usuario la ve ENTONCES las tarjetas se muestran en una sola columna, sin scroll horizontal.
- DADO que el store tiene `activa: false` en una película CUANDO se renderiza la cartelera ENTONCES esa película NO aparece.

## Fuera de alcance

- Buscador o filtros de películas.
- Paginación (las 4 películas del mock entran en una pantalla).
- Funcionalidad real del botón de login.
- Conexión a base de datos o API (los datos son mock en Pinia).
- Diseño del detalle de película (Spec 02).
