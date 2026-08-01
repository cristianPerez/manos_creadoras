# ONBOARDING Y PAYWALL — La Estrategia que Usan las Apps de $35M+

> ⚠️ **El PRICING y el modelo de negocio viven en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`** — el orden de diseño, los 3 modelos validados, la estrategia de pricing (anclaje, señuelo, créditos, trial), la matriz A-F por nicho, el puente de checkout y las métricas del funnel están allá. **La decisión de modelo/precio se toma ANTES de diseñar este funnel.** Este archivo diseña el funnel que ejecuta esa decisión.

> **Cuándo cargar este archivo:**
> - Siempre que se diseñe el onboarding o el paywall de la app (con el modelo ya decidido en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`)
> - En la fase de arquitectura (junto con `04-ARQUITECTURA.md`) al diseñar el flujo de usuario
> - Junto con `24-GAMIFICACION.md` (el onboarding gamificado y el loop de retención que sostiene la suscripción) y `26-AUTH-MODERNO.md` (registro sin fricción en el momento correcto)
>
> **Por qué existe:** el onboarding y el paywall son las 2-3 pantallas que concentran el dinero de la app. Este archivo recoge lo que hacen Duolingo, Cal AI ($35M → adquirida por MyFitnessPal), Noom y las apps top — los 5 trabajos del onboarding, las 7 reglas, la anatomía del paywall, las 7 preguntas y la capa de persuasión — y traduce esos patrones al contexto de una web app vendida por Hotmart.
>
> **⚠️ Antes de CONSTRUIR estas pantallas:** este archivo es la ESTRATEGIA. La especificación VISUAL de las pantallas de pregunta, el loading "construyendo tu plan" y el paywall (layouts a 375px, medidas exactas, motion, criterios de revisión) está en `50-DISENO-ONBOARDING-PAYWALL.md` — leerla antes de diseñarlas o revisarlas.
> **⚠️ Antes de escribir COPY o VISUALES de venta:** leer `52-COPY-VISUALES-CONVERSION.md`. El 02C decide el modelo; este archivo el funnel; el 52 convierte ese funnel en headline, visual, CTA, garantia concreta y navegacion de marca.

---

## PATRONES REALES DE APPS GANADORAS — antes de diseñar, revisar la evidencia

`52-COPY-VISUALES-CONVERSION.md` → sección "2bis" tiene 12 patrones extraídos de teardowns
reales (Duolingo, Cal AI, Tiimo, Flo, Asana) con fuente citada — no reinventar lo que ya está
probado a millones de usuarios. Resumen aplicable a esta fase:
```
- Registro DESPUÉS del primer valor real (Duolingo: +20% retención D1 al posponerlo).
- Paywall DESPUÉS del "aha" personalizado, nunca antes (Cal AI oculta precio hasta ver el plan).
- Ritual de micro-compromiso justo antes del paywall (Flo: gesto de mantener presionado).
- Retención construida en el LOOP CENTRAL mismo, no como capa aparte (Flo, Duolingo).
- Invertir en retener usuarios existentes rinde más que solo adquirir (Duolingo: 5x impacto).
```
Ver también `50-DISENO-ONBOARDING-PAYWALL.md` para la especificación visual de estos patrones.

---

## EL ONBOARDING QUE CONVIERTE — PATRONES DE LAS MEJORES APPS

### El patrón de Cal AI ($35M → adquirida 2026)

Cal AI empieza con un video demo corto, incluye personalización profunda a lo largo del flujo, está lleno de animaciones e interacciones, pide una reseña a mitad del onboarding, genera un plan personalizado, y solo entonces muestra el paywall: un "free trial" anual con 75% de descuento.

Cal AI mejoró significativamente sus tasas de conversión añadiendo preguntas al onboarding que no afectaban la funcionalidad de la app pero aumentaban el engagement del usuario.

Lección clave: **las preguntas del onboarding no tienen que ser solo funcionales — también son herramientas de construcción de compromiso.** Cada pregunta que el usuario responde es un micro-compromiso que aumenta su inversión emocional.

### El patrón de Noom (hasta 113 pantallas de onboarding)

