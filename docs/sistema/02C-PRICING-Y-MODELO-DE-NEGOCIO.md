# PRICING Y MODELO DE NEGOCIO — Dónde, Cuándo y Cuánto Cobrar

> **Cuándo cargar este archivo:**
> - En la fase de validación (junto con `02-VALIDACION.md`) al decidir el modelo de negocio
> - SIEMPRE antes de diseñar el onboarding o el paywall: la decisión de modelo/precio se toma ANTES de diseñar ese funnel (`02B-ONBOARDING-Y-PAYWALL.md`)
> - Al definir planes, precios, créditos, trial o la sección de oferta de la landing
>
> **Por qué existe:** la pregunta más importante de cualquier app de suscripción es dónde y cuándo cobrar. La respuesta tiene datos reales en 2026 y no es intuitiva. Este archivo recoge lo que hacen Duolingo, Cal AI ($35M → adquirida por MyFitnessPal), Noom, Revolut y las apps top — y traduce esos patrones al contexto de una web app vendida por Hotmart: el orden de diseño, los 3 modelos validados, la estrategia de pricing (anclaje, señuelo, créditos, trial por nicho), la matriz A-F por tipo de app, el puente de checkout y las métricas del funnel.
>
> **Con qué se combina:**
> - `02B-ONBOARDING-Y-PAYWALL.md` — el FUNNEL que ejecuta este modelo (los 5 trabajos del onboarding, la anatomía del paywall, la capa de persuasión)
> - `19-PAGINA-DE-VENTAS.md` + `55-DISENO-DE-LANDING.md` (§6) — la sección de OFERTA de la landing (donde vive el pricing de 3 columnas)
> - `40-UNIT-ECONOMICS.md` — validar el NÚMERO (COGS, margen, "regla de 30", LTV con churn realista)
> - `18-VENTA-HOTMART.md` — la configuración del cobro real (producto, trial, webhook)

---

## EL ORDEN DE DISEÑO — el error #1 es diseñar el precio antes que la experiencia

El error más común al monetizar es empezar por el final: elegir el paywall o el precio ANTES de saber qué hábito tiene el usuario. El paywall y el pricing "correctos" no existen en abstracto — existen **para un tipo de app, una frecuencia de uso y un valor percibido concretos**. El paywall de Duolingo no sirve para una app de IA creativa, y el de Cal AI no sirve para una app de finanzas.

> **Regla de construccion:** despues de definir esta estrategia, el agente debe construir o maquetar
> onboarding y paywall ANTES de la app interna. Si el primer codigo de producto es un dashboard,
> se salto la monetizacion real. Ver `SECUENCIA-MAESTRA-CONSTRUCCION.md`.

Por eso el SO impone un ORDEN. No se diseña el siguiente eslabón sin haber fijado el anterior:

```
1. TIPO DE APP        → ¿bienestar, educación, fitness, IA creativa, productividad o finanzas? (matriz A-F)
2. PROMESA            → la transformación en una frase (Constitución del Producto, 01)
3. FRECUENCIA DE USO  → ¿diaria, semanal, puntual? Decide si necesitas HÁBITO (freemium/gamificación, 24)
                        o RESULTADO inmediato (hard paywall / preview→paywall)
4. PRIMERA VICTORIA   → el "momento aha" que el usuario debe vivir ANTES de que le pidas pagar (01, 32)
5. PAYWALL            → su forma y su momento se DERIVAN de lo anterior (el momento/modelo aquí;
                        su diseño y narrativa en 02B-ONBOARDING-Y-PAYWALL.md)
6. PRICING            → value-based, anclado al WTP medido (02) y al margen (40), no al costo de IA
7. RETENCIÓN          → el loop que sostiene la suscripción mes a mes (24, 35)
```

> **La pregunta que ordena todo (responder en la Sesión 1, guardar en ESTADO.md):**
> *¿Esta app resuelve algo DIARIO, SEMANAL o PUNTUAL? ¿El usuario necesita un HÁBITO o un RESULTADO inmediato? ¿El valor está en crear, aprender, ahorrar tiempo, verse/sentirse mejor o ganar dinero?*
> La respuesta decide el modelo de monetización (freemium para hábito vs hard paywall / preview→paywall para resultado), la longitud del onboarding y el loop de retención. Optimizar adquisición (más tráfico/ads) ANTES de tener activación es pagar por perder usuarios.

**Por qué importa, dicho sin rodeos:** el usuario no paga por "una app con IA". Paga cuando la app le demuestra rápido tres cosas — *esto me entiende, esto me ahorra tiempo, esto me da el resultado que quiero*. Primero se diseña esa demostración (la primera victoria); el paywall es solo su consecuencia natural.

---

## LA RESPUESTA A LA PREGUNTA CLAVE

### ¿Cobrar en la landing page o hacer onboarding primero?

La respuesta depende del contexto, pero el dato es claro:

Las apps que combinan un onboarding estructurado con un paywall de prueba gratuita alcanzan 1.78% de conversión install-to-paid — la configuración de mayor rendimiento en todas las categorías de apps de suscripción según el State of In-App Subscriptions 2026.

