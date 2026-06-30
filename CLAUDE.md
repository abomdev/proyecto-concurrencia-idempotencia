# Reglas del proyecto — Crunchymark

## Idioma de la UI: español chileno (es-CL)

Todo texto visible al usuario en el frontend DEBE estar en **español chileno**.

### Regla crítica: prohibido el voseo rioplatense

Chile NO usa "vos". Usar voseo es un error de regionalismo. Está terminantemente prohibido escribir:

| ❌ Incorrecto (voseo argentino) | ✅ Correcto (tuteo chileno) |
|---|---|
| Iniciá sesión | Inicia sesión |
| Creá tu cuenta | Crea tu cuenta |
| Seleccioná | Selecciona |
| Registrate | Regístrate |
| ¿No tenés cuenta? | ¿No tienes cuenta? |
| ¿Ya tenés cuenta? | ¿Ya tienes cuenta? |
| Ingresá | Ingresa |
| Hacé click | Haz click |
| Anotá | Anota |

### Regla: usar tuteo (tú), no ustedeo excesivo

El tono de la app es informal-amigable. Usar "tú" y sus conjugaciones normales:
- "Selecciona una butaca" ✅
- "Inicia sesión" ✅
- "Crea tu cuenta" ✅

### Locale y moneda

- Fechas y horas: `Intl.DateTimeFormat('es-CL', ...)`
- Precios: `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })`

---

## Gestor de paquetes

Usar **pnpm** exclusivamente. Nunca usar npm ni yarn.

## Git

El usuario ejecuta todos los comandos de Git. El asistente solo proporciona los comandos exactos con explicación.
