# ESTADO — Manos Creadoras App

**Última actualización: 2026-10-21.** Aquí solo entra lo que sigue siendo cierto
y accionable. El porqué de cada cosa vive en la cabecera de su archivo y en los
mensajes de commit, largos a propósito. **Lo que se termina, se BORRA de aquí.**

> **Podado el 2026-10-19 de 1080 líneas a estas.** Había dejado de servir: decía
> "12 migraciones" (hay 31), "el cobro es 100% Hotmart" (es OnePay desde el
> 16-oct), mandaba a `npm run acceso:dar` (no existe) y daba **cuatro precios
> distintos**, ninguno igual al del código. Lo podado está en `git log`.
>
> Quedan ~353 líneas y la regla del SO son 200. No se recorta más a costa de
> borrar un hecho vivo: si vuelve a crecer, lo primero que sale son los
> pendientes de código, no los bloqueos ni los avisos que cuestan dinero.

---

## Qué es esta app

Escuela de bolsos tejidos de Elizabeth Valencia. 16 bolsos en video, un
directorio de materiales y el **Ojo Experto** (mentor de IA que responde dudas y
revisa fotos del trabajo). Suscripción mensual o anual, cobrada por **OnePay**.

---

## 💵 EL PRECIO: UNO SOLO (2026-10-19)

Fuente única: `lib/planes.ts` → `PRECIOS`. **Ningún precio escrito en otro sitio.**

**US$9,99 al mes · US$89,90 al año** (= US$7,49/mes · ahorra US$30, 25%).
Son EXACTAMENTE los planes de OnePay: si un día no coinciden, manda OnePay —es
quien cobra— y la constante miente. Se cambian los dos sitios a la vez.

⚠️ **LA OFERTA DE LANZAMIENTO SE RETIRÓ ENTERA** (barra del reloj, los dos
juegos de precios, la cookie del middleware, `lib/oferta*.ts`). No fue un
cambio de precio: **la rebaja no existía**. OnePay tiene UN enlace por ciclo,
así que cobraba lo mismo a todo el mundo mientras la página anunciaba "antes
US$350" y el reloj no cambiaba nada al llegar a cero. Palabras de Cristian:
«no queremos fingir una rebaja de precio».
→ Para una oferta de verdad hace falta PRIMERO un segundo plan en OnePay y que
el enlace cambie al expirar. Si no, es decoración.

**En OnePay, empresa "Manos Creadoras"** (0028): mensual `01a14b95-f607…` y anual
`01a14b96-796a…`, que se lee "Mensual · 12 ciclos" = **cobra cada 12 meses**. Sin
período de prueba. Los enlaces viven en `plan_checkout`, no en el código.

---

## 💳 El circuito de pago, verificado de punta a punta (2026-10-17)

Webhook `ab3b6206` → `https://qa.manoscreadoras.co/api/webhooks/onepay`, 9
eventos, claves en `.env.local` y en Vercel **Preview**. Probado contra QA: sin
firma → 401 · pago → membresía activa + correo de bienvenida (visto en Resend) ·
repetido → `repetido` · cancelación → `cancelada` **conservando el acceso hasta
`vence_el`**.

Sin tocar SQL (manual en `docs/WEBHOOKS.md`): `npm run webhook:probar` dispara un
evento FIRMADO como lo haría OnePay (pagada · cancelada · impagada · vencida ·
basura · `--repetir` · `--url`) y `npm run webhook:ver [--malos] [--traza X]`
cuenta qué pasó. ⚠️ **OnePay corta a los 10s y si se repite DESACTIVA el
endpoint**; la 0025 añadió `duracion_ms` y el log marca `lento` a los 8s.

⚠️ **Producción NO se ha revisado.** Es muy probable que `RESEND_API_KEY` y
`RESEND_FROM` de Production sigan apuntando a **El Charcu**, como pasó en Preview.

---