El onboarding de Noom convierte a través de construcción progresiva de compromiso: las preguntas sensibles se enmarcan con contexto, las expectativas se establecen deliberadamente, y el paywall aparece solo después de que los usuarios han invertido tiempo y energía emocional significativos. La pantalla de carga que anima mientras "construye tu plan" no es relleno — es el argumento de apertura del paywall.

Lección clave: **el "loading screen" que genera el plan del usuario es en realidad el inicio del pitch de venta.** El usuario ve su resultado renderizarse en tiempo real y ya quiere protegerlo pagando.

### El patrón de Duolingo (gradual engagement + loss aversion)

El onboarding de Duolingo guía a los usuarios a través de un ejercicio real antes de pedir que se registren. El registro se siente como un pequeño paso dentro de un proceso más grande, en vez de un obstáculo frustrante en el camino a lograr valor.

Duolingo convierte el tiempo en el producto y el progreso acumulado en disposición a pagar mediante loss aversion y formación de hábitos — no solo mediante paywalls de fricción.

Lección clave: **el momento del registro o pago debe sentirse como un paso natural dentro de un proceso que ya empezó, no como una puerta.**

---

## LOS 5 TRABAJOS DEL ONBOARDING (qué debe LOGRAR, antes de cómo se diseña)

Un onboarding que convierte no es solo "corto" — es **estratégico**. Antes de pensar pantallas, verificar que el flujo hace estos 5 trabajos en orden. Si falta uno, el paywall llega frío:

```
1. SEGMENTAR   → saber quién es el usuario (nicho, objetivo, nivel). 1-2 preguntas.
2. PERSONALIZAR→ mostrarle algo construido CON sus respuestas (no una bienvenida genérica).
3. ACTIVAR     → que HAGA una acción de valor (no que lea sobre la app). Primera victoria.
4. CREAR DESEO → mostrar lo que PODRÍA conseguir (el resultado renderizándose, el plan, la preview).
5. PREPARAR EL PAGO → que el paywall se sienta como el paso natural siguiente, no como una puerta.
```

> Estos 5 trabajos son el "qué". Las 7 reglas de abajo son el "cómo". Un onboarding largo que segmenta y personaliza pero nunca ACTIVA (el usuario no logró nada con sus propias manos) convierte peor que uno corto que sí da la primera victoria.

#### EL ONBOARDING SE DERIVA DE FICHA-AVATAR.md (no se improvisa el cuestionario)

Las preguntas del onboarding B2C no se inventan: **ecoan los DOLORES de la ficha** (`57-AVATAR-Y-CONSCIENCIA.md`) — el usuario se auto-diagnostica respondiendo y siente "esta app me entiende" (el efecto "me leyó la mente" trasladado del copy a la interacción). Los **micro-compromisos apuntan a los DESEOS** de la ficha (la meta que fija en el slider de compromiso es un deseo tangible con número), y la **pantalla de reconocimiento** (50 → A5) usa el **dolor emocional #1 en el lenguaje LITERAL del avatar** — nunca un ánimo genérico intercambiable.

```
Ejemplo (app de finanzas, ficha con dolor #1 "no sé en qué se me va la plata" y
dolor emocional "me da ansiedad abrir la app del banco"):
  Pregunta:       "¿Cuándo sientes que 'se te va' el dinero?" ← eco del dolor #1
  Chips:          quincena / fines de semana / gastos hormiga / "ni idea — y eso es
                  lo que quiero saber" ← el último chip ES el avatar hablando
  Reconocimiento: "Eso de revisar el saldo con ansiedad le pasa al 68% de quienes ganan
                  bien: no es de ingreso, es de visibilidad." ← dolor emocional, literal,
                  desculpabilizado (fórmula de 50 → A5)
```

Regla: antes de diseñar el cuestionario, abrir la ficha y mapear pregunta→dolor y micro-compromiso→deseo. Una pregunta que no ecoa ningún campo de la ficha ni personaliza el plan es fricción decorativa.

#### BANCO DE PREGUNTAS DE SEGMENTACIÓN (para llegar a 15-25 pantallas sin relleno)

Las preguntas-ancla salen de la ficha (dolores/deseos/objeciones — **incluida la objeción dominante COMO pregunta**: "¿ya probaste apps así?" habilita la pantalla de reconocimiento que la desarma). El resto son preguntas de **segmentación funcional** por vertical — alimentan el plan de verdad:

