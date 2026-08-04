# ESTADO — Manos Creadoras App
Última actualización: 2026-07-31 | Sesión actual: 1 (en curso)

⏸️ CHECKPOINT (2026-08-04) — **Los videos ya no dependen de Hotmart.** El soporte de Hotmart confirmó que su reproductor solo funciona dentro de Hotmart Club: la arquitectura de video asumida desde la Sesión 3 era una vía muerta. Reemplazada por una capa propia (`lib/video.ts` + migración `0006`) que soporta Bunny/Vimeo/YouTube, con enlace firmado que caduca en Bunny. Probado en navegador: YouTube y Vimeo reproducen de verdad, y las lecciones de PDF/enlace ahora tienen a dónde apuntar (antes ni siquiera existía la columna). **Falta que la dueña elija dónde alojar y suba los videos** — detalle y costos en "Los videos NO pueden salir de Hotmart".

⏸️ ANTERIOR (2026-08-03) — Sesión 7: **las 4 pantallas de la app interna ya leen y escriben datos REALES de Supabase** (se borró `lib/demo-data.ts`). Probado en navegador con una alumna real: entrar por enlace → ver su curso → marcar una lección (se guardó en la base) → preguntarle al Ojo Experto (Gemini respondió y el contador bajó de 40 a 39) → ver su cuenta. `tsc` ✓ `build` ✓. **3 rondas del revisor-visual: subió de 28-30/40 a 31-35/40 usabilidad, pero NO llega al listón (36/40 · 16/20).** El techo que queda es material de la dueña: sin fotos de los bolsos no se puede aplicar el dispositivo ownable de la ficha (eje identidad clavado en 2/5 en las 4 pantallas), y sin las ~49 lecciones que faltan las listas se ven a medio llenar. / Siguiente acción exacta: pedirle a la dueña (a) 3-5 fotos de bolsos terminados, (b) el listado completo de lecciones de las secciones 2, 3 y 4, (c) crear el producto de suscripción en Hotmart.

## Sesión 7 (2026-08-03) — Pantallas conectadas a Supabase
- `lib/curso.ts` (secciones + lecciones + progreso + perfil, todo con la sesión de la alumna para que aplique el RLS) y `lib/ojo-experto.ts` (historial + uso del mes). `lib/demo-data.ts` ELIMINADO.
- `app/(app)/cursos/acciones.ts`: server action `marcarLeccion` (insert/delete en `user_progress`, tolera el 23505 del doble tap). La ruta pasó de `/cursos/[modulo]` a `/cursos/[leccion]`.
- **DECISIÓN (informada, no consultada): se quitó el bloqueo secuencial de lecciones.** En Hotmart la alumna ya tiene TODO abierto; bloquear en nuestra app habría sido un retroceso que ella notaría el primer día. Ahora todas las lecciones se abren y el avance lo marca ella ("Marcar como vista"). ⚠️ Si la dueña prefiere el bloqueo secuencial, se revierte.
- **DECISIÓN: la sección 1 (bienvenida/comunidad/aviso/patrones) NO cuenta para el % de avance** — migración `0005` con la columna `secciones.cuenta_progreso` (por dato, no hardcodeado, para que se pueda cambiar sin tocar código). Resuelve la duda que quedó abierta el 2026-08-03.
- Migraciones `0003`, `0004` y `0005` guardadas como archivo en `supabase/migrations/` — estaban aplicadas en la base pero NO existían en el repo (habrían faltado en el deploy).
- 🐛 **Bugs reales corregidos**: (a) la memoria de la IA consultaba `user_progress.modulo_id`, columna que dejó de existir al cambiar el modelo de datos; (b) `lib/env.ts` exigía TODAS las claves de golpe, así que con `HOTMART_HOTTOK` vacía (el webhook aún no existe) el Ojo Experto devolvía error 500 aunque su clave estuviera bien → ahora se valida por uso (`aiEnv` / `hotmartEnv`); (c) `CountUp` solo contaba una vez, así que el medidor seguía diciendo "40 de 40" tras gastar una pregunta; (d) cerrar sesión sin internet dejaba el botón en "Cerrando…" para siempre.
- Otros arreglos del revisor: estados `loading`/`error`/`not-found` de la app (antes: pantalla congelada, pantalla blanca y 404 en inglés) · grano de marca aplicado al layout de la app (solo estaba en la landing) · números en la sans porque Cormorant solo trae cifras de texto (el 0 se leía como "o") · texto 13→14px y labels 11→12px (dentro del rango que fija la ficha) · verde suelto pasado a dorado (un solo acento) · foto que se achica a 1280px antes de subir (una foto de celular no viaja en datos móviles) · error distinto para foto ilegible (HEIC) en vez de culpar al internet · botón Cancelar durante la consulta · historial de IA expandible · confirmación al cerrar sesión.
- Screenshots de verificación: `.playwright-mcp/s7h-ojo-experto.png`, `s7f-cursos.png`, `s7f-leccion.png`, `s7f-cuenta.png`.
- ⚠️ Deuda conocida: 2 avisos de lint preexistentes (`BarraProgreso` llama setState dentro de un efecto) — no rompen nada.