Los paywalls "duros" (cobro inmediato) convierten 5x mejor que el freemium: 10.7% vs 2.1% al día 35. Pero la ventaja desaparece a largo plazo: la retención al año es prácticamente idéntica (28% freemium vs 27% hard paywall).

> **Actualización con datos mas recientes (RevenueCat, State of Subscription Apps 2025):** hard
> paywall vs freemium/soft — 12.1% vs 2.2% de conversion mediana descarga-a-pago, y hasta ~8x mas
> ingreso a 14 dias — consistente con el patron de arriba (la cifra exacta varia por metodologia y
> ano del reporte; la CONCLUSION no cambia: paywall duro convierte mas rapido, onboarding+paywall
> gana en LTV y retencion). Dato adicional: ~50% de los trials empiezan durante el onboarding, y la
> conversion del Dia 0 suele superar 80% — llegar rapido al "aha" y recien ahi mostrar el paywall.

**La conclusión real:** ni pagar de entrada ni freemium puro. **El modelo ganador es:**

```
Usuario llega → Onboarding personalizado (micro-compromisos) →
Resultado/plan generado PARA ÉL → Paywall → Pago
```

El paywall no aparece al inicio ni al final — aparece en el momento de máxima inversión emocional del usuario.

---

## LOS 3 MODELOS VALIDADOS (con datos 2026)

> ⚠️ **Esta decisión la toma la IA, no el usuario** (CLAUDE.md → DECIDE-INFORMA-AVANZA): la matriz
> A-F + el tie-breaker determinan el modelo con data validada. Preguntarle al usuario "¿hard
> paywall u onboarding-first?" es trasladarle una decisión técnica que no puede tomar. Se decide,
> se anota en ESTADO.md con la evidencia ("Modelo 2A porque nicho F + freemium"), se informa en
> 1 línea simple y se avanza.

### Modelo 1 — Hard Paywall inmediato (landing → pago → app)
```
CUÁNDO USARLO: apps B2B, herramientas de productividad, nicho técnico
VENTAJA: cash inmediato, datos de conversión rápidos, sin "turistas"
DESVENTAJA: elimina usuarios que necesitaban ver el valor antes de pagar
CONVERSIÓN: 10.7% de los que llegan al paywall (vs 2.1% freemium)
```
*Este es el modelo de Hotmart por defecto: la landing vende, el usuario paga, luego accede.*

### Modelo 2 — Onboarding + Paywall de prueba (el más poderoso para consumidores)
```
CUÁNDO USARLO: apps B2C, wellness, productividad personal, fitness, finanzas
VENTAJA: conversión brutal cuando el onboarding construye compromiso real
DESVENTAJA: más complejo de implementar, requiere un onboarding excepcional
CONVERSIÓN: hasta +234% vs un paywall sin onboarding previo
DATO CLAVE: 82% de los que inician una prueba lo hacen en el día 0 —
  si no los enganchas en la primera sesión, ya los perdiste
```
*Este es el modelo de Duolingo, Cal AI, Noom, Calm, Headspace.*

### Modelo 3 — Freemium → Upgrade (el modelo más común, pero el menos eficiente)
```
CUÁNDO USARLO: apps de colaboración donde el viral loop depende del crecimiento
VENTAJA: base de usuarios grande, crece por boca a boca
DESVENTAJA: la mayoría nunca paga (2.1% conversión), soporte costoso
CONVERSIÓN: 2.1% (la peor de las tres opciones en revenue por install)
```
*Este es el modelo de Notion, Slack, Figma.*

---

## EL MODELO RECOMENDADO PARA ESTE SO

Para web apps vendidas por Hotmart en LATAM, el modelo óptimo combina lo mejor de los tres:

```
PASO 1 — LANDING: vender el RESULTADO (no la app). CTA → "Empieza tu prueba gratis"
  (o "Accede ahora" si es hard paywall). Ver 19-PAGINA-DE-VENTAS.md.

PASO 2 — ONBOARDING (DENTRO DE LA APP, antes del pago si el modelo permite preview):
  El onboarding no es un tour — es la construcción de SU resultado personalizado.
  Puede correr sin cuenta usando estado local si el objetivo es mostrar valor primero,
  o con registro gratis si el progreso debe persistir antes de pagar.

PASO 3 — PAYWALL (si hay free tier) o ACTIVACIÓN (si ya pagó):
  Si pagó: el onboarding lleva directo a su primera victoria (momento aha).
  Si hay free tier: el paywall aparece después del onboarding, cuando ya
  invirtió tiempo y vio el resultado.

PASO 4 — PRIMER VALOR INMEDIATO:
  Dentro de los primeros 60 segundos, el usuario debe sentir que la app
  ya le está ayudando. Sin esto, la retención colapsa.
```

**Decisión estratégica inicial que el agente debe hacer con el usuario:**
> "¿Tu app tiene una propuesta de valor que se puede demostrar ANTES de pagar (y tiene sentido ofrecer un free tier), o el valor está claro desde la landing y conviene cobrar directo?"