```
FITNESS/NUTRICIÓN → nivel actual · lesiones/limitaciones · equipo disponible (casa/gym/nada)
FINANZAS          → medio de pago principal (efectivo/tarjeta/transferencia) · categorías donde
                    "se va" la plata · día de cobro (ancla el ciclo del presupuesto)
EDUCACIÓN/IDIOMAS → nivel · tiempo disponible/día · meta concreta (viaje, trabajo, examen)
IA CREATIVA       → caso de uso (anuncio/guion/carrusel) · estilo/tono de marca
PRODUCTIVIDAD     → rol/contexto de trabajo · herramientas que ya usa
BIENESTAR         → momento del día crítico (dormir/mañana/estrés) · hábito actual de partida
```

La regla de arriba sigue mandando: si una pregunta no ecoa un campo de la ficha NI personaliza el plan, es fricción decorativa — se corta, aunque falten pantallas para el número objetivo. El número se alcanza intercalando reconocimientos (50 → A5) y compromiso (50 → A6), no inflando el quiz.

---

## LAS 7 REGLAS DEL ONBOARDING DE ALTA CONVERSIÓN

Basadas en la investigación de 2026 y los patrones de las apps top:

```
1. UNA DECISIÓN POR PANTALLA (Ley de Hick aplicada al onboarding)
   Una pregunta, una opción, un avance. Nada más en pantalla.
   Los "quiz" de onboarding que convierten tienen 1 elemento por paso.

2. CADA PREGUNTA CAMBIA ALGO REAL
   Solo preguntar lo que afecta la experiencia O construye compromiso.
   Las preguntas decorativas que no personalizan nada destruyen conversión.
   PERO: las preguntas que no afectan la funcionalidad pero aumentan el
   engagement (Cal AI) sí tienen lugar — son micro-compromisos.

3. BARRA DE PROGRESO SIEMPRE VISIBLE
   El efecto goal gradient: las personas se esfuerzan más mientras más cerca
   están de completar un objetivo. Una barra al 70% genera más urgencia que
   una al 0%. El progreso predispone a completar.

4. PERSONALIZACIÓN QUE SE VE
   El onboarding debe decir "basado en tus respuestas, tu plan es X" —
   no una pantalla genérica de bienvenida. Usar el nombre, el objetivo,
   las respuestas del usuario en el resultado que se muestra.

5. ANIMACIÓN DEL RESULTADO ANTES DEL PAYWALL
   El "loading screen" que genera el plan (como Noom) es la preparación
   del paywall. El usuario ve algo construirse para él — cuando llega el
   precio, ya lo quiere proteger.

6. LA PRIMERA VICTORIA ANTES DE 60 SEGUNDOS
   Si no hay free tier: el primer resultado útil debe aparecer
   inmediatamente después del pago/registro.
   Si hay free tier: la primera victoria lleva al paywall de forma natural.

7. SKIP DISPONIBLE EN PASOS NO CRÍTICOS
   Paradójicamente, dar la opción de saltar aumenta la conversión porque
   reduce la resistencia. El usuario que elige quedarse está más comprometido.
```

---

## ¿CUÁNTAS PANTALLAS/PREGUNTAS DEBE TENER EL ONBOARDING? (con datos 2026)

La longitud larga NO es exagerada cuando el onboarding construye un PLAN PERSONALIZADO — los líderes van largo a propósito:
```
Noom     → hasta ~113 pantallas (10-15 min). El quiz largo ES el motor de conversión.
Cal AI   → ~20 pasos (preguntas + insights + features) → plan personalizado → trial corto.
Duolingo → ~7 preguntas rápidas + un ejercicio real ANTES de pedir registro.
Yuka (utilidad) → deliberadamente CORTO: el valor es obvio, el quiz solo estorba.
```
**LA REGLA POR TIPO DE APP (el factor que más mueve la conversión — decidir ANTES de diseñar):**
```
BIENESTAR / FITNESS / FINANZAS / HÁBITOS (el valor se PERSONALIZA):
  → 15-25 micro-pantallas (preguntas + insights + barra de progreso) que terminan en
    "Tu plan personalizado está listo" e INMEDIATAMENTE el paywall.
  → 15-20 preguntas NO es exagerado aquí: es el estándar de las apps de $35M+. Cada pregunta es un
    micro-compromiso (sesgo de inversión). Alargar el onboarding SUBE la conversión a pago
    (QUITTR; Cal AI: 61 experimentos de paywall → 57% trial→pago).

UTILITARIAS / HERRAMIENTAS (el valor es OBVIO):
  → ≤5 pantallas, o ir DIRECTO al valor. Un quiz largo aquí MATA la conversión: es fricción pura
    ("si el valor es obvio, el quiz retrasa al usuario de experimentarlo" — RevenueCat 2026).
  → Ventana útil: 30-60 segundos hasta la primera victoria.
```
> El agente DEBE clasificar la app (¿personaliza un plan, o es utilidad de valor obvio?) y fijar la
> longitud del onboarding antes de diseñar. Meter 20 preguntas en una utilidad espanta; meter 5 en
> una app de bienestar deja conversión sobre la mesa.