## Los videos NO pueden salir de Hotmart (2026-08-04) — RESUELTO EN CÓDIGO, FALTA DECIDIR DÓNDE ALOJARLOS

### El hallazgo
El soporte de Hotmart respondió por escrito: **el Hotmart Player funciona EXCLUSIVAMENTE dentro de Hotmart Club y no existe ningún código de inserción para sitios externos.** Toda la arquitectura de video que se venía asumiendo desde la Sesión 3 (`lecciones.hotmart_id` + iframe a `cf-embed.play.hotmart.com`) era una vía muerta: nunca habría funcionado.

Dato importante: **ellos mismos recomiendan alojar el video en otro servicio y embeber ESE video dentro de Hotmart Club.** Es decir, un solo archivo subido sirve para las dos cosas — la app y el Club. No hay que mantener dos copias.

### Lo que ya está hecho (código listo, funciona)
- Migración `0006`: se eliminó `lecciones.hotmart_id` (estaba 100% vacía, 0 de 9 filas) y se agregaron `video_proveedor` (`bunny` | `vimeo` | `youtube`), `video_id` y `recurso_url`. Constraint `lecciones_video_completo`: o vienen proveedor e ID juntos, o ninguno.
- `recurso_url` cubre un agujero que nadie había visto: las lecciones de tipo `pdf` (patrones) y `enlace` (comunidad) **no tenían dónde guardar su destino**, así que nunca habrían podido funcionar aunque el video sí.
- `lib/video.ts` (nuevo): arma la URL del reproductor según el proveedor. Corre **solo en servidor**. Para Bunny **firma el enlace con una clave secreta y lo hace caducar a las 6 horas**, así copiar la URL del inspector no sirve para compartir el curso.
- `components/app/ContenidoLeccion.tsx`: reproduce video, o muestra un botón real ("Abrir los patrones") para PDF/enlace, o el marcador honesto si todavía no hay nada. Ya no depende de `hotmartId`.
- `lib/config.ts`: `HOTMART_EMBED_BASE` eliminada. Hotmart sigue siendo SOLO el cobro (checkout + webhook), nada de contenido.

**Verificado en navegador real a 375px** con datos de prueba (borrados después): YouTube reproduce → `.playwright-mcp/s8-video-cursos.png` · Vimeo reproduce → `s8-video-vimeo.png` · PDF muestra botón "Abrir los patrones" → `s8-video-pdf.png`. La firma de Bunny se comprobó contra su fórmula documentada (SHA256 de clave+id+caducidad): coincide exacta y caduca a las 6 h.