## 🔴 Bloqueos para vender

- [x] ~~**BOTÓN "CANCELAR MI MEMBRESÍA"**~~ ✅ **CONSTRUIDO el 2026-10-19**, en
      `/app/plan`. Elimina la suscripción en OnePay por API
      (`DELETE /v1/subscriptions/{id}`, `lib/onepay.ts`) y, si eso falla,
      cancela igual en nuestra base y manda un aviso `ACCIÓN:` a Cristian y
      Elizabeth para hacerlo a mano. NO corta el acceso: conserva hasta el
      final del ciclo pagado. El FAQ y las páginas legales cambiaron en el
      mismo commit.
      🔴 **PERO LA LLAMADA A ONEPAY NUNCA SE HA EJECUTADO.** Las alumnas de
      prueba se activan a mano y no tienen suscripción en la pasarela, así que
      el código salta ese paso. Solo se prueba con una suscripción de verdad
      en QA — ver pendientes de abajo.
- [ ] 🔴 **`ONEPAY_API_KEY` EN VERCEL (Preview).** Sin ella el botón de
      cancelar no detiene el cobro: cancela en nuestra base y manda el aviso
      para hacerlo a mano. Es la misma `sk_test_…` del `.env.local`, y **nunca**
      como `NEXT_PUBLIC_`.
- [ ] **Identificación del responsable de los datos** (cédula o NIT de Elizabeth)
      y un domicilio → `lib/legal.ts` (`IDENTIFICACION`/`DOMICILIO`, hoy `null`).
      La Ley 1581 de 2012 lo exige. En `null` las páginas omiten la línea: quedan
      **incompletas, no falsas**.
- [ ] **Montar producción.** `icbhtsdalysatlizjlys` está **vacío**: las 31
      migraciones sin aplicar, un `db push` limpio sirve. Faltan la biblioteca de
      Bunny de producción y las variables en Vercel. Cuando aprueben la cuenta,
      crear un plan de US$1 y repetir la verificación completa. ⚠️ Los webhooks
      **no se comparten** entre empresas ni entre modos: hace falta uno propio.

### Contenido que solo puede dar la dueña
- [ ] 🔴 **Los videos llevan MARCA DE AGUA DE CAPCUT** (logo arriba a la
      izquierda; en uno pone "CapCut AI"), en una página que cobra. Reexportar.
- [ ] **2-3 testimonios reales** (capturas de WhatsApp). 🔴 Fallo nº1 del revisor
      visual, y **no se inventan**: el 17-oct se quitó un "4,9/5" sin respaldo.
- [ ] **Portada que falta: Esmeralda** (no llegó ninguna foto verde; Celeste
      Cálido recibió la suya el 2026-10-21). Las de los 4 bolsos nuevos y los 3 llaveros entraron el
      2026-10-21, asignadas por forma y materiales; **Icono y Perla Clásica son las
      menos seguras**, que Elizabeth las confirme. Formato: WebP 720×720, calidad 65.
- [ ] **Los 33 enlaces de AliExpress** (el botón dice "Enlace pronto").

---

## ⚠️ Riesgos aceptados por Cristian (no se re-discuten)

- ~~La portada de Anillos de Seda con la marca DIOR~~ ✅ **RESUELTO el
  2026-10-19** (migración 0031): Cristian entregó una foto limpia y sustituyó a
  la de la 0026. Era el PRIMER bolso del carrusel, o sea la primera imagen que
  ve quien llega por un anuncio. Esta vez **el seed también se actualizó**, que
  era el desfase que dejó la 0026.
- **Bunny no deja ocultar los controles del reproductor desde la URL** — solo por
  biblioteca, y esta sirve también las lecciones, donde la alumna sí necesita
  pausar. Una franja opaca de 72px tapa la barra en el visor de cápsulas.
- **El home no lleva dolor ni testimonios**: el diseño los quita a propósito.

---