---

## EL DISEÑO DEL PAYWALL QUE CONVIERTE

> **Propiedad del pilar paywall:** ESTRATEGIA y anatomía → `02B-ONBOARDING-Y-PAYWALL.md` · medidas/layout/motion → `50-DISENO-ONBOARDING-PAYWALL.md` · palabras/fórmulas de copy → `52-COPY-VISUALES-CONVERSION.md`. Este archivo cubre SOLO su parte.

### La anatomía de un paywall de alta conversión

La eliminación de texto excesivo y el diseño enfocado en un mensaje claro aumentaron la conversión de install-to-trial en un 72%. Los paywalls cortos con reseñas reales del App Store y un dato impactante sobre el resultado de la app superan a los paywalls largos con muchas features listadas.

```
ELEMENTOS OBLIGATORIOS:
✅ Encabezado que refleja el objetivo DEL USUARIO (no los features del producto)
   "Tu plan para [su meta] está listo" vs "Accede a todas las funciones"
✅ Headline corto y persuasivo (<=10 palabras) + subtítulo de máximo 2 líneas en mobile
✅ Logo/nombre de la app y ruta clara para volver en onboarding/paywall/login
✅ El resultado personalizado visible (usa su nombre, su meta, su respuesta)
✅ Prueba social específica: número de usuarios O reseña real con nombre y foto
✅ Las 3 funciones más importantes — sin más
✅ Precio con ancla: el mensual como referencia "cara" y el anual mostrado como $/mes (NUNCA el total), con "2 meses gratis"
✅ CTA con beneficio: "Empezar mi plan" vs "Suscribirse"
✅ Garantía concreta si existe: "30 días o te devolvemos el dinero" o "Garantía Hotmart de 7 días" (reduce el miedo)
✅ Fecha exacta de cuándo se cobra (si hay trial)

ELEMENTOS QUE MATAN LA CONVERSIÓN:
❌ Listas largas de features (crea fatiga de decisión)
❌ Varios planes con diferencias confusas
❌ Precio mensual solo sin ancla anual
❌ CTA genérico ("Enviar", "Continuar", "Suscribirse")
❌ Sin garantía ni reversión de riesgo cuando ya existe checkout real
❌ Placeholder de confianza ("garantía visible", "pago seguro después") cuando la política aún no existe
❌ Pantalla idéntica para todos (ignorar la personalización del onboarding)
```

