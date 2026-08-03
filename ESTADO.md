# ESTADO — Manos Creadoras App
Última actualización: 2026-07-31 | Sesión actual: 1 (en curso)

⏸️ CHECKPOINT (2026-08-02) — Sesión 6 casi cerrada. **Supabase y el Ojo Experto FUNCIONAN DE VERDAD, probados contra los servicios reales.** HECHO: modelo de negocio migrado a SUSCRIPCIÓN ($19.99/mes · $199/año) en toda la app + legales; IA en Gemini `gemini-3.6-flash`; webhook con ciclo de vida de suscripción; filtro de tema + memoria por alumna; Supabase con 8 tablas, RLS y 2 migraciones; **prueba end-to-end pasada: 2 fotos reales de bolsos analizadas correctamente, 1 pregunta técnica respondida, 1 pregunta fuera de tema y 1 intento de inyección de prompt ambos bloqueados**. / Siguiente acción exacta: conectar las pantallas a Supabase (hoy leen de `lib/demo-data.ts`), sembrar la tabla `modulos`, y después Hotmart (la dueña pidió dejarlo para el final).

⚠️ ÚNICO BLOQUEO DE NEGOCIO: crear el producto de SUSCRIPCIÓN en Hotmart — los botones de compra aún apuntan al producto viejo de pago único de $25. No se puede publicar hasta resolverlo.

## Auth real (2026-08-02) — REEMPLAZA el mock de la Sesión 4
- `lib/auth.ts` ahora usa Supabase Auth de verdad (`signInWithOtp`). **`shouldCreateUser: false` es deliberado**: las cuentas solo las crea el webhook al pagar; si cualquiera pudiera pedir enlace, el programa sería gratis.
- Anti-enumeración (26): si el correo no existe se devuelve `ok` igual, para que nadie pueda averiguar quiénes son las alumnas probando correos.
- `lib/supabase/client.ts` (navegador) y `server.ts` (RSC/handlers, con cookies) creados. `app/auth/callback/route.ts` canjea el código por sesión; enlaces vencidos/usados redirigen a `/login?error=...` con mensaje humano.
- `middleware.ts`: refresca el token en cada request y protege `/cursos`, `/ojo-experto`, `/cuenta` (+ subrutas), preservando `?next=` para devolver a la alumna a donde iba. Si ya tiene sesión y entra a `/login`, la manda a `/cursos`.
- "Cerrar sesión" ahora cierra de verdad (`BotonCerrarSesion`, antes era un link decorativo).
- **Verificado contra la base real** (usuario de prueba creado y borrado después): pago→acceso ✅ · cancelada con período vigente→conserva acceso ✅ · período vencido→cortada ✅ · reembolsada→cortada ✅. Y por HTTP: las 3 rutas privadas devuelven 307 al login y las públicas 200.
- El callback entiende **dos formas de enlace**: `?code=` (flujo PKCE, cuando la alumna pide el enlace desde el navegador) y `?token_hash=&type=` (enlaces generados desde el servidor). Soportar solo el primero dejaba los enlaces de prueba sin funcionar — detectado probando el flujo completo, no en teoría.

## Estructura REAL del curso (2026-08-03, vista en el área de miembros de Hotmart)
- **4 secciones, ~64 lecciones.** El modelo plano `modulos` era incorrecto y fue reemplazado por `secciones` → `lecciones` (migración `0003`), con `user_progress` ahora por lección.
- No todo es video: la sección 1 son bienvenida/comunidad/aviso/patrones (tipos `texto`, `enlace`, `pdf`), y la 4 trae 6 PDFs. Por eso `lecciones.tipo` y `duracion_seg` nullable.
- Los títulos ya vienen BILINGÜES en Hotmart ("La estructura del bolso - The Bag Structure") → se guardan en `titulo` / `titulo_en`. Buen punto de partida para el plan EN.
- Cargado: sección 1 completa (4/4) y las 5 primeras lecciones de la 2 con duración real. **Faltan ~55 lecciones** (resto de la 2, toda la 3 y la 4).
- Las 5 lecciones de la sección 2 ya suman 2h32m → el curso completo probablemente supera las 10 horas. Dato vendible para la landing.
- ⚠️ DECISIÓN DE PRODUCTO PENDIENTE: la sección 1 no enseña nada (es bienvenida y recursos). Si cuenta como "progreso del curso", una alumna ve 4/64 completado sin haber tejido nada. Preguntar si se excluye del cálculo de avance.

