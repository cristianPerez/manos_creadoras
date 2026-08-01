# FASE 0 — IDEACIÓN Y DESCUBRIMIENTO

## LA CONSTITUCIÓN DEL PRODUCTO (completar ANTES de pedir cualquier pantalla o UI)

Estas 6 preguntas son el filtro más importante del proyecto. Si no pueden responderse, no hay suficiente claridad para generar UI final. Documentar las respuestas en `ESTADO.md` antes de diseñar nada — la IA las consulta cada vez que haya duda sobre qué construir o qué cortar.

```
1. ¿Quién es el usuario principal y en qué situación concreta usa la app?
2. ¿Qué problema real quiere resolver y qué intenta evitar?
3. ¿Cuál es la promesa central de la app en UNA frase?
4. ¿Cuál es la primera victoria que debe experimentar (el "momento aha")?
5. ¿Cuáles son los 3 flujos más importantes?
6. ¿Qué comportamientos NUNCA debe tener la app aunque mejoren métricas a corto plazo?
```

> ⚠️ **La Constitución NO es un cuestionario para el usuario.** El usuario sabe poco o nada de
> crear apps: la IA REDACTA las 6 respuestas a partir de la idea que él dio + la investigación
> (las 4-6 — primera victoria, flujos, regla-nunca — se DERIVAN de la promesa y del nicho, no se
> preguntan), se las presenta COMPLETAS en un solo mensaje simple ("así entiendo tu app — corrige
> lo que no encaje") y avanza con su OK. Solo se pregunta lo indeducible, y siempre con 2-3
> opciones propuestas, nunca en blanco (CLAUDE.md → DECIDE-INFORMA-AVANZA).

**Fórmula obligatoria de promesa** (completar y guardar en ESTADO.md):
> "Esta app ayuda a [tipo de usuario] a lograr [resultado deseado] sin [fricción principal], mediante [mecanismo diferencial]."

**Regla de filtro:** Si una función no apoya la promesa central, probablemente sobra o debe esperar. Pensar desde el problema evita que la app se parezca a una plantilla genérica — cuando se entiende la situación real del usuario, aparecen decisiones de interfaz más humanas: qué mostrar primero, qué ocultar, qué automatizar.

**Criterio de aceptación:** Si eliminas una función y el usuario aún puede lograr la promesa principal con menos esfuerzo, esa función no era esencial para el MVP.

> **Validar la hipótesis antes de construir:** la hipótesis de problema que captura esta Constitución se VALIDA con usuarios reales en `44-DESCUBRIMIENTO-DE-USUARIO.md` antes de construir — el comportamiento pasado del segmento confirma (o tumba) el dolor antes de que `02` lo pruebe con dinero.

---

## Objetivo
Definir qué web app se va a crear. Si el usuario no tiene idea, guiarlo hasta una. Si ya tiene idea, refinarla y validar que tiene potencial.

---

## FUENTES DE INVESTIGACIÓN — Dónde Buscar Ideas Validadas

Usar estas fuentes con herramientas de búsqueda web al ejecutar el FLUJO A de `INICIO.md`. No son para leer manualmente — son para buscar en ellas activamente con queries específicos.

### Para ver qué funciona afuera (mercados extranjeros)
```
producthunt.com     → productos más votados por nicho y período. Query: "[nicho] app site:producthunt.com"
indiehackers.com    → founders con ingresos reales. Buscar: "[nicho] revenue indie hackers"
acquire.com         → apps en venta con MRR confirmado. Indicador de mercado real.
appsumo.com         → software que vende a emprendedores. Precios y volumen de compras.
```

### Para detectar tendencias antes de que lleguen a LATAM
```
explodingtopics.com → términos de búsqueda con crecimiento acelerado en últimos 6 meses
trends.google.com   → comparar EN vs ES de la misma keyword (¿crece la búsqueda en español?)
bigideasdb.com      → ideas rankeadas por quejas reales de usuarios (238K+ validadas)
reddit.com          → r/SaaS, r/indiehackers, r/microsaas — buscar "I wish there was a tool for..."
```

### Para confirmar que el dolor existe en LATAM
```
Google Trends en español → buscar la keyword en ES, filtrar por región LATAM
Reddit en español         → r/es, r/colombia, r/mexico, r/argentina — quejas + necesidades
Comunidades de nicho      → Facebook groups, Telegram, Discord de emprendedores LATAM
```

## EL FILTRO DE ARBITRAJE LATAM (el criterio más importante)

Una idea es una oportunidad de oro cuando pasa los 3 filtros simultáneamente:

```
✅ FILTRO 1 — Funciona afuera: la app tiene revenue real, reseñas positivas, 
   usuarios activos en mercados de habla inglesa o europea.

✅ FILTRO 2 — El dolor existe en LATAM: búsquedas en español creciendo,
   quejas similares en comunidades latinoamericanas, problema universal.

✅ FILTRO 3 — No hay competidor fuerte en español: sin app equivalente 
   con tracción real en LATAM, o la que existe tiene mala UX/UX y malas reseñas.
```

Si pasa los 3: el riesgo de validación es mínimo — el problema ya está probado,
solo hay que adaptarlo al contexto y al idioma. Eso es arbitraje de mercado.

Si solo pasa 1 o 2: puede funcionar, pero requiere más validación antes de construir.

---

## LOS PILARES DE UNA IDEA GANADORA (con datos 2026 — NO "la primera que se te ocurra")

El arbitraje LATAM dice DÓNDE buscar. Estos pilares dicen QUÉ separa una idea millonaria de una que nadie paga. Los datos son contundentes: **solo ~17% de las apps nuevas llegan a $1.000/mes de ingreso** y los líderes (top 25%) crecen +80% al año mientras el cuartil de abajo PIERDE un tercio (RevenueCat, State of Subscription Apps 2026). La diferencia no es suerte: las ganadoras comparten una estructura. **Una idea solo se le propone al usuario si pasa estos 8 pilares — jamás la primera ocurrencia.**

### Pilar 1 — DOLOR AGUDO, no "estaría bueno" (painkiller > vitamina)
Las apps que resuelven un dolor URGENTE convierten **5-9× más** que las "nice-to-have" (hasta 37% vs 4% de conversión). La gente YA busca cómo resolverlo y paga por que el dolor PARE. Rúbrica de 4 preguntas (1-5 cada una):
```
1. ¿Qué tan URGENTE es el problema?         (1 mejora linda → 5 dolor diario que ya intentan resolver)
2. ¿Qué pasa si NO lo resuelven?            (1 nada → 5 consecuencia real: dinero, salud, tiempo, reputación)
3. ¿Cuánto ALIVIO emocional da resolverlo?  (1 leve → 5 transformación/alivio fuerte)
4. ¿Qué tan malas son las ALTERNATIVAS hoy? (1 hay opciones gratis fáciles → 5 caras/lentas/frustrantes)
Suma:  16-20 = painkiller con poder de precio · 10-15 = vitamina con un nicho que sí paga · 4-9 = vitamina (descartar o reposicionar)

5. (MODIFICADOR para suscripción) ¿CADA CUÁNTO aparece el dolor? (raro/1 vez en la vida → recurrente diario/semanal)
   → Esto NO suma al painkiller, pero DECIDE el modelo de negocio (ver Pilar 6).
```
> **Trampa #1: confundir FRECUENCIA DE USO con disposición a pagar.** Una app de fertilidad usada 1 vez al día tiene WTP enorme; una del clima usada 5 veces al día, casi cero. **La urgencia paga, no la frecuencia de uso.**
> **Trampa #2 (la que se nos coló probando): el "catastrófico-pero-raro".** Un dolor enorme que ocurre UNA vez (sacar una visa, comprar un auto, una crisis) puntúa altísimo en "consecuencia" (pregunta 2) y PARECE ganador — pero como no se repite, es un **producto de pago único**, no una suscripción. Para este SO (suscripción recurrente por Hotmart), un painkiller de 18/20 que solo se usa una vez vale MENOS que uno de 16/20 que se usa cada semana. **Intensidad alta + frecuencia baja = transaccional, no suscripción** (ver Pilar 6, que es un gate duro).

### Pilar 2 — UN PROBLEMA QUE MILLONES COMPARTEN (demanda revelada, no imaginada)
No un dolor de 200 personas: uno universal y visible EN PÚBLICO. Señales de demanda REAL (buscarlas, no suponerlas): reseñas de 1-2 estrellas de las apps líderes (lo que ODIAN = tu oportunidad), "ojalá existiera algo que…" en Reddit/foros/grupos, volumen de búsqueda creciente, las MISMAS quejas repitiéndose mes a mes. Si nadie se queja del problema en ningún lado, probablemente no duele lo suficiente para pagar.
> **NO confundir dos señales distintas** (el error que se nos coló probando): que una startup gringa **levantó $20M** o **existe afuera** prueba que el PROBLEMA es real (señal de arbitraje, Pilar 7) — NO prueba que un latino pague **$20/mes por Hotmart**. La inversión de un VC ≠ disposición a pagar en LATAM. La señal de pago LATAM es propia: ¿hay gente en LATAM **gastando dinero hoy** en resolver esto (otra app de pago, un servicio, un "despacho", consultas)? Esa es la que vale para el modelo del SO. Si solo tienes "existe afuera" pero cero evidencia de pago en LATAM, baja la idea a "validar con el gate de demanda de 02".

### Pilar 3 — UN MOMENTO-IA QUE DE VERDAD RESUELVE (no que SIMULA) — el truco de Cal AI
Cal AI (~$30M/año) ganó con UN momento: foto → tus calorías. Su insight: *"la gente odia registrar comida a mano; la IA de visión elimina la peor parte de eso."* Específico, acotado, resuelto con UNA buena interacción de IA. La idea ganadora **toma el paso más tedioso de un trabajo que la gente YA hace y lo borra con IA en un solo toque** — no es "40 herramientas en una", es un wow puntual y memorable.
> **El wow tiene que ser REAL, no un disfraz** (el error que se nos coló probando con el "verificador de autos"): la IA puede *parecer* que resuelve cuando en realidad solo **adivina**. Antes de aprobar la idea, dos tests:
> - **Test "quítale la palabra IA":** si describes la app SIN decir "IA", ¿el usuario aún la quiere? Si el atractivo era solo "tiene IA", es gimmick. La gente compra el resultado (el agujero), no el taladro.
> - **Test de factibilidad real:** ¿la IA SOLA puede entregar el resultado prometido, o necesita **datos/integraciones que no tienes** (registros oficiales, bases privadas, APIs caras) para no quedarse en un "creo que…"? Si el valor de verdad vive en datos que el fundador no puede conseguir, la IA solo da una corazonada bonita — eso no es un painkiller, es un placebo. La IA debe **borrar trabajo real con precisión**, no producir adivinanzas con cara de certeza.

### Pilar 4 — "¿POR QUÉ AHORA?" (why now)
Una idea ganadora suele apoyarse en un cambio reciente que la hace posible o necesaria HOY. En apps de IA casi siempre es **una capacidad nueva del modelo** (visión, voz, generación de imagen/video, razonamiento) que antes no existía y ahora hace trivial algo que era imposible o carísimo. Si tu idea ya se podía hacer hace 5 años y nadie la hizo bien, pregúntate por qué — o encuentra el cambio que la destraba ahora.

### Pilar 5 — CATEGORÍA QUE MONETIZA + poder de precio
No todas las categorías pagan igual. Las que mejor monetizan y retienen (RevenueCat 2026): **Salud y Fitness** (la mayor LTV/ARPU), **Foto y Video** (la mayor tasa de éxito: ~28% llega a $1k en 2 años), **Productividad/Utilidades** y **Finanzas**. Y cobrar MÁS no baja la conversión: las apps de precio alto generan **~$62 de LTV por pagador vs ~$11** las baratas (6×) y convierten 2× mejor. Una idea que solo aguanta $3/mes es mala base — apunta a **$15-40/mes** con valor que lo justifique.

### Pilar 6 — RETENCIÓN INCORPORADA (GATE DURO, no advertencia)
Dato crítico: las apps de IA ganan **+41% de ingreso por pagador PERO retienen 30-36% PEOR** a 12 meses (RevenueCat 2026). El hype trae usuarios y los pierde rápido. Por eso la idea DEBE tener una razón estructural para volver: el problema se repite (diario/semanal), los datos se acumulan (mejora con el uso) o el resultado se vuelve un sistema. Las que ganan son **verticales y con opinión**, no un chatbot genérico para todo.
> **Este pilar es un GATE, no un asterisco** (el error #1 que se nos coló probando: presentar ideas de "un solo uso" con una nota de "ojo, esto no retiene" y seguir). Regla dura para el modelo del SO (suscripción recurrente por Hotmart):
> - Si la app es de **uso único / episódico** (sacar una visa, comprar un auto, un trámite puntual): **NO se propone como app de suscripción.** O se REFORMULA para que recurra (¿qué hace el usuario el resto del año?), o se reconoce que es un **producto de pago único** (otro modelo, fuera del default del SO). No se presenta con un "pero igual…".
> - La pregunta que decide: *"¿por qué este usuario abriría la app la semana que viene, y la siguiente?"* Si no hay una respuesta honesta y concreta, la idea NO pasa — por muy alto que sea su painkiller.

### Pilar 7 — VENTAJA DE DISTRIBUCIÓN (cómo vas a llegar barato)
La idea más brillante sin forma de llegar a su público es un hobby. Solo 17% de apps llegan a $1k MRR — y el filtro suele ser la distribución, no el producto. Ventajas válidas: PERTENECES a ese nicho (lo entiendes y tienes acceso), una audiencia de creadores que lo amplifica, o el propio **arbitraje LATAM** (un mercado/idioma desatendido ES tu canal). Si no hay forma barata y repetible de traer al usuario, reformula.

### Pilar 8 — ALCANZABLE, DEFENDIBLE Y SIN RIESGO REGULATORIO QUE TE HUNDA
Construible en ~1 semana con el SO, y con un ángulo que ChatGPT/Canva/Notion no copien de un día para otro (vertical, con opinión, con datos del nicho). Si "ChatGPT ya lo hace gratis", necesitas un ángulo 10× o un nicho específico que lo genérico no atiende bien.
> **Pesar el RIESGO REGULATORIO/LEGAL** (lo que se nos coló probando llamándolo "manejable" cuando no lo es): los dominios de **consejo médico, legal, migratorio o financiero** son terreno minado para un fundador no técnico solo — un mal output puede dañar a alguien y exponerte legalmente. No los descartes de plano, pero:
> - Solo entran si el producto se puede enmarcar honestamente como **"información/organización, NO consejo profesional"** (ej. organizar medicamentos ✅ vs. "te digo qué tomar" ❌; revisar un contrato y señalar dudas ✅ vs. "ejerzo de abogado" ❌).
> - Si el valor REAL de la idea exige cruzar esa línea (dar diagnóstico, asesoría legal vinculante), es **mala base para empezar** — sube muchísimo el riesgo y la complejidad. Preferir ideas igual de dolorosas pero de **bajo riesgo regulatorio**.

### El filtro, en una frase (con 3 GATES DUROS que descalifican aunque el resto brille)
> Una idea se propone SOLO si es un **painkiller** (Pilar 1 ≥16/20), de un **problema que millones comparten** con señal de pago en LATAM (2), resuelto por **un momento-IA que de verdad resuelve** (3), con un **por qué ahora** (4), en una **categoría que paga** (5), y una **forma de distribuirla** (7), **construible** (8).
> **Y además pasa los 3 GATES (si falla UNO, NO se propone aunque el painkiller sea 19/20):**
> 1. **GATE de retención (6):** hay razón honesta para volver semana a semana. Uso único → fuera (o es otro modelo).
> 2. **GATE de IA real (3):** la IA RESUELVE con precisión, no adivina; pasa el test "quítale la palabra IA" y el de factibilidad de datos.
> 3. **GATE regulatorio (8):** no exige dar consejo médico/legal/financiero vinculante; se enmarca como información, no asesoría.
> Si falla un pilar "blando", se REFORMULA. Si falla un GATE, se descarta o se cambia de raíz. **Nunca proponer "la primera que se te ocurra" ni una que tú mismo sabes que es floja "con una nota honesta".**

### Anti-patrones (ideas que los datos dicen que PIERDEN)
```
❌ Vitamina ("estaría bueno") → ~4% de conversión, no paga.
❌ Uso único / catastrófico-pero-raro (visa, comprar auto, un trámite) → gran dolor pero pago ÚNICO, no suscripción.
❌ "Wow" de IA que en realidad ADIVINA (no tiene los datos para resolver de verdad) → placebo, no painkiller.
❌ Chatbot genérico "para todo" → sin retención ni diferenciación (la IA churna rápido).
❌ Consejo médico/legal/financiero vinculante por un fundador solo → riesgo legal que te hunde.
❌ "Existe afuera / levantó plata" tomado como prueba de que LATAM pagará → es señal de arbitraje, NO de WTP local.
❌ Categoría que no monetiza o problema sin urgencia → techo bajísimo.
❌ Sin ventaja de distribución → gran producto que nadie encuentra.
❌ Copia de un feature de ChatGPT/Canva sin ángulo vertical → te borran en una actualización.
```

---

## CRITERIOS DE UNA BUENA IDEA (para el SO)

Además del filtro LATAM, la idea debe ser construible con este sistema:

```
✅ Problema puntual y claro (no "el próximo Salesforce")
✅ Monetizable por suscripción recurrente ($15-39/mes value-based, anclado al WTP medido en el gate de 02; no es precio de catálogo fijo)
✅ IA añade valor real (no decorativa — resume, genera, clasifica, personaliza)
✅ Construible en 1 semana (4-6 sesiones con el SO)
✅ Sin requerimientos de hardware, app stores nativas, ni regulaciones complejas
✅ El dueño puede operarla solo con el backoffice del SO (sin equipo técnico)
```

### Secuencia de Preguntas (máximo 5, mínimo 3)

Haz estas preguntas UNA POR UNA. No las lances todas juntas. Espera respuesta antes de avanzar.

**Pregunta 1 — Nicho y Audiencia**
> "¿En qué nicho o industria te mueves? (puede ser el tuyo o el de tu audiencia). Por ejemplo: fitness, educación, finanzas, marketing, gastronomía, salud mental, productividad, freelancers, e-commerce..."

**Pregunta 2 — Problema o Dolor**
> "¿Cuál es el problema más repetitivo o frustrante que tiene tu audiencia (o tú mismo)? Algo que les haga perder tiempo, dinero, o les genere estrés."

**Pregunta 3 — Frecuencia**
> "Ese problema, ¿ocurre todos los días, cada semana, o cada mes? (Esto define si la app puede retener usuarios recurrentemente)"

**Pregunta 4 — Soluciones Actuales**
> "¿Cómo lo resuelven ahora? (Excel, a mano, con otra app, no lo resuelven...)"

**Pregunta 5 — Resultado Soñado**
> "Si existiera una app que resolviera esto, ¿qué tendría que pasar para que digas 'esto es exactamente lo que necesitaba'?"

### Generación de la Propuesta

Con las respuestas, genera UNA propuesta de app (no tres, no cinco — UNA, la mejor) con este formato:

```markdown
## 🚀 Propuesta de App: [Nombre de la App]

**Qué hace:** [Una frase clara, máximo 15 palabras]

**Para quién:** [Audiencia específica]

**Problema que resuelve:** [El dolor concreto]

**Cómo lo resuelve (flujo básico):**
1. El usuario [acción de entrada]
2. La IA [procesamiento/magia]
3. El usuario recibe [resultado de valor]

**Por qué pagarían mes a mes:**
- [Razón 1: datos acumulados / personalización / contenido nuevo]
- [Razón 2: ahorro de tiempo cuantificable]
- [Razón 3: resultados que mejoran con el uso]

**Momento WOW (primeros 30 segundos):**
[Qué va a ver/sentir el usuario la primera vez que use la app que le haga decir "esto está increíble"]

**Por qué GANA (chequeo de pilares — ver "LOS PILARES DE UNA IDEA GANADORA"):**
- 💊 Painkiller: [score 1-5 de las 4 preguntas → /20; por qué duele de verdad]
- ⏰ Por qué ahora: [el cambio reciente / capacidad de IA que la destraba hoy]
- 🔁 Por qué retiene: [la razón estructural para volver — se repite / acumula datos / es un sistema]
- 💰 Categoría + precio: [categoría que monetiza + rango $15-40/mes]
- 📣 Distribución: [cómo se llega al usuario barato — nicho propio / creadores / arbitraje LATAM]

**Modelo de monetización sugerido:**
- Free: [qué incluye]
- Pro ($X/mes): [qué desbloquea]
```
> Si al rellenar este bloque algún pilar queda débil (ej. es vitamina, no retiene, o no hay cómo distribuirla), REFORMULA la idea antes de presentarla — no la presentes "como salió".

Presenta la propuesta y pregunta: **"¿Esto va por buen camino? ¿Qué le cambiarías?"**

---

## Escenario B: El Usuario YA Tiene Idea

Si el usuario llega con una idea, no la aceptes tal cual. Pásala por este filtro:

### Filtro de Viabilidad Rápida

Evalúa mentalmente (no necesitas mostrar todo esto al usuario):

1. **¿Se puede construir con IA en una sesión de trabajo?** → Si requiere infraestructura compleja (ML personalizado, procesamiento de video en tiempo real, etc.), sugiere simplificar.
2. **¿Tiene uso recurrente?** → Si es una herramienta de "usar una vez y ya", sugiere cómo añadir recurrencia.
3. **¿El resultado es inmediato?** → Si el usuario tiene que esperar días para ver valor, es un problema.
4. **¿Se diferencia de lo que ya existe gratis?** → Si ChatGPT o una herramienta gratuita ya lo hace igual, sugiere el ángulo diferenciador.
5. **¿Pasa "LOS PILARES DE UNA IDEA GANADORA"?** → sobre todo painkiller (¿duele de verdad o es vitamina?) y retención (¿hay razón para volver o es de un solo uso?). La idea propia del usuario a menudo es una vitamina o de uso único: tu trabajo NO es solo aceptarla, es proponerle el ÁNGULO que la convierte en painkiller con retención (sin destruir su visión). Ej: "tu idea de X es útil, pero para que la gente PAGUE mes a mes le daría este giro: [ángulo painkiller + razón de retorno]".

### Si la idea pasa el filtro:
Reformúlala usando el mismo formato de propuesta del Escenario A (incluido el chequeo de pilares) y preséntala al usuario para aprobación.

### MINI-TEARDOWN COMPETITIVO (entregable escrito, ya no "mental")

Antes de proponer la app, hacer un teardown BREVE pero ESCRITO — 20-30 minutos con búsqueda web, no
un informe de consultoría. Va resumido en la propuesta y completo en ESTADO.md/App Brief (un análisis
"mental" no deja rastro, no se puede auditar y siempre se hace a medias):

**1. TRES competidores × esta tabla (buscar "[idea] app", "AI [idea] tool" y su equivalente en español):**
```
| Competidor | Precio y modelo (sub / pago único / freemium) | Top-3 quejas en reseñas 1-2★ | El hueco que deja |
|---|---|---|---|
| [App 1]    | ej. $12/mes sub                               | 1)… 2)… 3)…                   | [qué NO resuelve] |
| [App 2]    |                                               |                               |                   |
| [App 3]    |                                               |                               |                   |
```
Las quejas 1-2★ de los líderes se buscan en app stores, Trustpilot/G2 y comentarios de redes — son
la materia prima del Pilar 2 (lo que ODIAN = tu oportunidad) y el **hueco que dejan ES tu ángulo
diferenciador**. Si Canva/Notion/ChatGPT ya lo hacen como feature, el hueco debe ser nicho o 10×.

**2. DEMANDA EN ESPAÑOL — fuente OBLIGATORIA: TikTok e Instagram.** Buscar el problema/las keywords
EN ESPAÑOL en TikTok/IG: ¿hay creadores hablando del dolor? ¿videos con tracción? ¿comentarios
pidiendo una solución? Es la señal más directa de demanda + distribución LATAM (Pilar 7) — Google
Trends solo se queda corto para audiencias que viven en redes.

**3. ¿Los competidores COBRAN?** Si sí → mercado validado. Si todo es gratis → preguntarse por qué
(quizás no se puede monetizar).

**4. FECHAR todo dato de mercado.** Cada benchmark citado lleva fuente y fecha con vencimiento:
"RevenueCat 2026 — revisar en 12 meses". Un dato sin fecha es un rumor; uno de hace 3 años, una trampa.

Presentar al usuario el teardown RESUMIDO (la tabla + el hueco encontrado) como parte de la
propuesta — el detalle queda en ESTADO.md.

### Naming de la App

Al proponer el nombre, seguir estas reglas:
- Máximo 2 palabras (ideal 1)
- Fácil de escribir y pronunciar en el idioma del usuario
- Verificar que el dominio .com o .app esté disponible (o al menos .co)
- Que no tenga connotaciones negativas en otros idiomas
- Que sugiera qué hace la app sin ser genérico ("BriefAI" > "AI Tool Pro")

Si no puedes verificar dominios, propón 2-3 opciones de nombre y dile al usuario que verifique disponibilidad.

### Si la idea NO pasa el filtro:
Explica con honestidad y respeto cuál es el problema, y propón una variación que sí funcione:

> "Tu idea de [X] tiene potencial, pero hay un tema: [problema identificado]. Lo que te propongo es [variación mejorada] porque [razón]. ¿Qué te parece?"

---

## Banco de Ideas por Nicho (si el usuario está muy perdido)

Si el usuario no puede responder las preguntas o dice "no sé qué hacer", ofrécele ideas probadas por nicho:

### Productividad / Freelancers
- Generador de propuestas comerciales con IA (input: tipo de servicio + cliente → output: propuesta profesional lista)
- Dashboard de ingresos y gastos con predicciones IA

### Marketing / Creadores de Contenido
- Generador de calendarios de contenido por nicho con captions y hashtags
- Analizador de perfiles de redes sociales con recomendaciones de mejora

### Educación
- Generador de quizzes y evaluaciones a partir de cualquier texto/tema
- Tutor personalizado que se adapta al nivel del estudiante

### Fitness / Salud
- Planificador de comidas personalizadas con lista de compras automática
- Tracker de hábitos con coach IA que analiza patrones

### E-commerce / Negocios
- Generador de descripciones de productos optimizadas para SEO
- Calculadora de pricing con análisis de competencia

### Finanzas Personales
- Asesor financiero IA que analiza gastos y sugiere optimizaciones
- Simulador de inversiones con escenarios personalizados

**Regla**: No presentes el banco entero. Filtra 2-3 ideas basándote en lo poco que sabes del usuario y preséntalas como sugerencias conversacionales.

> **Importante:** este banco son SEMILLAS genéricas, no ideas ya ganadoras. Varias, tal cual, son vitaminas (ej. "tracker de hábitos" sin ángulo es nice-to-have). Antes de proponer cualquiera, pásala por "LOS PILARES DE UNA IDEA GANADORA" y AFÍLALA hasta que sea un painkiller con su momento-IA, su por qué ahora y su razón de retención. El banco es para destrabar al usuario, no para entregar la primera de la lista.

---

## Paso Intermedio: Definición Estratégica de Features

Antes de generar el App Brief, definir exactamente qué funciones tendrá la app. No inventar features — basarlas en lo que hacen las apps exitosas del mismo tipo.

### Regla: Máximo 3-5 Features Core en el MVP

El usuario tiende a pedir 15 funciones. Tu trabajo es reducirlo a las 3-5 que realmente importan.

**Framework de priorización — Preguntar para cada feature:**
1. **¿Genera valor directo?** → Si la quitas, ¿la app pierde su razón de existir?
2. **¿Se puede construir en una sesión?** → Si requiere semanas, no es MVP.
3. **¿La van a usar >50% de los usuarios?** → Si solo la usaría el 5%, sobra.

Lo que NO pasa estos 3 filtros → Lista de "Versión 2.0", no del MVP.

### EL FILTRO DE FEATURE — el criterio de "buena idea" NO termina en la ideación (con evidencia)

El mismo criterio que filtra IDEAS debe filtrar cada FEATURE que se construye. El dato que lo justifica: **el ~80% de las features de una app se usan poco o nunca, y solo el ~12% se usan seguido** (Pendo, 2019 — 180M usuarios, 35.000 apps; el Standish Group ya medía 64% en 2002). Cada feature que no se usa no es neutra: **agrega complejidad, confunde, diluye la promesa y ralentiza la app**. Construir menos, pero mejor, es lo que hacen las apps exitosas.

> **El agente debe defender el alcance, no obedecer pedidos de más features.** Cuando el usuario (o el propio impulso) quiera añadir algo durante la construcción, pasa la feature por estas 4 preguntas — y si no las pasa, se dice con respeto y se manda a "V2", no se construye:
```
1. ¿APOYA LA PROMESA CENTRAL? (la frase de la Constitución). Si no la apoya, sobra — por buena que suene.
2. ¿LA USARÁ >50%? (regla del 80/20: si solo la usa un 5%, es peso muerto que esconde lo importante).
3. TEST "QUÍTALE LA PALABRA IA": ¿el usuario aún la querría si no dijera "con IA"? Si el atractivo era
   solo "tiene IA", es gimmick. La buena IA BORRA trabajo (aparece sola, reduce pasos), no agrega pasos
   ni botones. Se vende el RESULTADO, no "que usa IA".
4. ¿AHORA O DESPUÉS? Si no es parte de la primera victoria ni del loop de retención, va a V2. Lanzar
   enfocado > lanzar inflado.
```
> **Cómo decirlo (no eres un "sí señor"):** *"Entiendo por qué quieres [X], y es buena idea para más adelante. Pero ahora mismo NO apoya la promesa central / la usaría poca gente / haría la app más confusa. Te propongo dejarla en la lista de V2 y lanzar enfocados; cuando tengamos usuarios reales, ellos nos dirán si la piden. ¿Te parece?"* Esto NO contradice el estándar de "producto enriquecido" del archivo 32: enriquecido = cada pantalla LLENA DE VALOR, no llena de FEATURES. Profundidad en lo esencial, no cantidad de funciones.

> Cuándo SÍ sumar una feature a mitad de construcción: cuando hay evidencia de que pertenece (la piden usuarios reales de la beta, la tienen TODAS las apps de referencia del sector y el usuario la espera, o es parte del loop de retención del archivo 24). Evidencia, no corazonada.

### CUIDADO: un GENERADOR + HISTORIAL NO es una app de suscripción (la trampa de "pocas utilidades")

El filtro de arriba evita el exceso de features. Pero hay un error simétrico igual de letal, detectado al probar el SO: **podar tanto que quede un "generador + historial" — una herramienta de un solo disparo que no da razones para volver ni para pagar mes a mes.** "Genera X → guárdalo en Mis creaciones" es exactamente lo que ChatGPT hace gratis. Para una SUSCRIPCIÓN, el MVP DEBE incluir tres cosas que el recorte suele mandar a "V2" por error:

```
1. AL MENOS UNA SUPERFICIE DE RETENCIÓN (el loop del 24 hecho FEATURE, no "pendiente"):
   No basta con generar + guardar. El MVP necesita el sistema que hace volver. Según el tipo:
   - Contenido/creadores → CALENDARIO de contenido (qué publicar y cuándo) + biblioteca que se
     reutiliza/remixa + (idealmente) MÉTRICAS de lo publicado. "Hoy toca tu carrusel" vive en una pantalla, no en una nota.
   - Fitness/hábitos → registro + progreso/historial visible + check-ins.
   - Productividad → el sistema/espacio que se acumula (proyectos, plantillas), no solo "generar tarea".
   REGLA: el loop de retención (24) se define como PANTALLA(S) del MVP, no como "a diseñar después".
   Si lo dejas para V2, lanzas una herramienta de un solo uso y el churn de IA (−30%, ver 02C) te mata.

2. EL ARTEFACTO debe estar COMPLETO, igual a la promesa (no una versión "de texto"):
   Si la promesa es "carrusel de Instagram listo para publicar", el output lleva DISEÑO/IMÁGENES,
   no solo texto en cajas — un carrusel sin diseño NO está "listo para publicar" y rompe el wow.
   Antes de definir features, preguntar: "¿el artefacto que entrego es USABLE tal cual para lo que
   el usuario vino a hacer, o le falta la mitad (las imágenes, el formato, la exportación real)?"
   El wow tiene que IGUALAR la promesa, no insinuarla.

3. CERRAR EL LOOP (la retención más fuerte): crear → publicar → MEDIR → mejorar.
   Las apps que retienen no solo ayudan a CREAR; ayudan a ver si FUNCIONÓ y a mejorar. Para un
   creador: "tu carrusel del martes tuvo 2× alcance — repite ese formato". Eso da una razón
   mensual brutal para volver. ⚠️ FACTIBILIDAD (pilar 3): publicar/medir vía APIs oficiales
   (Instagram/Meta, LinkedIn) tiene fricción real (revisión de app, permisos) y puede ser inviable
   al inicio para un fundador solo. Caminos realistas: empezar con métricas que el usuario PEGA o
   sube (captura), o un sub-set de integración liviano; medir-el-resultado entra al roadmap como
   palanca de retención #1, evaluando la viabilidad técnica honestamente, no prometiéndola a la ligera.
```
> **Reconciliación con el filtro de features:** estas tres NO son "más features por gusto" — son lo que convierte un generador en un producto de suscripción. La disciplina de features corta lo que no apoya la promesa NI la retención; la superficie de retención SÍ las apoya, así que está PROTEGIDA del recorte. Cortar el calendario/métricas de un app de contenido para "lanzar enfocado" es cortar justo la razón de pagar.

### Cómo Sugerir Features (la IA propone, el usuario elige)

Si el usuario no sabe qué features incluir, la IA sugiere basándose en patrones probados según el tipo de app:

**Para apps de GENERACIÓN con IA (generador de textos, propuestas, contenido):**
1. Campo de input + generación (el core) — con el ARTEFACTO COMPLETO (si es visual, CON imágenes/diseño, no solo texto)
2. **SUPERFICIE DE RETENCIÓN — obligatoria en el MVP, no opcional** (el loop del 24 hecho pantalla):
   calendario/planificador, biblioteca que se reutiliza-remixa, o panel de resultados/métricas. SIN esto
   es "generador + historial" = herramienta de un solo uso que no retiene (la trampa de arriba).
3. Historial/biblioteca de resultados (que se reusa, no solo se archiva)
4. Personalización persistente (la "marca"/tono que la app APRENDE y reaplica — inversión que sube el costo de irse)
5. Copiar / exportar el resultado USABLE tal cual
6. Opcional: plantillas por caso de uso · cerrar el loop (medir resultados, con la nota de factibilidad de arriba)

**Para apps de ANÁLISIS con IA (analizador, evaluador, auditor):**
1. Input de datos (texto, URL, archivo)
2. Dashboard de resultados con métricas claras
3. Recomendaciones accionables
4. Historial de análisis anteriores
5. Opcional: Comparativa entre análisis

**Para apps de TRACKING/HÁBITOS:**
1. Registro diario de la actividad
2. Vista de progreso (gráfico/calendario)
3. Rachas y hitos
4. Insights IA sobre patrones
5. Opcional: Recordatorios/notificaciones

**Para apps de PLANIFICACIÓN con IA (calendarios, meal planners, etc.):**
1. Input de preferencias/restricciones
2. Plan generado por IA
3. Vista de calendario/timeline
4. Edición manual del plan
5. Opcional: Lista de compras/acciones derivadas

**Para apps de EDUCACIÓN:**
1. Lección/contenido adaptativo
2. Evaluación (quiz, ejercicio)
3. Progreso y nivel actual
4. Repaso de errores
5. Opcional: Gamificación (puntos, rachas)

### Formato de Presentación al Usuario

```markdown
## Features del MVP — [Nombre de la App]

### Core (imprescindibles):
1. [Feature]: [qué hace en 1 línea] — [por qué es necesaria]
2. [Feature]: [qué hace] — [por qué]
3. [Feature]: [qué hace] — [por qué]

### Importantes (recomendadas para retención):
4. [Feature]: [qué hace] — [por qué]
5. [Feature]: [qué hace] — [por qué]

### Versión 2.0 (después de validar el MVP):
- [Feature futura 1]
- [Feature futura 2]
- [Feature futura 3]

Total features MVP: [3-5]
```

Presentar y preguntar: **"¿Agregarías o quitarías algo?"**

Si el usuario quiere agregar más de 5, explicar:
> "Entiendo que quieres incluir [X], y es buena idea, pero para el MVP necesitamos lanzar rápido con lo esencial. Te propongo ponerlo en la lista de V2 y agregarlo cuando ya tengamos usuarios reales que nos confirmen que lo necesitan. ¿Te parece?"

---

## Entregable de Fase 0: App Brief

Cuando el usuario apruebe la idea, genera el App Brief final:

```markdown
# APP BRIEF — [Nombre de la App]

## Resumen Ejecutivo
[2-3 líneas describiendo qué hace la app y para quién]

## Problema
[El dolor específico que resuelve]

## Solución
[Cómo lo resuelve, paso a paso simple]

## Usuario Objetivo
- Perfil: [quién es]
- Frecuencia de uso esperada: [diario/semanal]
- Contexto de uso: [en el trabajo, en su celular, etc.]

## Propuesta de Valor Única
[¿Por qué ESTA app y no cualquier otra solución?]

## Features del MVP (máximo 5)
1. [Feature core]: [qué hace]
2. [Feature]: [qué hace]
3. [Feature]: [qué hace]
4. [Feature]: [qué hace] (si aplica)
5. [Feature]: [qué hace] (si aplica)

## Personalidad de la App
3 adjetivos: [___], [___], [___]
Si fuera una persona: [descripción breve]
Tono de voz: [formal/casual, entusiasta/sereno, técnico/simple]

## Modelo de Monetización
- Tier Gratuito: [límites]
- Tier Pro: [precio + beneficios]

## Métricas de Éxito
- Activación: [qué cuenta como "usuario activado"]
- Retención: [qué hace que vuelvan]
- Conversión: [qué los hace pagar]

## Momento WOW
[La primera experiencia que engancha al usuario]

## Complejidad Técnica Estimada
- Nivel: [Bajo / Medio / Alto]
  - Bajo: Solo frontend + API de IA. Se puede construir en 1-2 sesiones.
  - Medio: Necesita auth + base de datos. 2-4 sesiones.
  - Alto: Necesita integraciones externas, pagos, o lógica compleja. 4-8 sesiones.
- Backend necesario: [Sí/No — si sí, qué necesita: auth, DB, storage, pagos]
- APIs externas: [Lista de APIs que se usarán]
- Deploy recomendado: [Artifact / Vercel simple / Vercel + Supabase]
```

### Criterios de Salida de Fase 0
- [ ] El usuario aprobó la idea
- [ ] El App Brief está completo
- [ ] El modelo de monetización está definido
- [ ] El momento WOW está claro

→ **Siguiente: Cargar `02-VALIDACION.md`**
