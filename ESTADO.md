# ESTADO — Manos Creadoras App

**Última actualización: 2026-10-14.** Aquí solo entra lo que sigue siendo cierto
y accionable. El detalle de por qué algo se hizo así vive en el comentario de
cabecera de cada archivo y en los mensajes de commit, que en este repo son largos
a propósito. Lo que se termina, se quita de aquí.

> El 2026-10-09 este archivo se reescribió porque se estaba contradiciendo:
> decía "7 migraciones" cuando hay 12, decía que el login no crea cuentas cuando
> sí las crea, y tenía una sección titulada "🔴 Falta SMTP propio" a la vez que
> arriba declaraba ese mismo punto resuelto. Una memoria que miente es peor que
> no tenerla.

---

## ⏸️ Dónde estamos (2026-10-09)

**Rediseño en curso.** Cristian entregó una guía de marca y 7 pantallas de
referencia (`design-ref/`). Con eso se hicieron tres cosas:

1. La paleta pasó de **oscura a clara** ("crema y tinta"). Las 12 pantallas se
   convirtieron solas porque ninguna tenía colores sueltos: todas piden tokens.
2. Los planes pasaron de **uno a tres** (Aprendiz / Creadora / Maestra).
3. El **home se reconstruyó entero** contra el diseño — 11 secciones nuevas.

⚠️ **La FICHA-ARTE.md está DESACTUALIZADA**: describe el tema oscuro y la fuente
Jost. La guía nueva (`design-ref/07-guia-de-marca.png`) la sustituye y manda
sobre ella. Hay que reescribir la ficha antes de la próxima pantalla.

**Lo que falta para vender no es código:** son cuentas, contenido y dos datos.

QA vive en Vercel, es público y despliega solo con cada `push` a `develop`.

⚠️ **Las dos bases de Supabase se PAUSARON solas** tras tres semanas sin uso
(plan gratuito) y hubo que despertarlas a mano el 2026-10-09. **Volverá a pasar**
si el proyecto queda quieto otras tres semanas: la app seguirá cargando la página
de ventas pero el login, los tutoriales y el Ojo Experto darán error. Se arregla
con *Restore project* en supabase.com, y **no se pierde nada** — se comprobó:
las 4 cuentas, las 8 concesiones y las 9 lecciones estaban intactas.

---

## 🔴 EN CURSO — no se puede entrar en localhost con el correo (2026-10-11)

Cristian pide el enlace desde `localhost:3000` y el correo llega apuntando a
`qa.manoscreadoras.co`. **Sigue sin resolverse.** Lo que ya está descartado, para
no repetirlo:

- ✅ **La app pide bien el destino.** Se capturó la petición real del navegador:
  manda `redirect_to=http://localhost:3000/auth/callback`.
- ✅ **El backend lo acepta.** Se le pidió el enlace a Supabase con el admin y lo
  devuelve con ese mismo destino. La lista de *Redirect URLs* tiene localhost.
- ✅ **La causa original era la plantilla**: `magic-link.html` armaba el enlace
  con `{{ .SiteURL }}`, un valor FIJO del panel. El README ya lo advertía.
- ❌ **Primer intento fallido:** `{{ if .RedirectTo }}…{{ else }}{{ .SiteURL }}…`.
  Tras pegarla, el correo seguía llegando a QA → señal de que `.RedirectTo`
  llega VACÍO y cae al respaldo.
- ❌ **Segundo intento descartado ANTES de romperlo:** usar
  `{{ .ConfirmationURL }}`. Supabase sí lo construye con el destino correcto,
  pero se siguió el enlace de verdad y termina en
  `…/auth/callback#access_token=…`. **Lo que va tras el `#` no llega al
  servidor**, y nuestro callback es una ruta de servidor: vería la petición sin
  `code` ni `token_hash` y rebotaría a "enlace inválido". No intentarlo otra vez.

### Dónde quedó (2026-10-11, noche)

Las plantillas **SÍ estaban guardadas** en el panel (comprobado en captura: la
vista previa mostraba la versión nueva y *Save changes* en gris) y aun así
llegaba **la plantilla por defecto de Supabase**.

Sospecha principal: el `{{ if .RedirectTo }}` **falla al enviar** y Supabase cae
en su plantilla. Encaja con algo que se vio en la captura — **la vista previa
del panel NO evalúa las variables** (muestra `{{ .SiteURL }}` tal cual), así que
una plantilla que revienta al enviarse se ve perfecta ahí. No se pudo confirmar
en los registros: el conector de Supabase está conectado con una cuenta que no
tiene acceso a esta organización.

**Lo que se hizo, que no depende de resolver esa duda:**

1. Las dos plantillas quedan en su forma MÁS SIMPLE: sin condiciones, con una
   sola variable, `{{ .ConfirmationURL }}`. No puede fallar al procesarse, y el
   destino lo construye Supabase — que ya probamos que lo hace bien.