## Herramienta de desarrollo: alumna de prueba
- `npm run alumna:crear -- correo@ejemplo.com [mensual|anual] [active|cancelled]` — crea la cuenta + su perfil de membresía (igual que el webhook al recibir un pago) e **imprime el enlace de acceso directo**, sin depender del correo (Supabase limita fuerte los envíos hasta configurar dominio propio con Resend).
- `npm run alumna:borrar -- correo@ejemplo.com` — la elimina con todos sus datos.
- Verificado end-to-end: enlace → sesión guardada → `/cursos`, `/ojo-experto` y `/cuenta` devuelven 200; sin sesión siguen en 307.
- ⚠️ Solo para desarrollo. Lee `.env.local` y usa la clave secreta — nunca debe correr en producción.

⚠️ INCIDENTE DE SEGURIDAD (2026-08-02, contenido — no llegó a git): la dueña pegó la `SUPABASE_SECRET_KEY` real en `.env.example` (la plantilla que SÍ se versiona y se publica) en vez de `.env.local`. Se detectó antes de cualquier commit; `.env.example` fue limpiado y se le puso un encabezado de advertencia grande. **PENDIENTE: rotar esa clave igualmente** (estuvo en un archivo público y pasó por el chat). La clave secreta salta todo el RLS, así que no se asume que sigue siendo segura.

⏸️ ANTERIOR — Sesión 5 (app interna: Mis Cursos + El Ojo Experto + Mi Cuenta) construida y verificada. ⚠️ HALLAZGO CRÍTICO CORREGIDO: la tipografía display (Cormorant Garamond) NUNCA cargó desde la Sesión 3 por una variable CSS auto-referenciada (`--font-display: var(--font-display)`); todas las pantallas anteriores, incluida la landing "cerrada", renderizaban con la sans del sistema. Causa raíz arreglada (next/font ahora inyecta `--font-display-src`) y verificado con getComputedStyle en navegador real. ANTIGUO (Sesión 4): bienvenida post-compra + login magic link construidos y verificados — 2 rondas de `revisor-visual` con 9 defectos corregidos en total, build+tsc limpios, flujo completo probado en navegador real (escribir email → enviar → estado "revisa tu correo" → volver al formulario). Checkout real de Hotmart ya conectado desde Sesión 3 / Siguiente acción exacta: arrancar Sesión 5 — app interna con 3 secciones (Mis Cursos con video embebido de Hotmart · Asistente IA "El Ojo Experto" · Mi Cuenta), con datos semilla realistas. Esperar OK de la dueña antes de arrancar.

## Qué es esta app
App con dos zonas: (1) frente público de ventas (instalable, con notificaciones push) para clientas potenciales de Instagram, y (2) zona privada con login para alumnas que ya compraron, con sus cursos (video embebido desde Hotmart) y un asistente de IA que da feedback sobre fotos de sus bolsos en progreso. Vende el curso "Bolsos de Lujo en Cuentas" ($25 pago único vía Hotmart, ya validado con +1.200 alumnas).

## Promesa central
"Esta app ayuda a mujeres que quieren tejer bolsos de lujo en cuentas a decidir con confianza y avanzar sin trabarse, sin perder tiempo en grupos de WhatsApp o tutoriales sueltos, mediante una app con sus cursos, avisos automáticos y un asistente de IA que revisa fotos de su bolso y le dice qué mejorar."