> **Implicación técnica (no la pases por alto):** onboarding-first NO significa siempre "registro primero".
> Hay dos variantes:
> - **Preview anonimo -> paywall -> login/auth**: default para este SO cuando se quiere demostrar valor
>   antes de pedir cuenta. Guardas temporalmente en navegador y pides login para conservar/desbloquear.
> - **Registro gratis -> onboarding -> paywall**: usar solo si el progreso debe persistir antes del pago
>   o si la app necesita cuenta para entregar el primer valor.
>
> Si eliges la variante con registro gratis, la compra de Hotmart debe **SUBIR** esa cuenta a Pro
> (no crear una nueva). Ese bug típico —el email del registro no coincide con el de compra— está
> documentado en `18-VENTA-HOTMART.md` → "Los dos modelos de creación de usuario".

---

## LA ESTRATEGIA DE PRICING EN EL PAYWALL

El pricing anual presentado junto al mensual hace que el plan anual se sienta como una ganga. Los precios que terminan en .99 pueden subir la conversión 3-7%, especialmente en LATAM y Asia.

```
ESTRUCTURA DE PRICING RECOMENDADA (regla de oro: el ANUAL siempre se muestra como precio MENSUAL):
- Plan mensual: $X/mes (el ancla — el "caro").
- Plan anual: mostrarlo como "$Y/mes" (facturado anualmente), NUNCA el total anual en grande.
  → Así el anual se ve MÁS BARATO que el mensual de un vistazo — esa comparación es la que vende.
  → El total anual va solo en letra chica (transparencia/cumplimiento): "$Y/mes · se cobra $Z/año".
  → Pre-seleccionado por defecto + badge "Más popular / Mejor valor" → +15-20% eligen anual (Mojo).
  → Mostrar el ahorro como "2 MESES GRATIS" (≈17%) — convierte mejor que un "%". Descuento óptimo 15-20%.

DATO LATAM (CLAVE para Hotmart): mostrar el anual como mensual dio +60% de ARPU y, EN BRASIL,
  +45% de ingreso por impresión de paywall (Mojo/RevenueCat) — "particularmente efectivo en mercados
  de menor ingreso". Es de las palancas más rentables para una app vendida por Hotmart en LATAM.

PARA LATAM:
- Precios en número redondo o .99 (ej: $19.99 en vez de $20)
- Descomponer el precio por día/semana ("menos de $1 al día") reduce el sticker shock
- La garantía de devolución es más importante aquí que en mercados anglosajones
```

Las apps de precio alto convierten 2x mejor que las de precio bajo: mediana de 2.8% vs 1.4%. Cobrar más no reduce necesariamente la conversión — puede aumentarla si comunica más valor.

### Modelo de CRÉDITOS / uso (clave en apps de IA con costo variable alto)

Cuando cada acción cuesta dinero real (imagen, audio, video, generaciones largas), la suscripción "plana ilimitada" puede destruir el margen — un usuario intensivo se come la ganancia de diez. Ahí el modelo correcto es **suscripción + cuota de créditos por plan**, con compra de créditos extra. Esto NO sustituye al fair-use interno de `30` (control de costo en el servidor) — es su cara visible: convierte el límite en un eje de pricing en vez de en un freno invisible.

```
CUÁNDO USAR CRÉDITOS:
- La app usa IA cara por acción (imagen/audio/video, o texto muy largo).
- Hay usuarios intensivos que justifican un tier superior.
- Quieres evitar abuso sin poner un "ilimitado" que mienta.

ESTRUCTURA TIPO (ajustar números al COGS real de 30/40):
- Starter:  ~30 generaciones/mes   → para probar y enganchar.
- Pro:      ~150 generaciones/mes  → el plan recomendado (cubre al usuario frecuente).
- Max:      ~500 generaciones/mes + prioridad/cola rápida → para el usuario intensivo.
- Créditos extra: "compra 100 generaciones adicionales" (ingreso incremental sin cambiar de plan).
```

> **REGLA DE ORO — vende RESULTADOS, no la unidad técnica.** El usuario promedio no compra "tokens" ni "500.000 tokens"; compra resultados. Empaqueta y nombra la cuota en la unidad que el usuario entiende:
> - ❌ "Incluye 500.000 tokens" · "2.000 créditos de cómputo"
> - ✅ "Incluye 100 guiones al mes" · "30 videos generados" · "50 análisis de contenido"
>
> Internamente puedes medir en tokens/créditos de proveedor (ElevenLabs, etc. — ver `30`), pero la UI y el paywall hablan en resultados. Mostrar también el contador como resultado ("Te quedan 42 guiones este mes"), nunca como saldo técnico. La economía de cada tier de créditos se valida contra el COGS y la "regla de 30" (IA < 20% del precio) en `40-UNIT-ECONOMICS.md`.

> **Free tier en apps de IA cara:** no regales generaciones ilimitadas. El patrón que protege margen Y crea deseo: **1 resultado o preview gratis** → paywall para completar/exportar/generar más. Ver el nicho "IA creativa" abajo.

#### CÓMO SE RENUEVAN LOS CRÉDITOS (sin esto, la cuota es de un solo mes)

