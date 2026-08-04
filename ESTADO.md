# ESTADO — Manos Creadoras App
Última actualización: 2026-08-04 · El detalle de cada sesión vive en el historial de git; aquí queda solo lo que sigue siendo cierto y accionable.

⏸️ **CHECKPOINT (2026-08-04)** — La app interna funciona con datos reales de Supabase y los videos ya no dependen de Hotmart. **Lo que se ha construido hasta ahora es el ambiente de QA.** Nada bloquea por el lado del código: los 4 bloqueos que quedan son cuentas y material de la dueña (ver abajo).

---

## 🔴 BLOQUEOS PARA LANZAR (nada de esto es código)

- [ ] **Videos: elegir dónde alojarlos y subirlos.** Recomendación cerrada: **Bunny Stream**. Sin esto la app no tiene curso que mostrar. → guía completa en "Video".
- [ ] **Resend + SMTP en Supabase.** Hoy ninguna alumna recibiría su enlace de acceso después de pagar. → guía en "Correo / magic link".
- [ ] **Hotmart: crear el producto de SUSCRIPCIÓN.** `lib/config.ts` apunta al producto VIEJO de pago único ($25), así que los botones cobran lo equivocado. **Esto bloquea vender.**
- [ ] **Supabase de PRODUCCIÓN**: crear proyecto nuevo y correr ahí las 6 migraciones. El actual (`cazqmaluaehyikkstkoi`) queda como QA. → ver "Ambientes".
- [ ] **Hotmart — configurar el webhook**: panel → Herramientas → Webhook → apuntar a `https://TU-DOMINIO/api/webhooks/hotmart` y pegar el hottok en `HOTMART_HOTTOK`. ⚠️ Verificar ahí los nombres EXACTOS de los eventos de suscripción y contrastarlos con la tabla `EVENTO_A_ESTADO` del webhook — el catálogo varía por cuenta.
- [ ] **Vercel**: crear la cuenta y conectar el repo para publicar.

### ⚠️ Seguridad pendiente
- [ ] **Confirmar que la clave secreta de Supabase fue ROTADA.** Incidente del 2026-08-02: quedó en `.env.example` (archivo público) y pasó por el chat. No se detectó en git, pero esa clave salta todo el RLS. Project Settings → API Keys → crear nueva + revocar la anterior.

### Material de la dueña (bloquea la calidad, no el lanzamiento)
- [ ] **3-5 fotos de bolsos terminados** (buena luz, fondo simple). Sin ellas no se puede aplicar el dispositivo ownable de la ficha; el revisor deja el eje de identidad en 2/5 en las 4 pantallas. Es lo que más sube la nota.
- [ ] **Listado completo de lecciones** de las secciones 2, 3 y 4 (~49 faltan; hoy hay 9 cargadas).
- [ ] **Nombres reales de los tutoriales**: en Hotmart se llaman "Tutorial 2", "Tutorial 3"… La alumna no puede recordar dónde está la técnica que busca. Bastaría una línea por lección.
- [ ] **2-3 testimonios reales** (las capturas de WhatsApp) para la landing.

---

## Estado actual del producto

**Funciona y está verificado contra los servicios reales:**
- Landing pública (10 secciones canónicas) + 4 páginas legales, con el checkout de Hotmart conectado.
- Login por enlace mágico (Supabase Auth). `shouldCreateUser: false` es deliberado: las cuentas solo las crea el webhook al pagar. Anti-enumeración activa.
- Webhook de Hotmart con las 4 defensas: autenticidad (hottok en tiempo constante), frescura (ventana de 5 min), idempotencia (PK sobre `event_id`) y máquina de estados (un `PURCHASE_APPROVED` tardío no resucita a quien reembolsó).
- App interna: `/cursos`, `/cursos/[leccion]`, `/ojo-experto`, `/cuenta` — **leyendo y escribiendo datos reales de Supabase**.
- El Ojo Experto responde de verdad (Gemini), con memoria por alumna, filtro de tema, uso justo (40 preguntas + 8 fotos/mes) y circuit-breaker de gasto diario. Probado con fotos reales de bolsos; intentos de inyección de prompt bloqueados.
- Supabase: 8 tablas, RLS en todas, 6 migraciones en `supabase/migrations/`.