> El detalle de la ESTRUCTURA DE PRECIOS de estas cards (anclaje anual como $/mes, efecto señuelo con 3 tiers, créditos, trial por nicho) vive en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` — se decide ANTES de diseñar esta pantalla.

> **Día 1 sin prueba social (no inventarla JAMÁS):** una app recién lanzada no tiene reseñas ni "12.000 usuarios" — y rellenar con placeholders es la puerta por donde entran los testimonios fabricados. Usar la jerarquía día-1 del playbook "PRUEBA SOCIAL EN FRÍO" de `19-PAGINA-DE-VENTAS.md`: demo/GIF del producto real → garantía Hotmart destacada → resultado del propio fundador con fecha → beta testers reales divulgados. El bloque de reseñas/contador se OMITE hasta que sea real.

### Las 7 preguntas que el paywall debe responder (la narrativa, no solo los elementos)

Un buen paywall no es una lista de precios — es un argumento. Antes de cerrar el diseño, verificar que la pantalla responde estas 7 preguntas en la cabeza del usuario, en este orden. Si una queda sin responder, ahí se cae la conversión:

```
1. ¿QUÉ DESBLOQUEO?      → el resultado/transformación, no las features (encabezado).
2. ¿POR QUÉ AHORA?       → el momento (acabas de ver tu plan/preview; tu prueba termina el día X).
3. ¿QUÉ PIERDO SI NO SIGO?→ aversión a la pérdida honesta (tu plan/progreso queda sin completar).
4. ¿QUÉ GANO HOY?        → el valor inmediato al pagar (acceso completo, primera victoria protegida).
5. ¿PUEDO CANCELAR?      → reversión de riesgo (cancela cuando quieras, garantía de devolución).
6. ¿CUÁL PLAN ME CONVIENE?→ un plan recomendado OBVIO (anual como $/mes, badge, pre-seleccionado).
7. ¿Y SI NO QUIERO AHORA?→ salida limpia ("Ahora no" / seguir con versión limitada), sin culpa.
```

**Estructura narrativa que ensambla las 7** (de arriba a abajo en la pantalla):
```
Headline de RESULTADO  → "Crea contenido con IA sin empezar desde cero" (responde 1)
Subheadline PERSONAL   → "Preparamos tu ruta según tu nicho y objetivo" (usa sus respuestas)
Beneficios concretos   → máx 3, en lenguaje de resultado (responde 1 y 4)
Prueba social          → número real o reseña con nombre (baja el riesgo percibido)
Plan recomendado       → anual $/mes pre-seleccionado + "2 meses gratis" (responde 6)
Confianza/reversión    → garantía + fecha de cobro + "cancela cuando quieras" (responde 5 y 2)
CTA con beneficio      → "Desbloquear mi plan" (responde 4)
Salida limpia          → "Ahora no" (responde 7, sin confirmshaming)
```

> La regla 3 (aversión a la pérdida) es la más fácil de convertir en dark pattern. Hacerla HONESTA: "tu plan queda sin completar" (real) ✅ — no "vas a fracasar sin esto" (culpa) ❌. Ver ética de gamificación en `03` y `24`.

### LA CAPA DE PERSUASIÓN — cómo las "máquinas de conversión" venden (psicología + copywriting)

Un paywall y un onboarding que convierten no solo están "bien diseñados" — están construidos sobre psicología de la decisión. El dato base: **~95% de las decisiones de compra/registro son subconscientes y emocionales; la lógica solo JUSTIFICA después** (Cialdini). Por eso la emoción inicia la acción y los datos la respaldan. Estos son los gatillos que usan Duolingo, Noom, Cal AI y las top — aplicados con ÉTICA (gatillo real, nunca manipulación; ver `03`):

```
LOS 7 PRINCIPIOS DE CIALDINI, APLICADOS AL ONBOARDING + PAYWALL:
1. COMPROMISO Y CONSISTENCIA → micro-compromisos en el onboarding. Quien YA invirtió tiempo, convierte.
   Duolingo: pre-comprometerse a una meta diaria + racha ANTES de la 1ª lección. Pide pequeñas decisiones
   que el usuario quiera honrar.
2. RECIPROCIDAD → dar valor ANTES de pedir pago (la preview, el plan, un insight gratis). Noom: cada
   pregunta DEVUELVE algo (un dato, una validación) — el usuario siente que ya recibió antes de pagar.
3. PRUEBA SOCIAL → "+12.000 personas ya lo usan", reseña con nombre y foto, rating. 97% de la gente se
   deja influir por reseñas. Específica > abstracta.
4. AUTORIDAD → respaldo creíble (método, ciencia, experto, números reales). Noom apoya en CBT/ciencia.
5. ESCASEZ / URGENCIA → solo si es REAL (oferta de fundador que expira, cupos reales). Falsa = dark pattern.
6. SIMPATÍA (liking) → hablarle como un aliado, en su lenguaje, con su nombre y su meta. Cal AI: tono
   cercano + personalización profunda + pedir reseña a mitad del onboarding (cuando el ánimo está alto).
7. UNIDAD / IDENTIDAD → "para personas como tú que [identidad]". Atoms (James Clear): hábitos basados en
   identidad — "conviértete en alguien que [meta]".
```

```
GATILLOS DE COPYWRITING (el lenguaje que convierte):
- AVERSIÓN A LA PÉRDIDA (2× más fuerte que ganar): enmarca lo que PIERDE, no solo lo que gana.
  ✅ "No pierdas el plan que armaste" · ✅ "Deja de perder 2 horas por carrusel" — no solo "ahorra tiempo".
