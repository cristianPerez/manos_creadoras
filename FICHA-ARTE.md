# FICHA DE DIRECCIÓN DE ARTE — Manos Creadoras App

## Referencia del usuario (CONTRATO — protocolo 16)
- ¿Hay referencia del usuario?: SÍ → landing actual en producción (https://manoscreadoras.lovable.app), confirmada por la dueña como base ("sigamos con la estética pero más premium").
- Extracción (con `getComputedStyle` sobre el sitio real, no a ojo):
  - Modo: oscuro · Fondo: #090706 · Superficie/card: #120f0c · Texto 1º/2º: #f6f1e7 / #c9beac
  - Acento(s): gradiente #ebcd8c → #d48e00 (botón CTA) + sólido #e1af4a (labels/badges) — aparece en CTA primario, precio, eyebrows y bordes finos
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
- Fondo: #090706 · Superficie: #120f0c · Hundido: #060504 · Elevado: #171310 · Texto 1º/2º: #f6f1e7 / #c9beac
- Acento: gradiente #ebcd8c → #d48e00 (SOLO en: CTA primario, precio, dato clave) · Sólido de apoyo: #e1af4a (labels, íconos, bordes fino) · 2ª nota: N/A — un solo acento dorado, suficiente para el 60-30-10
- Semánticos: éxito #4ADE80 · error #F87171 · aviso #F5A524
- Display: "Cormorant Garamond" (pesos 400/500/600, cursiva para énfasis) · Body: "Jost" (pesos 400/500/600) · Escala: display 32-46px / title 18-22px / body 13.5-15px / label 11-12px (tracking 0.15-0.2em en labels, como el original)
- Radio: cards 20-24px · botones pill (CTA) / 12-16px (secundarios/inputs) · Profundidad: sombra dorada ambiental sutil en cards clave (no en todas) + bordes finos 1px dorado 35% · Espaciado base: escala 4·8·12·16·24·32·48·64
- Dispositivo ownable: foto de producto a sangre completa con grano de papel sutil (5% opacidad) + tipografía display grande superpuesta — tratamiento "portada editorial"
- Motion signature: familia `--ease-out` (DESIGN-CORE) para entradas/salidas · stagger 60-80ms · firma: fade + slide sutil sobre las fotos hero, shimmer dorado en celebraciones

## Trazabilidad y vetos
- Protocolo A/B/C: opción elegida **B — Editorial de Revista** (foto a sangre + texto superpuesto + grano) · descartadas: A "Vitrina Boutique" (marco fino tipo joyería, más simétrica/calma) y C "Atelier Íntimo" (collage cálido + hilo dorado dibujado, más cercano/personal) · página comparativa: `direcciones-abc.html` (raíz del proyecto) · screenshot verificado antes de presentar: sí (fuentes cargadas correctamente, 3 diseños distintos, mockups llenos con fotos reales)
- Paleta derivada de: referencia del usuario (landing actual en producción)
- Registro anti-repetición: paleta (casi-negro cálido #090706 + dorado #ebcd8c-#d48e00) y par tipográfico (Cormorant Garamond + Jost) quedan vetados para el próximo proyecto de este SO
- Modo (oscuro) DERIVADO por: la referencia del usuario (landing ya en producción, ya vende con este modo) — no asumido

## Idioma UI: Español (LATAM) · Fecha de cierre: 2026-07-31 · Aprobada por el usuario: SÍ (eligió Opción B)