2. **`app/auth/callback` ya acepta las TRES formas** en que puede volver una
   sesión: `?code=`, `?token_hash=` y `#access_token=`. Esta última nunca llega
   al servidor, así que se rebota a `app/auth/completar`, una pantalla de
   cliente que sí puede leer el fragmento.
   ✅ Verificado de punta a punta: el enlace con `#` —que antes daba "enlace
   inválido"— ahora entra a `/cursos` con la sesión abierta.

Con eso el acceso funciona venga como venga el enlace. Falta que Cristian pegue
las dos plantillas simplificadas y pruebe en QA.

🟡 **Se ofreció leer el correo que llega desde el conector de Gmail** —sería la
forma rápida de ver de una vez qué plantilla sale y a dónde apunta— y Cristian
dijo que **por ahora no**. Queda como recurso si el problema sobrevive al
cambio de plantillas. La otra vía es dar acceso al conector de Supabase a esta
organización, para leer los registros de auth.

✅ **Mientras tanto SÍ se puede entrar en local**: `npm run alumna:crear -- correo`
imprime un enlace que no pasa por el correo. Se arregló hoy (llevaba roto desde
la migración 0008).

🟡 **Pendiente de probar, y afecta a alumnas reales:** el `token_hash` que llega
viene como `pkce_…`, que ata el enlace al navegador donde se pidió. El README de
las plantillas eligió `token_hash` justamente para evitar eso (la alumna lo pide
en Chrome y lo abre desde Gmail). La prueba es pedir el enlace en un navegador y
abrirlo en otro; si falla, la solución es dejar de usar PKCE en
`lib/supabase/client.ts`, no volver a tocar la plantilla.

---

## 👉 PASO SIGUIENTE (decidido por Cristian el 2026-10-10)

**Entrar NO debe depender del webhook.** Como habrá un curso gratis, la
plataforma tiene que dejar pasar pidiendo solo el correo — y nosotros tenemos
que poder recorrerla.

### ✅ Lo que YA está construido (no hay que hacerlo)

Se comprobó en el código el 2026-10-10. Tres de las cuatro piezas existen:

- **Se entra solo con el correo, sin contraseña.** `lib/auth.ts` usa enlace
  mágico (`signInWithOtp`). No hay contraseña que recordar ni que recuperar.
- **El webhook NUNCA hizo falta para crear la cuenta.** La migración 0012
  (decisión de Cristian del 2026-09-15) ya creó la **cuenta gratis** con su
  cupo propio: 3 preguntas y 1 foto al mes. El webhook solo *asciende* a quien
  paga; no es la puerta.
- **Ninguna pantalla está cerrada con llave.** `middleware.ts` tiene la lista
  de rutas privadas VACÍA a propósito. Quién ve qué lo decide el RLS de la base
  (migraciones 0009, 0010 y 0012), que desde el navegador no se puede burlar.
- **Ya hay contenido visible sin siquiera entrar:** las lecciones `s2-l01`,
  `s2-l02` y `s2-l03` están marcadas `es_libre` — 1h21m de clase real.

### 🔴 Lo que falta de verdad

El hueco no es técnico, es de **contenido y de recorrido**:

1. **"3 lecciones sueltas" ≠ "1 curso completo".** El diseño promete en el plan
   Aprendiz *"1 curso completo: [NOMBRE DEL CURSO GRATIS]"* más *"su patrón
   descargable y lista de materiales"*. Hoy lo gratis son tres lecciones
   sacadas de la mitad de la sección 2 — no un curso con principio y final, y
   sin patrón asociado. **Hay que decidir cuál es el curso regalo y marcarlo
   entero**, no tres filas sueltas.
2. **🔴 Los tres videos libres NO EXISTEN.** Era peor de lo apuntado. No es que
   los tres compartan un video de prueba: el id `f8e8fda0-f7ac-40fb-8c29-
   b36f6bfe1b78` **no está en la biblioteca 723241 de Bunny**, así que el
   reproductor carga y muestra un **404** (comprobado entrando como alumna el
   2026-10-11). Hoy la plataforma se abre pero no se puede ver NADA.
   Es el bloqueo nº1 del curso gratis: da igual lo bien que funcione la puerta
   si al otro lado hay un 404.
3. **El botón "Tomar el curso gratis" no lleva a entrar**, lleva a bajar hasta
   los planes (`#planes`). Si entrar es solo poner el correo, ese botón debería
   abrir el formulario y ya.
4. **Para poder recorrer la plataforma** hace falta que Supabase esté
   despierta (se pausa sola a las 3 semanas — ver el aviso de arriba) y tener
   una cuenta de prueba. Se crea con el correo, sin tocar nada más.

⚠️ Nada de esto necesita OnePay. Se puede dejar funcionando el camino completo
—entrar, ver el curso gratis, toparse con el resto cerrado— **antes** de que
exista la pasarela, y es el orden sensato: primero que la puerta funcione,
después la caja.

---