- ANCLAJE: muestra primero el precio ALTO (mensual) para que el anual se sienta ganga (ver la
  estrategia de pricing en `02C-PRICING-Y-MODELO-DE-NEGOCIO.md`).
- ESPECIFICIDAD: "de 2 horas a 4 minutos por carrusel" convierte más que "ahorra tiempo". El número
  concreto da crédito — pero SOLO si es verificable y propio. ⛔ PROHIBIDO: claims de ingresos
  ("gana $X en Y días") o de salud sin sustento — violan políticas de Meta/TikTok y queman cuentas
  de ads (ver `47` → "claims publicitarios y moderación").
- EMOCIÓN PRIMERO, LÓGICA DESPUÉS: el titular toca la emoción (la transformación); los bullets dan la
  razón lógica para justificar la compra que la emoción ya inició.
- "CADA PREGUNTA DEVUELVE ALGO" (Noom): en el onboarding, tras un dato sensible, responde con
  reconocimiento/insight ("la mayoría que empieza como tú ve [X] en 2 semanas"). Nunca solo "siguiente".
- EL LOADING QUE CONSTRUYE EL PLAN es persuasión: el usuario VE su resultado armándose → ya lo quiere proteger.
- CTA en primera persona y de beneficio: "Empezar MI plan" > "Suscribirse" (el usuario se apropia de la acción).
- REVIEW PROMPT a mitad del onboarding (Cal AI), en el pico emocional, no al final.
```

> **Límite ético (no negociable):** estos gatillos venden DANDO valor real, no explotando. Prohibido: urgencia/escasez falsa, culpa ("no, prefiero seguir fracasando"), prueba social inventada, esconder el precio o la cancelación. Un gatillo deshonesto es deuda de confianza (ver `03` y `47`). La diferencia entre máquina de conversión y dark pattern es si el usuario, al pagar, recibe lo que la emoción le prometió.

---

## CHECKLIST DE ONBOARDING Y PAYWALL

```
DISEÑO DEL ONBOARDING
[ ] 1 decisión por pantalla
[ ] Barra de progreso visible en todo el onboarding
[ ] Cada pregunta personaliza el resultado O construye compromiso
[ ] "Skip" disponible en pasos no críticos
[ ] Animación que genera el "plan personalizado" antes del paywall
[ ] La primera victoria del usuario ocurre antes de los 60 segundos

DISEÑO DEL PAYWALL
[ ] Encabezado con el objetivo del usuario (no features del producto)
[ ] El resultado personalizado visible (nombre, meta, respuestas del onboarding)
[ ] Prueba social específica (número real o reseña con nombre) — si aún no existe, jerarquía día-1 de 19 (demo real/garantía/fundador); NUNCA placeholders
[ ] Máximo 3 features destacados
[ ] Precio con ancla: mensual vs anual con % de ahorro
[ ] CTA con beneficio ("Empezar mi plan")
[ ] Garantía de devolución visible
[ ] Fecha exacta de cobro si hay trial

ESTRATEGIA
[ ] Se revisaron los patrones de apps ganadoras aplicables (ver "PATRONES REALES DE APPS
    GANADORAS" arriba y `52` → "2bis") antes de diseñar el onboarding/paywall desde cero
[ ] El titular del paywall pasó por las 4 U's de `52` → "1bis", no solo por la plantilla de
    "pérdida honesta + resultado"
[ ] El onboarding hace los 5 trabajos (segmentar · personalizar · activar · crear deseo · preparar el pago)
[ ] El paywall responde las 7 preguntas (qué desbloqueo · por qué ahora · qué pierdo · qué gano · puedo cancelar · cuál plan · salida limpia)
[ ] Longitud del onboarding fijada por tipo de app (15-25 pantallas bienestar/fitness · ≤5 utilidad)
```

> Las decisiones de MODELO y PRICING (orden de diseño, nicho A-F, frecuencia→modelo, trial, créditos,
> anual como $/mes, .99, señuelo, PUENTE DE CHECKOUT y métricas del funnel) se verifican con el
> checklist de `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` — deben estar tomadas ANTES de diseñar este funnel.
