# Prompt: nueva paleta + nuevo home de Manos Creadoras

> Adjunta junto a este prompt las 7 imágenes de esta carpeta (01 a 07).

---

Eres un desarrollador frontend senior. Vas a rediseñar el proyecto **Manos Creadoras** (landing para vender una membresía de cursos de bolsos de lujo en cuentas, React + Tailwind). Tienes dos tareas:

1. **Reemplazar la paleta completa del proyecto** por la nueva paleta de marca (abajo), usando tokens. No dejes colores sueltos (hex o clases de Tailwind como `amber-700`, `stone-900`) en los componentes.
2. **Rehacer el home (`/`)** para que sea igual a las imágenes de referencia adjuntas, sección por sección.

Las imágenes mandan sobre el texto si hay dudas de espaciado, tamaños o jerarquía.

## Imágenes de referencia

- `01-home-escritorio-completo.png`: el home completo a 1440 px.
- `02-planes-escritorio-anual.png`: la sección de planes en escritorio con "Anual" activo (estado por defecto).
- `03-planes-escritorio-mensual.png`: la misma sección con "Mensual" activo.
- `04-home-movil-completo.png`: el home completo a 390 px.
- `05-planes-movil-creadora-anual.png`: los planes en móvil, estado por defecto.
- `06-planes-movil-maestra-mensual.png`: los planes en móvil con Mensual y Maestra seleccionados.
- `07-guia-de-marca.png`: la guía de marca con la paleta, la tipografía y los componentes.

Las áreas oscuras con puntos dorados son **marcadores de imagen**. Ponles las fotos reales que ya tiene el proyecto en `src/assets`: Pink Crystal en el hero, los 8 bolsos de la galería y la foto de Elizabeth en la sección de la mentora. Usa `object-fit: cover` y el mismo radio de borde de los marcadores.

## 1. Paleta (tokens)