## Reporte de validación (Sesión 1)
- Veredicto: Excelente oportunidad — el negocio ya está validado (1.200+ alumnas, 4.9/5, +1 año vendiendo); la oportunidad nueva es el FORMATO (app instalable con push, no solo landing).
- Competencia directa en el nicho (bolsos en cuentas/mostacillas): Domestika, cursosbisuteriayalambrismo.com, Pauline Caro — ninguna tiene app instalable ni asistente de IA. Brecha de formato clara.
- Evidencia de que push + app instalable convierte mejor: recuperación de carrito 37% mejor que email (Pushwoosh); casos reales con PWA+push: Lancôme +17% conversión, BMW 4x más clics a la sección de venta, Weekendesk 2x más probabilidad de compra con la app instalada.
- Precio de referencia del mercado: cursos similares $19-97 pago único; el propio ya vende a $25 (oferta de $55).

## Avatar y venta (Sesión 1 — hecho, pendiente de aprobación del usuario)
- FICHA-AVATAR.md: SÍ existe (creada 2026-07-31) — pendiente de aprobación explícita de la dueña (se le mostró resumen en el chat).
- Resumen: avatar "Marcela", 28-45, LATAM, sigue a Manos Creadoras en IG · dolor #1: "mis bolsos no se ven profesionales" · deseo #1: "que se vean de boutique, no casero" · nivel de consciencia 3-4 (audiencia orgánica caliente) · sofisticación etapa 3 (mecanismo IA al frente, nadie más lo tiene en el nicho)
- Landing: ya existe en manoscreadoras.lovable.app — se migra y se mejora (no se reinventa). Pendiente: completar respuestas de FAQ (hoy están vacías), sumar video de la creadora, unificar nombre de marca ("Manos Creadoras" en vez de "Elizabeth Valencia" / email de ateliervalencia.com).

## Estrategia de monetización (CAMBIADA 2026-08-02 por la dueña — MEMBRESÍA)
- **Modelo nuevo: SUSCRIPCIÓN.** $19.99/mes o $199/año (= $16.58/mes, "2 meses gratis"). En fase de test — el precio puede moverse.
- ~~Modelo viejo: pago único $25 con "acceso de por vida"~~ — ELIMINADO de toda la app el 2026-08-02 (era información falsa una vez cambiado el modelo: riesgo de disputas de reembolso).
- El cobro sigue 100% en Hotmart. Login automático post-compra vía webhook; sin paywall propio dentro de la app.
- Plan anual es el RECOMENDADO (anclado como $/mes, con el total anual en letra chica — regla del 19).
- Uso justo del Ojo Experto: 40 preguntas + 8 fotos/mes. **Con la suscripción esto dejó de ser un riesgo**: el costo de IA pasó de ~28% de un pago único de $25 a <1% del ingreso mensual recurrente.
- Consecuencias legales ya implementadas: página `/cancelar` (obligación del 47 con suscripciones), términos con cláusula de renovación automática y de cambio de precio, política de reembolso distinguiendo primer pago vs renovaciones.

## Decisión de proveedor de IA (CAMBIADA 2026-08-02 por la dueña)
- **Gemini 2.5 Flash de Google** (`gemini-2.5-flash` vía `@google/genai`). La dueña eligió el más económico tras ver la comparación de costos.
- Costo estimado: ~$0.014 por alumna activa al mes (~$3/mes con 240 alumnas). Alternativas descartadas: Claude Haiku 4.5 (~$16/mes), Claude Sonnet 5 (~$49/mes, era mi recomendación por mejor ojo visual), Claude Opus 5 (~$82/mes).
- ⚠️ Riesgo asumido y comunicado: es el modelo con menos finura visual de los evaluados. Si aparecen consejos flojos o equivocados sobre fotos de tejido, la palanca es subir a Haiku/Sonnet — es cambiar `AI_MODEL` + la clave, el resto del código no cambia salvo el SDK.
- `ANTHROPIC_API_KEY` fue reemplazada por `GEMINI_API_KEY` (Google AI Studio: aistudio.google.com/apikey).