## 🛒 HOME V3 — "MÁS VENTAS" (2026-10-20, sin commitear)

Brief y referencia: `design-ref/pantallas/` (21 imágenes). Renders reales en
`design-ref/estado-actual/home-v3/`. Orden: banner (con línea de precio) →
cápsulas → curso gratis → banda "1 de 16" → Ojo → Elizabeth → precio → FAQ →
cierre, y en móvil la **barra fija de compra** (sale al dejar el banner, se
esconde en `#precio`). Botón de compra a un toque en todo el recorrido.

**Decisiones de Cristian (no se re-preguntan):** WhatsApp `+57 315 494 0311`
(`lib/landing.ts`) · el anual dice **"Un pago de US$89,90 al año"**, nunca "pago único" (se
renueva solo) · el Ojo conserva "Ojo Experto · Ilimitado con tu plan" y su copy.

**Hecho y verificado:** tsc ✓ build ✓ · a 390×844 titular + botón + línea de
precio caben sobre la barra (acaba en 771 de 772) · barra: oculta arriba y en
precio, no tapa el copyright · los botones de precio y cierre abren el enlace
OnePay correcto de `plan_checkout` · FAQ con teclado + JSON-LD · Mixpanel
recibe `cta_inscribirme_click`, `plan_toggle`, `faq_open` (`whatsapp_click`
no se probó en vivo). Borrados `LlamadaAPlanes` y `BarraInferiorHome`; de
`lib/landing.ts` salieron 5 bloques muertos con datos falsos. `INCLUYE` cambió
también en Mi plan y en el selector de pago.

- 🔴 **QUIEN PAGA SIN CUENTA QUEDA HUÉRFANO.** El webhook busca a la alumna por
  el correo del checkout; si no tiene cuenta, el pago no se asigna, no sale el
  correo y hay que activarla a mano. Con los "Inscribirme" yendo directo a
  OnePay, puede ser la mayoría de compradoras nuevas. La FAQ lo dice; el arreglo
  de verdad es **crear la cuenta al llegar el pago**.
- 🟡 **`FICHA-ARTE.md` desfasada otra vez** (revisor, 2026-10-20): dice body Jost y CTAs pill; la app y la referencia usan Manrope y botones de 10-12px. Lo decide Cristian.
- ✅ Testimonios: 5 fotos reales de la comunidad de Telegram bajo Elizabeth,
  con sus frases literales (`lib/landing.ts`). 🟡 **Pedirles permiso** a
  Jenifer (Jenatelier) y Andrea antes de producción: son personas reales.

---

## 👜 CATÁLOGO: 20 BOLSOS, 3 LLAVEROS Y LAS CÁPSULAS CON SUS 5 VIDEOS (2026-10-20)

Fuente: `Manos_Creadoras_desde_Perla_Clasica_CORREGIDO.pdf`. Cargado en **QA**:
Perla Clásica, Corazón Dorado, Icono y Mini Perlina (orden 17-20, 12 lecciones,
16 videos; total 103). Los 21 videos del PDF se comprobaron en Bunny ANTES de
cargar. Cápsulas: Hilo adecuado · Nueva fila · Nuevo hilo · Tejido firme · Aro
lateral, cada una con su video (ya no se repite ninguna).

- **Llaveros (21-23: Mora, Chispitas, Ónix).** El "ID proporcionado" del PDF
  es su identificador, NO su video (Bunny da 404). Los videos los mandó
  Elizabeth aparte y están verificados. Un llavero = UN video completo: va como
  video de materiales y sin lecciones. Se reconocen por el slug `llavero-`
  (`esLlavero()`): el home y Mi plan cuentan solo bolsos ("20"), el catálogo
  dice "20 bolsos y 3 llaveros".
- Para añadir bolsos: `node scripts/seed-bolsos.mjs --solo slug1,slug2`. ⚠️ Sin
  `--solo` recarga los 20 y regenera sus lecciones.