**Calidad visual:** 3 rondas del subagente `revisor-visual` → subió de 28-30/40 a **31-35/40** usabilidad y 13-14/20 craft. **No llega al listón (36/40 · 16/20)** y el techo ya no es código: falta el material fotográfico de la dueña.

---

## Ambientes (QA vs producción)

⚠️ Todo lo construido hasta hoy es **QA**. Las claves y servicios que aparecen en este documento son los de QA.

| Servicio | ¿Claves separadas? | Cómo |
|---|---|---|
| **Bunny Stream** | ✅ Sí | Dos bibliotecas de video — las claves son por biblioteca, no por cuenta |
| **Supabase** | ✅ Sí | Un proyecto por ambiente; las migraciones están en archivo y se replican |
| **Gemini** | ✅ Sí | Varias API keys en Google AI Studio; conviene una por ambiente para separar el gasto |
| **Resend** | ✅ Sí | API keys independientes; el dominio verificado puede compartirse |
| **Vercel** | ✅ Nativo | Variables por entorno (Production / Preview / Development) — ahí se enchufa todo lo anterior |
| **Hotmart** | ❓ Por confirmar | Verificar si tiene ambiente de pruebas para el webhook |

---

## Video (2026-08-04) — resuelto en código, falta la cuenta

### El hallazgo
El soporte de Hotmart confirmó por escrito: **el Hotmart Player funciona SOLO dentro de Hotmart Club, no existe código de inserción para sitios externos.** La arquitectura asumida desde la Sesión 3 (`lecciones.hotmart_id` + iframe a `cf-embed.play.hotmart.com`) nunca habría funcionado.

Dato útil: **ellos mismos recomiendan alojar el video en otro servicio y embeber ESE video dentro de Hotmart Club** — un solo archivo sirve para la app y para el Club, sin subir nada dos veces.

### Lo que ya está hecho
- Migración `0006`: fuera `hotmart_id` (estaba 100% vacía); entran `video_proveedor` (`bunny`|`vimeo`|`youtube`), `video_id` y `recurso_url`, con constraint que impide guardar un video a medias.
- `recurso_url` tapó un agujero que nadie había visto: las lecciones `pdf` (patrones) y `enlace` (comunidad) **no tenían dónde guardar su destino**.
- `lib/video.ts`: arma la URL del reproductor según el proveedor, solo en servidor. Para Bunny **firma el enlace y lo hace caducar a las 6 h**.
- `ContenidoLeccion`: reproduce video, o muestra un botón real para PDF/enlace, o el marcador honesto si no hay nada.
- Hotmart queda SOLO para el cobro (checkout + webhook).

Verificado en navegador a 375px: YouTube y Vimeo reproducen, el PDF muestra su botón. La firma de Bunny coincide con su fórmula documentada.

### Precios de Bunny (verificados en su documentación)
Almacenamiento $0,01/GB · Entrega **Norteamérica (incl. México) $0,010/GB** · **Sudamérica $0,045/GB** · Codificación estándar **gratis**.

- El titular de "$0,005/GB" es solo Europa/Norteamérica en volumen alto: **Sudamérica cuesta 9× más**.
- ⚠️ **NO activar la codificación premium** ($0,025-$0,150/min): con 24 h de video serían $36-$216 de golpe. La estándar es gratis y se ve perfecta.
- No hay cargo mínimo mensual (el de $99 es solo del DRM Enterprise, que no se necesita).

**Con 500 alumnas y 160 GB:** almacenamiento $1,60/mes fijo; el tráfico manda (≈0,9 GB por hora vista). Mes realista (4 h/alumna) ≈ **$56/mes** = 0,6% del ingreso. Mes de lanzamiento (todas ven todo) ≈ $490 = 4,9%. El primer mes siempre es el más caro.