```
PLAN PAGO → los créditos se renuevan con CADA evento de cobro aprobado del webhook (18):
  el PURCHASE_APPROVED de la recurrencia resetea la cuota al cupo del plan
  (set credits = cupo_del_plan, NO credits + cupo — los no usados no se acumulan,
  salvo que el plan lo prometa). Los créditos EXTRA comprados aparte sí se SUMAN.

PLAN FREE → no hay webhook que dispare nada: columna `period_start` en `user_quota`
  y RESET PEREZOSO al primer uso del nuevo período (sin cron):
  dentro de la MISMA RPC atómica de 25 (create_generation), ANTES de descontar:
    if now() - period_start > interval '30 days'
      → credits = cupo_free, period_start = now()
  Un free que no vuelve nunca dispara nada — exactamente lo correcto.

LA UI lee de ahí: "Te quedan X [resultados] este mes" = user_quota.credits, y la fecha
  de renovación = period_start + 30 días (free) o la fecha del próximo cobro (pago).
```

### EL EFECTO SEÑUELO en 3 planes (cuando hay 3 tiers, el del medio se DISEÑA para hacer obvio el recomendado)

El anti-patrón "varios planes con diferencias confusas" (ver la anatomía del paywall en `02B-ONBOARDING-Y-PAYWALL.md`) NO prohíbe 3 planes — prohíbe 3 planes *incomparables*. El señuelo (decoy effect, Ariely: el caso The Economist) es lo contrario de la confusión: **una sola dimensión de comparación, tan clara que la decisión se toma en 3 segundos**. El plan del medio existe para que el recomendado se vea como ganga evidente.

```
RECETA DEL SEÑUELO (dimensionarlo, no improvisarlo):
1. UNA dimensión comparable entre los 3 planes (generaciones/mes, guiones, análisis) — la unidad
   de RESULTADO del plan de créditos de arriba. Si los planes difieren en 4 dimensiones a la vez,
   no hay señuelo: hay confusión (el anti-patrón).
2. PRECIO del señuelo: 80-90% del precio del plan recomendado (incómodamente cerca).
3. VALOR del señuelo: ≤40-50% del valor del recomendado en esa dimensión.
   → Resultado: "por $5 más, el triple" — el recomendado se vuelve la única opción racional.
4. El señuelo NUNCA lleva badge ni pre-selección (eso es del recomendado) y es un plan REAL
   y comprable (un plan ficticio solo-para-anclar es dark pattern — ver 50 → C5).

EJEMPLO NUMÉRICO (app de IA creativa, unidad = guiones/mes):
  Starter   $9.99/mes  →  30 guiones                      (entrada honesta, para probar)
  Pro       $24.99/mes → 100 guiones                      ← SEÑUELO (90% del precio, 1/3 del valor)
  Max       $27.99/mes → 300 guiones + cola prioritaria   ← RECOMENDADO (badge + pre-seleccionado)
  Lectura del usuario en 3 segundos: "Pro casi cuesta lo mismo que Max y da 3× menos" → Max obvio.

DÓNDE VIVE: en el pricing de la LANDING con 3 columnas (layout exacto en 55-DISENO-DE-LANDING.md).
En el PAYWALL in-app a 375px se mantienen 2-3 cards máximo (50 → C1): si son 3, la del medio es
el señuelo; si el nicho no da para 3 tiers, quedarse con mensual-ancla vs anual-recomendado
(el anclaje simple de arriba) — nunca inventar un tercer plan sin caso de uso real.
```

### Lifetime deals — usar con pinzas

Un pago único "de por vida" puede servir para **validación temprana** (caja rápida, primeros testimonios), pero destruye el ingreso recurrente si das demasiado acceso para siempre: el costo de servir (IA, infra) sigue corriendo mes a mes contra un ingreso que ya cobraste una vez. Si se usa: limitarlo en el tiempo o en cupo, y nunca como modelo principal de una app con COGS de IA continuo. La suscripción recurrente es el modelo por defecto del SO (ver `40`).

---

## ESTRATEGIA SEGÚN EL TIPO DE APP (decidir antes de diseñar)

El tipo de app es el factor que MÁS mueve la conversión. No hay un onboarding ni un paywall "mejor" en abstracto — hay uno correcto para cada hábito y valor percibido. Abajo, los 7 nichos con su estrategia completa (primera victoria → onboarding → paywall → monetización → retención). Elegir el del proyecto y fijar todo ANTES de diseñar.

### A) EDUCACIÓN / APRENDIZAJE (idiomas, cursos, skills) — referencia: Duolingo
```
OBJETIVO:        crear HÁBITO y progreso visible (el valor se acumula con el uso diario).
PRIMERA VICTORIA: completar la primera lección/ejercicio real (no leer una explicación).
ONBOARDING:      ~7 preguntas rápidas (meta + nivel) + un ejercicio real ANTES de pedir registro.
PAYWALL:         después de la primera victoria. "Ya completaste tu primera práctica. Continúa sin
                 límites, con ejercicios personalizados y seguimiento avanzado."
MONETIZACIÓN:    FREEMIUM útil + premium (quitar fricción, acelerar progreso, desbloquear funciones).
                 Freemium tiene sentido aquí porque necesitas volumen y hábito, y el uso mejora el producto.
RETENCIÓN:       rachas, niveles, metas diarias, recordatorios (loop "Educación/idiomas" de 24).
NO HACER:        cobrar antes de que entienda CÓMO aprende · clases largas al inicio · esconder
                 demasiado tras el pago si necesitas hábito · rankings que distraigan del aprendizaje.
```