- `scripts/seed-capsulas.mjs` estaba desfasado (ponía `video_id: null`); ya
  lleva los datos reales.
- ⚠️ **Producción** recibirá estos datos al montarla corriendo los dos seeds; la
  migración 0030 deja la versión vieja de las cápsulas y el seed la pisa.

---

## ⚠️ Pantallas que el revisor visual NO aprueba (listón: 36/40 y 16/20)

| Pantalla | Nota | Qué falta |
|---|---|---|
| Home v3 (2026-10-20) | 30/40 · 14/20 · 12/20 copy · **FIEL** | Copy sin dolor del avatar (ni "YouTube" ni "acabado de boutique"), falta FAQ "¿puedo vender lo que haga?", CTAs sin beneficio. Ya corregidos tras la nota: grano en bloques oscuros, botón bronce del héroe, header opaco, barra oculta sobre el Ojo, radios del Ojo. **Sin re-puntuar.** |
| Mi plan | 27/40 · 14/20 · 12/20 | Prueba social real (arriba). Menor: el CTA sin estado de carga |
| Las dos del visitante | 31/40 · 14/20 | Nota del 15-sep, **no cuenta dos arreglos posteriores** |

Lo que más subiría la nota sin depender de nadie: **las 5 fotos de bolsos sin
usar** de `public/images/` (glacier-blue, onix-cristal, pearl-bow, pearl-coin,
pearl-royale).

---

## 🎨 EL OJO EXPERTO, REDISEÑO v4 — PLANO (2026-10-20)

Contrato visual: `design-ref/ojo-v4-claude-code/` (11 pantallas + su prompt).
**Es cosmético**: no se tocó el endpoint, los cupos, el streaming ni el
historial.

**La regla de v4 es que no hay relieve.** Ni degradados, ni sombras, ni glow,
ni blur, ni círculos — solo color sólido y líneas de 1px. El avatar del ojo se
sustituye por un **tile cuadrado con `Sparkles`**. Auditado: 0 infracciones en
los tres archivos.

⚠️ **EL CAMBIO CON MÁS EFECTO NO FUE DE COLOR: fue quitar la altura fija.**
`OjoDemo` metía el chat en una caja de 520px con scroll propio (`h-130` +
`overflow-y-auto`). En un teléfono eran dos scrolls peleando y la respuesta del
Ojo —lo único que hay que leer— asomaba por una rendija. Ahora la sección crece
con su contenido.

**Cinco tokens nuevos** en `globals.css` (`--sand-hover`, `--espresso-2`,
`--espresso-line`, `--line-strong`, `--on-dark-muted`): tonos intermedios que
el lenguaje plano necesita y que los 12 de marca no cubrían.

**Tres decisiones tomadas al aplicarlo:**
1. La tarjeta destacada es la de FOTO ("¿Está pareja mi tensión?"), no una de
   las cuatro preguntas: el layout pide 1 destacada + 4, y la de foto es la
   única función que la alumna no adivina sola.
2. En las sugerencias manda la PREGUNTA, no el área. Con el área en grande se
   leía como un índice de categorías.
3. Los eyebrows siguen la IMAGEN ("Elige una duda"), no el texto del prompt
   ("Prueba con una de estas"): las dos fuentes decían cosas distintas.

⬜ **PENDIENTE, y es decisión de Cristian:** el chip de contexto
("Gota de Rocío · Paso 4") sigue abajo junto al composer, no arriba en la
cabecera como pide el diseño. No es cosmético: ese chip ES el selector con el
que se elige bolso y paso, así que subirlo cambia dónde se interactúa.

---

## 🤖 EL OJO EXPERTO, AHORA ASISTENTE CREATIVA (2026-10-20)

Dejó de ser un ayudante de tejido. El prompt cubre **cinco áreas**: materiales
y tejido, fotografía, diseño creativo, contenido para redes, y marca y ventas.
Tejer ya se aprende con los videos; lo que justifica pagar es el resto.