## 🏠 HOME V2 Y PLAN ÚNICO (2026-10-14)

Cristian entregó un diseño nuevo del home (17 pantallas, en `.respaldo/diseno/home-v2`)
y con él una decisión de negocio.

🔴 **UN SOLO PLAN** (migración 0016, aplicada en QA). Se acabaron los tres
niveles: US$35/mes o US$350/año (US$29,17/mes · ahorra 17%). El cambio NO se
quedó en `lib/planes.ts` — bajó a la base, porque los tres nombres vivían en el
`check` de `membresias.plan` y en `plan_cupos`. Dejar el código con un plan y la
base aceptando tres habría permitido escribir 'maestra' a mano para siempre.
· `plan_cupos`: ahora `gratis` (3/1) y `completo` (600/60 — hereda los de
  maestra: el plan único se vende como "todo incluido", no puede dar menos que
  el más caro de antes).
· **Las 9 membresías se migraron sin perder un día pagado** (6 → completo, 3 → gratis).
· `plan_efectivo()` CONSERVA nombre y firma: es la frontera entre "cómo se
  guarda el plan" y "quién ve qué"; cambiarla obligaría a tocar seis llamadas.

**HOME V2** en `components/home/`: HeroSlider · Capsulas (+ StoryViewer) ·
CursoGratis · OjoDemo · PrecioHome · BarraInferiorHome · Entrada ·
NumeroQueCuenta. Se borraron 9 secciones viejas (~1.000 líneas).
⚠️ Las cápsulas son UN componente con dos presentaciones (tarjetas en escritorio,
historias circulares en móvil), no dos: mismos datos, mismo visor, misma lógica
de "vistas". El ORDEN cambia con `order` en el flex de `main` — en escritorio van
debajo del banner, en móvil encima.

🔴 **EL OJO EXPERTO YA RESPONDE SIN CUENTA** (migración 0017). Eso abre el gasto
de IA a tráfico anónimo, así que lleva DOS frenos: 2 preguntas por huella
contadas en la base (`consumir_visitante` — borrar la cookie no regala más) y un
TERCER bolsillo de presupuesto ('visitante'), separado del de quien paga. Misma
lección de la 0011. La huella es un hash de IP + sal: **nunca la IP en claro**.

⚠️ **EL REVISOR VISUAL LO REPRUEBA: 29/40 usabilidad · 14/20 craft** (el listón
es 36 y 16). Se corrigió lo que tenía razón. **Queda abierto y lo decide
Cristian:** el revisor pide bloques de dolor/testimonios/FAQ (su diseño los quita
a propósito) y reescribir el copy del héroe (es el suyo, palabra por palabra).

**Tres fallos que encontró Cristian al verlo, ya corregidos:**
· La página **se iba sola hasta el Ojo Experto al abrirla**: el chat llamaba a
  `scrollIntoView` al montarse, vacío — y esa función no mueve solo su caja,
  mueve la ventana. Arreglado con dos cambios (solo baja si ya hay mensajes, y
  `block: "nearest"`).
· Las cápsulas salían encima del banner también en escritorio.
· ⚠️ **EL AIRE DE UNA SECCIÓN SE SUMA AL DE LA SIGUIENTE.** Dos `py-16` seguidos
  daban 128px de blanco: cada sección se veía bien aislada y el conjunto no.
  Bajado a 48+48. Si hace falta más aire, se da DENTRO del bloque, nunca entre
  bloques.

🟡 En pantallas de 812px el CTA del héroe sigue cayendo bajo la barra fija. No
cabe: header (76) + cápsulas (136) + foto + titular + botón. La barra lleva
"Bolso gratis" al mismo destino y está visible siempre.

🔴 **NO EXISTEN LOS VIDEOS DE LAS CÁPSULAS.** `capsulas.video_id` es nulo y el
visor enseña la portada diciéndolo. Los 5 textos son del prompt del diseño, no de
Elizabeth. (Posible pista: los 21 videos sueltos sin colección en Bunny.)

---

## 🧭 Navegación reorganizada (2026-10-12, pedido de Cristian)

⚠️ **SE QUITÓ LA PANTALLA "CORTESÍA", y eso se aparta del diseño** (las
pantallas 16 y 17 de `design-ref` la dibujan aparte). Cristian pidió que todo
viva en `/app`, y tenía razón en el motivo: la Cortesía no tenía barra lateral
ni forma de volver — era un callejón sin salida — y obligaba a mantener dos
catálogos parecidos.

**Ahora quien llega sin cuenta ve EL MISMO catálogo**: los 14 bolsos, el gratis
primero y el resto con candado. Puede abrirlos y leer sus pasos, sus materiales
y sus medidas; lo único que no puede es reproducir el video. La oferta va como
una tarjeta DENTRO del catálogo, no como pantalla previa.