## Dirección de Arte (Sesión 2 — CERRADA, cosa juzgada)
- FICHA-ARTE.md: SÍ existe y está aprobada (2026-07-31) — opción elegida: **B, "Editorial de Revista"**.
- Resumen: fondo #090706 · superficie #120f0c · texto #f6f1e7/#c9beac · acento dorado #ebcd8c→#d48e00 · Display "Cormorant Garamond" · Body "Jost" (reemplazó a "Inter", genérico) · radio cards 20-24px, botones pill.
- Personalidad: Elegante · Cálida · Aspiracional.
- Dispositivo ownable: foto de producto a sangre completa + grano sutil + tipografía display superpuesta ("portada editorial").
- REGISTRO ANTI-REPETICIÓN: paleta (casi-negro cálido #090706 + dorado #ebcd8c-#d48e00) y par tipográfico (Cormorant Garamond + Jost) vetados para el próximo proyecto de este SO. Dirección del banco 54 usada: N/A (fue interpretación fiel de referencia, no del banco).
- Pendiente de limpieza (no urgente): borrar/mover `direcciones-abc.html` de la raíz antes de inicializar el repo público o hacer deploy.

## Secuencia maestra de construcción (adaptada — NO es la secuencia default del SO)
- Esta app NO tiene paywall interno tradicional: página de ventas (pública, con push) → checkout externo en Hotmart → login automático post-compra (vía webhook) → app interna (cursos embebidos + asistente IA), sin paywall propio.
- Landing: pendiente (Sesión 3)
- Login/Auth: pendiente (Sesión 4) — motivo: dar acceso a cursos y guardar progreso/conversaciones con la IA.
- App interna: pendiente (Sesión 5) — secciones previstas: Mis Cursos (video embebido Hotmart) · Asistente IA (texto + fotos) · Mi Progreso/Cuenta.
- Servicios externos: pendiente (Sesión 6) — Supabase (auth+RLS), Hotmart webhook, Hotmart Player (verificar con la dueña si ya lo tiene o hay que contratarlo), notificaciones push, IA (Claude con visión), Vercel, dominio.

## Decisiones técnicas (tomadas por el agente, no se re-preguntan)
- Framework: Next.js App Router (necesita SEO/landing pública + rutas privadas + API routes) — decidido 2026-07-31.
- IA: Claude vía servidor/BFF · chat de texto síncrono con streaming · análisis de fotos SIEMPRE asíncrono (job en cola, la alumna recibe el resultado en la app/notificación, no espera bloqueada) · circuit-breaker de gasto global + contador de fair-use mensual por usuario (tabla `ai_usage`).
- Videos: NO se alojan de cero — se embeben desde Hotmart (Hotmart Player o Club, a confirmar con la dueña qué tiene contratado hoy).
- Auth: Supabase Auth con enlace mágico por email (sin contraseña, mínima fricción) · cuenta creada automáticamente por el webhook de Hotmart al comprar, usando el email de la compra como llave — no hay registro manual ni paywall propio.
- Modelo de datos (borrador, se ajusta en Sesión 6): `profiles` (perfil + estado de acceso) · `courses`/`modules` (metadata + ID del video de Hotmart Player) · `user_progress` (qué módulos completó cada alumna) · `ai_conversations` (historial del asistente) · `ai_usage` (contador mensual para el fair-use). RLS en todas: política por `(select auth.uid()) = user_id`, columna indexada.

## Sesiones completadas ✅
- Sesión 1 — Validación, Constitución del Producto, Plan Maestro, FICHA-AVATAR.md, fair-use de IA, arquitectura técnica (auth/datos/RLS) — todo aprobado 2026-07-31.
- Sesión 2 — Identidad visual: protocolo A/B/C ejecutado, dueña eligió Opción B, FICHA-ARTE.md aprobada — 2026-07-31.

## Sesión en progreso 🔧
- Sesión 6 — Servicios externos. Código backend HECHO; **Supabase CONECTADO y con esquema aplicado** (2026-08-02, vía MCP). Faltan 2 claves de la dueña (secreta de Supabase + Gemini) y el producto de suscripción de Hotmart.
  - ⚠️ Hallazgo de seguridad corregido en el momento: el linter de Supabase detectó que `tiene_acceso(uid)` era llamable sin iniciar sesión desde `/rest/v1/rpc/` — cualquiera podía probar UUIDs y averiguar qué alumnas tienen membresía activa. Se partió en `tiene_acceso_de(uid)` (solo servidor) + `tiene_acceso()` (solo responde sobre quien llama). Migración `0002`.
  - Avisos restantes del linter, revisados y ACEPTADOS a propósito: (a) `ai_spend`/`processed_events`/`webhook_log` tienen RLS sin políticas — es intencional, solo las escribe el servidor y nadie las lee desde el cliente; (b) `rls_auto_enable()` no es nuestra, es una red de seguridad de la plataforma que activa RLS en tablas nuevas — inofensiva fuera de un trigger DDL (se leyó su código para confirmarlo).
  - `supabase/migrations/0001_init.sql`: esquema completo con RLS en TODAS las tablas — `profiles` (estado de membresía), `modulos`, `user_progress`, `ai_conversations`, `ai_usage` (uso justo), `processed_events` + `webhook_log` (idempotencia y auditoría del webhook), `ai_spend` (circuit-breaker de gasto). Políticas por `(select auth.uid())` con columnas indexadas.
  - `app/api/webhooks/hotmart/route.ts`: las 4 defensas del 18 — autenticidad (hottok en tiempo constante, anti timing-attack) · frescura (ventana anti-replay de 5 min) · idempotencia (PK sobre `event_id`, porque Hotmart REENVÍA) · máquina de estados (un `PURCHASE_APPROVED` tardío NO resucita a quien ya reembolsó). Crea la cuenta passwordless al pagar (Modelo 1, hard paywall).
    - ⚠️ Bug propio detectado y corregido durante la construcción: la marca de idempotencia se insertaba ANTES de procesar, así que un fallo transitorio + reintento de Hotmart = alumna que pagó y nunca recibía acceso. Ahora la marca se BORRA en el catch antes de devolver 500.
  - `app/api/ojo-experto/route.ts`: patrón BFF (la clave de IA nunca toca el navegador). Valida token Y estado de membresía EN SERVIDOR, aplica el uso justo (40 preguntas + 8 fotos/mes) contra la DB —no contra el cliente, que puede mentir—, y corta con el circuit-breaker de gasto diario. Prompt de sistema con la voz de la mentora + prohibiciones (no promesas de ingresos).
  - `lib/env.ts` (fail-closed con zod: si falta un secreto, la app crashea en vez de correr insegura), `lib/supabase/admin.ts`, `lib/hotmart-verify.ts`, `.env.example` comentado en simple.
  - `.gitignore` corregido: `.env*` también ignoraba `.env.example` (que sí debe versionarse); se agregó excepción + se excluyeron `direcciones-abc.html` y las capturas.

## Sesiones completadas ✅
- Sesión 3 — Página de ventas: 10 secciones canónicas + 4 páginas legales, checkout real de Hotmart conectado (`pay.hotmart.com/S100198743F?off=f3k6k34t` en `lib/config.ts`). Testimonios con nombre quedan PENDIENTES de la dueña a propósito (ver Problemas conocidos). 3 rondas de `revisor-visual` (25→32/40 usab., 12→13/20 craft), 13 defectos reales corregidos, incluido un bug de precio parpadeando "$24→$25" a mitad de animación.
- Sesión 4 — Bienvenida + login (2026-08-01):
  - `/bienvenida` (post-compra): confirmación + instrucción de revisar correo, con celebración real (`.celebrate`, spring 0.6s) en el ícono — el único hito real del flujo hasta ahora.
  - `/login`: magic link sin contraseña, 4 estados completos (idle, loading, sent, error). `lib/auth.ts` MOCKEA el envío a propósito (el backend real de Supabase llega en Sesión 6).
  - 2 rondas de `revisor-visual`, 9 defectos corregidos: estado "enviado" sin salida · falta de `autoComplete`/`inputMode` · error que no se limpiaba al corregir · profundidad insuficiente de fondo · Eyebrow faltante en "enviado" · CTA siempre activo aunque el email fuera inválido (ahora se deshabilita hasta que el formato sea válido) · copy "Usar otro correo" que no coincidía con la acción (ahora "Reenviar o cambiar correo") · anillo de celebración circular sobre un ícono cuadrado · falta del grano de papel (dispositivo ownable) en las pantallas de auth.
  - Verificado en navegador real: flujo completo probado (email → enviar → "revisa tu correo" con el email correcto → volver al formulario precargado), botón confirmado pasando de `[disabled]` a activo. Screenshots (últimos, ya con TODOS los arreglos aplicados): `.playwright-mcp/bienvenida-v2-final.png`, `login-disabled-final.png`, `login-sent-final.png`, `login-reset-final.png`.

- Sesión 5 — App interna (2026-08-01): 3 secciones con bottom-nav (`/cursos`, `/ojo-experto`, `/cuenta`) + ruta de lección `/cursos/[modulo]` (8 páginas estáticas).
  - **Mis Cursos**: protagonista = retomar el módulo en curso. Progreso 3/8 con conteo animado + barra que se dibuja. Módulos pendientes NO son enlaces (`aria-disabled` + microcopy "se abre al terminar el anterior"); los disponibles llevan a su lección real.
  - **El Ojo Experto** (el diferenciador): subir foto (input file real con `capture`) o escribir. Chips de sugerencia, medidor visual de uso justo, historial. Estado REAL: al consultar sube el contador y la consulta entra al historial. Estados completos: idle · enviando (skeleton) · respondido · error (con reintentar) · límite alcanzado · empty. Disclaimer de IA visible junto a la salida (obligación legal del 47).
  - **Mi Cuenta**: estado de acceso de por vida + hito de módulos + enlaces legales + cerrar sesión.
  - `lib/demo-data.ts` con datos semilla del mundo del avatar (32): alumna "Marcela", 8 módulos con nombres reales del nicho, 3 consultas previas con respuestas reales de tejido.
  - Backend mockeado a propósito (Supabase/Claude llegan en Sesión 6). Los IDs de video de Hotmart están vacíos → se muestra marcador rotulado en vez de iframe roto.
  - 1 ronda de `revisor-visual` (23/40 usab., 13/20 craft) + verificación propia: 5 defectos corregidos, incluido el **bug crítico de la tipografía** (ver checkpoint) y enlaces muertos en el CTA héroe y las 8 filas de módulos.
  - Verificado con datos en navegador real: contador 12→13, historial 3→4 ítems, consulta nueva encabezando la lista, ruta de módulo disponible y bloqueada. Screenshots: `.playwright-mcp/s5v2-cursos.png`, `s5v2-leccion.png`, `s5v2-bloqueado.png`, `s5v2-ojo-experto.png`.

## Próximas sesiones 📋
- Sesión 6: Integraciones reales (Supabase, Hotmart webhook + Player, IA real, push, dominio)
- Sesión 7: Testing, pulido, rigor de entrega
- Sesión 8: Adquisición, lanzamiento, backoffice

## Problemas conocidos ⚠️
- No confirmado si "Hotmart Player" (el embebible) ya está contratado o hay que agregarlo — verificar con la dueña antes de la Sesión 5/6.
- La landing NO tiene testimonios con nombre — decisión deliberada: la dueña pidió inventarlos "mientras agregamos unos reales" y el agente se negó (riesgo real de moderación de Hotmart/publicidad engañosa, no solo regla del SO) — la dueña lo aceptó. Solo queda el agregado real (+1.200 alumnas · 4.9/5) hasta tener 2-3 reales.
- `direcciones-abc.html` sigue en la raíz del proyecto — recordar borrarlo antes de subir el repo o hacer deploy (no se sube a producción).
- Título de pestaña de `/login` no personalizado (hereda el de Home) — es "use client" y no puede exportar `metadata`; solucionable con un layout.tsx propio del grupo `(auth)` si se quiere pulir, no bloqueante.

## Pendientes del usuario (Sesión 6 — bloquean el resto)
- [ ] 🔴 **Hotmart — crear el producto de SUSCRIPCIÓN.** El link actual en `lib/config.ts` es el del producto VIEJO de pago único ($25). Hasta que exista el producto de suscripción y se peguen los dos links (`CHECKOUT_MENSUAL` y `CHECKOUT_ANUAL`), los botones de la landing cobran el producto equivocado. **Esto bloquea vender.**
- [x] ~~**Supabase**: crear proyecto y esquema~~ — HECHO 2026-08-02. Proyecto `cazqmaluaehyikkstkoi` ("Manos creadoras app", us-west-2). Las 8 tablas creadas con RLS activo; migraciones `0001_init` y `0002_endurecer_tiene_acceso` aplicadas vía MCP. URL y clave publishable ya escritas en `.env.local`.
- [x] ~~Claves de Supabase y Gemini~~ — PUESTAS y VERIFICADAS contra los servicios reales (2026-08-02).
- [ ] ⚠️ **Confirmar que la clave secreta de Supabase fue ROTADA.** Se pidió rotarla tras el incidente (quedó en `.env.example` y pasó por el chat); no se pudo verificar desde acá si la vieja fue revocada. Si aún no se hizo: Project Settings → API Keys → crear nueva + revocar la anterior.
- [ ] **Hotmart — webhook**: panel → Herramientas → Webhook → apuntar a `https://TU-DOMINIO/api/webhooks/hotmart` y pegar el hottok. ⚠️ Verificar ahí los nombres EXACTOS de los eventos de suscripción y contrastarlos con la tabla `EVENTO_A_ESTADO` del webhook — el catálogo varía por cuenta.
- [ ] **Vercel**: crear cuenta y conectar el repo para publicar.

## Pendientes anteriores del usuario
- [ ] **Mandar 2-3 testimonios reales** (las capturas de WhatsApp de alumnas que mencionaste tener) para agregarlos a la sección "La app por dentro".
- [ ] Confirmar en su panel de Hotmart si tiene "Hotmart Player" contratado (para los videos embebidos, Sesión 5/6)
- [ ] Más adelante: crear/confirmar cuentas de Supabase, Vercel y dominio (se guía paso a paso en la Sesión 6)

## Notas para la próxima sesión
- El pago sigue siendo 100% en Hotmart (pago único $25) — esta app NO tiene paywall propio, es un beneficio post-compra.
- Servidor de desarrollo: `npm run dev` (puerto 3000 o el que Next asigne libre). Screenshots de verificación en `.playwright-mcp/home-375-fullpage-v4.png` (última versión, todo corregido).
- ⚠️ **Node por defecto de la máquina es v10.23.0** (de 2018) — Next 16 exige 20+. Una terminal nueva arranca en v10 y ahí `tsc`/`next` REVIENTAN con `SyntaxError: Unexpected token ?` (no es un error del código: es Node viejo sin `??`). Ya hay `.nvmrc` con `20.12.1` en la raíz → correr `nvm use` al abrir la terminal del proyecto. Verificado 2026-08-02 (dos veces): con Node 20 el proyecto compila con `tsc` en código 0.
  - ~~El hook `pre-stop.sh` daba falsos positivos~~ — **ARREGLADO 2026-08-02**: ahora carga nvm y hace `nvm use` (respeta `.nvmrc`) antes de correr `tsc`, y distingue "el código tiene errores" de "el entorno no puede correr tsc". Verificado: pasa en 0 desde una terminal con Node v10.
  - **RESUELTO 2026-08-02: el proyecto ahora corre en Node 22.23.2** (`.nvmrc` actualizado). Motivo: `@supabase/supabase-js` YA NO soporta Node ≤20 — falla con "native WebSocket not found", así que la app no podía hablar con la base. Se instaló Node 22 con nvm.
  - ⚠️ Al cambiar de versión de Node hubo que **reinstalar `node_modules` de cero** (`rm -rf node_modules package-lock.json && npm install`): el binario nativo `@next/swc-darwin-x64` se pierde y el build muere con "Turbopack is not supported on this platform". Si vuelve a pasar tras cambiar Node, esa es la cura.
  - Opcional: `nvm alias default 22.23.2` para que TODA terminal nueva arranque en Node 22.
  - (51-STACK-PINEADO recomienda 22 LTS — evaluar antes del deploy.)