### B) BIENESTAR / MEDITACIÓN / SALUD MENTAL — referencias: Headspace, Calm
```
OBJETIVO:        confianza, calma y continuidad (relación de largo plazo, sin presión).
PRIMERA VICTORIA: una primera sesión corta (respirar, dormir, enfocarse) que el usuario SIENTE.
ONBOARDING:      suave y emocional. Preguntar el objetivo emocional (dormir mejor, reducir estrés,
                 enfocarse) con lenguaje tranquilo. 15-25 micro-pantallas que terminan en "tu plan listo".
PAYWALL:         tras la mini-experiencia. "Tu plan de calma está listo. Empieza con sesiones guiadas
                 para dormir mejor y reducir estrés." Vender continuidad, no urgencia agresiva.
MONETIZACIÓN:    TRIAL gratis (5-9 días, óptimo) + anual destacado. Onboarding LARGO + trial CORTO.
RETENCIÓN:       rutina emocional diaria (dormir, meditar, respirar) — el loop, no la presión.
NO HACER:        copy agresivo "última oportunidad" · saturar de descuentos · hacer sentir culpa ·
                 prometer resultados exagerados.
```

### C) FITNESS / NUTRICIÓN / TRACKING — referencias: Cal AI, MyFitnessPal, Strava
```
OBJETIVO:        reducir fricción brutalmente y mostrar progreso (Cal AI: foto → estimación en segundos).
PRIMERA VICTORIA: el primer registro/análisis hecho (foto de comida, primer tracking).
ONBOARDING:      rápido + personalizado. Pedir lo mínimo, dar una acción inmediata antes del primer registro.
                 15-25 micro-pantallas + plan animado (Cal AI: 61 experimentos de paywall → 57% trial→pago).
PAYWALL:         tras el primer análisis. "Ya analizamos tu primer registro. Desbloquea seguimiento
                 inteligente, historial y recomendaciones personalizadas."
MONETIZACIÓN:    TRIAL (5-9 días) + anual; CRÉDITOS si la IA por acción es cara. Email recordatorio Día 5-6.
RETENCIÓN:       check-ins diarios/semanales, progreso, racha (loop "Fitness/nutrición" de 24).
NO HACER:        vender desde la INSEGURIDAD corporal · usar vergüenza/culpa/comparación física ·
                 prometer resultados irreales · onboarding largo ANTES del primer registro · hablar
                 solo de números (hablar de control, claridad, constancia).
```

### D) IA CREATIVA / CONTENIDO / VIDEO / DISEÑO — el nicho central de muchas apps de este SO
```
OBJETIVO:        resultado inmediato y "wow moment". El usuario no quiere aprender la herramienta —
                 quiere PRODUCIR algo ya.
PRIMERA VICTORIA: el primer resultado generado (una preview usable en <2 minutos).
ONBOARDING:      ULTRA corto. "¿Qué quieres crear?" → caso de uso → preview rápida. Plantillas por caso
                 (anuncio, guion, carrusel, video, avatar, landing). El usuario NO escribe prompts desde cero.
PAYWALL:         después de la PREVIEW. "Tu primer guion está listo. Desbloquea la versión completa,
                 edítala y genera variaciones listas para publicar."
MONETIZACIÓN:    1 preview/generación gratis → paywall para completar/exportar/generar más.
                 SUSCRIPCIÓN + CRÉDITOS (la IA por acción es cara — ver sección de créditos arriba y 30/40).
                 Cobrar por: exportar, generar más, calidad premium, guardar proyectos, plantillas premium.
RETENCIÓN:       calendario y producción, NO "entra a jugar". "Hoy toca crear tu guion del día" ·
                 "Te faltan 2 piezas para completar tu semana" · "Tu calendario está al 70%"
                 (loop "Creación de contenido" de 24).
NO HACER:        mostrar 40 herramientas en la primera pantalla · hablar de modelos/tokens/parámetros ·
                 hacer escribir prompts desde cero · regalar IA ilimitada si el costo es alto.
```

### E) PRODUCTIVIDAD / ORGANIZACIÓN / NOTAS / CALENDARIO — referencias: Notion, Linear
```
OBJETIVO:        ahorrar tiempo y reducir caos (vender "menos desorden", no "más funciones").
PRIMERA VICTORIA: la primera tarea organizada / algo ordenado (agenda, lista priorizada, resumen listo).
ONBOARDING:      problema → solución. Conectar con un dolor concreto y mostrar un resultado rápido.
                 Modelo 1 (hard paywall) o Modelo 2 corto; la primera tarea completada en minutos.
PAYWALL:         después de ordenar algo. "Organizamos tu semana. Desbloquea automatizaciones,
                 recordatorios inteligentes y planificación recurrente."
MONETIZACIÓN:    SUSCRIPCIÓN. Cobrar por automatizaciones, integraciones, recordatorios, colaboración.
RETENCIÓN:       automatizaciones y sistema acumulado (loop "Productividad" de 24).
NO HACER:        empezar pidiendo mil permisos · pedir conectar calendario/Gmail/archivos ANTES de
                 explicar el beneficio · vender "más features" en vez de "menos caos".
```

