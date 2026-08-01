# CHECKLIST DE CIERRE — Referencia por dominio

> Este archivo complementa el **NÚCLEO OBLIGATORIO de 10 ítems** de `CLAUDE.md` (ese se recorre
> SIEMPRE, en cada pantalla/feature, sin excepción). Aquí vive la **referencia por dominio**:
> al cerrar, recorre SOLO los bloques que apliquen a lo que tocaste (diseño, IA, base de datos,
> auth, seguridad, gamificación). Es condicional pero NO opcional cuando el dominio aplica.
>
> Para el cierre de DISEÑO, el checklist canónico (26 ítems + sub-ítems) vive en `DESIGN-CORE.md`
> (los bloques visuales de aquí son la referencia extendida).

```
VERIFICACIÓN TÉCNICA
[ ] tsc --noEmit limpio · build limpio · dev server arranca sin errores en consola
[ ] Probado el flujo principal + casos borde (input vacío, doble-tap, sin conexión)
[ ] Regresión: lo que dependía de lo que toqué sigue funcionando

SECUENCIA DE PRODUCTO (archivo SECUENCIA-MAESTRA-CONSTRUCCION.md)
[ ] Si es app nueva/primera version/MVP, respeta el orden: ventas -> onboarding -> paywall -> login/auth -> app interna -> servicios externos
[ ] No se construyo un dashboard interno antes de landing/onboarding/paywall/login
[ ] Cada pantalla tiene 1 protagonista principal y maximo 2 secundarios
[ ] La app interna tiene 3-5 secciones maximo y no hay secciones duplicadas
[ ] ESTADO.md registra el estado de cada etapa de la secuencia
[ ] Si se cierra una etapa clave, se presento la PUERTA DE ETAPA (SECUENCIA 2.1) con evidencia y siguiente paso
[ ] No se arranco la siguiente etapa sin OK del usuario cuando correspondia

VERIFICACIÓN VISUAL (archivo 32 — la puerta que MÁS se salta y la que produce apps básicas)
[ ] ABRISTE la pantalla RENDERIZADA a 375px y la MIRASTE (screenshot si la herramienta lo permite) — sin esto, nada de lo de abajo cuenta
[ ] La bottom-nav está al fondo y NO hay vacío muerto (shell con min-h-dvh, NUNCA min-h-full sin h-full en el padre)
[ ] La pantalla está LLENA DE VALOR, no un input + 2 botones en un vacío (chips/medidores/estado/confianza — patrones del 32/15)
[ ] El fondo tiene PROFUNDIDAD (mesh/gradiente sutil), no un fill plano; las superficies están elevadas (sombra suave, no solo borde)
[ ] El CTA héroe se ve VIVO y accionable (nunca un pill muerto al 50% de opacidad)
[ ] El SUBAGENTE `revisor-visual` (.claude/agents/) puntuó el screenshot: ≥36/40 usabilidad Y ≥16/20 craft — autoevaluarse es inválido
[ ] Si el usuario dio referencia visual: veredicto FIEL en el test de fidelidad (16/DESIGN-CORE §8) — screenshot al lado de la referencia

MISIÓN Y CLARIDAD (por cada pantalla)
[ ] La pantalla tiene UNA misión principal — escrita en una frase
[ ] El CTA principal se reconoce en menos de 3 segundos
[ ] Cada elemento visible ayuda a entender, decidir, actuar o sentir progreso
  (si un elemento no hace ninguna de estas 4 cosas → eliminarlo)
[ ] El usuario sabe dónde está y qué ocurrirá si toca la acción principal
[ ] Hay ruta clara de volver, cancelar, cerrar, editar o deshacer cuando aplica
[ ] Existen todos los estados: empty, loading, success, error, disabled, offline

COPY Y LENGUAJE
[ ] Los textos usan lenguaje del usuario, no jerga técnica ni nombres internos
[ ] Los errores dicen qué pasó Y qué hacer: "No pudimos guardar. Revisa tu conexión e intenta de nuevo"
[ ] Las acciones destructivas o de alto impacto tienen confirmación o deshacer
[ ] La personalidad del copy es consistente con los 3 adjetivos de la app (archivo 11)
[ ] Si la pantalla vende/cobra/desbloquea: existe FICHA-AVATAR.md completa y aprobada (57) y CADA pieza de copy se traza a un campo de la ficha (dolor/deseo/objecion) — sin traza = relleno corporativo, reescribir
[ ] Si la pantalla vende/cobra/desbloquea: se recorrio `52-COPY-VISUALES-CONVERSION.md` y el copy pasa la RÚBRICA /20 del 52 (≥16, puntuada por el revisor independiente)
[ ] Landing: sigue la ESTRUCTURA CANÓNICA de 10 secciones del 19 en su ORDEN EXACTO (hero 4U's → problema en preguntas → agitacion → mecanismo → carrusel → oferta anual+mensual con trial → garantia → FAQ desde objeciones → CTA final emocional → footer legal con paginas existentes)
[ ] Landing/paywall: headline salido del PROCESO OBLIGATORIO del 52 (10 variantes + 4 U's + test del bar), <=10 palabras, subtitulo <=2 lineas mobile, bullets max 3-5
[ ] Landing: el mecanismo esta BAUTIZADO (nombre propio, archivo 19) y aparece en hero + seccion de mecanismo + paywall
[ ] El visual principal vende contraste, perdida honesta, valor desbloqueado, progreso o prueba; no es una card generica
[ ] No hay placeholders publicos de confianza: "garantia visible", "pago seguro despues", "se configurara luego"
[ ] Logo/nombre de app visible en landing/onboarding/paywall/login con ruta clara para volver

DISEÑO (archivos 14 + 16)
[ ] Espaciado: solo escala 4·8·12·16·24·32·48·64, interno≤externo, simétrico, sin huecos muertos
[ ] Color: regla 60-30-10, máx 1-2 de marca, auditados los colores que se colaron
[ ] Jerarquía: un objeto principal, test de entrecerrar los ojos pasa
[ ] Tipografía con carácter (no Inter/Roboto), texto minimalista (1 titular + 1 subtitular)
[ ] Fondo CON profundidad (mesh/gradiente sutil, NO fill plano — ni #000 ni beige plano); superficies elevadas (sombra suave + borde, no solo borde)
[ ] Capa anti-IA (archivo 16): <3 banderas rojas (no #000/#fff puro · no neón+glow+glass+orbe · modo DERIVADO, no asumido oscuro · jerarquía por tamaño) · ≥1 dispositivo ownable (textura/foto/ilustración/2ª nota de color) · el brand kit NO podría intercambiarse con otra app del SO

MOVIMIENTO Y CRAFT (archivo 22 — leer antes de verificar)
[ ] Las 7 animaciones baseline presentes — verificar UNA POR UNA:
    1) entrada escalonada (stagger) en cada pantalla al cargar
    2) conteo animado en números héroe (0 → valor final, nunca estático)
    3) dibujado de anillos / crecimiento de barras al cargar
    4) feedback de tap <150ms en todo elemento interactivo (whileTap scale 0.97)
    5) transición suave entre tabs/pantallas (no corte seco)
    6) aparición suave de modales y bottom sheets (desde abajo)
    7) celebración en hitos reales (solo hitos reales, no en cada tap)
[ ] prefers-reduced-motion respetado en TODAS las animaciones
[ ] Ícono de estado activo visible (no tapado por su fondo — Phosphor fill + acento)

EXPERIENCIA (archivos 15 + 03)
[ ] Skeleton en vez de spinner, empty states con CTA, feedback en cada interacción
[ ] La app no depende solo del color para comunicar estado (siempre texto/ícono también)
[ ] El usuario sabe "qué sigue" sin pensar
[ ] No hay patrones engañosos: confirmshaming, urgencia falsa, costos ocultos, cancelación difícil

SI HAY FUNCIÓN DE IA (UX en docs/sistema/05-CREACION.md; integración multimodal en docs/sistema/30-INTEGRACION-IA.md)
[ ] La IA está porque reduce esfuerzo real, no por moda
[ ] El usuario puede editar, regenerar, rechazar y deshacer toda salida importante
[ ] La IA declara límites; NO promete perfección
[ ] Acciones de alto impacto requieren control humano explícito
[ ] La personalización explica por qué muestra cada recomendación
[ ] Integración (30): clave en servidor; texto = streaming; imagen/audio = job asíncrono + Storage (no por la función)
[ ] Resiliencia: reintentos con backoff, timeout, idempotencia, degradación elegante ante fallo del proveedor
[ ] Caché de resultados idénticos + fair-use por modalidad; costo de IA por usuario Pro < 20% del precio
[ ] Observabilidad (31): tabla `ai_calls` (costo/tokens/latencia) + alertas de gasto; golden set de evals antes de cambiar modelo/prompt; guardrails (moderación, anti-inyección)

ACCESIBILIDAD
[ ] Contraste ≥4.5:1 texto / ≥3:1 UI · objetivos táctiles ≥48px · labels visibles
[ ] Navegación por teclado · focus visible · HTML semántico

SI HAY BASE DE DATOS (checklist completo en docs/sistema/25-BASE-DE-DATOS.md)
[ ] RLS activo en TODA tabla con política `(select auth.uid())` + columna de la política indexada
[ ] Toda foreign key tiene su índice; listas paginadas; sin Seq Scan en tablas grandes (EXPLAIN)
[ ] Migraciones generadas con `supabase db pull` + `db advisors` sin alertas críticas

SI HAY AUTENTICACIÓN (checklist completo en docs/sistema/26-AUTH-MODERNO.md)
[ ] Tokens en cookies httpOnly (NUNCA localStorage); refresh con rotación; logout invalida en servidor
[ ] Rate limiting por endpoint; mensajes genéricos (anti-enumeración); verificación de email
[ ] OAuth/passkeys ofrecidos; MFA si maneja dinero o datos sensibles

SEGURIDAD ANTES DE VENDER (auditoría completa en docs/sistema/27-REVISION-SEGURIDAD.md)
[ ] Corrida la auditoría: grep de fail-open · `semgrep` · `npm audit` · OWASP Top 10:2025
[ ] Sin secretos en frontend/logs; .env en .gitignore; webhooks de pago verifican firma
[ ] Probado IDOR: intentar leer un recurso de otro usuario por ID y confirmar que falla (403)

SI HAY GAMIFICACIÓN / RETENCIÓN (checklist completo en docs/sistema/24-GAMIFICACION.md)
[ ] El loop central (gatillo→acción→recompensa→inversión) está nombrado en ESTADO.md
[ ] Lógica de racha/XP/logros en el SERVIDOR (no editable desde el cliente), con RLS
[ ] Notificaciones ≤1-2/día, accionables, con control en ajustes; cero anti-patrones de culpa
[ ] Cada evento emocional (racha extendida/rota, level-up, logro, win-back) tiene su MOMENTO
    diseñado según `56-MOMENTOS-EMOCIONALES.md` (pantalla/overlay con la voz del arquetipo), no solo un toast

CIERRE
[ ] ESTADO.md actualizado
[ ] Pecados Capitales revisados (docs/sistema/03-PRINCIPIOS): ¿cae en alguno?
[ ] Verificación final con evidencia (ritual de 5 pasos, docs/sistema/12): no "debería funcionar"
[ ] Test final: "Si quito el logo, ¿se ve como estudio premium o app de IA genérica?"
```
