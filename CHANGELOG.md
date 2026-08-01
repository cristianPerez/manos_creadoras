# CHANGELOG — Sistema Operativo (SO)

Registro de cambios del **propio sistema documental** (no de las apps que construye con él).
Formato basado en [Keep a Changelog](https://keepachangelog.com/) (simplificado) + [SemVer](https://semver.org/lang/es/).

**Cómo versionar este SO (semver):** **MAJOR** = cambio de proceso o de estructura (rompe cómo se usa el sistema: sesiones, ruteo, núcleo obligatorio). **MINOR** = doc/pilar nuevo o ampliación con compatibilidad hacia atrás. **PATCH** = correcciones (typos, refs rotas, IDs de modelo, fences, coherencia interna).

---

## [5.4.2] — 2026-07-07

**PATCH: protocolo A/B/C — fuentes garantizadas + listón de showcase (2ª prueba real).** Las
tipografías declaradas no cargaron (embed base64 fallido en silencio → las 3 opciones con la misma
serif de fallback) y las opciones eran correctas pero planas frente a los showcases reales.

### Fixed (54 + 16 + CLAUDE.md)
- **CARGA DE FUENTES GARANTIZADA**: receta canónica de Google Fonts (preconnect + display=swap, 1
  URL con todas las familias) · FALLBACK-TRAMPA (cada familia con fallback monospace en la
  comparativa — si la fuente no carga, el fallo GRITA en el screenshot) · verificación obligatoria
  clase por clase antes de presentar ("¿la A se ve redondeada? ¿la B grotesk?") · alternativa
  offline con @font-face verificando el peso del archivo.
- **REGLA DURA #3 — EL LISTÓN DE SHOWCASE**: las 3 opciones al nivel de Mobbin/Dribbble/Pinterest
  actuales — cada una con forma dominante propia, SISTEMA DE ÍCONOS propio (chip de color pleno,
  duotone o soft-3D con receta CSS — nunca pelados), elemento gráfico firma (blob/patrón/sticker/
  spot) y un momento de COLOR VALIENTE (coraje ≠ neón, capa anti-IA vigente). MOCKUPS LLENOS con
  datos semilla (media pantalla vacía = rehacer). 5 gates sobre el screenshot en el formato de
  presentación.

---

## [5.4.1] — 2026-07-07

**PATCH: protocolo A/B/C endurecido (hallazgo de prueba real).** El agente presentaba las 3
opciones solo en texto (preview en boilerplate) y como 1 diseño con 3 acentos.

### Fixed (54 + 16 + PLANTILLA-FICHA-ARTE + CLAUDE.md)
- **El entregable es un archivo visual**: página comparativa `direcciones-abc.html` autocontenida
  (o /dev/direcciones) con los 3 mockups lado a lado en frames de 375px; PROHIBIDO presentar solo
  texto o preguntar sin pegar la ruta + screenshot auto-verificado ("si el preview muestra el
  boilerplate, NO has terminado").
- **Divergencia real — regla de los 4 ejes**: cada opción diverge en ≥3 de 4 (clase tipográfica de
  fila DISTINTA del 29 · composición anclada a líderes distintos · paleta real · dispositivo);
  TEST DE DIVERGENCIA en escala de grises como gate. Con referencia: divergencia obligatoria en
  composición + dispositivo.
- Corregida la causa raíz documentada: el 54 decía "las 3 variantes comparten el mismo TSX (solo
  cambia globals.css)" — reescrito: cada opción tiene su PROPIA composición y tipografía.

---

## [5.4.0] — 2026-07-07

**MINOR: los 6 huecos de la "versión definitiva" (análisis estratégico de la experiencia completa).**

### Added
- **EL PUENTE DEL TRIAL (02C)**: mapa D1-D7 dentro de la app — primera victoria D1, insight de SUS
  datos D2-D3, inversión visible D4-D5, AVISO PRE-COBRO honesto D6 (baja reembolsos/chargebacks),
  agradecimiento+desbloqueo D7; indicador "Día 3 de 7" neutro; cada día trazable a un deseo de la
  ficha; métricas del puente. + C4bis en 50 (la verdad del puente bajo el CTA) + 58 (primera línea
  del dunning) + PLANTILLA-ESTADO.
- **TEST DE ESTRENO (48)**: la IA recorre landing→onboarding→paywall→primera sesión ENCARNANDO al
  avatar (dolor activo, objeción, su hora del día) y entrega narración en 1ª persona + las 3 fugas
  con fix — la evaluación EXPERIENCIAL que las rúbricas por pantalla no ven.
- **CERTIFICADO /100 (48 + /pre-lanzamiento)**: un solo número para el dueño con 6 pilares (VENTA
  /20 · FUNNEL /20 · PRODUCTO /20 · CONFIANZA /15 · VELOCIDAD /10 · RETENCIÓN /15), regla honesta
  (no medido = 0 y se dice), bandas ≥90/80-89/<80, guardado en ESTADO.md.
- **DATOS SEMILLA (32)**: la app nunca se enseña vacía — seed realista del mundo del avatar
  (comercios/nombres/montos del mercado, fechas relativas a hoy, progreso 40-70%) para screenshots
  del carrusel, revisor y demo; jamás en producción (flag). Tabla por nicho A-F. Cableado en
  SECUENCIA (prerrequisito del carrusel), PREFLIGHT y checklist núcleo ítem 2.
- **DESKTOP SIN VERGÜENZA (43 §13)**: decisión única por app (columna centrada max-w-md default
  B2C vs adaptativo real B2B), landing siempre adaptativa, funnel siempre max-w-md, screenshot
  1440px de las 3 pantallas clave.
- **RECETAS DE PROMPTS DESDE FICHA-ARTE (20)**: cero prompts genéricos de imagen — plantilla base
  compuesta con los hex/mood/dirección de la ficha, PACK MÍNIMO (logo, OG, hero, serie de
  ilustraciones, mascota→11, share card→56), coherencia de una sesión, fallbacks honestos.
- 3 filas nuevas de ruteo + Regla de Oro 6 y fila del 48 actualizadas.

---

## [5.3.0] — 2026-07-07

**MINOR: protocolo A/B/C universal + sistema de íconos y detalles premium.**

### Changed — PROTOCOLO A/B/C (54, ahora universal)
- La elección de estilo visual es SIEMPRE entre 3 opciones RENDERIZADAS a 375px de la misma
  pantalla clave (/dev/direcciones): sin referencia → 3 FUSIONES distintas de los líderes del
  nicho; CON referencia → 3 INTERPRETACIONES FIELES del contrato (divergen solo en lo que la
  imagen no fija). El usuario ELIGE A/B/C, COMBINA lo mejor ("la B con la tipografía de la A" →
  se re-renderiza), pide OTRAS 3 (sin repetir, descartadas anotadas) o ajusta un detalle. Es de
  las pocas preguntas legítimas al usuario (gusto). Propagado a 16 (contrato + PASO 0 + tarjeta),
  INICIO (Sesión 2 + análisis de referencias), PLANTILLA-FICHA-ARTE (campo de elección),
  CLAUDE.md (doctrina + 2 filas de ruteo) y aclarado el fallback de lógicas del 16.

### Added — SISTEMA DE ÍCONOS Y DETALLES (55, obligatorio en toda sección)
- REGLA MADRE: ninguna sección de landing/onboarding/paywall es SOLO texto; emojis como íconos
  PROHIBIDOS salvo pedido explícito. Íconos SVG (Lucide/Phosphor) siempre en contenedor premium
  (chip 40-48px, fondo acento 8-12%, radius del kit) — receta Tailwind incluida.
- Receta CSS copiable de HAIRLINE 1-2px con degradé (padding-box/border-box + color-mix), solo
  en 1-3 elementos clave por vista (el plan recomendado del pricing es el lugar canónico).
- REPERTORIO DEL DISEÑADOR: 10 detalles con mini-receta (number chips de pasos reales, separadores
  con fade, badge pills, textura del 54, sombras de color, highlight de titular sin gradiente de
  texto, bento, marcos de screenshot, checkmarks custom, hover con elevación) — reconciliado
  explícitamente con la capa anti-slop (funcional con tratamiento propio SÍ; decorativo regado NO).
- Blueprints del 55 actualizados sección por sección (los emojis 🛡/🔒/📸 de los propios blueprints
  reemplazados por SVG); 19 con remisiones + ítem de checklist; 49 con 2 componentes nuevos
  compilables (`<IconChip>`, `<GradientBorderCard>`); 50 (chips y trust row con SVG); 22 (regla
  anti-emoji dura); PROMPT-LANDING//landing con la regla; CLAUDE.md y DESIGN-CORE con la doctrina.

---

## [5.2.0] — 2026-07-07

**MINOR: la identidad visual se BASA EN LO QUE YA FUNCIONA (fusión de líderes).** Hallazgo de
prueba real: sin referencia del usuario, el SO derivaba combinaciones inventadas (dos serifs
compitiendo, degradé salvia→durazno) que ninguna app grande usa.

### Changed
- **16 — PASO 0.2bis "LO QUE YA FUNCIONA" (obligatorio, primero)**: sin referencia del usuario, se
  investigan las 3-5 apps LÍDERES del nicho + 1-2 gigantes admirados, se llena la TABLA DE LÍDERES
  (tipografía real→equivalente Google Fonts, lógica de color/degradés, radius/cards, navegación,
  celebración, patrón robable) y el brand kit se compone por FUSIÓN de lo mejor de cada una;
  diferenciación SOLO con acento perturbado + dispositivo ownable + copy. REGLA ANTI-INVENTO: si
  ninguna app líder usa algo parecido, no se propone — la novedad no es objetivo, la conversión sí.
- **29 — COMBINACIONES TIPOGRÁFICAS PROBADAS (método principal)**: reglas duras (patrón #1 = UNA
  sola sans en 2-3 pesos; 2 familias = display con carácter + body sans NEUTRA; NUNCA serif+serif;
  serif display solo editorial/lujo) + tabla de 10 combinaciones por nicho con referente real y
  equivalente verificado + DEGRADÉS QUE USAN LAS GRANDES (tonal/análogo ≤40°, nunca saltos raros).
  La "lista fresca" queda solo para el detalle propio.
- **54** reposicionado (fuente del dispositivo ownable, no sustituto de los líderes; si contradice
  a los líderes del nicho, mandan los líderes) · **PLANTILLA-FICHA-ARTE** con la TABLA DE LÍDERES
  y la combinación probada usada · **CLAUDE.md/DESIGN-CORE//diseno/INICIO/PROMPT-NUEVA-APP-FITNESS**
  alineados a la doctrina de fusión.

---

## [5.1.0] — 2026-07-07

**MINOR: doctrina DECIDE-INFORMA-AVANZA + 4 prompts complementarios nuevos + paquete DOCX.**
Hallazgo de prueba REAL con usuario: el agente preguntaba decisiones estratégicas ("¿hard paywall u
onboarding-first?", "¿qué framework?") a un usuario que no puede responderlas — incluso cuando ya
sabía la respuesta.

### Changed — DECIDE-INFORMA-AVANZA (CLAUDE.md → PREGUNTAR vs DECIDIR, reescrito)
- Toda decisión estratégica con respaldo del SO (modelo de monetización vía matriz A-F, framework,
  trial, longitud del onboarding, mecánicas de gamificación, "regla nunca", precio inicial
  propuesto) la DECIDE la IA con la data del SO, la anota en ESTADO.md con su evidencia, la INFORMA
  en 1 línea simple con opción de veto, y AVANZA. Preguntárselas al usuario queda PROHIBIDO.
- Al usuario solo se le pregunta lo que la IA no puede saber: gustos/identidad (siempre con
  opciones propuestas), contexto del negocio, acciones que cuestan SU dinero, credenciales, y
  eliminar trabajo hecho. Propagado a: 01 (la Constitución la REDACTA la IA, no es cuestionario),
  INICIO (regla 10), 02C (la decisión de modelo la toma la IA), y 8 prompts complementarios.

### Added — prompts complementarios
- **PROMPT-CRITICA-DE-EXPERTOS** (/critica-expertos): panel de 4 expertos brutalmente honestos
  (copywriter, director de arte, conversión/retención, inversionista escéptico) puntúa /10 por área
  con screenshots reales, top 10 por impacto en ventas, quick wins y veredicto "¿la comprarías?" —
  solo diagnóstico, ejecuta tras el OK.
- **PROMPT-EMAILS** (/emails): todos los correos del negocio (acceso post-compra, carrito, dunning,
  win-back, D1-D7, nurturing) con voz del arquetipo, deliverability y prueba E2E real.
- **PROMPT-VELOCIDAD** (/velocidad): performance en celular LATAM real — medir antes, arreglar por
  capas, medir después (budget del 38).
- **PROMPT-ANALITICA** (/analitica): instrumentación completa (taxonomía del 36, atribución,
  server-side) verificando que cada evento llega, conectada al backoffice.
- Menú de CLAUDE.md, GUIA-DE-LOS-PROMPTS y SETUP (25 comandos) actualizados.

### Fixed — pasada de pulido de los 20 prompts existentes
- Encabezado estándar ("📌 CUÁNDO USARLO" + instrucción de pegado) en todos.
- NUEVA-APP-FITNESS contradecía la doctrina v5 (diluía la referencia del usuario con la capa
  anti-IA) — alineado a REFERENCIA=CONTRATO.
- 6 prompts con referencias a contenido migrado (35→58, 47→59) corregidas; 5 prompts que tocaban
  UI sin exigir screenshot + revisor-visual al cierre — añadido.
- Carpeta distribuible completa en TXT + **paquete paralelo en DOCX** (24 prompts + "Guía de los
  Prompts — cuándo usar cada uno") generado y validado.

---

## [5.0.1] — 2026-07-06

**PATCH: prueba seca end-to-end completa (app simulada "Fuga", 8 sesiones + operación) + matriz de
cobertura de 52 pilares.** Veredicto de la prueba: el SO es ejecutable de punta a punta sin
callejones sin salida; 47/52 pilares CUBIERTOS. Los ~35 hallazgos (3 graves, resto fricciones)
quedaron corregidos:

### Fixed — graves (funnel anónimo)
- **26**: el middleware canónico redirigía a /login a todo el funnel anónimo (el modelo default) —
  ahora declara RUTAS PÚBLICAS y protege solo /app + API. Sección nueva USUARIO ANÓNIMO → CUENTA
  (estado versionado en navegador, migración validada por BFF, conflictos, otro dispositivo).
  Decisión Hotmart-first: magic link primario.
- **18**: implementación del Modelo 2A (anónimo→compra→cuenta con `sck`), tabla de idempotencia
  unificada, eventos de webhook corregidos (PURCHASE_DELAYED/EXPIRED — `PURCHASE_OVERDUE` no es
  del catálogo) + advertencia de verificar nombres en el panel.
- **50**: spec visual de LOGIN (no existía), estado de ERROR del loading "construyendo tu plan",
  háptica del funnel, objeción de eficacia/abandono, nombre obligatorio para el "Plan [Nombre]".

### Fixed — gates y costuras
- **02C**: tie-breaker nicho vs frecuencia + CÓMO SE RENUEVAN LOS CRÉDITOS (reset que no existía).
- **24**: RLS de user_progress con `with check`, timezone de la racha, disparo del hito (M2),
  matiz rachas-en-finanzas. **25**: period_start en user_quota. **30**: tope mensual del kill-switch.
- **48/PRE-LANZAMIENTO**: gate doble completo (≥36/40 Y ≥16/20), gate de performance del 38, y
  cierre de pendientes de ESTADO.md (screenshots reales del carrusel) en la puerta final.
- **55/19/50**: trial parametrizado (lo define 02C — prohibido inventarlo), fórmula del ahorro anual,
  convención de precios por moneda, CTA ≥52px unificado, dots del carrusel obligatorios.
- **revisor-visual**: RÚBRICA 4 de COPY /20 embebida, FICHA-ARTE como input activo (desvío = defecto),
  test anti-clon con las paletas de los ejemplos del 53 VETADAS, recibe la ruta del código.
- **16**: rama para referencia descrita/link (sin imagen) + filas dataviz/íconos en la extracción.
  **53**: regla de colisión nicho+modo (divergencia triple obligatoria). **17**: glow condicionado.
- **57/plantillas**: pregunta del costo de inacción, objeción de IA condicional, fila Bordes,
  personalidad compilada SIEMPRE. **34**: los ángulos de ads salen de FICHA-AVATAR (mapeo).
- **36**: nomenclatura de eventos resuelta (los de 24 en inglés = única excepción), eventos
  `momento_mostrado`/`logro_compartido` para el 56. **58**: cancelación vía portal Hotmart cubierta.
  **59**: 4 plantillas base de soporte. **47**: Colombia/Ley 1581 operativa + el agente redacta
  los borradores legales. **INICIO**: listas de sesión completadas (52§1bis, 11, 57, 17/24/56,
  31, 41/43/38). **05**: re-anclado a PREFLIGHT/DESIGN-CORE/53. **06**: rúbricas re-apuntadas +
  fallback del test con persona real. **04/02B**: longitud de onboarding por nicho + banco de
  preguntas de segmentación. **PROMPT-DEPLOY**: registro de la URL del webhook en Hotmart +
  RESEND_API_KEY + compra E2E en el cierre. **21/OPERACION-MENSUAL/PROMPT-LANZAMIENTO/08/19**:
  referencias stale del split 35→58 y sobre-promesas corregidas.

---

## [5.0.0] — 2026-07-06

**MAJOR: un archivo = un pilar.** Auditoría completa de pilares fusionados (mapeo de los 60+ docs
por pilares, líneas por pilar y ruteo) + self-check integral. Cinco separaciones ejecutadas donde la
fusión confundía el ruteo u obligaba a cargar cientos de líneas de un pilar para usar otro — y
veredicto explícito de NO separar donde la fusión es cohesión real (onboarding+paywall = un solo
funnel; 34 = mapa comparativo de canales; 31 = ciclo operar-IA).

### Changed — separaciones de pilares (contenido migrado íntegro, cero pérdida)
- **02B → 02B-ONBOARDING-Y-PAYWALL.md (304 l.) + 02C-PRICING-Y-MODELO-DE-NEGOCIO.md (444 l., nuevo)**:
  el pricing/modelo de negocio (3 modelos, matriz A-F, señuelo, créditos, puente de checkout,
  métricas, trial) es pilar propio — `/precios` ya no carga el funnel entero para tocar un precio.
- **35 → 35-LANZAMIENTO.md (179 l.) + 58-RETENCION-DE-INGRESOS.md (174 l., nuevo)**: lanzar y
  proteger el ingreso son momentos opuestos del negocio con comandos dedicados. 58 = churn
  voluntario, dunning, win-back, referidos, renovación anual (distinción explícita: 24 retiene el
  USO; 58 retiene el INGRESO).
- **07 → 07-PULIDO.md (408 l., fase pura) + RUBRICAS-DE-PANTALLA.md (248 l., nuevo)**: las rúbricas
  (/40 con anclas, craft /20, 5 ejes, severidad, gate cognitivo, gate doble) son la operación más
  frecuente del SO — ya no exigen cargar la fase de pulido. Verificado: idénticas a las embebidas
  del subagente `revisor-visual`.
- **09 (940→798 l., seguridad técnica PURA) + 47 → 47-LEGAL-FISCAL-Y-PRIVACIDAD.md (368 l.)**: el
  pilar legal (páginas legales, privacidad LGPD/LATAM, ToS, disclaimer IA, T&S) vive en UN solo
  lugar; duplicados 09/47 fusionados (ToS, links legales, checklists).
- **59-SOPORTE-CLIENTE.md (138 l., nuevo)**: soporte consolidado (antes repartido en 47 §2 + 31
  Parte 4) — canales por etapa, SLA, plantillas, IA+escalada, rescate de churn, métricas.
- **Deduplicación paywall**: línea de propiedad en 02B/50/52 (estrategia → 02B · layout/motion →
  50 · palabras/fórmulas → 52).
- **Pasada global de referencias**: ~150 menciones re-apuntadas en ~50 archivos según contexto
  (tabla de ruteo con filas nuevas para 02C/58/59/RUBRICAS, comandos, PROMPT-*.txt, catálogos,
  cross-refs); CERO referencias a los nombres viejos; carpeta distribuible re-sincronizada.

### Fixed — self-check integral
- Faltaban en el paquete: `PROMPT-NUEVA-APP-FITNESS.txt` y `.claude/commands/nueva-app-fitness.md`.
- 19 prompts de la carpeta distribuible estaban en v3 → sincronizados (21 + guía).
- Gate del revisor llevado a los PROMPT-*.txt canónicos (auditoria/diseno/landing) con fallback
  para entornos sin subagentes; gemelos arranque/retencion alineados; SECUENCIA-MAESTRA con
  Puerta de Etapa exigiendo screenshot + veredicto del revisor y gate de FICHA-AVATAR; catálogos
  (REFERENCIA-RAPIDA, INSTRUCCIONES, 00-SISTEMA-MAESTRO, SETUP con los 21 comandos) actualizados;
  conteos corregidos (núcleo de 10, rango 00-59, ~30 líneas del preflight).

---

## [4.1.0] — 2026-07-06

**El SO ahora vende a UN cliente ideal, no al aire.** Antes creaba landing/onboarding/paywall sin
saber a quién le vendía. Ahora: FICHA-AVATAR obligatoria + estructura de landing canónica inmutable.

### Added
- **`57-AVATAR-Y-CONSCIENCIA.md`** — el fundamento de toda la venta: avatar (con investigación
  voice-of-customer), problema urgente y diario, escalera de 5+ dolores en 3 niveles (superficial→
  emocional→identidad), 5+ deseos en 3 niveles, nivel de consciencia Y sofisticación del mercado
  (Schwartz, con tests de diagnóstico), 5+ objeciones con destino, PNL ética aplicada (sistema
  representacional, presuposiciones, future pacing, anclaje, límites éticos explícitos), y la
  TABLA DE MAPEO campo→pieza de copy con ejemplo completo trabajado. Regla madre: PROHIBIDO
  escribir venta sin FICHA-AVATAR.md aprobada — el copy se DERIVA (trazable), no se inventa.
- **`PLANTILLA-FICHA-AVATAR.md`** — la ficha persistente del cliente ideal (raíz del proyecto,
  inyectada por el hook de arranque junto a FICHA-ARTE.md; cosa juzgada).

### Changed
- **`19-PAGINA-DE-VENTAS.md`** — LA ESTRUCTURA CANÓNICA (INMUTABLE, 10 secciones que se repiten
  en toda landing del SO): 1) hero con 4 U's de Mark Ford + subtitular que potencia + visual o
  placeholder con sugerencia + CTA · 2) problema en 3-5 preguntas desde los dolores de la ficha ·
  3) agitación con costo de inacción cuantificado · 4) mecanismo único bautizado · 5) carrusel
  automático de screenshots de la app (placeholders hasta que la app exista → la IA toma los
  screenshots reales con Playwright al cerrarla, paso obligatorio) · 6) oferta anual+mensual AMBOS
  con prueba gratuita · 7) garantía con nombre · 8) FAQ desde las objeciones de la ficha · 9) CTA
  final emocional con future pacing + PS · 10) footer legal (páginas EXISTENTES, contenido según
  47). Prueba social día-1 en posición fija bajo el CTA del hero. Gate de avatar al inicio.
  No se reordena ni se recorta; solo copy (ficha avatar) y visual (ficha arte) cambian.