### F) FINANZAS / INVERSIÓN / DINERO — referencias: Revolut, Wise
```
OBJETIVO:        confianza, claridad y control. Aquí NO va un paywall juguetón — el usuario necesita seguridad.
PRIMERA VICTORIA: un diagnóstico o visualización inicial de su situación.
ONBOARDING:      confianza + datos claros. Mostrar transparencia, privacidad y seguridad. La prueba social
                 (número de usuarios, auditorías) va ANTES del paywall.
PAYWALL:         después del diagnóstico. "Tu panorama financiero está listo. Desbloquea reportes
                 avanzados, alertas y recomendaciones personalizadas."
MONETIZACIÓN:    premium / reportes / alertas / automatización. Modelo 2 con énfasis en confianza.
RETENCIÓN:       alertas y reportes periódicos.
NO HACER:        prometer ganancias · urgencia agresiva · ocultar costos · gamificación que haga
                 parecer el dinero un juego.
```

> **Por qué no hay nicho de e-commerce/marketplace aquí:** TODA app de este SO se vende como **suscripción recurrente por Hotmart** (ver `18`/`40`). El comercio con checkout de productos o membresía de marketplace queda fuera del modelo — si una idea solo monetiza por compra única, no encaja con este SO (revisar la idea en `01`/`02`).

### MATRIZ ESTRATÉGICA CONSOLIDADA (de un vistazo)

| Nicho | Primera victoria | Onboarding | Paywall | Monetización | Retención |
|---|---|---|---|---|---|
| Educación | Completar 1ª lección | Metas + nivel + ejercicio real | Después de probar | Freemium + premium | Rachas / progreso |
| Bienestar | Primera sesión corta | Suave / emocional | Tras mini-experiencia | Trial + anual | Rutina diaria |
| Fitness / tracking | Primer registro/análisis | Rápido + personalizado | Tras el 1er análisis | Trial / créditos / premium | Check-ins |
| IA creativa | Primer resultado generado | Ultra corto, por caso de uso | Tras la preview | Créditos + suscripción | Calendario / proyectos |
| Productividad | Primera tarea organizada | Problema → solución | Tras ordenar algo | Suscripción | Automatizaciones |
| Finanzas | Diagnóstico inicial | Confianza + datos claros | Tras el diagnóstico | Premium / reportes | Alertas / reportes |

> **TIE-BREAKER nicho vs frecuencia:** si el NICHO y la FRECUENCIA sugieren modelos distintos (ej. finanzas = resultado → premium/diagnóstico, pero el uso es diario → "hábito"), manda la **MATRIZ DEL NICHO** para el modelo de PAGO; la frecuencia se atiende con el LOOP de retención (`24-GAMIFICACION.md`) — se gamifica la CONSTANCIA de uso (registrar cada día), nunca el dinero. El modelo de cobro sale de esta tabla; el hábito se construye aparte.

> **Nota sobre trial (aplica a B/C/F):** trial gratis de 7 días con tarjeta (modalidad Hotmart); el punto óptimo es 5-9 días (~45% trial→pago, Adapty 2026; Cal AI usa 3). El patrón ganador es **onboarding LARGO + trial CORTO**, no al revés. Programar email de recordatorio el Día 5-6 ("tu prueba termina, esto perderás"). Config en `18-VENTA-HOTMART.md`. Los loops de retención por nicho están desarrollados en `24-GAMIFICACION.md`.

### LA FÓRMULA PARA UNA APP DE IA (qué copiar de cada referencia)

No copiar 100% a ninguna. Tomar lo correcto de cada una:
```
De Duolingo:  progreso visible, hábito, rachas útiles, pequeñas victorias.
De Headspace: onboarding emocional, claridad, calma, promesa simple.
De Cal AI:    reducir fricción brutalmente y dar resultado inmediato.
De apps de IA: preview antes del pago, créditos, exportación premium, plantillas listas.

La fórmula:
"Dime qué quieres crear → te doy una preview útil → desbloquea la versión completa →
 vuelve cada día para completar tu sistema de contenido."
```

---

## EL PUENTE DE CHECKOUT (la fricción que los benchmarks no cuentan)

Los benchmarks de este archivo (1.78% install-to-paid, ~45% trial→pago, +234%) vienen de **apps móviles donde pagar es 1 tap con Face ID/Google Pay** sin salir de la pantalla. Aquí NO: el usuario debe **SALIR de la app al checkout de Hotmart**, digitar la tarjeta completa (o PIX/boleto), y volver. Esa fricción es **~10× mayor** y colapsa la tasa paywall→trial. Diseñar y medir como si fuera un paywall de App Store es fijarse metas que nunca vas a ver — y diagnosticar mal cuando no lleguen.

> **Regla: los benchmarks de app store son REFERENCIA DE TECHO, no meta.** Sirven para entender la mecánica (onboarding→paywall convierte más que paywall solo), no para fijar objetivos de una web app con checkout externo.

### El funnel real por etapas (medir cada tasa POR SEPARADO)