### Por qué se descartó Vimeo
- **Vimeo normal** (Starter $12 / Standard $25 / Advanced $75, precio anual): los tres tienen **el MISMO tope de 2 TB/mes** de tráfico. Se agota con **~92 alumnas** viendo el curso completo, o ~555 mirando 4 h. Con +1.200 alumnas esperando, el techo llega justo cuando el negocio arranca. Su Starter solo promete "contraseña y enlaces ocultos" — no se pudo confirmar restricción por dominio.
- **Vimeo OTT** ($1 por suscriptor/mes + 10% de ventas): no es alojamiento, es una plataforma de membresías que **reemplazaría a esta app** — y no puede alojar El Ojo Experto, lo único que justifica cobrar $19,99/mes. A 500 alumnas: $500/mes, lo mismo que el PEOR mes de Bunny pero todos los meses.

### Seguridad de Bunny (verificada)
| Capa | Qué bloquea | Estado |
|---|---|---|
| **Hotlink Protection** (*Allowed Referrers*) | Reproducción desde otro sitio → 403 | Se activa en el panel |
| **Embed View Token** | Que el enlace del iframe sirva para siempre → caduca a las 6 h | ✅ ya en `lib/video.ts` |
| **CDN Token** | Que alguien saque la URL del archivo (HLS, MP4) y la comparta | Pendiente |

- Los dos tokens **no protegen lo mismo**: uno firma el iframe, el otro los archivos por debajo. Conviene activar ambos; el de CDN no es urgente.
- ⚠️ *Block Direct URL File Access*: **dejarlo apagado al principio** — su propia documentación avisa que también bloquea clientes de correo y algunos navegadores.

### QA y producción con claves separadas ✅
En Bunny **las claves son por biblioteca, no por cuenta** (*"per-library Stream API key"*). Se crean **dos bibliotecas**: cada una trae su Library ID, su API key de subida, su Token Authentication Key y su propia lista de Allowed Referrers.

| | QA | Producción |
|---|---|---|
| Contenido | 1-2 videos de prueba | los 58 reales |
| Almacenamiento | ~$0,02/mes | ~$1,60/mes |
| Allowed Referrers | `localhost` + dominio de pruebas | solo el dominio real |

**No hay que tocar código**: `lib/video.ts` ya lee `NEXT_PUBLIC_BUNNY_LIBRARY_ID` y `BUNNY_TOKEN_KEY`; cambiar de ambiente es cambiar valores en Vercel.

⚠️ La **Account API Key** es global y da acceso TOTAL — no se usa en la app y nunca se versiona.

