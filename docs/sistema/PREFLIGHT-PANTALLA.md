# PREFLIGHT — releer INMEDIATAMENTE ANTES de construir CADA pantalla

> ~30 líneas. Es lo único que debe estar fresco en memoria al codear. La doctrina completa vive en
> DESIGN-CORE (leído al inicio de sesión); esto es la tarjeta de cabina que se relee SIEMPRE.

**0. FICHA-ARTE.md abierta.** Todos los valores salen de ahí. ¿Hay referencia del usuario? → es CONTRATO (16).
¿Primera pantalla de este tipo en el proyecto? → mira el ejemplo compilable del 53 (copia COMPOSICIÓN, no valores).

**1. SPEC ANTES DE CÓDIGO** — emite este bloque y RECIÉN después escribe JSX:
```yaml
pantalla: __            # una misión, un objeto principal dominante
objeto_principal: __    # qué domina visualmente
niveles: {display: __, title: __, body: __, label: __}   # máx 3 tamaños visibles
acento_en: __           # SOLO la acción/dato clave (60-30-10)
baseline_aplican: []    # de las 7: stagger, conteo héroe, anillo/barras, tap, tabs, modal, celebración
dispositivo_ownable: __ # el de la ficha, visible en esta pantalla
estados: [empty, loading, success, error, disabled, offline]  # TODOS existen
```

**2. Números no negociables:** min-h-dvh + nav al fondo · 375px sin scroll horizontal · touch ≥44px ·
texto ≥14px · escala espaciado 4·8·12·16·24·32·48·64 (nada intermedio) · radio idéntico en toda la
pantalla · tap 80-150ms, transiciones 200-400ms, nada linear · contraste ≥4.5:1.

**3. Prohibido:** hex fuera de tokens · `transition: all` · Inter/Roboto/system-ui de marca ·
`min-h-full` · fondo de un solo fill plano (3 niveles: base/elevado/hundido) · spinner genérico
(skeleton) · vacío muerto (pantalla LLENA de valor, no input+2 botones) · elemento tapable sin acción.

**4. Cierre = evidencia:** screenshot REAL a 375px con DATOS SEMILLA (32 — nunca pantalla vacía) → subagente `revisor-visual` (él puntúa /40 y /20,
tú NO te autoevalúas) → si hay referencia: test de fidelidad → gate ≥36/40 Y ≥16/20 → reporte con
ruta del screenshot + puntajes + ESTADO.md actualizado. Sin screenshot no hay "lista".
