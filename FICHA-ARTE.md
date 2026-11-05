# FICHA DE DIRECCIÓN DE ARTE — Manos Creadoras App

> ⚠️ **ESTA FICHA ESTUVO DESFASADA Y SE CORRIGIÓ EL 2026-10-14.** Describía el
> modo OSCURO de la landing vieja de Lovable (#090706) cuando la app llevaba
> semanas en CREMA. Lo detectó el revisor visual al puntuar el home v2: el
> render no coincidía con su propio contrato. Una ficha que miente es peor que
> no tenerla — es la que se consulta para decidir, y manda rehacer lo que está
> bien.
>
> **El contrato vigente son las 17 pantallas de `home-v2-claude-code/pantallas`**
> (entregadas por Cristian el 2026-10-13), más las 48 del rediseño de la app.

## Referencia del usuario (CONTRATO — protocolo 16)
- ¿Hay referencia del usuario?: SÍ → las pantallas del home v2 y del rediseño de la app, entregadas por Cristian.
- Extracción:
  - Modo: **CLARO** · Fondo: #FBF6EE (crema) · Superficie/card: #FFFDF9 (marfil) · Texto 1º/2º: #2A1F19 (espresso) / #6B5A4C
  - Acento(s): **#8C6A2F** es el ÚNICO dorado válido sobre crema (contraste); #D9B97A (gold-light) solo sobre espresso. Gradiente dorado únicamente DENTRO del botón, donde el fondo ya es oscuro.
  - Display: serif elegante → "Cormorant Garamond" (confirmada, ya en uso) · Body: sans genérico "Inter" (medido) → REEMPLAZADO por "Jost" (ver Prohibiciones abajo)
  - Radio: cards 24px · botones pill (9999px) · Espaciado: aireado (secciones 48px/128px top/bottom) · Sombras: sutil, glow dorado ambiental (`0 20px 60px -20px` acento a 35-45%)
  - Bordes: sí, 1px, dorado a ~35-40% opacidad · Textura: ninguna en el original (plano) → se agrega grano sutil (ver abajo) · Layout: hero + grid + cards
  - Detalle firma a replicar: botón CTA en gradiente dorado + halo suave debajo de las cards

- Prohibiciones anti-IA que la referencia LEVANTA: fondo casi-negro con acento dorado en gradiente — permitido, no es la receta "neón morado/cian" prohibida, es fiel al mundo boutique/joyería.
- Ajuste NO dictado por la referencia (mejora explícita pedida por la dueña — "más premium"): "Inter" es la fuente por defecto de la plantilla original, no una decisión de marca deliberada → se reemplaza por "Jost" (geométrica, más carácter, empareja mejor con el serif). Se agrega grano de papel sutil + sombra dorada más profunda para dar sensación de profundidad (el original era fondo plano).

## Personalidad compilada
- 3 adjetivos: Elegante · Cálida · Aspiracional
- Compilación: spring sutil (overshoot bajo) solo en celebraciones reales · duración base 250-300ms (medida, no apurada) · exclamaciones máx 1/pantalla · celebración nivel medio (brillo/shimmer dorado, nunca confeti) · radio tendencial 20-24px en cards, pill en CTAs

## Brand kit final
- Fondo: #FBF6EE (crema) · Superficie: #FFFDF9 (marfil) · Alterna: #F3E8D7 (arena) · Texto 1º/2º: #2A1F19 (espresso) / #5E4D40 · Apagado: #6B5A4C · Línea: #E5D6BF
- Acento: **#8C6A2F es el ÚNICO dorado válido sobre crema** — los claros (#D9B97A, #F0D9A8) solo sobre espresso, donde contrastan. El gradiente dorado vive DENTRO del botón (`--boton-dorado`), que ya es una superficie oscura. 2ª nota: N/A — un solo acento, suficiente para el 60-30-10
- Semánticos: éxito #4ADE80 · error #F87171 · aviso #F5A524
- Display: "Cormorant Garamond" (pesos 400/500/600, cursiva para énfasis) · Body: "Jost" (pesos 400/500/600) · Escala: display 32-46px / title 18-22px / body 13.5-15px / label 11-12px (tracking 0.15-0.2em en labels, como el original)
- Radio: cards 20-24px · botones pill (CTA) / 12-16px (secundarios/inputs) · Profundidad: sombra dorada ambiental sutil en cards clave (no en todas) + bordes finos 1px dorado 35% · Espaciado base: escala 4·8·12·16·24·32·48·64
- Dispositivo ownable: foto de producto a sangre completa con grano de papel sutil (5% opacidad) + tipografía display grande superpuesta — tratamiento "portada editorial"
- Motion signature: familia `--ease-out` (DESIGN-CORE) para entradas/salidas · stagger 60-80ms · firma: fade + slide sutil sobre las fotos hero, shimmer dorado en celebraciones

## Trazabilidad y vetos
- Protocolo A/B/C: opción elegida **B — Editorial de Revista** (foto a sangre + texto superpuesto + grano) · descartadas: A "Vitrina Boutique" (marco fino tipo joyería, más simétrica/calma) y C "Atelier Íntimo" (collage cálido + hilo dorado dibujado, más cercano/personal) · página comparativa: `direcciones-abc.html` (raíz del proyecto) · screenshot verificado antes de presentar: sí (fuentes cargadas correctamente, 3 diseños distintos, mockups llenos con fotos reales)
- Paleta derivada de: referencia del usuario (landing actual en producción)
- Registro anti-repetición: paleta (crema #FBF6EE + espresso #2A1F19 + dorado #8C6A2F) y par tipográfico (Cormorant Garamond + Jost) quedan vetados para el próximo proyecto de este SO
- Modo (**CLARO**) DERIVADO por: las pantallas que entregó Cristian. ⚠️ Antes decía "oscuro" por la landing vieja de Lovable; la app llevaba semanas en crema y esta ficha no se había actualizado.

## Idioma UI: Español (LATAM) · Fecha de cierre: 2026-07-31 · Corregida: 2026-10-14 (el brand kit decía oscuro) · Aprobada por el usuario: SÍ

---

## Paleta B — "Lavanda empolvada" (EXPERIMENTO, 2026-11)

> ⚠️ **ESTO NO REEMPLAZA NADA DE ARRIBA.** La paleta crema y dorado sigue
> siendo la del sitio y el CONTROL del experimento. Esta es la rama nueva de
> un A/B que decide la flag `paleta_b` en Flagsmith; mientras el experimento
> esté vivo, las dos son contrato y ninguna de las dos se toca sin decidir
> antes cuál gana. Si gana la B, se sube aquí y la de arriba se archiva;
> si gana el control, este bloque se borra.
>
> Elegida por Cristian el 2026-11-05 entre tres opciones comparadas en Claude
> Design (A · Perla rosada · B · Lavanda empolvada · C · Rosa té).
> Referencia: `design-ref/paleta-b-claude-code/` (screenshots = contrato).

### Los colores (contraste medido, todos pasan WCAG AA)

| Rol | Hex | Contraste |
|---|---|---|
| Fondo | `#F7F4FB` | — |
| Tarjeta | `#FDFBFF` | — |
| Sección alterna / toggle | `#ECE5F5` | — |
| Bordes 1px | `#E2D9EE` · fuerte `#CFC3E0` | — |
| Texto principal | `#2E2440` | 13,4:1 |
| Texto secundario | `#625A74` | 6,0:1 |
| Notas | `#696178` | 5,4:1 sobre fondo · 4,8:1 sobre alterna |
| **ACCIÓN** (botón, precio, dato clave) | `#6B4FA0` | 5,9:1 como texto |
| **APOYO** (cursiva del titular y enlaces) | `#A3466F` | — |
| Banda oscura | `#3A2D52` · elevado `#3A2D52` sobre `#2E2440` | — |
| Acento sobre oscuro | `#D9CCEE` | 9,6:1 |

Reparto **60-30-10**: 60% fondo/tarjeta, 30% alterna, 10% el morado de acción.

### Las tres reglas que la separan del control

1. **DOS colores de marca, no uno.** El morado es SOLO la acción (botón,
   precio, "+1.200"); el frambuesa es SOLO la palabra en cursiva de cada
   titular y los enlaces de texto. Nunca al revés, y el frambuesa nunca en un
   botón: si el morado saliera también en el titular, el ojo dejaría de saber
   dónde tocar.
2. **Menos redondez.** Fotos 8px (6px dentro de una tarjeta), tarjetas 12px,
   chips y el +/− del acordeón 6px, tarjeta de precio 16px. Los **botones
   siguen en píldora** (52px de alto en móvil, 56 en escritorio): es lo que
   mantiene la marca reconocible entre las dos versiones.
3. **Plana.** Sin degradados dorados, sin vidrio, sin brillos. Los tokens de
   degradado se escriben como un degradado de un solo color porque van en
   `background-image`.

Tipografía: **igual que el control** — Cormorant Garamond 500 en titulares (una
palabra en cursiva) y Manrope en el texto. Íconos Lucide de línea.

### Las fotos

Los bolsos están fotografiados sobre fondo café y madera, y con el lavanda ese
café se lee "durazno". La rama B usa las versiones **topo** (mismo encuadre,
fondo neutralizado) de `public/images/topo/`, que genera
`scripts/fotos-topo.mjs`. Van tal cual: Nácar Soñado, Navidad, Elizabeth y las
fotos de alumnas.

### Dónde vive

- Tokens: `app/globals.css`, bloque `html[data-paleta="b"]` (remapea los 12 de
  marca; por eso repinta también `/app` sin tocar un componente).
- Home B: `components/home-b/`.
- El interruptor: `lib/flags.ts` + `lib/paleta-servidor.ts`.
- Para verla a mano: `?paleta=b` · volver al control: `?paleta=actual` ·
  devolver el mando al panel: `?paleta=auto`.