Define estos tokens en `src/index.css` como variables HSL y conéctalos en `tailwind.config.ts`. Mapea también los tokens de shadcn (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--muted`, `--accent`, `--ring`) para que los componentes existentes hereden la paleta.

| Token | Hex | HSL | Uso |
|---|---|---|---|
| `--cream` | #FBF6EE | 37 62% 96% | Fondo principal (`--background`) |
| `--sand` | #F3E8D7 | 36 54% 90% | Secciones alternas, fondo del toggle |
| `--ivory` | #FFFDF9 | 40 100% 99% | Tarjetas (`--card`) |
| `--line` | #E5D6BF | 36 42% 82% | Bordes y divisores (`--border`) |
| `--gold-light` | #D9B97A | 40 56% 66% | Acentos y badges **solo sobre fondo oscuro** |
| `--gold-pale` | #F0D9A8 | 41 71% 80% | Precio dentro de la tarjeta oscura |
| `--gold` | #8C6A2F | 38 50% 37% | Texto de acento sobre crema, eyebrows, checks (`--primary`) |
| `--gold-deep` | #83602A | 36 51% 34% | Final del degradado del botón principal |
| `--cacao` | #6E4B2C | 28 43% 30% | Inicio del degradado de la tarjeta destacada |
| `--espresso` | #2A1F19 | 21 25% 13% | Texto principal, secciones y botones oscuros (`--foreground`) |
| `--ink-body` | #5E4D40 | 26 19% 31% | Párrafos |
| `--ink-muted` | #6B5A4C | 27 17% 36% | Notas y textos secundarios (`--muted-foreground`) |

Reglas de contraste:
- Texto dorado sobre crema: siempre `--gold` (#8C6A2F), nunca `--gold-light`.
- Botón principal: degradado de `#9C7638` a `--gold-deep`, con texto blanco.
- Tarjeta destacada: `linear-gradient(160deg, var(--cacao), #3B2A20 72%)`.

## 2. Tipografía

- Títulos, precios y cifras: **Cormorant Garamond** (peso 500 normal, 400 en cursiva). La palabra clave del título va en cursiva y en `--gold`.
- Cuerpo, botones y etiquetas: **Manrope** (400, 600 y 700).
- Eyebrows: Manrope 600, 12 px, mayúsculas, `letter-spacing: .18em`, color `--gold`.
- Títulos de sección: `clamp(36px, 4vw, 54px)`, interlineado de 1.05.
- H1 del hero: `clamp(46px, 5.6vw, 82px)`, interlineado de 0.98.
- Radios: 20–30 px en tarjetas y botones en píldora (`999px`). Botones de al menos 56 px de alto.

## 3. Estructura del home (en orden)

1. **Barra superior** (espresso): "Nuevo curso cada mes · Con el plan anual pagas **3 meses gratis**".
2. **Header**: logo con una "M" en cursiva dorada dentro de un círculo espresso, más "Manos Creadoras". Enlaces: Cómo funciona, Cada mes, Planes, Mentora, Preguntas. Botón oscuro "Unirme a la membresía" que lleva a `#planes`.
3. **Hero** en dos columnas:
   - H1: "Cada mes, un bolso de *lujo* nuevo en tus manos."
   - Un párrafo, el botón "Tomar el curso gratis" y el botón secundario "Cómo funciona".
   - Tres cifras: +1.200 creadoras, 4,9 / 5, US$ 9,74 al mes en el plan anual.
   - A la derecha va la foto del bolso con una tarjeta flotante: "Curso de este mes · Pearl Bow".
4. **Cómo funciona** (fondo arena): 3 pasos numerados 01, 02 y 03 en tarjetas marfil.
5. **Lo que incluye**: grid tipo bento. Una tarjeta oscura ancha para "+50 tutoriales en video HD", tarjetas para los patrones y el directorio, y una tarjeta ancha arena para la comunidad. En móvil, las tarjetas anchas pasan a una sola columna.
6. **La colección crece cada mes** (fondo espresso): grid de los 8 bolsos con una etiqueta en píldora: "Este mes" (Pearl Bow), "Mes anterior" (Pearl Hobo) y "Biblioteca" (el resto).
7. **Planes** (ver la sección 4).
8. **Mentora** (fondo arena): foto de Elizabeth Valencia, su bio y 3 cifras (+5 años, +1.200 alumnas, 4,9).
9. **FAQ** en acordeón, con una sola pregunta abierta a la vez y la primera abierta al cargar. Incluye: "¿Qué incluye cada plan?" y "¿Puedo cancelar cuando quiera?" (esta lleva un texto pendiente de confirmar).
10. **CTA final** en una tarjeta espresso: "Tu primer bolso empieza *este mes*." con el botón dorado "Unirme ahora".
11. **Footer**.

## 4. Planes (lo más importante)

El estado `billing` puede ser `'annual' | 'monthly'` y **por defecto es `'annual'`**. Todos los precios se muestran **por mes**.

| Plan | Anual (por mes) | Nota anual | Mensual | Nota mensual |
|---|---|---|---|---|
| Aprendiz | Gratis | "Para siempre" | Gratis | "Para siempre" |
| **Creadora** (destacado, "La más elegida") | US$9,74 | "Se cobra US$116,91 una vez al año" | US$12,99 | "Se cobra cada mes" |
| Maestra | US$18,74 | "Se cobra US$224,91 una vez al año" | US$24,99 | "Se cobra cada mes" |

Beneficios de cada plan:
- **Aprendiz**: 1 curso completo: [NOMBRE DEL CURSO GRATIS] · Su patrón descargable y lista de materiales · Sin tarjeta, a tu ritmo. Botón: "Tomar el curso gratis".
- **Creadora**: Un curso nuevo cada mes · +50 tutoriales en video HD · 50 patrones y plantillas descargables · Directorio de proveedores · Comunidad privada. Botón dorado: "Suscribirme".
- **Maestra**: Todo lo de Creadora · Mentoría mensual con Elizabeth · Feedback personal de tus piezas · Bonos: guía de precios y fotografía para vender. Botón con contorno: "Suscribirme".

Pon los precios y los enlaces de Hotmart en un solo archivo de configuración (`src/config/plans.ts`), con un enlace por plan y por frecuencia.

**Escritorio** (imágenes 02 y 03):
- Toggle en píldora sobre fondo arena. El activo va en espresso. El botón "Anual" lleva el badge "Ahorra 25%" en `--gold-light`.
- Debajo van las 3 tarjetas en grid; la del centro es la oscura destacada.
- Al final, la nota "Pago seguro en Hotmart · Garantía de 7 días".

**Móvil** (imágenes 05 y 06): no repitas los tabs en píldora oscura.
- Facturación: un switch pequeño "Mensual ◯ Anual −25%". El lado activo va en espresso y el inactivo en gris cálido.
- Selector de plan: 3 mini tarjetas marfil en fila, cada una con el nombre y el precio por mes. La seleccionada lleva un borde de 2 px en `--gold`.
- **Por defecto está seleccionada Creadora.** Solo se muestra la tarjeta completa del plan seleccionado.
- Usa elementos accesibles: `role="switch"` con `aria-checked` para la facturación, y `role="radiogroup"` / `role="radio"` para los planes. El área táctil mínima es de 44 px.

## 5. Criterios de aceptación

- [ ] No queda ningún color fuera de los tokens (busca `#`, `amber-`, `stone-`, `yellow-` y `brown`).
- [ ] El home se ve como en las imágenes 01 y 04 a 1440 px y a 390 px, sin scroll horizontal.
- [ ] Planes: Anual por defecto, precios por mes, y la nota de cobro cambia con el toggle.
- [ ] En móvil, Creadora está seleccionada por defecto y se ve una sola tarjeta.
- [ ] Las fuentes cargan desde Google Fonts y tienen fallback (Georgia / system sans).
- [ ] El texto tiene un contraste mínimo de 4.5:1 y el foco es visible en los botones.