### 🔴 DECISIÓN PENDIENTE DE LA DUEÑA: dónde se alojan los videos (cuesta dinero)
El código soporta los tres; solo hay que elegir uno, crear la cuenta y subir. Cálculo con ~58 videos de ~25 min (≈24 h de video, ≈29 GB):

| | Costo real | Protección | En celular LATAM | Esfuerzo |
|---|---|---|---|---|
| **Bunny Stream** (recomendado) | ~$0,30/mes de almacenamiento + ~$0,20 por alumna activa/mes. Con 50 alumnas ≈ **$11/mes** | Enlace firmado que caduca + bloqueo por dominio | Excelente (calidad adaptable) | Subir 58 archivos |
| **Vimeo** | **$12-20/mes fijos**, sin importar cuántas vean | Bloqueo por dominio (planes Plus+) | Muy bueno | El panel más fácil |
| **YouTube oculto** | Gratis | ❌ ninguna real: cualquiera con el enlace lo ve y lo comparte | El mejor con internet malo | El más fácil |

- **Recomendación: Bunny Stream.** Es el más barato, el único con enlace que caduca, y permite **poner un tope de gasto mensual** para que no llegue una factura sorpresa.
- **Si prefiere cero complicación y factura fija: Vimeo.** Cuesta más al principio pero nunca sorprende.
- **YouTube oculto queda descartado para el curso pagado**: sin protección real, un enlace filtrado en un grupo de WhatsApp regala el producto. Sirve solo para material abierto (un video de bienvenida en la landing, por ejemplo).

### Lo que tiene que hacer ella
1. Elegir el servicio y crear la cuenta.
2. Subir los videos. **No hacen falta los 58 para lanzar**: con los primeros tutoriales de la sección 2 ya se puede abrir. ⚠️ Subir ~29 GB desde casa puede tomar varias horas.
3. Pasarme la lista de "lección → ID del video" y yo la cargo en la base.
4. Si elige Bunny: pasarme el número de la biblioteca y la clave de firma (van en variables de entorno del servidor, nunca en el navegador).

## Correo / magic link en producción (2026-08-03) — PENDIENTE DE CONFIGURAR

### 🐛 Corregido: bucle infinito de redirecciones (ERR_TOO_MANY_REDIRECTS)
- **Qué pasaba:** si había sesión válida pero NO existía fila en `profiles`, `cargarCurso` y `cargarOjoExperto` devolvían `null`, la pantalla hacía `redirect("/login")`, y el middleware —que sí ve la sesión— la rebotaba a `/cursos`. Las dos se reenviaban entre sí hasta que el navegador cortaba con ERR_TOO_MANY_REDIRECTS, **sin ningún mensaje**.
- **Es la trampa exacta de quien crea el usuario a mano** en el panel de Supabase: ese panel crea la cuenta de auth pero NO la fila de `profiles`. Igual pasa si el webhook de Hotmart falla a mitad (crea el usuario y muere antes de insertar el perfil).
- **Arreglo:** `lib/curso.ts` devuelve un curso vacío con una alumna sintética (`status: "sin_perfil"`, `tieneAcceso: false`) y `lib/ojo-experto.ts` devuelve el estado vacío sin acceso. Las pantallas se dibujan y explican qué pasó, con botón a soporte.
- **Verificado en navegador** con un usuario de auth creado a propósito SIN fila en `profiles`: `/cursos` → "Tu membresía no está activa", `/cuenta` → "Sin acceso al programa", `/ojo-experto` → "El Ojo Experto está en pausa", `/cursos/[leccion]` → un solo salto a `/cursos`. Cero bucles. Capturas: `.playwright-mcp/s7i-sinperfil-cursos.png`, `s7i-sinperfil-cuenta.png`, `s7i-sinperfil-ojo.png`.