**La barra lateral está SIEMPRE en escritorio.** Antes la ficha y la lección no
la llevaban (la idea era "ya estás dentro de algo"), y se sentía como salirse
de la app. Vive en `app/(interna)/app/(conbarra)/layout.tsx`, así que se hereda
y no hay que acordarse de ponerla en cada pantalla nueva.
El Ojo Experto sigue con su propia barra —lleva el historial— pero incluye los
mismos enlaces de navegación.

---

## ⚙️ Ajustes hechos EN LOS PANELES (2026-10-12)

No están en el código: viven en Supabase y en Bunny, y si alguien recrea los
proyectos hay que volver a ponerlos.

**Supabase → Authentication → Emails:**
- *Magic link* y *Confirm sign up* con la plantilla de `supabase/templates/`.
  Usan `{{ .ConfirmationURL }}`, que respeta el destino que pide la app — por
  eso ya se puede entrar desde localhost.

**Bunny → Stream → biblioteca 772366:**
- *Player UI Primary Color* = **#D9B97A** (dorado claro, el válido sobre fondo
  oscuro). Antes era el naranja de Bunny.
- *Allowed referrers*: `qa.manoscreadoras.co`, `manoscreadoras.co` y
  **`localhost`**. ⚠️ Este último hacía falta: con "Block direct url file
  access" encendido, el navegador manda `Referer: localhost` y Bunny devolvía
  **403** — los videos no se veían en desarrollo.
- *Embed view token authentication*: ENCENDIDA. Comprobado que rechaza enlaces
  sin firma, con firma inventada, vencidos, y el token de un video usado en
  otro.

🟡 Dos cosas del reproductor que siguen por defecto y conviene mirar: el idioma
está en **inglés** y la fuente es **Rubik**, no la de la marca.

---

## 🔨 LAS 8 FASES DEL REDISEÑO, HECHAS (2026-10-12)

La app pasó de **un curso** a **14 bolsos**. Todo construido contra
`design-ref/manos-creadoras-claude-code/pantallas` (48 imágenes).

**Rutas nuevas:** `/app` · `/app/bolsos/[slug]` · `/app/bolsos/[slug]/[orden]` ·
`/app/directorio` · `/app/ojo` · `/app/cuenta` · `/entrar` · `/contacto` ·
`/legal/[documento]` · `/bienvenida`.
Las 9 viejas redirigen con 308 (están en correos ya enviados).

**Decisiones que conviene no redescubrir:**
- `lib/bolsos-logica.ts` vs `lib/bolsos.ts` están separados a propósito: los
  componentes de cliente necesitan las reglas, y si vivieran junto a las
  consultas arrastrarían `next/headers` al navegador y Next lo rechaza.
- Los **pasos se CALCULAN** agrupando títulos consecutivos iguales. No hay
  ningún número escrito: un bolso nuevo con otro reparto de partes sale solo.
- El Ojo Experto sigue siendo **ruta de Next**, no edge function (decisión de
  Cristian): conserva el control de gasto y el presupuesto por público.
- `consumir_cupo` **mira y descuenta en la misma operación**. Antes eran dos
  pasos y con dos pestañas abiertas se colaba una consulta gratis.
- El texto legal se **movió palabra por palabra** a `components/legal/`. Solo se
  cambiaron las menciones a Hotmart y los precios viejos.
- `TextoDelOjo` pinta el Markdown sin librería ni `dangerouslySetInnerHTML`: el
  texto lo escribe un modelo a partir de lo que teclea la alumna.

**Retirado:** las plantillas de lección lectura/PDF, el carrusel, la barra de
compra pegajosa, `lib/curso.ts`, `lib/ojo-experto.ts`, las secciones
problema/agitación/solución/oferta/garantía y **el webhook de Hotmart** (llamaba
a funciones que ya no existen).

✅ **RESUELTO EL BLOQUEO DE LOS VIDEOS (2026-10-12).** Era la biblioteca: el
`.env.local` apuntaba a **723241**, que ya no existe. La real es **772366**
("manos creadoras", 100 videos) — se vio entrando al panel de Bunny con la
sesión de Cristian en Chrome.
Comprobados **los 75 videos uno por uno: los 75 reproducen**. Verificado también
en pantalla: el paso 4 de Gota de Rocío carga el video de verdad.

⚠️ **HAY QUE CAMBIARLO TAMBIÉN EN VERCEL.** El `.env.local` ya está corregido,
pero QA y producción tienen su propia copia de `NEXT_PUBLIC_BUNNY_LIBRARY_ID`.
Mientras no se cambie ahí, en QA siguen saliendo 404.

✅ **Y se resolvió la otra incógnita del JSON:** `bolso_id` ES el id de la
COLECCIÓN de Bunny. Confirmado: la colección "Gota de rocío" vive en
`…/collections/e8bac115-3fbf-49c8-b0a9-1fdc73e67378`, que es exactamente el
`bolso_id` del JSON.