⚠️ **El filtro de tema NO se quitó, se reescribió.** Sin él, el Ojo contesta
recetas y tareas escolares con el presupuesto de IA. La regla pasó de "solo
tejido" a "solo el negocio de bolsos tejidos de esta alumna".

⚠️ **El prompt distingue lo que HACE de lo que INDICA**: escribe prompts y
guiones, no genera imágenes. Prometer de más aquí se paga en soporte.

**Dos bugs de fondo que salieron y están arreglados:**
1. **Cada pregunta abría una conversación NUEVA.** El chat era por dentro una
   ristra de consultas sueltas y el historial crecía una entrada por pregunta.
   Ahora el endpoint acepta `conversacionId` —solo si el hilo es de esa
   alumna— y escribe en él.
2. **El panel enlazaba a `/app/ojo/<id>`, una ruta que no existía**: todas las
   conversaciones del historial daban 404. Creada.

**Verificado contra la IA real** (con `AI_SIMULAR_IA=0`): las cuatro preguntas
sugeridas responden concreto y ninguna se marca fuera de tema — incluida la de
videos para redes, que el prompt viejo habría rechazado.

✅ **Decisión de Cristian: 30 imágenes al mes en Premium** cuando exista la
generación de imágenes. El texto sigue ilimitado; se topan las imágenes por
caras. El tope va en `plan_cupos`, no en código, y **se anuncia antes de
comprar**.

👉 **El plan completo y lo que falta está en `docs/PLAN-OJO-EXPERTO.md`**:
quedan F4 ("Dale vida a tu bolso"), F5 (banco de evaluación) y F6 (diseño
premium con streaming). Eso es producto nuevo, no arreglos.

⚠️ Durante las pruebas Google devolvió varios **503 "high demand"**. Es caída
suya, pero la pantalla lo enseña como "No pudimos conectar". Si se repite,
toca reintentar en el servidor.

---

## 🟡 Pendientes de código (no bloquean vender)

- 🟡 **EL AUDIO DE LOS VIDEOS: SIN OÍR EN UN TELÉFONO REAL** (2026-10-20).
  Los **tres** sitios con video —cápsulas, curso gratis y lecciones de `/app`—
  comparten el mismo reproductor y la misma lógica: intentan sonar y, si no
  les dejan, se remontan mudos. El peor caso es un video mudo, nunca parado.
  Falta **oírlo en un celular**; desde el navegador no se puede.
  ⚠️ **NO reabrir el tema sin leer los comentarios de `ReproductorEnSitio` y
  `VideoDeHistoria`**: están probadas y descartadas las tres vías obvias
  (`muted=false` → no arranca · `unmute` tras `ready` → lo pausa · reloj desde
  el montaje → silencia videos que sí podían sonar, que es el bug que reportó
  Cristian). Hoy decide `ready` + 2 s, con un tope absoluto de 6 s por si
  `ready` no llega nunca.
- **Queda una cookie `oferta` huérfana** en los navegadores de quien ya visitó:
  el middleware dejó de escribirla y nadie la lee, pero dura un año. No hace
  daño; si molesta, se borra desde el middleware una temporada.
- **`lib/hotmart-verify.ts` es un huérfano** (nadie lo importa) y `lib/env.ts`
  conserva `HOTMART_HOTTOK` y `hotmartEnv()`. Borrar.
- 🟡 **Falta confirmar `x-vercel-ip-country` en QA.** En local no existe: la
  detección de país se verificó inyectando la cabecera a mano, y de ella depende
  qué enlace de pago ve cada quien.
- 🟡 **El token del enlace mágico llega como `pkce_…`**, que ata el enlace al
  navegador donde se pidió. Probar pidiéndolo en uno y abriéndolo en otro; si
  falla, se quita PKCE en `lib/supabase/client.ts`, **no se toca la plantilla**.