### Cómo funciona el envío del enlace (para no perder tiempo depurando)
- El magic link **NO se envía si el correo no existe en `auth.users`**: `lib/auth.ts` usa `shouldCreateUser: false` a propósito (las cuentas solo las crea el webhook al pagar). Por anti-enumeración la pantalla dice igual "revisa tu correo" aunque no se haya mandado nada — es deliberado, no un bug.
- La fila en `profiles` **no influye en el envío**, solo en poder entrar y ver contenido.

### 🔴 BLOQUEA EL LANZAMIENTO: falta SMTP propio
El remitente por defecto de Supabase manda ~2 correos por hora y **solo a direcciones del equipo del proyecto** → ninguna alumna recibiría su acceso después de pagar.
- Resend en Supabase: **Project Settings → Authentication → SMTP Settings** · host `smtp.resend.com` · puerto `465` · usuario `resend` · password = la API key `re_...`.
- Para probar sin dominio sirve `onboarding@resend.dev`, pero **solo entrega al correo dueño de la cuenta de Resend**. Para alumnas reales hay que verificar el dominio (SPF/DKIM).
- Después subir **Rate Limits → "emails per hour"**.

### ⚠️ Cambiar la plantilla del correo a `token_hash`
La plantilla por defecto usa PKCE (`?code=`), que exige abrir el enlace **en el mismo navegador que lo pidió**. La alumna lo pide desde Chrome, abre el correo en Gmail, y el enlace se abre en el navegador interno de Gmail → otro almacenamiento → "enlace vencido". Con audiencia móvil pasa constantemente.
- **Authentication → Email Templates → Magic Link**, poner:
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink`
- El callback ya soporta las dos formas (`app/auth/callback/route.ts`) — **no se toca código**.

### ⚠️ URL Configuration
- Site URL: `https://TU-APP.vercel.app`
- Redirect URLs: `https://TU-APP.vercel.app/auth/callback` y `http://localhost:3000/auth/callback`

### Atajo para entrar sin correo, apuntando a producción
```
APP_URL=https://TU-APP.vercel.app npm run alumna:crear -- tu@correo.com anual active
```

⏸️ ANTERIOR (2026-08-02) — Sesión 6 casi cerrada. **Supabase y el Ojo Experto FUNCIONAN DE VERDAD, probados contra los servicios reales.** HECHO: modelo de negocio migrado a SUSCRIPCIÓN ($19.99/mes · $199/año) en toda la app + legales; IA en Gemini `gemini-3.6-flash`; webhook con ciclo de vida de suscripción; filtro de tema + memoria por alumna; Supabase con 8 tablas, RLS y 2 migraciones; **prueba end-to-end pasada: 2 fotos reales de bolsos analizadas correctamente, 1 pregunta técnica respondida, 1 pregunta fuera de tema y 1 intento de inyección de prompt ambos bloqueados**. / Siguiente acción exacta: conectar las pantallas a Supabase (hoy leen de `lib/demo-data.ts`), sembrar la tabla `modulos`, y después Hotmart (la dueña pidió dejarlo para el final).

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
- ~~Videos: se embeben desde Hotmart~~ → **DESCARTADO el 2026-08-04**, ver la sección "Los videos NO pueden salir de Hotmart" abajo.
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
- ~~No confirmado si "Hotmart Player" está contratado~~ → **RESUELTO el 2026-08-04: no existe, no se puede.** Ver "Los videos NO pueden salir de Hotmart".
- La landing NO tiene testimonios con nombre — decisión deliberada: la dueña pidió inventarlos "mientras agregamos unos reales" y el agente se negó (riesgo real de moderación de Hotmart/publicidad engañosa, no solo regla del SO) — la dueña lo aceptó. Solo queda el agregado real (+1.200 alumnas · 4.9/5) hasta tener 2-3 reales.
- `direcciones-abc.html` sigue en la raíz del proyecto — recordar borrarlo antes de subir el repo o hacer deploy (no se sube a producción).
- Título de pestaña de `/login` no personalizado (hereda el de Home) — es "use client" y no puede exportar `metadata`; solucionable con un layout.tsx propio del grupo `(auth)` si se quiere pulir, no bloqueante.