🔴 **FALTA UN BOLSO EN EL JSON: "Zafiro perlado" (4 videos).** Bunny tiene 15
colecciones con contenido y el JSON trae 14. Las cuentas cuadran al vídeo: las
colecciones suman 79 videos, el JSON 75, y la diferencia son exactamente los 4
de Zafiro perlado. Hay que decidir si entra como bolso 15 o si se deja fuera a
propósito.

🟡 **PENDIENTE ANOTADO (2026-10-12):** decidir si "Zafiro perlado" entra como
bolso 15. Sus 4 videos están en Bunny y el JSON no lo trae. Cristian lo deja
para después.

🟡 **21 videos sueltos** en la biblioteca sin colección (100 en total, 79 dentro
de colecciones). Puede que sean tomas viejas o material sin clasificar.

🟡 Pendientes menores: las 14 fotos de portada (hoy se pinta la inicial sobre
espresso), los 33 enlaces de AliExpress (el botón dice "Enlace pronto"), y el
webhook de OnePay.

---

## 🔨 FASE 1 APLICADA EN QA (2026-10-12)

El contenido dejó de ser UN CURSO y pasó a ser **14 BOLSOS**. Migraciones 0013,
0014 y 0015 aplicadas a QA, y el seed cargado.

**En QA hay ahora:** 14 bolsos · 61 lecciones · **75 videos** · 72 materiales ·
33 productos de directorio con 85 enlaces · 7 membresías · 3 planes de cupo.

**Tablas que desaparecieron** (`secciones`, `modulos`, `lecciones` vieja,
`user_progress`, `accesos`, `ai_conversations`, `ai_usage`, `cupos`).
Respaldo de todas en `.respaldo/qa-antes-de-0013_2026-10-12.json` (fuera del
repo). `user_progress` tenía **0 filas**: no se perdió el avance de nadie.
Las 10 filas de `accesos` sí se migraron a `membresias`.

**Decisiones que conviene no redescubrir:**
- `membresias` sustituye a `accesos` con la forma de El Charcu: una fila por
  cuenta y `vence_el`. Cancelar NO corta el acceso: lo deja hasta esa fecha.
- Las funciones `tiene_acceso()` / `tiene_acceso_de()` **conservan su nombre** y
  solo cambiaron por dentro. Son la frontera que permitió cambiar la tabla sin
  tocar las 6 llamadas repartidas por el código.
- Cupos nuevos: aprendiz 3/1 · creadora **200/30** · maestra **600/60**. Suben
  mucho respecto a los 40/8 de antes porque Gemini salió barato y casi nadie
  agota las fotos — comprobado en El Charcu.
- `npm run acceso:dar` ya NO existe → `npm run membresia:dar -- correo creadora anual`.

⚠️ **QA quedó medio vacía, y es lo esperado.** El código desplegado todavía lee
las tablas viejas. No se cae —degrada y dice "vuelven pronto"— pero hasta las
fases 3 y 5 no habrá contenido en pantalla. Ocho archivos por reescribir:
`lib/curso.ts`, `lib/ojo-experto.ts`, `app/(app)/cursos/*`, `app/page.tsx`,
`app/api/ojo-experto`, `app/api/webhooks/hotmart`.

⚠️ **El criterio de aceptación dice "Gota de Rocío: 5 pasos" y son 4.**
Comprobado contra el propio diseño (`08-ficha-del-bolso`): Materiales va sin
número y la base es el paso 4 con dos partes. Los pasos se CALCULAN agrupando
títulos del JSON; no hay ningún número escrito a mano.

---

## 📸 Capturas del estado actual (2026-10-12)

Las **18 pantallas** de la app están capturadas en `.capturas/estado-actual/`,
con un `LEEME.md` que explica qué es cada una. Se tomaron para rediseñarlas con
Claude Design partiendo del estado real.

Cubren: las 6 de dentro de la app (incluidas las TRES plantillas distintas de
lección — video, lectura y PDF), las 4 que ve quien no ha entrado, y las 8
públicas. A 375 px, salvo el home que va también a 1440.

⚠️ La carpeta está en `.gitignore` — pesan 6,8 MB y no deben entrar al repo.

Cuatro cosas que saltaron al revisarlas y que NO son fallos de diseño:
- El reproductor de video muestra un **404** (el video no existe en Bunny).
- **Contacto está casi vacía** y es donde aterrizan hoy los botones de pago.
- **Mi cuenta muestra los precios VIEJOS** (USD 199/año) mientras el home vende
  tres planes desde USD 9,74/mes. Se quedó atrás en el cambio de modelo.
- Los nombres de los tutoriales siguen siendo de relleno.

---

## 🟡 Decisiones del home que esperan a Cristian

El revisor visual puntuó el home en **26/40 usabilidad · 14/20 craft · 9/20
copy**, con fidelidad al diseño **FIEL**. Los defectos técnicos se corrigieron;
estos tres son decisiones de producto, no fallos:

1. **El Ojo Experto no se nombra ni una vez.** La ficha de avatar dice que el
   ángulo de venta es "la única escuela con un mentor de IA que revisa tus
   fotos" — y el home nuevo no lo menciona. El producto tiene la función
   construida y funcionando. Es el hallazgo más caro del reporte.
2. **No hay sección de dolor.** El diseño va directo a enseñar producto. Para
   quien ya teje y llega buscando, funciona; para tráfico frío de anuncios,
   suele costar conversión.
3. **No hay testimonios.** El diseño no los contempla y no tenemos ninguno real.

---

## 🔴 Bloqueos para vender

- [ ] **El cobro: Hotmart SALE, entra OnePay** (decisión de Cristian,
      2026-10-09). Esto ya no es "crear un producto": es **construir una
      pantalla de pago**. Detalle largo en `lib/planes.ts`; lo esencial:
      - OnePay **no tiene checkout alojado** para suscripciones. Hotmart daba un
        enlace; OnePay exige tokenizar la tarjeta con su SDK **dentro de nuestra
        app** + 3D Secure. Contradice la decisión cerrada de "no hay paywall
        propio", que hay que reabrir.
      - ✅ **Sí cobra en dólares** (confirmado por Cristian el 2026-10-09). La
        investigación de El Charcu decía que solo COP; esa parte queda superada.
      - ⚠️ El entorno lo decide la **CLAVE** (`sk_test_` vs `sk_live_`), no la
        URL: una clave live en QA **cobra de verdad**.
      - Webhook: la firma va en el header `Signature` (NO `x-onepay-signature`),
        sobre el cuerpo CRUDO, comparación en tiempo constante, responder 2xx en
        <10 s, y **idempotente** porque reintenta 6 veces con el mismo cuerpo.
      - Investigación completa: `git show 6a644b2:ESTADO.md` en el repo elcharcu,
        sección "1. Pagos — OnePay".
      ✅ **Mientras tanto SE PUEDE COBRAR YA**: `npm run acceso:dar` activa a mano.
      Cuando OnePay funcione, su webhook inserta una concesión más y no se
      rediseña nada.
- [ ] **La identificación del responsable de los datos** (cédula o NIT de
      Elizabeth Valencia) y un domicilio. Va en `lib/legal.ts`
      (`IDENTIFICACION` / `DOMICILIO`) y las dos páginas legales lo recogen
      solas. ⚠️ La Ley 1581 de 2012 exige que la alumna sepa QUIÉN tiene sus
      datos para poder reclamar. Mientras esté en `null` las páginas no inventan
      nada: omiten la línea, así que quedan **incompletas, no falsas**.
- [ ] **Montar producción.** El proyecto `icbhtsdalysatlizjlys` existe desde el
      2026-09-08 y está **completamente VACÍO** — comprobado el 2026-10-09: las
      12 migraciones figuran sin aplicar. Buena noticia: no hay descuadre que
      arreglar, un `db push` limpio sirve. Falta además la biblioteca de Bunny de
      producción y copiar las variables en Vercel.

### Contenido que solo puede dar la dueña (bloquea la calidad, no el cobro)
- [ ] **Los videos reales.** Hoy las TRES lecciones de cortesía tienen el mismo
      video de prueba (`f8e8fda0-f7ac-40fb-8c29-b36f6bfe1b78`). Antes de
      enseñárselo a nadie hay que poner el de cada una.
      🔼 **Subió de prioridad**: con el curso gratis como puerta de entrada,
      esto es lo PRIMERO que ve quien llega. Ver tres veces el mismo video es
      peor que no tener curso gratis. Ver el PASO SIGUIENTE arriba.
- [ ] **Nombres reales de los tutoriales.** Hoy se llaman "Tutorial 2",
      "Tutorial 3"… La alumna no puede recordar dónde estaba la técnica que
      busca, y en pantalla se leen como marcadores de posición.
- [ ] **Listado completo de lecciones** de las secciones 2, 3 y 4 (~49 faltan).
- [ ] **2-3 testimonios reales** (capturas de WhatsApp) para la landing.
      ⚠️ Ahora pesa más: el home nuevo **no tiene ni un testimonio**, porque el
      diseño no los contempla. El revisor visual lo marcó como el fallo nº1.
- [ ] **El nombre del curso gratis.** El diseño lo dejó como
      `[NOMBRE DEL CURSO GRATIS]` y en `lib/planes.ts` sigue con una
      descripción provisional.
- [ ] **Confirmar la política de cancelación.** La respuesta del FAQ dice lo
      único que hoy es verdad (se cancela escribiendo) sin prometer un botón
      que no existe.

---

## Qué funciona hoy, verificado contra los servicios reales

- **Landing** (10 secciones) + 4 páginas legales, con el checkout de Hotmart
  conectado (al producto equivocado, ver bloqueos).
- **Cualquiera entra sin cuenta** y ve 3 tutoriales completos. Lo que recibe lo
  decide el RLS de la base, no la pantalla.