- **Los precios por token de `lib/costo-ia.ts` no están verificados** contra la
  lista de Google (los tokens sí). Contrastar un mes de `ai_spend` con la factura.
- **Eventos de Mixpanel sin verificar en vivo**: los del Ojo Experto,
  `correo_enviado`, `checkout_abierto`, `cuenta_creada`/`cuenta_iniciada`.
- **Correo distinto al de la compra**: falta el aviso en la landing y
  `npm run alumna:mover`. ⚠️ **Solo comando, nunca un botón.**
- 🟡 **EL CUPO DEL OJO SE DEVUELVE CUANDO NO RESPONDE** (2026-10-20, sin
  commitear). `devolverCupo` existía en `app/api/ojo-experto/route.ts` y nadie
  la llamaba: la pregunta se perdía si era fuera de tema, si el presupuesto del
  día estaba agotado o si Gemini fallaba. Ahora se llama en los tres, resta con
  compare-and-swap (antes escribía un número fijo y podía pisar otra pregunta),
  devuelve también la del visitante, y el mes sale en hora de Colombia como
  `periodo_actual()` (antes UTC: fallaba el último día del mes desde las 7 pm).
  El gasto de una respuesta fuera de tema ahora SÍ se apunta en `ai_spend`.
  ✅ Probado en QA: visitante con Gemini caído → 3 preguntas, `preguntas` sigue
  en 0. ⬜ Falta probar el camino de la alumna con cuenta y el de presupuesto
  agotado.
- 🟡 **`FICHA-ARTE.md` dice Jost y la app usa Manrope** (lo detectó el grafo de
  graphify, 2026-10-20). `app/layout.tsx` anota que Manrope reemplazó a Jost el
  2026-10-09, pero la ficha (líneas 18, 24, 34 y 42) nunca se actualizó. Corregir
  la ficha, no el código, salvo que Cristian decida otra cosa.
- Menores: `direcciones-abc.html` sigue en la raíz (ya ignorado por git) · título
  de pestaña de `/login` sin personalizar · 1 aviso de lint en `BarraProgreso`.

---

## Decisiones cerradas (no se re-preguntan)

**Producto**
- **Un solo plan** (0016): `gratis` (3 consultas / 1 foto al mes) y `completo`
  (600/60). Se acabaron Aprendiz/Creadora/Maestra.
- **El bolso gratis es Nácar Soñado**, y lo decide `gratis: true` en el seed — ni
  un slug escrito en el código.
- **Cancelar NO corta el acceso**: lo deja hasta `vence_el`. El mes es suyo.
- **Las lecciones no se bloquean secuencialmente.**
- **El muro sale al INTENTAR preguntar, no al abrir la pantalla**, y la pregunta
  escrita no se pierde. **El Ojo Experto responde sin cuenta** (0017) con dos
  frenos: 2 preguntas por huella contadas en la base y un presupuesto de IA
  aparte. La huella es un hash de IP + sal: **nunca la IP en claro**.

**Técnicas**
- **Next.js App Router** · **Gemini** (`AI_MODEL`, hoy `gemini-3.6-flash`) vía
  BFF · **Supabase Auth** con enlace mágico, sin contraseñas.
- **La puerta vive en la BASE, no en la pantalla.** `middleware.ts` tiene la
  lista de rutas privadas **vacía a propósito**: quién ve qué lo decide el RLS.
- **Las migraciones se aplican con `supabase db push`** y se comprueban con
  `supabase migration list`. Si el CLI no se puede usar, **se para y se avisa**:
  un esquema correcto con un historial mentiroso no falla hoy, falla al
  desplegar. **A producción no entra ninguna sin aprobación de Cristian, cada
  vez.** ⚠️ El conector MCP de Supabase no ve ningún proyecto; el CLI sí.