- **`55-DISENO-DE-LANDING.md`** — blueprints reordenados 1-10 al orden canónico + nuevos: placeholder
  de visual del hero, carrusel completo (frames 9:19.5, auto-scroll 25-30s pausable, mask fade,
  reduced-motion→manual, estado placeholder), pricing con trial en ambos planes, CTA final
  emocional, footer legal.
- **`52`** — nueva fuente única del copy (FICHA-AVATAR + test de traza), tabla de NEUROMARKETING
  por sección (saliencia, "me leyó la mente", aversión a pérdida, dotación, anclaje, future
  pacing), tabla Schwartz acotada (el nivel ajusta ÉNFASIS, nunca el orden canónico).
- **`02B`/`50`** — onboarding y paywall derivados de la ficha (preguntas←dolores,
  micro-compromisos←deseos, headline paywall←deseo #1, microcopy del CTA←objeción dominante).
- **Cableado**: hook de arranque inyecta FICHA-AVATAR.md; CLAUDE.md/AGENTS.md (Reglas 3 y 6,
  checklist núcleo ítem 8, 6 filas de la tabla de ruteo); CHECKLIST-CIERRE (traza + orden
  canónico); INICIO.md (Sesión 1 entrega la ficha aprobada; Sesión 3 canónica); PLANTILLA-ESTADO
  (sección "Avatar y venta"); comandos /landing y /onboarding-paywall + sus PROMPT-*.txt gemelos
  (gate de avatar); 32/REFERENCIA-RAPIDA sin residuos de "≥11 secciones".

---

## [4.0.0] — 2026-07-06

**MAJOR: de garantías declarativas a garantías MECÁNICAS.** Auditoría de 5 dimensiones (referencia
visual, ejecutabilidad con modelo medio, copy de respuesta directa, diseño emocional, arquitectura
de flujo) detectó la causa raíz del diseño genérico: el SO era un sistema de validación sin motor de
generación, y sus garantías dependían de que el agente obedeciera texto. Esta versión las convierte
en mecanismos (hooks, linter, subagente revisor, ejemplos compilables, ficha persistente).

### Added — mecanismos (antes no existían, solo se exhortaban)
- **`.mcp.json` con Playwright** — prometido por SETUP §4 desde v3.x pero AUSENTE del paquete; sin él
  toda la verificación visual caía en modo degradado.
- **`.claude/agents/revisor-visual.md`** — el "revisor independiente" ahora es un agente real con las
  rúbricas /40 y /20 EMBEBIDAS + test de fidelidad a la referencia + formato de veredicto fijo.
  Autoevaluarse la rúbrica queda prohibido (Regla de Oro 7, checklist de cierre, 12, plantillas).
- **`.claude/hooks/post-edit-diseno.sh`** — linter mecánico de diseño al editar .tsx/.css: hex fuera
  de tokens, `transition: all`, Inter/Roboto/system-ui, `min-h-full`, espaciados fuera de escala.
- **`session-start.sh` reescrito**: inyecta el CONTENIDO de FICHA-ARTE.md + PREFLIGHT en cada sesión
  (incluida la vuelta de una compactación) — las decisiones visuales ya no dependen de "lee el archivo X".
  `pre-compact.sh` ahora exige checkpoint escrito en ESTADO.md antes de compactar.
- **`PLANTILLA-FICHA-ARTE.md`** — la dirección de arte vive en FICHA-ARTE.md en la raíz del proyecto
  (extracción de la referencia, brand kit, personalidad compilada, trazabilidad, vetos) y sobrevive
  sesiones y compactaciones.
- **`PREFLIGHT-PANTALLA.md`** — tarjeta de ~25 líneas que se relee ANTES de cada pantalla, con la
  SPEC PRE-CÓDIGO en YAML (el diseño se ancla antes de improvisar en JSX).
- **`53-PANTALLA-CANONICA.md`** — 2 pantallas ejemplares COMPLETAS y compilables (clara/editorial y
  oscura/densa: globals.css @theme + page.tsx con las 7 baseline implementadas) — verificadas con
  tsc --strict y PostCSS. "Copia la COMPOSICIÓN, nunca los valores."
- **`54-BANCO-DE-DIRECCIONES.md`** — 12 direcciones nombradas (paleta + par tipográfico único +
  dispositivo ownable CON receta CSS + motion signature) + regla de perturbación obligatoria +
  registro anti-repetición + protocolo de 3 DIRECCIONES DIVERGENTES renderizadas (el usuario elige).
- **`55-DISENO-DE-LANDING.md`** — el hermano visual del 50 para la landing: hero con medidas a 375px,
  pricing table con señuelo, sticky CTA, ritmo de secciones, animaciones de scroll.
- **`56-MOMENTOS-EMOCIONALES.md`** — los 7 momentos que retienen (primera victoria, hito de racha,
  level-up, racha en riesgo, racha rota, vuelta tras abandono, share card) con blueprint + timeline
  + copy por 4 arquetipos + 2 componentes TSX completos (CelebrationOverlay, StreakAtRisk).

### Changed — protocolo REFERENCIA=CONTRATO (arregla "ignora mi imagen de referencia")
- **16**: nueva sección obligatoria al inicio — la referencia del usuario MANDA sobre la capa anti-IA
  y las tablas del 29; distinción referencia-mandato vs referencia-investigación ("no clonar el hex"
  aplica SOLO a la segunda); TABLA DE EXTRACCIÓN de 16 campos (mirando la imagen); TEST DE FIDELIDAD
  al cierre (screenshot al lado de la referencia, ≥2 desvíos = corregir). + tarjeta "SI SOLO PUEDES
  RETENER 15 LÍNEAS".
- **29**: hex de las tablas PROHIBIDOS literales (perturbar hue ±10-25°); 3 candidatas tipográficas
  obligatorias; lista fresca ampliada a ~35 fuentes verificadas; REGISTRO ANTI-REPETICIÓN.
- **10**: gate "tokens antes de código" — prohibido codear UI con placeholders; el :root se llena y
  se muestra al usuario ANTES de la primera pantalla.
- **Contradicciones resueltas**: "dark-first default" eliminado de 16/32/14/29 y /diseno (el modo se
  DERIVA); glow/crema+serif+terracota armonizados; 07 limpiado de código legacy que violaba la
  doctrina (`transition: all`, nuke de reduced-motion, `ring:` inválido, "¡Listo!"); baselines y
  anti-slop deduplicados a DESIGN-CORE como fuente única; DESIGN-CORE §7 declarado EL ÚNICO checklist
  de cierre (los demás son consulta).
- **19/52/02B**: Big Idea + MECANISMO BAUTIZADO (regla dura), oferta Hormozi completa (ecuación de
  valor, stack, garantía diseñada, PS), oferta de fundadores operativa, SWIPE FILE (10 plantillas +
  24 headlines por nicho), PROCESO OBLIGATORIO DE HEADLINE (10 variantes + 4 U's + test del bar +
  intercambiabilidad), RÚBRICA DE COPY /20, Schwartz completado a 5 niveles con tabla nivel→landing,
  efecto señuelo de 3 planes con receta numérica.
- **11/24/50**: sistema de personaje operativo (árbol de decisión + 5 estados + pipeline IA),
  COMPILADOR DE PERSONALIDAD (adjetivo → valores), MATRIZ DE VOZ 4 arquetipos × 8 momentos, pushes
  con voz, plan con nombre propio, spec de Lottie/ilustración.
- **CLAUDE.md/AGENTS.md**: Reglas de Oro 1/3/7 reescritas (preflight por pantalla, FICHA-ARTE.md
  como memoria, revisor obligatorio, fidelidad); tabla de ruteo con 53/54/55/56 y la fila de
  referencia visual; checklist de cierre núcleo actualizado. `12`: protocolo del revisor con tope de
  3 iteraciones. `INICIO.md`: análisis de referencias separado en mandato vs investigación.
  Comandos `/diseno` y `/landing` reconectados. SETUP con los 5 hooks + inspector explicados.

---

## [3.3.0] — 2026-07-02

### Added — pasada de diseño integral basada en investigación 2026 (RevenueCat, Emil Kowalski, Rauno Freiberg, Refactoring UI, guía de estética frontend de Anthropic)
4 investigaciones en paralelo (animaciones premium, UX/diseño de conversión de RevenueCat, tipografía/color por nicho, e inventario de los docs de diseño del SO). Hallazgo: los archivos de diseño ya son muy sólidos en lo básico — se rellenaron SOLO los huecos concretos que la investigación 2026 confirmó, sin reescrituras ni bloat:
- **`22-LIBRERIAS-Y-CRAFT.md`**: nuevas "4 reglas de ejecución" que convierten las 7 animaciones baseline de amateur a premium — arranque proporcional (nunca desde scale(0)/salto grande; el tell #1 de motion amateur, Rauno), salidas más rápidas que entradas (250-300 entra / 150-200 sale), solo transform+opacity (GPU), spring para interactivo + curva para opacity.
- **`16-DIRECCION-DE-ARTE.md`**: (1) táctica "derivar el color de una referencia CULTURAL" (cabaña de esquí 70s → naranja quemado/aguacate) en vez del selector de tono — el antídoto documentado contra el morado genérico. (2) Números del tratamiento tipográfico bespoke (contraste de peso extremos 800/900 vs 400 nunca 400-vs-600, saltos de tamaño 3×+, tracking por tamaño, `opsz`, line-height por rol). (3) Valores concretos de la firma de movimiento por arquetipo (tripleta bounce/stagger/duración; `bounce>0.3` solo en juguetón/kids).
- **`29-REFERENCIA-VISUAL.md`**: pares tipográficos frescos 2026 que faltaban — Mona Sans+Hubot Sans (productividad, GitHub open-source), display+monospace para IA/creativo, y guía fresca por nicho (Fraunces+Hanken bienestar, Gambetta/Boska+Manrope finanzas).
- **`50-DISENO-ONBOARDING-PAYWALL.md`**: el descuento/ahorro como el elemento MÁS ruidoso del paywall (RevenueCat: +20% al subirlo a badge grande contrastante) + equivalente mensual como ancla; el tipo de visual sigue al vertical (ilustración para lúdico/consumer, capturas reales+reseñas para utilidad/finanzas).
- **`43-MICRO-CRAFT-Y-EJECUCION.md`**: regla dura de inputs ≥16px en mobile (evita el zoom-on-focus de iOS — el tell #1 de "web, no app").
- **`DESIGN-CORE.md`**: 2 tells de diseño-IA nuevos de 2026 a la lista anti-slop — cards anidadas dentro de cards (el tell más común del dashboard-IA) y paleta tímida/repartida sin dominante.
- Fences verificados balanceados en los 6 archivos; sin referencias rotas.

---

## [3.2.1] — 2026-07-02

### Added — 6 patrones extraídos de una prueba real del SO (app "Constancia", app-prueba3, Sonnet 5 esfuerzo medio)
El usuario probó el SO de cero en una sesión aparte, obtuvo una app decente pero tuvo que pedir
varias rondas de pulido manual sobre el onboarding, el paywall y la app interna. Se auditó el
código ya corregido de esa sesión y se extrajo el patrón GENERAL de cada corrección puntual, para
que la próxima app lo tenga bien desde el primer intento:
- **`50-DISENO-ONBOARDING-PAYWALL.md`**: (1) escape hatch obligatorio "Otra cosa (escribí la tuya)"
  en toda pregunta de categoría ABIERTA (meta, hábito, nicho) — las preguntas de categoría cerrada
  (sí/no, horario, frecuencia) no lo necesitan. (2) Nuevo patrón "input con sugerencias que
  rellenan, no seleccionan" para metas en las propias palabras del usuario — el chip llena el
  campo editable, nunca avanza el paso solo. (3) Fórmula de copy de 3 pasos (nombrar el patrón
  exacto → quitar la culpa con la causa real → nombrar el mecanismo propio) para que las pantallas
  de reconocimiento conecten con el avatar específico, no con ánimo genérico intercambiable. (4)
  Mini-visual con los colores REALES de la app en las pantallas que explican el mecanismo
  diferenciador (mismo principio que "mockups honestos" de `19`, aplicado dentro del onboarding).
- **`52-COPY-VISUALES-CONVERSION.md`**: nuevo patrón "12bis" — usar la propia investigación de
  mercado de la Sesión 1 (apps de referencia con métricas reales) como autoridad de Cialdini en el
  paywall, sin esfuerzo extra y sin inventar nada.
- **`32-DEL-MVP-AL-PRODUCTO.md`**: nueva sección "4 detalles de enriquecimiento" + checklist final
  ampliado — cero íconos de texto/Unicode/emoji haciendo de ícono funcional (siempre Lucide/
  Phosphor), hitos de celebración en todo contador de progreso (compatible con mecanismos
  anti-culpa), tarjeta de resumen agregado en toda sección de historial/calendario, y el chequeo de
  "función muerta" (si el sistema técnico soporta algo —ej. modo claro/oscuro—, tiene que ser
  alcanzable desde la UI, no solo existir en los tokens).
- Fences verificados balanceados en los 3 archivos tocados.

---

## [3.2.0] — 2026-07-02

### Fixed — auditoría final end-to-end de los 5 pilares del SO (ventas/onboarding/paywall, diseño, arquitectura/seguridad/datos, construcción/secuencia, crecimiento/operación/legal)
5 agentes en paralelo re-auditaron el SO completo con ojo escéptico (asumiendo que las mejoras
previas podían tener huecos nuevos). Se corrigieron los hallazgos con impacto real; se descartaron
observaciones puramente cosméticas (vaguedad inherente a guías de diseño/copy que no necesitan un
número para cada palabra):
- **`10-DESIGN-TOKENS.md`**: la afirmación "dark-first es la base" contradecía directamente a
  `16-DIRECCION-DE-ARTE.md` (el modo se DERIVA, claro suele ser más distintivo hoy) — reescrita
  para aclarar que el `:root` oscuro es solo andamiaje técnico de partida, no una recomendación.
  Reconciliados los radios de borde (botones 12-16px, no 8px) y la escala de espaciado (se
  eliminaron `--space-5`/`--space-10` que rompían la regla "solo estos 8 valores").
- **`14-LEYES-DE-DISENO.md`**: aclarado que la escala tipográfica de 6 niveles es la paleta
  completa, no una obligación de usar los 6 a la vez (máx 3 por pantalla, per DESIGN-CORE).
- **`04-ARQUITECTURA.md`** y **`05-CREACION.md`**: la corrección de "no presentarle al usuario
  decisiones técnicas" (ronda anterior) no se había propagado aquí — agregadas notas explícitas +
  cross-reference al presupuesto de copy de `52` para que no se improvise copy de venta desde estos archivos.
- **`27-REVISION-SEGURIDAD.md`**: la verificación de firma de webhook apuntaba a "ver 18" de forma
  genérica — ahora apunta a la sección exacta ("SEGURIDAD DEL WEBHOOK DE HOTMART") que SÍ tiene
  código completo y correcto (verificado, no hacía falta escribirlo de nuevo). Prompt-injection
  (A05) ahora tiene el patrón concreto (datos vs instrucciones, zod, confirmación humana) en vez de
  la frase suelta "no ejecutar acciones según texto del usuario".
- **`09-SEGURIDAD.md`**: una llamada a `SUPABASE_ANON_KEY` (nomenclatura legacy) coexistía con la
  nomenclatura nueva (`SUPABASE_SECRET_KEY`) en el mismo archivo — corregida a
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con referencia a `51-STACK-PINEADO.md` §5.
- **`34-ADQUISICION-Y-TRAFICO.md`**: suavizaba demasiado la viabilidad de 50% de comisión recurrente
  frente a la advertencia estricta de `40-UNIT-ECONOMICS.md` (margen ≤0 a precios típicos) —
  endurecido el texto para que no se lea como "opción válida con solo recalcular".
- **`24-GAMIFICACION.md`**: la regla simple de "congelador de racha" (1 congelador = salva cualquier
  ausencia) contradecía el código más abajo (1 congelador POR día fallado) — aclarado inline.
- Chequeo mecánico completo corrido: sin referencias rotas, `AGENTS.md`==`CLAUDE.md`, fences
  balanceados en los 8 archivos tocados en esta ronda.

---

## [3.1.3] — 2026-07-02

### Added — pasada final de auto-auditoría obligatoria (el bug que dejaba pasar violaciones ya "revisadas")
Error real detectado: cada sección se revisaba al escribirla, pero nadie recorría la pantalla
COMPLETA al final — así sobrevivieron 2 bullets de beneficios de 14-16 palabras y respuestas de FAQ
largas en una landing que ya había pasado por la Fase 1-5 de mejora.
- **`52-COPY-VISUALES-CONVERSION.md`**: nueva sección "PASADA FINAL DE AUTO-AUDITORÍA" — recorrido
  de arriba a abajo DESPUÉS de terminar de escribir todo, contando palabras contra el presupuesto en
  cada elemento. Nueva excepción documentada para respuestas de FAQ (contenido bajo demanda: hasta
  ~18-22 palabras en 2 oraciones cortas, nunca una sola oración compuesta larga).
- **`19-PAGINA-DE-VENTAS.md`**: checklist con el ítem de la pasada final.
- Aplicado a la landing real: 2 bullets de beneficios acortados, las 5 respuestas de FAQ reescritas
  más cortas y directas. tsc ✓ build ✓ verificado.

---

## [3.1.2] — 2026-07-02

### Fixed — reglas de copy sin números duros permitían texto largo y secciones puramente textuales
Error real detectado: el subtítulo del hero tenía 35 palabras y ocupaba 5 líneas en mobile — la
regla "máx 2 líneas" ya existía en `52` pero en prosa, sin un conteo verificable. Varias secciones
de la landing eran solo párrafos de texto sin ningún elemento visual, y no existía un patrón para
assets (foto/video) que la IA no puede generar.
- **`52-COPY-VISUALES-CONVERSION.md`**: nueva sección "PRESUPUESTO DE COPY" con topes numéricos
  exactos por tipo de elemento (headline ≤8-10 palabras, subheadline ≤12-14, bullet ≤10-12, párrafo
  ≤2 líneas mobile) — auto-auditable contando palabras, no "a ojo". Nueva sección "DENSIDAD VISUAL"
  (ninguna sección con 3+ bloques de texto seguidos sin ícono/mockup/foto). Nueva sección
  "PLACEHOLDER DE ASSET REAL" — patrón de caja punteada + ícono + instrucción de 1 línea para
  fotos/videos que la IA no puede generar (distinto de los mockups honestos de UI).
- **`19-PAGINA-DE-VENTAS.md`**: checklist actualizado con los 3 puntos de arriba.
- Retrofit de la landing real (`app/`): subtítulo del hero de 35→11 palabras; secciones de
  "problema" y "diferenciación" con ícono por card; sección "solución" (era un párrafo largo) ahora
  es un mini value-stack visual de 3 líneas cortas; nuevo componente `AssetPlaceholder.tsx` con un
  placeholder de video del fundador insertado en la banda de identidad.

---

## [3.1.1] — 2026-07-02

### Fixed — el agente exponía decisiones técnicas internas como si necesitaran aprobación del usuario
Error real detectado: en Sesión 1, el agente presentó el modelo de datos y el método de auth (temas
100% de implementación) como un mini-acuerdo a confirmar con el usuario — mezclando decisiones de
PRODUCTO (que sí se preguntan) con decisiones de IMPLEMENTACIÓN (que se deciden y documentan solas):
- **`CLAUDE.md`/`AGENTS.md`**: Regla de Oro 6 aclara que los 3 pilares técnicos son decisión interna,
  no de producto — se anotan en ESTADO.md sin presentárselos al usuario. "PREGUNTAR vs DECIDIR"
  ahora incluye explícitamente modelo de datos/RLS, método de auth y arquitectura de IA bajo "Decide
  solo", con la razón (el usuario no gana nada sabiendo el nombre de una tabla).
- **`INICIO.md`** (regla 9 de conducción): separa explícitamente decisiones de producto/negocio
  (sí se confirman, agrupadas) de decisiones de implementación pura (se ejecutan directo).
- **`SECUENCIA-MAESTRA-CONSTRUCCION.md`** (Paso 6): agrega el detalle de CÓMO se guía la única etapa
  con acompañamiento manual (servicios externos) — incluye abrir `.env.local`, pegar claves,
  confirmar antes de seguir. Deja explícito que es la ÚNICA etapa así; las anteriores no piden nada al usuario.
- `AGENTS.md` resincronizado byte a byte con `CLAUDE.md`. Self-check corrido: sin refs rotas, fences balanceados.

---

## [3.1.0] — 2026-07-02

### Added — Fase 1 de auditoría de copy/conversión: fórmulas deterministas + evidencia real de apps ganadoras
Tras detectar (auditoría de dos agentes: inventario de huecos + investigación de fuentes externas) que `19` y `52` citaban principios correctos pero sin fórmula replicable, se agregó:
- **`52-COPY-VISUALES-CONVERSION.md`**: sección "1bis" con la fórmula de las 4 U's (AWAI/Michael Masterson) + niveles de consciencia de Schwartz para calibrar el ángulo del titular; sección "2bis" con 12 patrones validados extraídos de teardowns reales con fuente citada (Duolingo, Cal AI, Tiimo, Flo, Asana — RevenueCat, Lenny's Newsletter, TechCrunch, growthcurve.co, retention.blog, Auth0, entre otras); método "Fascinations" de Copyhackers para bullets; advertencia ética con caso real (Apple retirando Cal AI de la App Store por dark pattern de facturación, abril 2026).
- **`19-PAGINA-DE-VENTAS.md`**: arco narrativo StoryBrand SB7 como columna vertebral de las 11 secciones; guía de "mockups honestos pre-lanzamiento" (jerarquía de fidelidad cuando la app interna aún no existe — nunca screenshots falsos); checklist de cierre actualizado.
- Ambos checklists de cierre actualizados con los criterios nuevos. Sin archivos numerados nuevos (se integró en los existentes para no romper el ruteo ni el conteo del self-check).

### Added — Fase 2: onboarding y paywall heredan los patrones y fórmulas de la Fase 1
- **`02B-ONBOARDING-MONETIZACION.md`**: nueva sección "Patrones reales de apps ganadoras" (resumen aplicable de los 12 patrones de `52`); cifras actualizadas de RevenueCat (State of Subscription Apps 2025: 12.1% vs 2.2% conversión hard-paywall/freemium, ~8x ingreso a 14 días, ~50% de trials inician en onboarding); referencia a la fórmula 4 U's para el titular del paywall.
- **`50-DISENO-ONBOARDING-PAYWALL.md`**: pregunta de atribución ("cómo nos conociste", patrón Cal AI) y pre-poblado "Sugerir por mí" (patrón Tiimo) añadidos a la especificación de preguntas de onboarding; ritual de micro-compromiso pre-paywall opcional (patrón Flo, "mantener presionado"); guía de mockups honestos cuando el backend de pago aún no existe; referencia a las 4 U's en el headline del paywall.
- Ambos checklists de cierre actualizados. Fences verificados balanceados en los 4 archivos tocados hasta ahora (`52`, `19`, `02B`, `50`).

### Added — Fase 3: referencias cruzadas menores (sin reescritura — estos archivos ya cubrían bien lo suyo)
- **`15-PATRONES-UX.md`**, **`11-DISENO-EMOCIONAL.md`**, **`24-GAMIFICACION.md`**: una línea de referencia cruzada cada uno apuntando a `52-COPY-VISUALES-CONVERSION.md` para copy persuasivo/de venta, evitando que un agente futuro escriba headline o paywall desde el archivo de tono/mecánica en vez del de conversión. `42-UX-WRITING.md` ya tenía esta referencia — sin cambios ahí.
- Self-check de coherencia interna corrido tras las Fases 1-3: sin referencias rotas, `AGENTS.md`==`CLAUDE.md`, sin docs huérfanos de la tabla de ruteo, fences balanceados en los 7 archivos tocados.

---

## [3.0.0] — 2026-07-02

### Changed/Added — MAJOR: de "exhortación" a MECANISMO + capa de diseño rediseñada (plan de mejora integral, 6 fases)
Auditoría end-to-end con 5 frentes (núcleo, diseño, negocio, ingeniería, growth) → PLAN-MEJORA-SO.md ejecutado completo:
- **Paquete nativo de Claude Code (`.claude/`)**: 21 slash commands (uno por PROMPT-*.txt + 7 nuevos), hooks (SessionStart/PostToolUse-tsc/Stop-gate/PreCompact), permisos pre-aprobados, `.mcp.json` con Playwright para el gate visual, `scripts/release.sh` (reempaque verificado) y `scripts/audit-diseno.sh` (auditoría mecánica anti-slop). Setup para no técnicos en `SETUP-CLAUDE-CODE.md`.
- **Capa de diseño**: `DESIGN-CORE.md` (núcleo canónico único que reemplaza el bundle de 9 archivos y los ~10 checklists solapados; doctrinas resueltas: ease-out en salidas, umbral spinner/skeleton, onboarding por 02B, modo derivado, una familia de curvas), `49-SISTEMA-DE-COMPONENTES.md` (inventario canónico + receta de des-shadcn-ización), `50-DISENO-ONBOARDING-PAYWALL.md` (spec VISUAL de las 2 pantallas que venden), paletas LIGHT por nicho en 29 + scaffold light y anti-FOUC y Tailwind v4 en 10, PASO 0.48 de referencias reales (Mobbin) en 16, keyboard/offline/scroll/thumb-zone en 43, PWA e ilustración in-app en 20, rúbrica de CRAFT /20 con gate doble (≥36/40 usabilidad Y ≥16/20 craft) puntuada por REVISOR INDEPENDIENTE (12). Contradicciones barridas en 03/11/14/15/41.
- **Negocio**: "EL PUENTE DE CHECKOUT" en 02B (fricción real del checkout Hotmart vs benchmarks de app store, con métricas separadas), landing bifurcada por modelo en 19/PROMPT-LANDING, gate de validación con matemática realista y FLUJO A sin loophole en 02, "qué se puede y qué NO en Hotmart" + verificación sandbox del evento de trial + graduación de plataforma en 18, prueba social en frío y claims publicitarios seguros en 19/47, capa legal de suscripción en 47, mini-teardown competitivo en 01, comisión de afiliados alineada 30-40% (40↔34).
- **Ingeniería**: `51-STACK-PINEADO.md` (scaffold canónico, Next 16/Tailwind 4/claves Supabase nuevas, verificado jul-2026), rate limiting canónico en 09 (Postgres atómico + Upstash), VIDEO asíncrono en 30, matriz "cuándo activar cada módulo" en 32. Correcciones críticas: snippet de IA con headers y solo-servidor (05), CSP con nonce (09), middleware SSR de Supabase (26), `with check` en RLS de 30/26/33, params async (39/45), CLI de Supabase (25).
- **Growth y ciclo de vida**: píxel/CAPI en Hotmart como gate del paid + WhatsApp + tácticas LATAM en 34, pausa de suscripción corregida (Hotmart controla el cobro) + checklist D-14→D+7 + prerrequisito 46/47 en 35, y 7 prompts/comandos nuevos: RETENER-INGRESOS, OPERACION-MENSUAL, ITERACION-FEEDBACK, SOPORTE, CONTENIDO-SEMANAL, PRECIOS (+ NUEVA-APP-FITNESS reescrito sin dependencia de imagen ni look neón). `GUIA-DE-LOS-PROMPTS.md` reemplaza a la guía Word (flujo + prerrequisitos, no catálogo).
- **Gobernanza**: CLAUDE.md adelgazado (la referencia por dominio → `CHECKLIST-CIERRE.md`), tabla de ruteo actualizada (DESIGN-CORE/49/50/51/SETUP/GUIA), cifras no verificadas marcadas o retiradas, INSTRUCCIONES/REFERENCIA-RAPIDA remiten a INICIO (8 sesiones), CHECKPOINT en PLANTILLA-ESTADO, self-check con rutas relativas, AGENTS.md generado por script.

---

## [2.11.0] — 2026-06-26

### Added — pilar nuevo `48-RIGOR-DE-ENTREGA.md` + circuit-breaker de costo de IA (que la v1 salga CASI PERFECTA y el usuario corrija lo mínimo)
Pensando fuera de la caja: el patrón de fondo de casi todo lo que el usuario tuvo que corregir (flujos a medias, paywall faltante, output flojo, detalles de encaje, secuencia) es que el SO construye bien pero NO tenía una capa final de RIGOR DE ENTREGA. Nuevo pilar transversal que actúa como QA despiadado + fundador preocupado + operador servicial antes de declarar "listo":
- **`48-RIGOR-DE-ENTREGA.md`** (nuevo): (1) **Auto-QA end-to-end** — manejar la app como usuario real, tocar cada elemento, recorrer cada flujo, 6 estados, casos borde, primer arranque vacío (compilar ≠ probar); (2) **Pre-mortem** (Gary Klein) — imaginar el fracaso a 1 semana y corregir los top riesgos + test del desconocido; (3) **Invariantes que no pueden fallar** — dinero (gating en servidor, webhook idempotente, refund/chargeback), datos (no se pierden, export, soft-delete), seguridad (IDOR, RLS, secretos); (4) **Circuit-breaker de costo de IA** — tope global + por-usuario + kill-switch + alerta (evita la factura sorpresa de miles); (5) **Calidad del OUTPUT de IA** — que el resultado sea bueno/completo/en-marca, no slop (rúbrica/golden set de 31); (6) **Manual del Dueño** — `MANUAL-DEL-DUEÑO.md` con cuentas/claves/deploy/tareas comunes/runbook en lenguaje simple; (7) **Cadencia de mantenimiento** (claves, dominio, backups, deps, costos). + CHECKLIST DE ENTREGA como puerta final.
- **`30-INTEGRACION-IA.md`**: detalle técnico del **circuit-breaker de gasto** (3 capas: por-usuario, global con kill-switch, anti-loop) con código de verificación de presupuesto antes de cada llamada cara.
- **Tejido en el SO**: fila de ruteo en `CLAUDE.md`/`AGENTS.md`; Regla de Oro 6 ("antes de vender, corre 27 Y la puerta 48 — sin 48 no está lista"); Sesión 6 del plan en `INICIO.md` (entregable incluye el checklist de 48 + el manual); `00-SISTEMA-MAESTRO.md` y `REFERENCIA-RAPIDA.md`; `PROMPT-PRE-LANZAMIENTO.txt` ampliado con el punto 10 (rigor de entrega).

Fuentes: técnica de pre-mortem (Gary Klein/HBR), prácticas de SRE/runbooks, y el patrón observado al auditar las apps reales construidas con el SO.

---

## [2.10.0] — 2026-06-26

### Changed — auditoría de 2ª app real ("Habi", hábitos) → color por nicho, micro-craft y persuasión de paywall/onboarding
La 2ª app construida con el SO mejoró mucho (onboarding-first de 9 pasos, paywall, loop de retención, fuente fresca), pero la corrida destapó 3 fallas, corregidas con investigación:
- **Color genérico para el nicho** (la app de hábitos salió marrón oscuro + ámbar, sombría, no motivadora). Fix: **`16` PASO 0.5 + `29`** — la paleta se VALIDA contra los GANADORES del nicho (estudiar 3-5 apps exitosas del nicho exacto y extraer su lógica de color), debe servir al trabajo emocional del nicho (hábitos = positivo, victoria visible, verde=hecho — BJ Fogg), y NO defaultear a "oscuro + 1 acento" (muchos géneros ganan en claro/multicolor). Test: "¿un usuario del nicho sentiría 'esto es para mí' en 1 segundo?".
- **Micro-craft con desencajes** (anillo "1" sobre "/1" sin centrar; chip "🔥 1" con hueco muerto a la derecha). Fix: **`43` nueva sección 8 "Encaje y centrado óptico"** + ítems de checklist — chips/badges ABRAZAN su contenido (`w-fit`, cero hueco muerto), números compuestos en UNA composición centrada ópticamente, centrado óptico real (no solo `items-center`).
- **Paywall/onboarding sin profundidad de persuasión.** Fix: **`02B` nueva sección "LA CAPA DE PERSUASIÓN"** — los 7 principios de Cialdini aplicados (compromiso/consistencia, reciprocidad, prueba social, autoridad, escasez real, simpatía, identidad), gatillos de copywriting (aversión a la pérdida, anclaje, especificidad, emoción-primero, "cada pregunta devuelve algo" de Noom, review prompt a mitad del onboarding de Cal AI, CTA en 1ª persona), con el dato de que ~95% de la decisión es subconsciente — todo con límite ético explícito (gatillo real, nunca dark pattern).

Fuentes: RevenueCat (pricing psychology), Cialdini (*Influence*), casos Duolingo/Noom/Cal AI (UX teardowns), BJ Fogg (visible win), color psychology (Angela Wright), apps de hábitos (Streaks, Productive, Finch, Atoms, Way of Life).

---

## [2.9.0] — 2026-06-26

### Changed — auditoría de una app REAL construida con el SO (app "Imán") → 4 gaps de proceso/producto corregidos
Se auditó end-to-end una app que un usuario construyó con el SO. El SO hizo mucho bien (Constitución, validación FLUJO A, nicho D preview→paywall, pricing, atomicidad de cuota), pero la corrida destapó 4 fallas reales:
- **Secuencia: el paywall y el wow real quedaban para el final.** El agente construyó dos generadores con datos DEMO + onboarding y se fue al backend (cuentas/planes/nube) SIN haber construido el paywall ni probado la primera victoria con IA real. Fix: **`INICIO.md` + Regla 6 de `CLAUDE.md`/`AGENTS.md`** — construir temprano la **"columna vertebral de venta"** completa (primera victoria REAL con IA conectada + onboarding + el MOMENTO DE PAYWALL como pantalla de primera clase + la superficie de retención), aunque la persistencia sea local/mock; "backend primero" = el BFF de la acción core para que el wow sea real, NO posponer lo que vende.
- **"Generador + historial" no es una app de suscripción** (la app salía con pocas utilidades). Fix: **`01-IDEACION.md` + `24`** — el MVP DEBE incluir ≥1 **superficie de retención** (el loop del 24 hecho PANTALLA: calendario, biblioteca que se remixa, métricas), no diferirla a V2; la lista de features para apps de GENERACIÓN ahora incluye la superficie de retención como obligatoria, no opcional. Reconciliado con la disciplina de features: la superficie de retención está PROTEGIDA del recorte porque ES la razón de pagar.
- **El artefacto salía incompleto** (carruseles de texto sin imágenes, pese a prometer "listo para publicar"). Fix: regla de **artefacto completo = igual a la promesa** (si es visual, CON imágenes/diseño, no solo texto); el wow debe IGUALAR la promesa.
- **Faltaba cerrar el loop** (crear→publicar→medir→mejorar). Fix: medir-el-resultado se documenta como la palanca de retención #1, con nota honesta de **factibilidad** (APIs sociales tienen fricción real — empezar liviano: métricas pegadas/subidas por el usuario, o integración acotada), atado al pilar 3 de factibilidad de `01`.

---

## [2.8.0] — 2026-06-26

### Changed — identidad visual con "dientes" anti-genérico (el SO entregaba brand kits que "huelen a IA")
Al probar el SO, sus propuestas de identidad visual salían genéricas (oscuro + acento + glow, o el par editorial "seguro") aunque el protocolo de `16` ya era sofisticado. El problema: la teoría no tenía RESTRICCIONES NEGATIVAS, así que el "default estadístico" de IA se colaba. Investigación (Refactoring UI, "por qué todas las apps de IA se ven iguales", Pendo/NN-g, font-pairing, Marty Neumeier *Zag*) convertida en una capa con teeth:
- **`16-DIRECCION-DE-ARTE.md` — nueva sección "LA CAPA ANTI-IA"**: (1) el look de IA tiene RECETA y banderas rojas nombradas (#000/#fff puro, neón morado/cian, glow regado, tarjeta glass + orbe de gradiente, jerarquía por peso) — 3+ = recházalo; (2) **restricción negativa por defecto** (prohibido neón/negro puro/glow/glass salvo que el arquetipo lo justifique) + referencia positiva concreta; (3) el **MODO oscuro/claro se DERIVA, no se asume oscuro** (claro/editorial suele ser MÁS distintivo hoy); (4) tácticas "se ve diseñado" (casi-negro con tinte, grises con temperatura, profundidad de 3 niveles, un acento por viewport, jerarquía por TAMAÑO, glass solo en overlays); (5) **Zag/Neumeier** + test endurecido: "¿el brand kit se distingue de TODA app de IA y de las otras apps del SO?"; (6) exigir ≥1 dispositivo ownable (textura/foto/ilustración/2ª nota de color), no solo "oscuro + 1 acento".
- **`16` PASO 0.6 + `29`**: la propia "rotación fresca" (Clash, Satoshi, Fraunces) ya se quema como Space Grotesk/Geist → ROTAR, no auto-elegir el par del mood, y dar a la display un TRATAMIENTO propio; opciones frescas añadidas (Bricolage, Schibsted, Familjen, Gambetta, Erode, Instrument Serif, Unbounded…); principios de pareo (contraste por clase, superfamilia, x-height).
- **`CLAUDE.md`/`AGENTS.md`**: reescrita la guía de "Dirección de arte" (antes recomendaba "dark-first por defecto" y "glow/glassmorphism" — justo el look de IA) + nuevo ítem en el checklist de cierre de diseño (capa anti-IA, ≥1 dispositivo ownable, test de no-intercambiabilidad).

Fuentes: Refactoring UI (Wathan/Schoger), "Dark Mode Design That Doesn't Look AI" (RAXXO), AI-Unchained sobre colores genéricos de IA, Google Fonts Knowledge / TypeSmith (font pairing), NN/g, Marty Neumeier (*The Brand Gap*, *Zag*).

---

## [2.7.0] — 2026-06-26

### Changed — ideación ENDURECIDA (cierra 5 huecos detectados al probar el SO) + el criterio de "buena idea" se extiende a la construcción
Tras probar la ideación con un prompt real, salieron 5 fallas (ideas bien presentadas pero flojas como suscripción: uso único disfrazado, "wow" de IA que solo adivina, riesgo legal minimizado, "existe afuera" tomado como prueba de pago LATAM, rúbrica sesgada hacia lo catastrófico-pero-raro). Corregido con evidencia:
- **`01-IDEACION.md` — los 8 pilares ahora tienen 3 GATES DUROS** (descalifican aunque el painkiller sea 19/20): (6) **retención** = gate, no asterisco (uso único/episódico NO se propone como suscripción; o se reformula a recurrente o es otro modelo); (3) **IA real, no simulada** = test "quítale la palabra IA" + test de factibilidad de datos (la IA debe RESOLVER con precisión, no adivinar con cara de certeza); (8) **riesgo regulatorio** (consejo médico/legal/financiero vinculante por un fundador solo = mala base; solo entra como "información, no asesoría"). Rúbrica painkiller **de-sesgada**: modificador de frecuencia + Trampa #2 "catastrófico-pero-raro" (intensidad alta + frecuencia baja = transaccional, no suscripción). Pilar 2: separar **señal de arbitraje** ("existe/levantó plata afuera") de **señal de pago LATAM** (gente gastando dinero hoy aquí). Filtro y anti-patrones reescritos con los gates.
- **`01-IDEACION.md` — nuevo "EL FILTRO DE FEATURE"**: el criterio de "buena idea" NO termina en la ideación, aplica a CADA feature al construir. Evidencia: ~80% de las features se usan poco o nunca, solo ~12% seguido (Pendo 2019; Standish 64% en 2002). 4 preguntas por feature (apoya la promesa · la usaría >50% · test "quítale la palabra IA" · ahora o V2) + cómo decir que no sin ser un "sí señor", coherente con el estándar "enriquecido = valor, no features" de 32.
- **`CLAUDE.md`/`AGENTS.md`**: nueva regla de UX 19 (**disciplina de features**) que hace vivo ese filtro durante toda la construcción, con el dato del 80% y el test anti-gimmick de IA.

Fuentes: RevenueCat State of Subscription Apps 2025/2026, framework painkiller-vs-vitamin (Airbridge), Pendo Feature Adoption Report 2019, Standish CHAOS, NN/g y guías de diseño de features de IA.

---

## [2.6.0] — 2026-06-26

### Added — refuerzo profundo de la generación de IDEAS (anclado en datos reales 2026, no en intuición)
Investigación externa (RevenueCat State of Subscription Apps 2025/2026, framework painkiller-vs-vitamin, caso Cal AI, "why now" de Lenny Rachitsky, señales de demanda en Reddit) convertida en un marco accionable para que el SO proponga ideas GANADORAS, no la primera ocurrencia:
- **`01-IDEACION.md`**: nueva sección mayor **"LOS PILARES DE UNA IDEA GANADORA (con datos 2026)"** — 8 pilares con la evidencia detrás: (1) painkiller > vitamina con rúbrica de 4 preguntas /20 (convierten 5-9× más; la URGENCIA paga, no la frecuencia); (2) problema que millones comparten con demanda revelada (reseñas 1-2★, "ojalá existiera", Reddit); (3) un momento-IA puntual que borra la peor parte (truco de Cal AI ~$30M); (4) "por qué ahora" / capacidad de IA reciente; (5) categoría que monetiza + poder de precio (Salud/Fitness, Foto/Video, Productividad, Finanzas; precio alto = 6× LTV); (6) **retención incorporada** (las apps de IA ganan +41% pero retienen −30-36% → deben ser verticales con razón de volver, no chatbots genéricos); (7) ventaja de distribución (solo 17% llegan a $1k MRR; el arbitraje LATAM ES un canal); (8) alcanzable y defendible. Incluye el filtro en una frase y los anti-patrones que los datos dicen que pierden.
- La **plantilla de propuesta** de `01` ahora exige un "chequeo de pilares" (painkiller score, por qué ahora, por qué retiene, categoría, distribución) y reformular si algún pilar queda débil. El **Banco de Ideas** se marca como semillas que deben afilarse con los pilares.
- El **filtro del Escenario B** (idea propia del usuario) añade el paso de pasar la idea por los pilares y proponer el ángulo que convierte una vitamina/uso-único en painkiller con retención.
- **`INICIO.md`** (FLUJO A): la tarjeta de oportunidades incorpora campos nuevos (💊 por qué duele/painkiller, ⚡ momento-IA, ⏰ por qué ahora, 🔁 por qué retiene, categoría que paga) y una regla: cada oportunidad PASA los 8 pilares antes de mostrarse — nunca "la primera para llenar la lista".

---

## [2.5.0] — 2026-06-26

### Added / Fixed — cierre de los 11 hallazgos de un simulacro de uso completo (dry-run con usuaria no técnica)
Se simuló una corrida entera del SO en voz alta poniéndose en los pies de un usuario no técnico que "quiere que la IA lo haga todo". 0 blockers; se cerraron las **costuras entre piezas** y los **gaps de expectativa** que solo un dry-run destapa:
- **`02-VALIDACION.md`** (alto): el Gate de Demanda ya no puede frenar en seco a un no-técnico. Tres caminos explícitos: FLUJO A → gate cubierto por arbitraje (igual se corre el de viabilidad unitaria 40); quiere validar → fake-door con la landing de 19; no puede/no quiere → ruta de **riesgo asumido** documentada + validación EN PARALELO, con OK explícito (no bloqueo silencioso). El gate es bloqueante de verdad solo para gastar en ads.
- **`18-VENTA-HOTMART.md`** (alto): nueva sección **"Los dos modelos de creación de usuario"** (hard paywall = webhook CREA al pagar; onboarding-first = registro gratis → webhook SUBE a Pro) + el **caveat crítico del email que no coincide** (registro con un correo, compra con otro → cuenta duplicada y progreso huérfano) con 3 mitigaciones (mismo email/pre-rellenar, matchear por id/`src`, flujo de reclamo). Nueva sección **"Prueba de pago de punta a punta"** obligatoria + ítems de checklist (incl. casos del Modelo 2 y reembolso).
- **`40-UNIT-ECONOMICS.md`**: la plantilla ahora la **rellena el AGENTE** estimando los costos; al dueño no técnico solo se le piden 2-3 datos (precio objetivo, afiliados sí/no, ciclo). No más hoja financiera en blanco.
- **`CLAUDE.md`/`AGENTS.md`**: degradación de la verificación visual — sin herramienta de preview NO se le exige al usuario no técnico una captura a 375px ni puntuar /40; se deja "pendiente de preview automático" y no se declara la pantalla lista.
- **`INICIO.md`**: reglas de conducción 8-10 (fijar expectativas al inicio — "hay ~5 cosas que solo tú puedes hacer, te aviso y te guío"; ritmo en sesiones densas; degradar sin web/preview y ofrecer ejemplos en preguntas difíciles), notas de secuencia en el plan (clave de IA en local temprano para probar el wow real; sembrar eventos al construir; modelo de usuario decidido en Sesión 1), y ejemplos en la pregunta "qué NUNCA debe hacer la app".
- **`30-INTEGRACION-IA.md`**: configurar la clave de IA en local temprano para probar la primera victoria con generación REAL (no declarar el onboarding listo sobre un mock).
- **`36-ANALITICA-Y-EVENTOS.md`**: sembrar los eventos de activación/retención AL construir cada pantalla (Sesiones 3-4), no en una sesión de analítica al final.
- **`02B`** y **`PROMPT-ARRANQUE.txt`**: cross-link al seam de `18` cuando hay free tier; y fijación de expectativas en el prompt de arranque.
- **Desambiguación de los dos prompts de auditoría** (mismo "audita" en el nombre, funciones distintas): `PROMPT-AUDITORIA.txt` (audita TU APP, en el menú de usuario) y `PROMPT-AUDITAR-SO.txt` (audita la DOCUMENTACIÓN del SO, uso interno) ahora llevan una línea de cross-pointer al inicio; la fila de ruteo de `CLAUDE.md`/`AGENTS.md` marca el segundo como "uso INTERNO de mantenimiento". No se renombraron (evita romper referencias del zip).

---

## [2.4.1] — 2026-06-26

### Fixed — auditoría integral final (4 pases de coherencia: monetización, meta/ruteo, prompts, diseño/técnico)
Resultado de la auditoría: **0 blockers**, refs cruzadas íntegras (0 rotas), CLAUDE.md = AGENTS.md, ruteo y menú completos. Correcciones aplicadas:
- **`10-DESIGN-TOKENS.md`**: import roto `framer-motion` → `motion/react` (el SO estandariza en Motion; el import viejo habría fallado al construir). *Único hallazgo con impacto de build.*
- **`02B` / `02-VALIDACION`**: unificadas las metas de retención (D7 >20%, D30 >10% en ambos) y de churn (meta aspiracional <8% en ambos + nota: para MODELAR el LTV usar el churn realista 10-20% de `40`). Antes se contradecían (D7 20 vs 25, D30 10 vs 15; churn <5 vs <8).
- **`02B`**: checklist decía matriz "(A-G)" → "(A-F)" (el nicho G/e-commerce se había eliminado).
- **`21-BACKOFFICE`**: el objetivo trial→pago ~45% remitía a `18` (que no lo contiene) → ahora "(ver 02B/02)".
- **`22-LIBRERIAS-Y-CRAFT` / `14-LEYES-DE-DISENO`**: corregida la doctrina de `prefers-reduced-motion` en 22 (decía "animaciones a 0.01ms" — el antipatrón que 10/14 marcan como INCORRECTO; ahora "conservar fades/color, quitar solo movimiento") y suavizada la estadística inflada "~35% (WebAIM)" en 14 y 22 por una frase cualitativa defendible.
- **`11-DISENO-EMOCIONAL`**: hardcode `#2563eb` etiquetado "Colores de la marca" (el azul default que el propio SO prohíbe) → placeholder que remite al brand kit (PASO 0 de 16).
- **`05-CREACION`**: nota añadida — el `<link>` a Google Fonts es para Vite/HTML plano; en Next.js usar `next/font` (ver 28).
- **`CLAUDE.md`/`AGENTS.md`**: alineada la línea de IDENTIDAD con la regla transversal ("por defecto hablas SIMPLE; subes el registro solo si detectas a un técnico").

NITs no corregidos (no rompen nada, decisión del dueño): `PROMPT-NUEVA-APP-FITNESS.txt` es un ejemplo no expuesto en el menú de CLAUDE.md; `PROMPT-AUDITAR-SO.txt` es de uso interno y no está en el menú a propósito; placeholder `system-ui` en el favicon de `20-ASSETS-VISUALES` (se reemplaza al generar el favicon real).

---

## [2.4.0] — 2026-06-26

### Changed — `02B-ONBOARDING-MONETIZACION.md` ampliado (cierre de huecos de pricing/paywall/onboarding por nicho, a partir de investigación externa)
- **Orden de diseño explícito**: nueva sección que fija la secuencia *tipo de app → promesa → frecuencia de uso → primera victoria → paywall → pricing → retención* y prohíbe empezar por el precio. La frecuencia (diaria/semanal/puntual) decide el modelo (hábito→freemium vs resultado→hard paywall/preview→paywall). Mide activación antes que adquisición.
- **Matriz de nichos A-G**: la sección "estrategia por tipo de app" pasó de 3 buckets a los **7 nichos** completos (educación, bienestar, fitness, IA creativa/contenido, productividad, finanzas, e-commerce), cada uno con primera victoria · onboarding · paywall · monetización · retención · qué NO hacer. Añade tabla consolidada de un vistazo y la "fórmula para una app de IA" (qué copiar de Duolingo/Headspace/Cal AI). Antes faltaban IA creativa, educación y e-commerce.
- **Modelo de créditos como packaging visible** + regla **"vende resultados, no tokens"** (ej. "100 guiones/mes", no "500.000 tokens"); tiers Starter/Pro/Max + créditos extra; cuándo usarlo; free tier de 1 preview/generación en apps de IA cara. Es la cara visible del fair-use interno de `30`, validada contra el COGS de `40`. Más caution sobre **lifetime deals**.
- **Los 5 trabajos del onboarding** (segmentar · personalizar · activar · crear deseo · preparar el pago) como el "qué" antes del "cómo" de las 7 reglas.
- **Las 7 preguntas que el paywall debe responder** (qué desbloqueo · por qué ahora · qué pierdo · qué gano · puedo cancelar · cuál plan · salida limpia) + estructura narrativa que las ensambla, con nota anti-dark-pattern sobre la aversión a la pérdida honesta.
- Checklist de estrategia ampliado con las decisiones nuevas (orden, nicho, frecuencia, 5 trabajos, 7 preguntas, créditos en resultados).
- Cross-links nuevos: `40-UNIT-ECONOMICS.md` y `30-INTEGRACION-IA.md` (fair-use interno ↔ créditos visibles); nota de monetización por defecto en `CLAUDE.md`/`AGENTS.md` actualizada con el orden de diseño, la matriz de nichos y los créditos.
- **Removed**: nicho G (e-commerce/marketplace) — TODA app del SO se vende como suscripción recurrente por Hotmart; el comercio por compra única queda fuera del modelo. La matriz quedó en A-F.

### Changed — perfeccionamiento de los pilares de retención y venta (24, 35, 19)
- **`24-GAMIFICACION.md`**: nueva sección **"La métrica de activación — el número mágico que predice la retención"** (acción × cantidad × ventana que separa retenidos de churneados; cómo hallarlo con datos de `36`; calibrar la gamificación para empujar al usuario a cruzarlo) + la **forma de la curva de retención** (decae a cero = no hay producto, ninguna mecánica lo salva; aplana en meseta >0 = PMF, ahí rinde la gamificación). Checklist y conexión con `36` añadidos.
- **`35-LANZAMIENTO-Y-RETENCION.md`**: nueva sección **"Referidos / member-get-member"** (dos formas en el modelo Hotmart: convertir clientes en afiliados de `34`, o recompensa in-app "da y recibe" reconciliada por el webhook de `18`; pedir el referido en el momento de máxima felicidad de `24`; no montarlo antes de que la curva aplane; respetar el margen de `40`) + bloque **"renovación anual — el acantilado del mes 12"** (cadencia pre-renovación que convierte el cobro anual en algo esperado, no una emboscada). Conexiones a `34`/`40` actualizadas; TODO de índices del mantenedor marcado HECHO.
- **`19-PAGINA-DE-VENTAS.md`**: nueva sección **"Message-match"** (el headline del hero debe ecoar la promesa exacta del anuncio/email que trae al visitante — congruencia de *information scent* con `34`, alineada al nivel de consciencia de Schwartz) + ítem en checklist. **Fix**: eliminada la fuga de marca "MECLUB" (nombre de proyecto que se había colado en el SO genérico).
- Ruteo de `35` actualizado en `CLAUDE.md`/`AGENTS.md` y `REFERENCIA-RAPIDA.md` (añadidos referidos y renovación anual).

### Added — regla transversal de comunicación con el usuario no técnico + alertas (orientación 100% a usuario no técnico)
- **`CLAUDE.md`/`AGENTS.md`**: nueva sección **"Comunicación con el usuario y alertas"** (regla transversal, aplica en cada mensaje): (1) hablar SIEMPRE simple, traduciendo cada término técnico la primera vez; (2) cerrar cada etapa preguntando si seguir Y explicando en una frase simple QUÉ es el siguiente paso y PARA QUÉ sirve, esperando confirmación; (3) **protocolo de alertas proactivas** (⚠️ formato qué pasó→por qué importa→qué hacer) para pendientes/omisiones importantes, riesgos de seguridad, algo que cuesta dinero, y —destacado— **el caso de que el usuario pegue una API key/secreto en el chat**: avisar de inmediato y decirle que la rote/regenere.
- **`INICIO.md`**: regla de conducción 3 reforzada (el siguiente paso se explica en simple, no solo se nombra) + nueva regla 7 (hablar simple y avisar lo importante, con remisión a la sección de `CLAUDE.md`).

### Changed — conexión 34 ↔ 36 ↔ 21 (atribución por canal, la pieza que faltaba)
- **`34-ADQUISICION-Y-TRAFICO.md`**: nueva sección **"Medir antes de gastar"** — instrumentar el funnel (36) y **etiquetar cada canal** antes de invertir: afiliados los atribuye Hotmart solo; ads/orgánico/email se etiquetan con el parámetro `src` del checkout de Hotmart (`?src=meta_dolor`, `?src=email_dia3`...) para saber qué canal trae clientes que PAGAN. Conexión con `36` añadida.
- **`36-ANALITICA-Y-EVENTOS.md`**: nueva sección **"Atribución por canal — cómo se llena `source`"** que cierra el círculo: la cadena completa `src` en la URL → la landing la guarda y la arrastra al checkout → el webhook (18) la persiste en `profiles.source` → `identify()` y cada evento la leen. Sin esto, el CAC por canal de `21`/`34` no se podía calcular. Conexión con `34` actualizada.
- **Prompts `.txt` actualizados** (los atajos que disparan estos archivos, en `docs/sistema/`): `PROMPT-MEJORA-ONBOARDING-PAYWALL` (orden de diseño, matriz de nichos A-F, 5 trabajos del onboarding, 7 preguntas del paywall, créditos en resultados, anual como $/mes), `PROMPT-RETENCION` (número mágico + curva de retención + referidos), `PROMPT-LANDING` (message-match), `PROMPT-ADQUISICION` (medir antes de gastar + atribución por `src`/36), `PROMPT-LANZAMIENTO` (referidos + renovación anual), `PROMPT-BACKOFFICE` (ganancia real + avisos al dueño + refs 40/36), `PROMPT-ARRANQUE` (regla de comunicación: hablar simple, explicar el siguiente paso, avisar/rotar API key).
- **`21-BACKOFFICE.md`**: (1) métrica **"Ganancia real"** — la línea de fondo que faltaba (ingresos − Hotmart − afiliados − impuestos − IA de `ai_calls`/31 − infra − email) con % de margen y alerta si la IA supera el ~20% (regla de 30/40); (2) sección **"Avisos automáticos para el dueño"** — el panel empuja alertas en lenguaje simple (IA cara, webhook fallando, churn involuntario, canal que pierde dinero, margen negativo), reflejo de la regla de alertas de `CLAUDE.md` dentro del producto; (3) **reconciliación con `36` y `40`** en "Relación con herramientas externas" (backoffice = vista del dueño / PostHog = herramienta del constructor sobre el MISMO `event_log`; backoffice = ganancia real / `40` = modelo previo; no mezclar bases). Checklist y atribución (captura vía 36) actualizados.

---

## [2.3.0] — 2026-06-21

### Added — Cierre de fugas operativas (capa post-venta y crecimiento orgánico que faltaba)
- **`45-SEO-TECNICO.md`**: lo técnico del orgánico (metadata dinámica/`generateMetadata`, `sitemap.ts`/`robots.ts` nativos, JSON-LD schema.org, SSG/ISR vs CSR para que el bot indexe, hreflang, programmatic SEO legítimo vs spam, GSC). Complementa la estrategia de `34`.
- **`46-EMAIL-DELIVERABILITY.md`**: que el email no caiga en spam — SPF/DKIM/DMARC (DMARC progresivo), subdominio dedicado separando transaccional (`tx.`) de marketing (`news.`), warmup, higiene de lista (double opt-in, suppression vía webhooks), `List-Unsubscribe`, monitoreo (Postmaster Tools), specifics de Resend. Protege los emails de acceso de `18` y el nurturing de `34`.
- **`47-LEGAL-FISCAL-Y-SOPORTE.md`**: operación post-venta — fiscal/legal LATAM (Hotmart como Merchant of Record reduce pero no elimina la carga; ToS/refund/**disclaimer de IA** + limitación de responsabilidad; checklist empezar vs escalar), **soporte al cliente como sistema de retención** (SLA, IA+escalada humana sin loops, rescate de churn ligado a `35`, loop de feedback a `44`), y **trust & safety/moderación** condicional (UGC + outputs de IA, enlaza guardrails de `30`).

### Changed
- `06-TESTING.md`: añadido el gate de **accesibilidad testeada automáticamente** (`@axe-core/playwright`/`jest-axe`/`pa11y-ci` en CI), aclarando que cubre ~30-50% de WCAG y complementa (no reemplaza) el test manual con lector de pantalla y la regla `aria-live` de `15`.

---

## [2.2.0] — 2026-06-21

### Added — Descubrimiento de usuario (a partir de analizar la skill cookiy-ai/user-research-skill: tomar lo bueno, corregir lo malo)
- **`44-DESCUBRIMIENTO-DE-USUARIO.md`**: cierra el eslabón entre "tengo una idea" (01) y "alguien la paga" (02). Toma de la skill lo sólido (Big Q atada a una decisión, screener por comportamiento, protocolo de entrevista anti-sesgo, síntesis trazable con ≥2 fuentes, Opportunity Solution Tree / Opportunity Scoring) y **corrige sus defectos**: **Mom Test explícito** (prohíbe "¿te gustaría/pagarías/usarías?" → comportamiento pasado específico), **fuerzas JTBD/switch** + timeline, **prohíbe synthetic users (entrevistar IAs) como evidencia de demanda**, **prohíbe muestra complaciente / relajar el segmento para llenar cupo** (5 del avatar exacto > 30 tibios; no encontrar 5 ya es señal), y **handoff obligatorio** al gate de pago (02) y a la economía unitaria (40): 44 detecta la señal cualitativa de WTP, 02 la prueba con dinero, 40 la ancla al pricing value-based. Sin sesgo comercial.
- Enlaces cruzados nuevos en `01-IDEACION.md`, `02-VALIDACION.md` (junto al gate de demanda) y `40-UNIT-ECONOMICS.md`; fila de ruteo en `CLAUDE.md`/`AGENTS.md`.

---

## [2.1.0] — 2026-06-20

### Added — Tier "craft de élite" (ingesta de 5 skills de diseño de referencia: frontend-design de Anthropic, UX/UI Pro Max, Emil Kowalski, Huashu, Vercel)
- **`41-CRAFT-DE-ANIMACION.md`**: criterio de animación de élite — framework "¿debe animarse?" por frecuencia de uso (cuándo NO animar), easing perceptual, interrumpibilidad (transition/spring vs keyframe), spring físico, transform-origin, prohibir `scale(0)`, **performance de runtime GPU** (transform/opacity, CSS vars heredables, Framer no-GPU), gestos/drag por velocidad, `clip-path`, **motion narrativo** (Slow-Fast-Boom-Stop, expoOut, chunk-reveal, foco con blur), **View Transitions API nativa**, reduced-motion matizado.
- **`42-UX-WRITING.md`**: microcopy de interfaz — nombrar por lo que el usuario controla, consistencia de verbos acción→confirmación, errores/empty states como dirección.
- **`43-MICRO-CRAFT-Y-EJECUCION.md`**: la última milla verificable — micro-tipografía (`…`/comillas/`tabular-nums`/`text-wrap:balance`), overflow/`min-w-0`, forms (`inputmode`/`autocomplete`/no-bloquear-paste), URL-como-estado, touch nativo (`touch-action`/`overscroll-behavior`/safe-area), dark robusto (`color-scheme`), barrel-files.

### Changed — enriquecimientos
- `16`: PASO 0.45 "mundo del sujeto", test de genericidad, matiz "eje libre" a la lista negra, protocolo de 3 lógicas divergentes, menú de estilos nombrados 2026. `29`: verticales especializados (12 sectores + anti-patrón) + estilos-firma con % de fidelidad CSS.
- `14`: árbol de easing perceptual, complexity matching, densidad por tipo de producto, micro-tipografía, filas anti-slop nuevas. `10`: reduced-motion matizado (no apagar fades), dark robusto, utility `.tabular`.
- `20`: protocolo de activos de marca + sub-portón de logos. `12`: "verdad antes que suposición" + pase junior. `17`: gráfico→caso de uso + accesibilidad de visualizaciones. `07`: severidad en checklist + rúbrica de crítica de 5 ejes + gate de micro-craft.
- `28`: composición de componentes + waterfalls granulares + re-render/INP. `38`: runtime de animación + barrel files. `15`: URL-como-estado + sostenibilidad/peso de assets.

### Fixed
- Lectura fina de los 5 pilares 36-40: corregidos errores reales (comisión de afiliado Hotmart 40-60% vs tarifa 10% en `40` → dos escenarios de margen; sesgo de doble módulo y caso anónimo en `37`; `size-limit`/brotli en `38`; `flush()` vs `shutdown()` y taxonomía en `36`; setup `next-intl` completo en `39`).

---

## [2.0.0] — 2026-06-19

### Added
- **Pilares nuevos** que cierran la cadena de "vendible y operable": `33-RAG-Y-CONTEXTO.md`, `34-ADQUISICION-Y-TRAFICO.md`, `35-LANZAMIENTO-Y-RETENCION.md`, `36-ANALITICA-Y-EVENTOS.md`, `37-FEATURE-FLAGS-Y-EXPERIMENTOS.md`, `38-PERFORMANCE-BUDGET.md`, `39-INTERNACIONALIZACION.md`, `40-UNIT-ECONOMICS.md`.
- **PASO 0 "del brief al brand kit"** en `16-DIRECCION-DE-ARTE.md`: la identidad se DERIVA de la audiencia/ICP, no se copia de un nicho genérico.
- **Núcleo de 9 ítems + verificación-como-artefacto** en `CLAUDE.md` (y su copia byte a byte `AGENTS.md`): cierre con evidencia (tsc/build/dev + render a 375px), no exhortación.
- **DR / Continuidad a nivel app** en `31-EVALS-OBSERVABILIDAD-OPERACION.md` (runbook que orquesta el detalle de DB de `25`).
- **Self-check del propio SO**: `docs/sistema/PLANTILLA-SELF-CHECK.md` + `docs/sistema/PROMPT-AUDITAR-SO.txt` para detectar incoherencias internas antes de reempacar.

### Changed
- **Auditoría integral multi-rol + plan de pulido**: revisión por roles (producto, diseño, UX, backend, DB, auth, ciberseguridad, IA, infra, monetización, distribución, operación).
- **Webhook de Hotmart de producción** en `18-VENTA-HOTMART.md`: firma en tiempo constante sobre el RAW body + idempotencia + máquina de estados.
- **Correctitud de datos** en `25-BASE-DE-DATOS.md`: transacciones atómicas, idempotencia, paginación keyset (no OFFSET profundo), multitenancy con RLS de alto rendimiento.
- **Seguridad** en `09-SEGURIDAD.md`/`27-REVISION-SEGURIDAD.md`: XSS por escape de OUTPUT, SSRF en fetch de URLs, CSRF (SameSite + Origin/double-submit), privacidad LATAM (LGPD/Ley 1581/LFPDPPP).
- **IA seria** en `30-INTEGRACION-IA.md`/`31`/`33`: structured output vía tool use nativo (no parsear texto a ciegas) + RAG solo cuando hace falta + evals con golden set y LLM-judge.
- **Proceso canónico unificado** en 8 sesiones (una sola narrativa de extremo a extremo).
- **Fusión de prompts** redundantes: `PROMPT-AUDITORIA.txt` (modos --rapido/--exhaustivo) y `PROMPT-DISENO.txt`.

### Fixed
- Sincronización de referencias cruzadas (`NN-*.md` / `PROMPT-*.txt`), conteos de docs/sesiones y rangos numéricos — el defecto histórico #1 del SO es la incoherencia interna; esta versión añade versionado y un self-check para contenerlo.
- IDs de modelo vigentes en todos los docs: `claude-opus-4-8` / `claude-sonnet-4-6` / `claude-haiku-4-5` / `fable-5` (sin sufijo de fecha ni versiones 3.x).

---

<!--
Plantilla para entradas futuras (copia y rellena; la más reciente arriba):

## [X.Y.Z] — AAAA-MM-DD
### Added      (pilares/docs/plantillas/prompts nuevos → bump MINOR)
### Changed    (cambios de proceso/estructura → bump MAJOR; ampliaciones compatibles → MINOR)
### Fixed      (correcciones de coherencia/refs/IDs/fences → bump PATCH)
### Removed     (docs/secciones retiradas)
-->