```
VISTA DEL PAYWALL
   │  Tasa 1: paywall → clic-al-checkout ... mide si el paywall CONVENCE (diseño, oferta, momento).
   ▼         Medir APARTE — es la única tasa comparable con los benchmarks de paywall.
CLIC EN "EMPEZAR MI PRUEBA" (sale de la app al checkout de Hotmart)
   │  Tasa 2: clic → trial-iniciado ........ mide el PUENTE. Aquí muere la mayoría: página nueva,
   ▼         tarjeta completa, dudas de confianza. Esperar MUCHO MENOS que el 40%+ de app store —
TRIAL INICIADO (lo confirma el webhook)      en web con checkout externo, una fracción de eso es normal.
   │  Tasa 3: trial → pago ................. aquí sí aplican las palancas clásicas (email día 5-6,
   ▼         valor durante el trial). El ~45% de Adapty también es techo de app móvil.
PRIMER COBRO REAL
```

Si colapsas paywall→trial en UNA sola tasa, no sabes si el problema es el PAYWALL (no convence) o el PUENTE (convence, pero la fricción del checkout externo lo mata). Son dos diagnósticos con dos arreglos distintos.

### El diseño del PUENTE (reducir la fuga del checkout externo)

```
A) ANTES DE REDIRIGIR — pantalla de transición IN-APP (no un salto en frío):
   - "Te llevamos al pago seguro de Hotmart 🔒 — usa este mismo correo: [email del usuario]"
   - Recordar QUÉ va a pasar: "pagas allá, vuelves aquí y tu plan queda activo al instante".
   - Señales de confianza: logo de Hotmart, garantía, "cancela cuando quieras".

B) LA URL DEL CHECKOUT — pre-llenada, siempre:
   - `?email=` con el correo de la cuenta (Hotmart lo acepta) para que el usuario no digite otro.
   - Pasar el user_id por `src`/`sck` para que el webhook matchee por id, no solo por email
     (las dos mitigaciones del bug de email distinto — ver 18 → "Los dos modelos de creación de usuario").

C) AL VOLVER — pantalla "Confirmando tu compra…" (nunca dejarlo perdido):
   - Polling: la app consulta cada pocos segundos si el webhook ya activó el plan (status
     trialing/active en el perfil). Al confirmarse → celebración + directo a su primera victoria.
   - Si tras ~60-90s no llega: fallback honesto — "El pago puede tardar unos minutos en confirmarse.
     Te avisamos por correo" + botón "Ya pagué y no se activa" que dispara el flujo de reclamo
     (buscar por email/código de suscriptor, ver 18). Cubre el caso del email distinto y el webhook lento.
```

---

## EL PUENTE DEL TRIAL (los días 1-7 DENTRO de la app: de "activó la prueba" a "pagó y se queda")

El SO diseña con precisión cómo se ACTIVA el trial (onboarding → paywall → puente de checkout), pero entre "trial iniciado" y "primer cobro real" hay 5-9 días DENTRO de la app — y ahí se decide si ese cobro llega a suceder. Un trial sin experiencia diseñada es un contador en silencio que termina en cancelación pre-cobro o, peor, en un cobro-emboscada (reembolso + chargeback + reseña de 1 estrella — y Hotmart castiga ambos). Regla rectora: **cada día del trial tiene UN momento de valor diseñado, igual que cada pantalla del onboarding tiene un micro-compromiso.**

### EL MAPA D1-D7 (adaptar los números a la duración REAL del trial del nicho — 5-9 días, ver la nota de trial arriba)

```
D1 — PRIMERA VICTORIA, YA: la victoria que el onboarding PROMETIÓ se materializa HOY — el plan/
     resultado generado es USABLE el mismo día (no "tu plan empieza el lunes"). Sin D1 no hay D2.
D2-D3 — EL MOMENTO "ESTO FUNCIONA": la app muestra el primer INSIGHT derivado de SUS datos reales
     ("tu mejor hora de X es...", "con solo 2 registros ya vemos que..."), nunca un tip genérico
     que serviría para cualquiera. Si aplica, aquí caen los momentos M1/M2 del 56 (1ª celebración).
D4-D5 — INVERSIÓN ACUMULADA VISIBLE: la app le muestra lo que YA construyó — "llevas 6 registros,
     tu [plan/artefacto] ya sabe [Y] de ti". El costo de irse crece cada día (efecto dotación).
D6 — AVISO PRE-COBRO HONESTO (in-app + email): fecha exacta, monto exacto y cómo cancelar en 1 tap.
     Contraintuitivo pero probado: avisar BAJA reembolsos y chargebacks y SUBE la confianza — el
     que iba a cancelar cancela igual; el que se queda, se queda sin rencor.
D7 / COBRO — AGRADECIMIENTO + DESBLOQUEO VISIBLE: "ya eres Pro" con lo Pro tangible (qué se
     desbloqueó, señalado en la UI) — el primer cobro se siente como upgrade, no como débito.
```

### INDICADOR DE TRIAL honesto (siempre visible, nunca amenazante)

```
Pill discreta "Día 3 de 7" en el home: caption 12-13px, fondo neutro elevado, SIN color de alarma —
NUNCA un countdown rojo de presión. Al tocarla abre un sheet: qué incluye Pro + fecha y monto
exactos del cobro + "Cancelar mi prueba" en 1 tap (sin laberinto).
```

### REGLA DURA

