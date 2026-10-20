# ESTADO — Manos Creadoras App

**Última actualización: 2026-10-19.** Aquí solo entra lo que sigue siendo cierto
y accionable. El porqué de cada cosa vive en la cabecera de su archivo y en los
mensajes de commit, largos a propósito. **Lo que se termina, se BORRA de aquí.**

> **Podado el 2026-10-19 de 1080 líneas a estas.** Había dejado de servir: decía
> "12 migraciones" (hay 31), "el cobro es 100% Hotmart" (es OnePay desde el
> 16-oct), mandaba a `npm run acceso:dar` (no existe) y daba **cuatro precios
> distintos**, ninguno igual al del código. Lo podado está en `git log`.
>
> Quedan ~275 líneas y la regla del SO son 200. No se recorta más a costa de
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
- [ ] **El 5º video de cápsula.** Hoy repite el de la 1ª a propósito, para
      completar las cinco (`UPDATE capsulas … where orden = 5`).
- [ ] **2-3 testimonios reales** (capturas de WhatsApp). 🔴 Fallo nº1 del revisor
      visual, y **no se inventan**: el 17-oct se quitó un "4,9/5" sin respaldo.
- [ ] **6 portadas de bolso**: silueta-nacar, cherry, celeste-calido, esmeralda,
      boho, zafiro-perlado. (Anillos de Seda ya la tiene — ver abajo.)
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

## ⚠️ Pantallas que el revisor visual NO aprueba (listón: 36/40 y 16/20)

| Pantalla | Nota | Qué falta |
|---|---|---|
| Home v2 | 26/40 · 14/20 · 9/20 copy | El **Ojo Experto no se nombra ni una vez**, y es el ángulo de venta de la ficha de avatar |
| Mi plan | 27/40 · 14/20 · 12/20 | Prueba social real (arriba). Menor: el CTA sin estado de carga |
| Las dos del visitante | 31/40 · 14/20 | Nota del 15-sep, **no cuenta dos arreglos posteriores** |

Lo que más subiría la nota sin depender de nadie: **las 5 fotos de bolsos sin
usar** de `public/images/` (glacier-blue, onix-cristal, pearl-bow, pearl-coin,
pearl-royale).

---

## 🟡 Pendientes de código (no bloquean vender)

- 🔴 **EL AUDIO DE LOS VIDEOS ESTÁ SIN COMPROBAR EN UN TELÉFONO REAL**
  (2026-10-19). Se quitó el `muted=true` que las cápsulas tenían forzado, así
  que el reproductor arranca con su volumen normal en vez de mudo siempre.
  Verificado que SIGUEN arrancando solas, pero **desde el navegador no se puede
  oír**: hace falta abrir una cápsula y un "Ver este paso" en un celular.
  ⚠️ Si alguna se queda **congelada en el primer fotograma**, el culpable es
  esto —el navegador bloqueó el autoplay con sonido— y la vuelta atrás es una
  línea: reponer `muted=true` en `VideoDeHistoria.tsx`. Queda anotado allí.
  ⚠️ **NO intentar forzarlo**: se probaron las otras dos vías el mismo día y
  son peores. `muted=false` en la URL → pantalla negra, no arranca.
  Desmutear con `unmute` tras `ready` → el navegador PAUSA el video y aparece
  el play gigante en medio.
- **Queda una cookie `oferta` huérfana** en los navegadores de quien ya visitó:
  el middleware dejó de escribirla y nadie la lee, pero dura un año. No hace
  daño; si molesta, se borra desde el middleware una temporada.
- **`lib/hotmart-verify.ts` es un huérfano** (nadie lo importa) y `lib/env.ts`
  conserva `HOTMART_HOTTOK` y `hotmartEnv()`. Borrar.
- **El seed no tiene la portada de Anillos de Seda** (la puso la 0026): si
  alguien corre `npm run seed:bolsos`, **la borra**. Meterla en el JSON.
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

## Ambientes

| | QA | Producción |
|---|---|---|
| Supabase | `cazqmaluaehyikkstkoi` | `icbhtsdalysatlizjlys` (**vacío**) |
| Bunny Stream | `772366` ("manos creadoras", 100 videos) | por crear |
| Vercel | rama `develop`, público | por configurar |

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