- **El Ojo Experto es ruta de Next, no edge function**: conserva el control de
  gasto y el presupuesto por público.
- **Modo simulado de IA**: `AI_SIMULAR_IA=1` **y** no estar en producción — la
  segunda condición no se puede apagar.
- **Mixpanel**: grabación de sesión APAGADA a propósito. Se le manda el ID de
  Supabase, nunca el correo, y con `ip: false`.
- **Arte** → `FICHA-ARTE.md`. **Avatar** → `FICHA-AVATAR.md`. Ambas cerradas.

---

## 🚀 PRODUCCIÓN PUBLICADA — CON LA VENTA APAGADA (2026-10-21)

**En vivo:** https://manos-creadoras.vercel.app (rama `main`, PR #2, `82338ce`).
`manoscreadoras.co` y `www` (→ redirige al apex) ya están en el proyecto, **falta
el DNS** en Namecheap: `A @ 216.198.79.1` y `CNAME www
54c77d9c2092c13e.vercel-dns-017.com`.

**Base de producción (`icbh…`):** 35 migraciones aplicadas con `db push` (la 0002
tenía un fallo de tilde que impedía montarla desde cero — corregido); esquema
idéntico a QA (24 tablas, 27 políticas, 52 índices, 0 sin RLS); catálogo cargado
con `ENV_FILE=.env.prod node scripts/seed-bolsos.mjs` y `seed-capsulas.mjs`,
igual fila a fila (219). Auth: Site URL `https://manoscreadoras.co`, redirects
(apex, www, vercel.app), las 6 plantillas del repo y SMTP de Resend. La
contraseña de la base es nueva y vive SOLO en `.env.prod` (que ahora sí es de
producción: claves de Supabase prod + servicios compartidos con QA).

**Vercel:** Production tiene SUS 19 variables (Supabase prod, `PUSH_ADMIN_SECRET`
propio, sin OnePay ni Hotmart ni IA simulada); Preview conserva las de QA.