## Pendientes del usuario (Sesión 7 — bloquean la calidad visual)
- [ ] 🔴 **3-5 FOTOS de bolsos terminados** (buena luz, fondo simple). Sin ellas la app no puede aplicar su propio sello visual (foto a sangre + grano, la Opción B que ella eligió) y el revisor deja el eje de identidad en 2/5 en las 4 pantallas. Es lo que más sube la nota ahora mismo.
- [ ] 🔴 **El listado completo de lecciones** de las secciones 2, 3 y 4 (~49 faltan). Hoy la app muestra 9 de ~58 y dos secciones salen con el aviso "estamos subiendo estas lecciones".
- [ ] **Nombres reales de los tutoriales**: en Hotmart se llaman "Tutorial 2", "Tutorial 3"… La alumna no puede elegir ni recordar dónde está la técnica que busca. Bastaría una línea por lección ("qué parte del bolso resuelve").

## Pendientes del usuario (Sesión 6 — bloquean el resto)
- [ ] 🔴 **Elegir dónde se alojan los videos y subirlos** (Bunny recomendado, Vimeo alternativa). El reproductor de Hotmart NO se puede usar fuera de Hotmart Club — confirmado por su soporte. Sin esto la app no tiene curso que mostrar. (Comparación de costos en la sección "Los videos NO pueden salir de Hotmart".)
- [ ] 🔴 **Resend + SMTP en Supabase.** Sin esto ninguna alumna recibe su enlace de acceso después de pagar. Bloquea el lanzamiento igual que el producto de Hotmart. (Pasos exactos en la sección "Correo / magic link en producción".)
- [ ] 🔴 **Hotmart — crear el producto de SUSCRIPCIÓN.** El link actual en `lib/config.ts` es el del producto VIEJO de pago único ($25). Hasta que exista el producto de suscripción y se peguen los dos links (`CHECKOUT_MENSUAL` y `CHECKOUT_ANUAL`), los botones de la landing cobran el producto equivocado. **Esto bloquea vender.**
- [x] ~~**Supabase**: crear proyecto y esquema~~ — HECHO 2026-08-02. Proyecto `cazqmaluaehyikkstkoi` ("Manos creadoras app", us-west-2). Las 8 tablas creadas con RLS activo; migraciones `0001_init` y `0002_endurecer_tiene_acceso` aplicadas vía MCP. URL y clave publishable ya escritas en `.env.local`.
- [x] ~~Claves de Supabase y Gemini~~ — PUESTAS y VERIFICADAS contra los servicios reales (2026-08-02).
- [ ] ⚠️ **Confirmar que la clave secreta de Supabase fue ROTADA.** Se pidió rotarla tras el incidente (quedó en `.env.example` y pasó por el chat); no se pudo verificar desde acá si la vieja fue revocada. Si aún no se hizo: Project Settings → API Keys → crear nueva + revocar la anterior.
- [ ] **Hotmart — webhook**: panel → Herramientas → Webhook → apuntar a `https://TU-DOMINIO/api/webhooks/hotmart` y pegar el hottok. ⚠️ Verificar ahí los nombres EXACTOS de los eventos de suscripción y contrastarlos con la tabla `EVENTO_A_ESTADO` del webhook — el catálogo varía por cuenta.
- [ ] **Vercel**: crear cuenta y conectar el repo para publicar.

## Pendientes anteriores del usuario
- [ ] **Mandar 2-3 testimonios reales** (las capturas de WhatsApp de alumnas que mencionaste tener) para agregarlos a la sección "La app por dentro".
- [x] ~~Confirmar si tiene "Hotmart Player" contratado~~ → el soporte de Hotmart respondió que NO se puede usar fuera de Hotmart Club. Reemplazado por la decisión de alojamiento de video (arriba).
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