- **Cuenta gratis con el correo**, sin contraseña. Da 3 consultas al Ojo Experto
  y 1 foto al mes — **no da el curso**.
- **El acceso al programa se concede a mano**: `npm run acceso:dar|quitar|ver`.
  Ya no depende de que llegue una compra.
- **El Ojo Experto** responde de verdad (Gemini), con memoria por alumna, filtro
  de tema, dos cupos (3/1 gratis · 40/8 alumna), dos presupuestos diarios
  separados y una barrera que impide prometer ingresos.
- **Webhook de Hotmart** con 4 defensas: autenticidad, frescura, idempotencia y
  máquina de estados. Escribe concesiones, no estados.
- **PWA instalable con avisos push**, verificada contra FCM.
- **Analítica**: 14 eventos en Mixpanel, comprobados llegando con HTTP 200.
- **Errores** centralizados en `lib/fallos.ts`, sin datos personales.
- **Base**: 12 tablas con RLS, 12 migraciones.

**Calidad visual:** las dos pantallas del visitante se quedaron en **31/40
usabilidad y 14/20 craft**; el listón es 36/40 y 16/20. ⚠️ Esa nota es del
2026-09-15 y **no cuenta dos arreglos posteriores** (la caja que parecía un campo
real y el marco del video). Hay que volver a pasar el `revisor-visual` antes de
dar la Fase 2 por cerrada.

---

## Decisiones cerradas (no se re-preguntan)

**Producto**
- **Suscripción** USD 19,99/mes o 199/año (=16,58/mes). Reemplazó al pago único
  de $25 el 2026-08-02; el texto de "acceso de por vida" se eliminó por ser falso.
- El cobro es 100% Hotmart. No hay paywall propio.
- **Las lecciones NO se bloquean secuencialmente**: en Hotmart la alumna ya tiene
  todo abierto; bloquear sería un retroceso que notaría el primer día.
- **La sección 1 no cuenta para el % de avance** (`secciones.cuenta_progreso`).
- **Los 3 videos de regalo son del CATÁLOGO** (`lecciones.es_libre`), no un
  permiso por persona: cambiar el regalo es un `update` de una fila, no
  reescribir filas de todo el mundo.
- **La cuenta gratis da 3 consultas, no 1.** Con una no se ve una conversación —
  lección que costó cara en El Charcu. Cuesta ~USD 0,005 por persona.
- **El muro sale al INTENTAR preguntar, no al abrir la pantalla.** El Ojo Experto
  se ve igual con o sin cuenta; enseñar un "ejemplo" obliga a imaginarse el
  producto. ⚠️ La pregunta escrita no se pierde cuando aparece el muro.

**Técnicas**
- **Next.js App Router** · **Gemini** (`AI_MODEL`) vía BFF · **Supabase Auth**
  con enlace mágico.
- **La puerta vive en la BASE, no en la pantalla.** Ninguna ruta es privada en el
  middleware y no es un descuido: quién ve qué lo deciden las políticas RLS, que
  desde el navegador no se pueden burlar.
- **El acceso lo dan las CONCESIONES** (`accesos`), no `profiles.status`. La
  columna `status` se queda para la máquina de estados del webhook y para la
  pantalla "Mi cuenta", pero ya no decide quién entra.
- **Los límites y cupos viven en la BASE** (tabla `cupos`), no en constantes:
  había dos copias del mismo número en la API y la pantalla.
- **Modo simulado de IA** con dos condiciones, y la segunda no se puede apagar:
  `AI_SIMULAR_IA=1` **y** no estar en producción.
- **Dirección de arte CERRADA** → `FICHA-ARTE.md`. **Avatar** → `FICHA-AVATAR.md`.
- **Mixpanel**: grabación de sesión APAGADA a propósito (se grabarían mujeres
  subiendo fotos de su trabajo). Se le manda el ID de Supabase, nunca el correo,
  y con `ip: false`. Si algún día se enciende la grabación, **la política de
  privacidad se actualiza ANTES**.

---

## Ambientes

| | QA | Producción |
|---|---|---|
| Supabase | `cazqmaluaehyikkstkoi` | `icbhtsdalysatlizjlys` (vacío) |
| Bunny | `723241` (1 video de prueba) | por crear |
| Vercel | rama `develop`, público | por configurar |

⚠️ **En Vercel, una variable `NEXT_PUBLIC_*` NO puede ser "Sensitive".** Next la
sustituye por su valor AL COMPILAR y las Sensitive no existen en ese momento:
quedaría vacía sin ningún error que lo delate. Va como Config / Plain.

**Variables que suele olvidarse copiar:** `AI_DAILY_BUDGET_REGALO_USD`,
`AI_DAILY_BUDGET_MIEMBRO_USD`, `NEXT_PUBLIC_MIXPANEL_TOKEN`, `AI_SIMULAR_IA`, y
las 4 de push (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
`VAPID_SUBJECT`, `PUSH_ADMIN_SECRET`).