**🔌 VENTA APAGADA:** `plan_checkout` vacío en producción y sin claves de OnePay.
Los "Inscribirme" llevan a `/pagar` → Mi plan → Contacto ("te escribimos con el
enlace de pago"); el webhook responde 401. **Para encenderla:** OnePay en modo
real → `sk_live`, webhook nuevo a `https://manoscreadoras.co/api/webhooks/onepay`
con su secreto y token en Vercel Production, las 4 filas de `plan_checkout` con
los enlaces reales, y una compra de US$1 de punta a punta.

**Verificado en vivo:** páginas 200, sin `noindex`, 19 imágenes sin rotas, "1 de
20 bolsos", cápsulas nuevas, Ojo Experto con IA REAL respondiendo con contexto
de Nácar Soñado, webhook sin firma → 401. Bunny ya permite `manoscreadoras.co`
(en `vercel.app` los videos dan 403: es esperado, ese no es el dominio final).

⚠️ **Pendientes:**
- 💵 **Vercel Pro (US$20/mes) antes de encender la venta** — Hobby prohíbe uso
  comercial. 💵 **Supabase Pro (US$25/mes) muy recomendado** — el gratis pausa la
  base tras una semana sin uso y no tiene copias de seguridad.
- **Gemini puede fallar por "alta demanda"** (pasó en la primera prueba en vivo:
  503 de Google). La pregunta se devuelve, pero la alumna ve un error. Conviene un
  reintento corto o un modelo de respaldo.
- El correo de acceso (enlace mágico) en producción no se probó con un envío real.
- Mixpanel comparte proyecto con QA (datos mezclados).
- Identificación legal (Ley 1581) y permiso de las alumnas de los testimonios.

---

## Ambientes

| | QA | Producción |
|---|---|---|
| Supabase | `cazqmaluaehyikkstkoi` | `icbhtsdalysatlizjlys` (35 migraciones + catálogo) |
| Bunny Stream | `772366` ("manos creadoras") | la MISMA biblioteca (ya permite `manoscreadoras.co`) |
| Vercel | rama `develop`, `qa.manoscreadoras.co` | rama `main`, `manos-creadoras.vercel.app` (dominio pendiente de DNS) |

QA despliega solo con cada `push` a `develop`, y desde el 2026-10-18 manda
`X-Robots-Tag: noindex` en **toda** respuesta fuera de producción
(`next.config.ts`): `Disallow` en robots.txt no basta para sacar de Google lo que
ya está indexado.

⚠️ **Supabase gratuito se PAUSA solo a las 3 semanas sin uso.** La página de
ventas sigue, pero el login, los videos y el Ojo Experto dan error. *Restore
project* lo arregla y **no se pierde nada** (comprobado).

⚠️ **Una variable `NEXT_PUBLIC_*` NO puede ser "Sensitive" en Vercel**: Next la
sustituye AL COMPILAR y quedaría vacía sin ningún error que lo delate.

**Al publicar, tres cosas fallan en silencio:** el *Site URL* de Supabase en
`localhost` (correos con enlaces que no existen) · el dominio fuera de los
*Allowed Referrers* de Bunny (videos en negro, 403) · cambiar las llaves VAPID
(todas las suscritas dejan de recibir avisos).

---

## Avisos que cuestan dinero

- **Bunny es PREPAGO.** Si llega a cero, los videos dejan de servirse **a alumnas
  que pagan**: revisar el saldo una vez al mes. ⚠️ **No activar la codificación
  premium** (con 24h de video serían $36-216 de golpe). **Sudamérica cuesta 9×
  más** que Norteamérica en entrega: con 500 alumnas, un mes normal ≈ $56; el de
  lanzamiento ≈ $490.
- **Los presupuestos de IA son globales por público, no por persona**: una sola
  alumna puede agotar el de `miembro`. Con varias decenas activas, decidir si el
  tope pasa a ser por cuenta.

---

## Notas operativas (leer antes de tocar la terminal)

⚠️ **El Node por defecto de la máquina es v10.23.0** (de 2018). Una terminal
nueva arranca ahí y `tsc`/`next` revientan con `SyntaxError: Unexpected token ?`
— no es el código. **Correr `nvm use`** (hay `.nvmrc`). El proyecto va en Node
22.23.2; al cambiar de versión, reinstalar `node_modules` de cero.

⚠️ **Esta terminal tiene `LC_CTYPE="C"`, no UTF-8**: al copiar una plantilla de
correo con `pbcopy` los acentos y las ñ se destrozan, **y el panel de Supabase lo
guarda sin avisar**. Usar `npm run correo:copiar <plantilla>` y MIRAR EL PREVIEW
antes de guardar.

⚠️ **Credenciales de El Charcu cruzándose en este repo: ya pasó TRES veces**
(plantilla de correo de Supabase, organización de OnePay, claves de Resend en
Vercel). Ante cualquier cosa rara con un servicio externo, **sospechar de esto
primero**.

**Comandos:** `npm run dev` · `alumna:crear|borrar` · `membresia:dar|quitar|ver`
· `seed:bolsos` · `seed:capsulas` · `webhook:probar|ver` · `push:enviar` ·
`correo:copiar` · `typecheck`.

---

## Historial

El detalle está en `git log` — los mensajes llevan el problema, la causa y cómo
se comprobó. Hitos: construcción de la app (jul-ago 2026) · embudo de entrada
portado de El Charcu (sep) · rediseño a crema y los 16 bolsos (oct 9-14) · home
v2 y plan único (oct 14) · salida de Hotmart y entrada de OnePay (oct 16-17) ·
visor de cápsulas y oferta de lanzamiento (oct 17-18) · baja autónoma de la
alumna, galería del home en móvil y vuelta a UN solo precio, retirando la
oferta de lanzamiento por no ser real (oct 19).