### Guía de arranque
1. [Quickstart](https://bunny.net/docs/stream/quickstart) — crear biblioteca y subir el primer video (activar ≥2 regiones)
2. [El panel por dentro](https://bunny.net/docs/stream/dashboard)
3. [Subir desde una URL](https://bunny.net/docs/stream/url-fetch) — ⭐ si los videos ya están en Drive/Dropbox/Hotmart, Bunny los jala solo y **la dueña se ahorra subir 160 GB desde su casa**
4. [Subidas reanudables TUS](https://bunny.net/docs/stream/tus-resumable-uploads) — retoma si se corta el internet
5. [Seguridad](https://bunny.net/docs/stream/security) · [Token de embed](https://bunny.net/docs/stream/token-authentication) · [Hotlink Protection](https://bunny.net/docs/cdn/security/hotlink-protection)
6. Ya implementado: [Embeber](https://bunny.net/docs/stream/embedding) · [Reproductor](https://bunny.net/docs/stream/player) · [Precios](https://bunny.net/docs/stream/pricing)

**Orden de trabajo:** crear cuenta y **ponerle tope de gasto mensual** → crear biblioteca QA con 1-2 videos → activar Token Authentication y agregar `localhost` a Allowed Referrers → pasarme Library ID + Token Key (⚠️ la clave **no se pega en el chat**, va a variables de entorno) → verifico end-to-end → repetir para producción.

---

## Correo / magic link — pendiente de configurar

### 🔴 Falta SMTP propio (bloquea el lanzamiento)
El remitente por defecto de Supabase manda ~2 correos/hora y **solo a direcciones del equipo** → ninguna alumna recibiría su acceso.
- Resend: **Project Settings → Authentication → SMTP Settings** · host `smtp.resend.com` · puerto `465` · usuario `resend` · password = la API key `re_...`.
- Para probar sin dominio sirve `onboarding@resend.dev`, pero **solo entrega al correo dueño de la cuenta de Resend**. Para alumnas reales hay que verificar el dominio (SPF/DKIM).
- Después subir **Rate Limits → "emails per hour"**.

### ⚠️ Cambiar la plantilla a `token_hash`
La plantilla por defecto usa PKCE (`?code=`), que exige abrir el enlace **en el mismo navegador que lo pidió**. La alumna lo pide en Chrome, abre el correo en Gmail, el enlace se abre en el navegador interno de Gmail → "enlace vencido". Con audiencia móvil pasa constantemente.
- **Authentication → Email Templates → Magic Link**: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink`
- El callback ya soporta las dos formas — **no se toca código**.

### URL Configuration
Site URL `https://TU-APP.vercel.app` · Redirect URLs: `https://TU-APP.vercel.app/auth/callback` y `http://localhost:3000/auth/callback`

### Cómo funciona el envío (para no perder tiempo depurando)
- El enlace **NO se envía si el correo no existe en `auth.users`**. Por anti-enumeración la pantalla dice igual "revisa tu correo" — es deliberado, no un bug.
- La fila en `profiles` no influye en el envío, solo en poder entrar.

### Atajo para entrar sin correo
```
APP_URL=https://TU-APP.vercel.app npm run alumna:crear -- tu@correo.com anual active
```

---

## Decisiones cerradas (no se re-preguntan)

**Producto**
- **Modelo: SUSCRIPCIÓN** $19.99/mes o $199/año (=$16.58/mes, "2 meses gratis"). El plan anual es el recomendado. Reemplazó al pago único de $25 el 2026-08-02; el texto viejo de "acceso de por vida" fue eliminado de toda la app (era información falsa y riesgo de disputas).
- El cobro es 100% en Hotmart. **No hay paywall propio**: login automático post-compra vía webhook.
- Consecuencias legales ya implementadas: `/cancelar`, cláusula de renovación automática y de cambio de precio, política de reembolso que distingue primer pago vs renovaciones.
- **Uso justo del Ojo Experto**: 40 preguntas + 8 fotos/mes. Con la suscripción el costo de IA pasó de ~28% de un pago único a <1% del ingreso recurrente.
- **Las lecciones NO se bloquean secuencialmente** (decidido 2026-08-03): en Hotmart la alumna ya tiene todo abierto; bloquear sería un retroceso que notaría el primer día. El avance lo marca ella. ⚠️ Reversible si la dueña prefiere lo contrario.
- **La sección 1 no cuenta para el % de avance** (es bienvenida y recursos): migración `0005`, columna `secciones.cuenta_progreso` — por dato, no hardcodeado.

**Técnicas**
- **Next.js App Router** (SEO + rutas privadas + API routes).
- **IA: Gemini** (`AI_MODEL`, hoy `gemini-3.6-flash`) vía patrón BFF — la clave nunca toca el navegador. ~$0,014 por alumna activa al mes. ⚠️ Riesgo asumido: es el modelo con menos finura visual de los evaluados; si aparecen consejos flojos sobre fotos, la palanca es subir de modelo (es cambiar `AI_MODEL` + la clave).
- **Auth**: Supabase Auth con enlace mágico, sin contraseña. La cuenta la crea el webhook al pagar, usando el email de la compra como llave.
- **Variables de entorno validadas POR USO** (`aiEnv` / `hotmartEnv`), no todas de golpe: así una clave de Hotmart vacía no tumba al Ojo Experto.
- **Dirección de arte: CERRADA** — ver `FICHA-ARTE.md` (opción B "Editorial de Revista"). Fondo #090706 · dorado #ebcd8c→#d48e00 · Cormorant Garamond + Jost. Dispositivo ownable: foto a sangre + grano + display superpuesta.
- **Avatar: ver `FICHA-AVATAR.md`** — "Marcela", 28-45, LATAM. Dolor #1: "mis bolsos no se ven profesionales". Consciencia 3-4, sofisticación 3.

---

## Estructura real del curso
- **4 secciones, ~58-64 lecciones** (el total exacto sigue sin confirmar). Modelo `secciones` → `lecciones`, con `user_progress` por lección.
- No todo es video: la sección 1 es bienvenida/comunidad/aviso/patrones (`texto`, `enlace`, `pdf`) y la 4 trae 6 PDFs. Por eso `tipo` y `duracion_seg` son nullable.
- Los títulos vienen **bilingües** desde Hotmart → `titulo` / `titulo_en`. Buen punto de partida para un plan en inglés.
- **Cargado hoy: 9 lecciones** (sección 1 completa + las 5 primeras de la 2 con duración real). Faltan ~49.
- Las 5 lecciones cargadas de la sección 2 ya suman 2h32m → el curso completo probablemente supera las 10 horas. **Dato vendible para la landing.**

---

## Herramienta de desarrollo: alumna de prueba
- `npm run alumna:crear -- correo@ejemplo.com [mensual|anual] [active|cancelled]` — crea la cuenta + su perfil (igual que el webhook) e **imprime el enlace de acceso directo**, sin depender del correo.
- `npm run alumna:borrar -- correo@ejemplo.com` — la elimina con todos sus datos.
- ⚠️ Solo desarrollo: lee `.env.local` y usa la clave secreta. Nunca en producción.

---

## Problemas conocidos ⚠️
- La landing **no tiene testimonios con nombre**. Decisión deliberada: la dueña pidió inventarlos "mientras agregamos unos reales" y se rechazó (riesgo real de moderación de Hotmart y publicidad engañosa). Solo queda el agregado real (+1.200 alumnas · 4.9/5).
- `direcciones-abc.html` sigue en la raíz — borrarlo antes del deploy (no va a producción).
- Título de pestaña de `/login` no personalizado (es "use client" y no puede exportar `metadata`). Solucionable con un `layout.tsx` del grupo `(auth)`. No bloqueante.
- 2 avisos de lint preexistentes: `BarraProgreso` llama setState dentro de un efecto. No rompen nada.

---

## Notas operativas (leer antes de tocar la terminal)
⚠️ **El Node por defecto de la máquina es v10.23.0** (de 2018). Una terminal nueva arranca ahí y `tsc`/`next` REVIENTAN con `SyntaxError: Unexpected token ?` — no es el código, es Node viejo. **Correr `nvm use` al abrir la terminal del proyecto** (hay `.nvmrc`).
- **El proyecto corre en Node 22.23.2**: `@supabase/supabase-js` ya no soporta Node ≤20 (falla con "native WebSocket not found").
- ⚠️ Al cambiar de versión de Node hay que **reinstalar `node_modules` de cero** (`rm -rf node_modules package-lock.json && npm install`): se pierde el binario nativo `@next/swc-darwin-x64` y el build muere con "Turbopack is not supported on this platform".
- Opcional: `nvm alias default 22.23.2`.
- Servidor de desarrollo: `npm run dev` (puerto 3000 o el que Next asigne libre).

---

## Historial de sesiones
Detalle completo en el historial de git. Resumen:

| Sesión | Qué se hizo |
|---|---|
| 1 (07-31) | Validación, Constitución del Producto, FICHA-AVATAR, arquitectura técnica |
| 2 (07-31) | Identidad visual: protocolo A/B/C, la dueña eligió la opción B, FICHA-ARTE aprobada |
| 3 | Página de ventas (10 secciones) + 4 legales + checkout real de Hotmart |
| 4 (08-01) | Bienvenida post-compra + login magic link |
| 5 (08-01) | App interna (3 secciones + bottom nav) con datos semilla. ⚠️ Se descubrió que Cormorant **nunca había cargado** desde la Sesión 3 por una variable CSS auto-referenciada — todas las pantallas anteriores renderizaban con la sans del sistema |
| 6 (08-02) | Servicios externos reales: Supabase (8 tablas + RLS), webhook de Hotmart, Gemini. Migración del modelo a suscripción. ⚠️ Se detectó y cerró un agujero: `tiene_acceso(uid)` era llamable sin sesión desde `/rest/v1/rpc/` — cualquiera podía averiguar qué alumnas tenían membresía activa |
| 7 (08-03) | Pantallas conectadas a Supabase (se borró `lib/demo-data.ts`). 4 bugs reales corregidos, entre ellos el **bucle infinito de redirecciones** cuando hay sesión sin fila en `profiles` |
| 8 (08-04) | Video independiente de Hotmart (`lib/video.ts` + migración `0006`) |