Cada día del trial tiene UN momento de valor diseñado y TRAZABLE a un deseo de FICHA-AVATAR.md (57) — el mapa se anota en ESTADO.md (sección de monetización). Si el usuario NO volvió en D2-D3, el push/email de re-enganche (24/34) usa el DOLOR #1 de la ficha en su lenguaje literal — nunca un "te extrañamos".

### MÉTRICAS DEL PUENTE DEL TRIAL (sumarlas a las del funnel de abajo)

```
- Activación D1: % de trials con la primera victoria completada el día 1 (meta: >80%).
- Retorno D3: % que volvió a abrir la app el día 2-3 (si no volvió, el cobro casi nunca llega).
- Conversión trial→pago: benchmark honesto por nicho — el ~45% de Adapty es TECHO de app store
  (ver EL PUENTE DE CHECKOUT); en web con checkout externo, medir la propia base y mejorarla.
- % de cancelación pre-cobro y SU DÍA: ¿cancelan al D1 (falló la primera victoria) o al D6 (el
  aviso reveló poco valor acumulado)? — dos diagnósticos con dos arreglos distintos.
```

> **Cross-refs:** los momentos de D2-D5 se diseñan con `56-MOMENTOS-EMOCIONALES.md` · si cancela igual → encuesta + oferta de rescate de `58-RETENCION-DE-INGRESOS.md` · la secuencia espejo por EMAIL (D1 bienvenida, D5-D6 aviso) vive en `PROMPT-EMAILS.txt` + `18` · los 3 bullets de confianza del paywall que PROMETEN este puente están en `50` → C4bis.

---

## MÉTRICAS CLAVE A MEDIR (implementar desde el día 1)

```
ONBOARDING
- Tasa de completación del onboarding (meta: >70%)
- Tasa de abandono por paso (identificar el paso donde más se van)
- Tiempo hasta la primera victoria (<60 segundos es el objetivo)
- Tasa de activación (% que completa la primera acción de valor)

PAYWALL Y PUENTE (dos tasas SEPARADAS — ver "EL PUENTE DE CHECKOUT" arriba)
- Vista del paywall → clic al checkout (¿el paywall convence?) — medir aparte
- Clic al checkout → trial iniciado (¿el puente funciona?) — esperar MUCHO menos que el 40%+
  de app store: ese número es techo de apps móviles con pago de 1 tap, no meta de web
- Trial → pago (referencia de techo app store: ~45%, Adapty 2026; punto óptimo 5-9 días)
- Día 0 de cancelación (el 55% de las cancelaciones ocurren el Día 0). ⚠️ DIAGNÓSTICO: un Día 0
  alto o una conversión pobre NO siempre es mal onboarding — PRIMERO revisa el PUENTE (¿la gente
  hace clic pero no inicia el trial? ¿vuelve del checkout a una pantalla que confirma y activa,
  o queda perdida?). Solo si el puente está sano, el sospechoso es el onboarding/compromiso.

RETENCIÓN
- D1 (meta: >40%), D7 (meta: >20%), D30 (meta: >10%)
- Churn mensual (meta aspiracional <8%; para MODELAR el LTV usa el churn realista 10-20% de `40-UNIT-ECONOMICS.md`)
```

---

## CHECKLIST DE PRICING Y MODELO DE NEGOCIO

```
[ ] Orden de diseño respetado: tipo de app → promesa → frecuencia → primera victoria → paywall → pricing → retención (no al revés)
[ ] Nicho identificado y su estrategia tomada de la matriz (A-F): primera victoria, onboarding, paywall, monetización y retención fijados ANTES de diseñar
[ ] Frecuencia de uso definida (diaria/semanal/puntual) → modelo elegido (freemium=hábito · hard paywall / preview→paywall=resultado)
[ ] Decisión tomada: ¿hard paywall, onboarding→paywall, o freemium?
[ ] Trial definido: 7 días por defecto (óptimo 5-9 días) — onboarding largo + trial corto, no al revés
[ ] Si la IA por acción es cara: créditos por plan definidos y empaquetados en RESULTADOS (no tokens), validados contra el COGS (40)
[ ] Plan anual mostrado como $/mes (NUNCA el total), pre-seleccionado, con badge y "2 meses gratis"
[ ] Pricing en .99 si el mercado es LATAM; precio descompuesto por día/semana
[ ] Si hay 3 tiers: el del medio dimensionado como señuelo (una dimensión, 80-90% del precio, ≤40-50% del valor) y el recomendado con badge
[ ] PUENTE DE CHECKOUT diseñado: pantalla de transición antes de redirigir + `?email=`/`src` en la URL + pantalla "confirmando tu compra…" al volver (polling del webhook + fallback)
[ ] PUENTE DEL TRIAL diseñado: mapa D1-D7 con UN momento de valor por día (trazado a FICHA-AVATAR), indicador "Día X de Y" honesto, aviso pre-cobro D6 in-app + email — anotado en ESTADO.md
[ ] Métricas de onboarding y paywall configuradas para medir desde el día 1 — con paywall→clic y clic→trial SEPARADAS (benchmarks de app store = techo, no meta)
```

> El diseño del FUNNEL que ejecuta este modelo (los 5 trabajos del onboarding, las 7 reglas, la anatomía y las 7 preguntas del paywall) se verifica con el checklist de `02B-ONBOARDING-Y-PAYWALL.md`.