⚠️ **Al publicar, tres cosas fallan en silencio si se olvidan:**
1. El **Site URL** de Supabase en `localhost` → los correos traen enlaces que en
   el celular de la alumna no existen.
2. El dominio **fuera de *Allowed Referrers* de Bunny** → los videos dan 403, que
   en pantalla se ve como un cuadro negro.
3. **Cambiar las llaves VAPID** → todas las alumnas suscritas dejan de recibir
   avisos y hay que volver a pedirles permiso.

**Migraciones:** cómo se nombran, cómo se aplican y cómo cuadrar la libreta está
en `supabase/migrations/README.md`. Regla: un cambio de esquema = un archivo
nuevo. **A producción no entra ninguna sin aprobación de Cristian, cada vez.**
⚠️ El conector MCP de Supabase no ve ningún proyecto; el que funciona es el CLI.

---

## Pendientes de código (no bloquean vender)

- **Volver a puntuar las dos pantallas del visitante** con `revisor-visual`.
- **Aplicar a la app interna las 5 fotos de bolsos sin usar** (`public/images/`:
  glacier-blue, onix-cristal, pearl-bow, pearl-coin, pearl-royale). Es lo que
  más sube la nota y no depende de nadie más.
- **Correo distinto al de la compra**, faltan 2 de 3 capas: ① aviso en la landing
  junto al botón de compra, ③ comando `npm run alumna:mover`. ⚠️ El ③ es **solo
  comando, nunca un botón**: mover accesos automáticamente es regalar acceso a
  quien engañe al soporte. La capa ② (aviso tras "revisa tu correo") ya está.
- **Verificar en vivo los eventos que faltan** de Mixpanel: los del Ojo Experto,
  `correo_enviado`, `checkout_abierto` y `cuenta_creada`/`cuenta_iniciada`.
- **Los precios por token de `lib/costo-ia.ts` no están verificados** contra la
  lista de Google. Los tokens sí son exactos. Contrastar un mes real de
  `ai_spend` contra la factura de AI Studio y ajustar las dos constantes.
- `direcciones-abc.html` sigue en la raíz — borrarlo antes del deploy.
- Título de pestaña de `/login` sin personalizar (es "use client").
- 1 aviso de lint preexistente en `BarraProgreso` (setState dentro de un efecto).

---

## Avisos que cuestan dinero o tiempo si se olvidan

- **Bunny es PREPAGO**: el saldo cargado es el techo si Auto-Recharge está
  apagado. ⚠️ Pero corta en los dos sentidos — si llega a cero, los videos
  podrían dejar de servirse **a alumnas que pagan**. Revisar el saldo una vez al
  mes. ⚠️ **NO activar la codificación premium**: con 24 h de video serían
  $36-216 de golpe; la estándar es gratis y se ve perfecta.
- **Sudamérica cuesta 9× más** que Norteamérica en entrega de video ($0,045 vs
  $0,010/GB). Con 500 alumnas, un mes normal ≈ $56; el de lanzamiento ≈ $490.
- **Una consulta al Ojo Experto cuesta ~USD 0,0018** — siete veces la estimación
  que se usó durante meses. Sigue siendo <1% del ingreso.
- **Los dos presupuestos de IA son globales por público, no por persona:** una
  sola alumna puede agotar el de `miembro`. Con las de hoy da igual; con varias
  decenas activas hay que decidir si el tope pasa a ser por cuenta.
- **Los registros salen del edificio** en cuanto haya un recolector de logs: ahí
  no puede ir nunca un correo, un nombre, el texto de una pregunta ni una foto.

---

## Notas operativas (leer antes de tocar la terminal)

⚠️ **El Node por defecto de la máquina es v10.23.0** (de 2018). Una terminal
nueva arranca ahí y `tsc`/`next` REVIENTAN con `SyntaxError: Unexpected token ?`
— no es el código, es Node viejo. **Correr `nvm use`** (hay `.nvmrc`).
- El proyecto corre en **Node 22.23.2**.
- Al cambiar de versión de Node hay que **reinstalar `node_modules` de cero**, o
  el build muere con "Turbopack is not supported on this platform".
- Servidor: `npm run dev`. Alumna de prueba: `npm run alumna:crear|borrar`.

---

## Historial

Las sesiones 1-10 (2026-07-31 → 08-08) construyeron la app: validación, arte,
landing, login, app interna, Supabase + webhook + Gemini, video propio con Bunny,
PWA con push y correo verificado con Resend.

Las sesiones del 2026-09-14/15 portaron el **embudo de entrada de El Charcu** en
6 fases (acceso por concesiones, entrada sin registro, cupos y presupuestos,
asistente con modo simulado y barrera de promesas, analítica con Mixpanel y
errores centralizados), más la cuenta gratis, las páginas legales colombianas y
el renombrado de migraciones.

El detalle de cada una está en `git log` — los mensajes llevan el problema, la
causa y cómo se comprobó.
