# ESTADO — Manos Creadoras App

**Última actualización: 2026-11-02.** Aquí solo entra lo que sigue siendo cierto
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

🔗 **DIRECTORIO: UN ENLACE GRATIS PARA TODAS, EL RESTO CON MEMBRESÍA
(2026-11-02, migraciones 0041 + 0042, decisión de Cristian). En QA y PRODUCCIÓN.** «Cuentas de 10 mm»
(`directorio_items.gratis`, se usa en 8 bolsos) lo abre cualquiera, con cuenta o
sin ella, y va primero; los otros 12 enlaces muestran "Desbloquear" y el aviso de
la membresía. Cambiar cuál es el gratis = mover `gratis` de fila.
· ⚠️ **LA URL DE TEMU NUNCA LLEGA AL NAVEGADOR.** La columna `url` ya no es
  legible con la clave pública (permiso por columna, 0041; antes "la leía
  cualquiera" y el muro habría sido decorativo). Todo salto pasa por
  `/app/directorio/ir/<id>` → `abrir_enlace_directorio()`, que comprueba con
  `tiene_acceso_de()` y redirige. Verificado en QA: sin sesión el gratis abre y
  el resto da `bloqueado`; `select=url` → permiso denegado; con membresía abren
  los 13; 0 URLs de Temu en el HTML de las 16 fichas.
· ⚠️ **CÓMO SE APLICÓ A PRODUCCIÓN (la contraseña de `.env.prod` no entra,
  ni después de 2 resets):** `supabase link --project-ref icbhtsdalysatlizjlys`
  SIN contraseña, desde una carpeta temporal (para no desenlazar QA), y
  `supabase db push --linked --yes`: el CLI crea un rol de acceso temporal con
  la sesión de la cuenta. La app NO usa `SUPABASE_DB_PASSWORD` (Vercel no la
  necesita). Historial de producción: 42/42, sin descuadre.
· `directorio_clics` apunta qué abre cada alumna con sesión (para saber qué
  material se busca). El seed ya NO manda `url`: re-sembrar no borra enlaces.
· **Sin fotos, el directorio es una LISTA de filas** (ícono, nombre, botón; 2
  columnas en escritorio; en móvil el bloqueado es solo un candado de 44px).
  Las tarjetas vuelven solas en cuanto algún producto tenga `imagen_url`
  (pedido de Cristian: una tarjeta con un ícono suelto era una caja vacía).
· Revisor visual (2ª ronda, aún con tarjetas): 28/40 · 11/20 · copy 14/20 —
  **no lista** por craft. Pendiente: fotos de producto, modal con
  desplazamiento además de fundido, y la cabecera compartida (avatar "AD"
  cortado a 375px con sesión = 2px de scroll horizontal en toda `/app`).

🧵 **PROYECTOS, NO SOLO BOLSOS (2026-11-02, pedido de Cristian).** Todo el copy
que vende la membresía dice "proyectos" (bolsos, accesorios, adornos navideños
y, en diciembre, velas): banner del home ("Crea piezas de perlas…", botón "Ver
los proyectos"), banda café, Mi plan, `BannerPlan`, selector de pago,
`INCLUYE`, preguntas frecuentes, metadata/manifest, aviso del directorio (decía
"los 16 bolsos"), correo de bienvenida e instrucciones del Ojo Experto. "Curso
completo" → **"Membresía completa"** (banner, barra fija, Mi plan, Cuenta,
correo). El menú dice **"Mis proyectos"** (las URLs `/app/bolsos/…` NO cambian).
El encabezado del catálogo decía "20 bolsos y 3 llaveros": ahora "23 proyectos ·
N videos", calculado de la tabla. En la venta sigue SIN cifra (techo, 1-nov).
· **CURSOS BLOQUEADOS "SE ABRE EN DICIEMBRE"** al pie del catálogo, desde
  `lib/proximamente.ts` (no en la tabla `bolsos`: sin videos rompería la ficha).
  Adornos navideños (foto de la sección Navidad, "12 piezas") y **Velas: SIN
  FOTO todavía** — sin foto NO sale tarjeta (parecía rota), solo se nombra en
  el subtítulo. ⚠️ Cuando Cristian mande las imágenes: archivo a
  `public/images/` y su ruta en `imagen` → la tarjeta aparece sola (con 1
  tarjeta va horizontal a todo el ancho; con 2+, rejilla). Cuando se publiquen
  los videos, el curso entra a `bolsos` y SE BORRA de esa lista.
· Banda café del home: miniaturas = bolso + llavero Ónix + adornos navideños.
· Revisor visual (2 pasadas): banda 32→34/40 · 15/20 · copy 13→15/20;
  "Se abre en diciembre" 27→30/40 · 11→13/20; catálogo 29→30/40 · 15/20 —
  **NO LISTA formalmente.** Pendiente que pidió y no entró: intercalar un
  accesorio entre las primeras 5 tarjetas del catálogo (hoy solo carteras
  arriba), botón "Avísame cuando abra", y lo de antes (texto del banner del
  home bajo el precio en móvil, interruptor de Mi plan, filtros "En curso 0"
  para invitada, cabecera Entrar/Inscribirme, la ficha dice Jost y se usa
  Manrope).
· ✅ Contacto (2026-11-02): el recuadro ya no dice "te enviamos el enlace de
  pago, lo hacemos a mano" (era de antes de OnePay) → "¿Ya quieres entrar?" +
  botón a Mi plan; el gratis sale de la base (decía Cristal Brillante, es Nácar
  Soñado); el selector arranca en mensual. `/bienvenida` ya no recomienda
  Cristal Brillante. **Desde el 2026-11-03 los mensajes de contacto llegan a
  Cristian y a Elizabeth** (`AVISOS_INTERNOS` en `lib/correo.ts`, la misma
  lista de los avisos de cancelación), no a `hola@manoscreadoras.co`, que
  nadie confirmó que existiera. Siguen guardándose primero en `contactos`.

📈 **REPORTE DIARIO DE PRODUCCIÓN (2026-11-03).** `npm run reporte:diario`
(`scripts/reporte-diario.mjs`, solo lee `.env.prod`) → visitantes nuevos,
países con %, dispositivos, quiénes volvieron, cuentas, pagos y contactos del
día anterior (hora de Bogotá); queda en `reportes/` (fuera de git). Skill
`.claude/skills/reporte-diario` + tarea programada de la app a las 7 am
(`reporte-diario-manos-creadoras`; corre solo con la app abierta).
· "Visitantes" = navegadores (`sesiones_pais` es UNA fila por cookie de 30
  días), NO sesiones: el número real de visitas no se guarda en Supabase.
· ⚠️ **MIXPANEL NO ESTÁ CONECTADO AL REPORTE**: el token de la app solo
  ESCRIBE eventos. Falta una cuenta de servicio de solo lectura en `.env.prod`
  (`MIXPANEL_SA_USUARIO`, `MIXPANEL_SA_SECRETO`, `MIXPANEL_PROYECTO_ID=4064037`,
  y `MIXPANEL_REGION=eu` si el proyecto está en Europa). Con eso el script
  añade solo el embudo y los países de Mixpanel.
· Foto al 2026-11-03: 614 visitantes reales en 40 países desde el 21-oct (casi
  todo desde el 31-oct): CO 34% · MX 9% · US 8% · VE 8% · CL 4%; 59% Android,
  36% iPhone; ~36% entra desde el navegador de Instagram. 4 cuentas gratis,
  0 pagos.
· ⚠️ El Ojo Experto todavía marca "otras manualidades" como fuera de tema: al
  abrir velas hay que añadirlas a sus instrucciones (`app/api/ojo-experto`).

---

## Qué es esta app

Escuela de manualidades de Elizabeth Valencia: **proyectos** en video (hoy
20 bolsos + 3 llaveros = 23; en diciembre adornos navideños y velas), un
directorio de materiales y el **Ojo Experto** (mentor de IA que responde dudas y
revisa fotos del trabajo). Suscripción mensual o anual, cobrada por **OnePay**.

---

## 💵 EL PRECIO: UNO SOLO (bajado el 2026-11-03)

**Fuente única: la BASE, `plan_checkout.precio_usd`, en la MISMA fila que el
enlace de OnePay** (migraciones 0044/0045). Precio y enlace se leen juntos en
cada visita (`lib/checkout.ts` → `lib/precios.ts` en servidor, `usePrecios()`
de `components/app/Precios.tsx` en navegador). `PRECIOS_RESPALDO` en
`lib/planes.ts` solo se usa si la base falla. **Ningún precio escrito en otro sitio.**

🔧 **CÓMO SE CAMBIA UN PRECIO (desde el 2026-11-03), sin publicar código:**
1. Crear el plan nuevo en el panel de OnePay (modo REAL para producción, modo
   PRUEBAS para QA). Ojo: el campo Valor lee "14.70" como 1.470 → escribir "14,70".
2. `npm run precio:cambiar -- prod mensual 14,70 https://pagos.onepay.la/plan/<id>`
   (sin `prod` = QA). Lee la página del plan y se NIEGA si el monto, la moneda
   (USD), el impuesto (0%), la frecuencia o el modo (real/prueba) no cuadran.
   Sin `--si` solo simula; con `--si` escribe precio + enlace en un solo update.
3. Actualizar `PRECIOS_RESPALDO` cuando convenga (no es urgente).
Cada cambio queda en `plan_checkout_historial` (trigger: quién, cuándo, de
qué a qué; `service_role` = el comando, `postgres` = a mano en el panel).
`checkout:ver` enseña precio y enlace; `checkout:fijar` ya no escribe.
⚠️ QA enseña lo que COBRA su plan de prueba: hoy 19,70 / 117, no 14,70 / 97.

**US$14,70 al mes · US$97 al año** (= US$8,08/mes · ahorra US$79, 45%).
Migración 0043. Planes de OnePay en MODO REAL: `01a1a209-8a1b…cc9b4dea`
(Mensual 14,70) y `01a1a20a-42c5…eb9b1146` (Anual 97), "Membresía Manos
Creadoras", USD, 0% impuesto. ⚠️ **QA NO se cambió** (decisión de Cristian: no
crear planes en modo pruebas): QA anuncia 14,70/97 y su checkout de prueba
cobra 19,70/117. La 0043 solo pisa filas que apuntaban a los planes reales
viejos, así que en QA no hizo nada. Los planes reales viejos (19,70 y 117) NO
están archivados: quien ya pagó conserva su precio.
⚠️ **EL PLAN POR DEFECTO ES EL MENSUAL desde el 2026-11-01** (antes el anual).
Lo decide `FRECUENCIA_POR_DEFECTO` en `lib/planes.ts` y de ahí salen todos los
botones del home, el selector y `precioDesde()`.
Historia: 9,99/89,90 → 19,70/167 (31-oct) → 19,70/117 (2-nov) → 14,70/97 (3-nov).
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

**En OnePay, empresa "Manos Creadoras"** (migración 0037, 2026-10-31): los planes
NO se editan de precio, se crean nuevos. Los vigentes son
`01a192d6-6925…` (Mensual · US$19.70) y `01a192d6-d124…` (Anual · US$167.00),
los dos en **USD, impuesto 0%** (se cobra exactamente lo que anuncia la página)
y sin período de prueba. El anual ya usa la frecuencia "Anual" del panel, no el
apaño de "Mensual · 12 ciclos" de la 0028. Mismo enlace para Colombia y para
internacional. Los enlaces viven en `plan_checkout`, no en el código.
⚠️ Los planes viejos (9,99 / 89,90) siguen existiendo: quien ya compró conserva
su precio. No se borran sin decisión de Cristian.

---

## 💳 El circuito de pago, verificado de punta a punta (2026-10-17)

⚠️ **EL PANEL DE ONEPAY TIENE DOS MUNDOS Y SE CONFUNDEN CON FACILIDAD**
(descubierto por las malas el 2026-10-31). Arriba del panel hay una barra
naranja «Estás en modo de pruebas»: **cada modo tiene SUS planes y SUS
webhooks, y no se ven entre ellos**. Entrar al panel sin mirar esa barra y
concluir que "no hay nada creado" es el error que se cometió ese día: se dio
por muerto el webhook `ab3b6206` —que estaba vivo en modo pruebas— y se
pisaron sus claves en Vercel con las de otro. QA dejó de aceptar pagos hasta
que se repusieron. **Antes de tocar nada en OnePay: mira en qué modo estás.**

**MODO PRUEBAS → es lo que usa QA.** Webhook `ab3b6206` · "Manos Creadoras QA
(pruebas)" → `https://qa.manoscreadoras.co/api/webhooks/onepay`, activo; sus
claves son las de `.env.local` y las de Vercel **Preview**. Sus planes al
precio nuevo: `01a193ae-cdcc…` (Mensual US$19,70) y **`01a19ca4-e422…` (Anual
US$117, creado el 2026-11-02)**; el de US$167 (`01a193af-4e14…`) sigue ahí sin
usarse. El checkout de prueba trae tarjetas que simulan cada caso (Visa 4242
aprueba; hay otras para vencida, sin fondos y rechazo del banco).

**MODO REAL → es lo de producción.** Planes `01a192d6-6925…` (Mensual
US$19,70, migración 0037) y **`01a19ca5-bda1…` (Anual US$117, migración
0040)**. El anual viejo de US$167 (`01a192d6-d124…`) quedó **archivado** el
2026-11-02 —acción que el panel avisa como irreversible— después de que la
base de producción ya apuntara al nuevo y con 0 suscriptores, así que no
afectó a ninguna alumna. Webhook `7b4d702e`
· "Producción · Manos Creadoras" → `https://manoscreadoras.co/api/webhooks/onepay`,
activo, con los 5 eventos que el código entiende (pagada · cancelada ·
no pagada · vencida · finalizada; "creada" se deja fuera a propósito — una
suscripción creada todavía no se cobró). Sus claves están en `.env.prod` y en
Vercel **Production**. ⚠️ `.env.prod` tenía las claves del webhook de PRUEBAS
hasta el 2026-10-31: el archivo mentía y se corrigió ese día.

🟢 **LA VENTA EN PRODUCCIÓN SE ENCENDIÓ EL 2026-10-31.** Verificado de punta a
punta ese día: `manoscreadoras.co` anuncia US$13,92/US$167 · el botón lleva a
los planes reales de OnePay · el webhook rechaza con 401 lo que no viene
firmado · y un evento firmado de verdad entró con **200** y quedó guardado en
la base de producción (traza `2c86e1fe`, 1,26 s — muy lejos del corte de 10 s),
como huérfano porque el correo era inventado, que es lo correcto. Fue el PRIMER
evento que registra esa base: antes de ese día nunca llegó ninguno.

🟡 **FALTA `ONEPAY_API_KEY` EN PRODUCCIÓN — APLAZADO A PROPÓSITO** (ni en
`.env.prod` ni en Vercel Production; la de `.env.local` es `sk_test_`, de
pruebas, y **no sirve**). Consecuencia concreta: cuando una alumna pulse
"cancelar mi membresía", la app la cancelará en nuestra base y mandará el
aviso `ACCIÓN:` para hacerlo a mano, pero **NO detendrá el cobro en OnePay**.
Decisión de Cristian el 2026-10-31: **se deja para estos días**, porque la
venta acaba de abrir y todavía no hay nadie que pueda cancelar. Hace falta la
`sk_live_` del panel en modo real.
⚠️ Deja de ser aplazable en cuanto haya la primera compradora: a partir de
ahí, una cancelación que no se atienda a mano es dinero cobrado de más.

✅ **PAGO DE VERDAD PROBADO EN QA (2026-10-31), NO SIMULADO.** Se pagó el plan
mensual en el checkout de modo prueba con la Visa 4242: «Transacción
Aprobada» (ticket `bf69-48beada58eb9`) y, sin tocar nada más, la alumna quedó
con **membresía `completo` activa** y su correo de bienvenida enviado. En la
tabla: `d8210668` = `subscription.created`, ignorado a propósito, y
`44289d2d` = `suscripcion.pagada`, procesado en 2,6 s. Es la primera vez que
se verifica el camino entero —checkout real → webhook → acceso abierto— y no
solo un evento firmado a mano.
Para repetirlo: el cliente del checkout de prueba es **`hola@onepay.ai`**, así
que esa es la cuenta que hay que tener creada en QA (`npm run alumna:crear --
hola@onepay.ai`). Cambiar el correo del comprador desde el checkout NO se
puede: su sesión caduca y devuelve 401 al editar.

🟡 **EL WEBHOOK NO GUARDA EL CICLO NI LA FECHA DE VENCIMIENTO.** En ese pago la
membresía quedó con `ciclo = null` y `vence_el = null`. No corta el acceso
—`finDelCicloEnCurso` (`lib/ciclo.ts`) lo contempla— pero **sin ciclo cae al
respaldo de 30 días**. Para quien pague MENSUAL acierta; para quien pague
**ANUAL, "Mi plan" le enseñará una fecha de renovación a un mes en vez de a un
año**, y al cancelar el `coalesce(…, now())` puede recortarle el acceso que se
le prometió. Pendiente de decidir con Cristian: el evento de OnePay sí trae el
plan, así que se puede deducir el ciclo al activarla.

🇨🇴 **SE PROBÓ COBRAR A COLOMBIA POR WHATSAPP Y SE DESHIZO EL MISMO DÍA**
(migraciones 0038 y 0039, 2026-11-01). Durante unas horas quien entraba desde
Colombia iba a `wa.me` en vez de a la pasarela, con el botón diciendo
"Inscribirme por WhatsApp". Cristian lo revirtió: hoy **todos los países van a
OnePay**, con los textos de siempre.
Lo que queda aprendido, por si se repite la idea:
· **La estructura de dos regiones sigue viva** (`plan_checkout`, desde la
  0018). Cambiar el destino de Colombia son DOS FILAS, no código.
· **El texto del botón sí es código**: prometer "Pago seguro con OnePay" y
  abrir un chat es mentir justo cuando la alumna va a pagar.
· **Al revertir, el enlace se COPIA de la fila `internacional` del mismo
  entorno** y no se escribe: producción tiene los planes reales y QA los de
  modo prueba; una URL a mano cruza los dos entornos.
· **No se puede probar otro país desde aquí**: Vercel ignora la cabecera que
  se le mande y usa la IP real.

💲 **EL PLAN ANUAL BAJÓ A US$117 (2026-11-02, decisión de Cristian).** Antes
US$167. Hecho de punta a punta ese día: plan nuevo en los dos modos del panel,
migración 0040, código (`PRECIOS.anual`), QA y producción desplegadas y el plan
viejo archivado. **Pago de prueba REAL verificado en QA**: checkout de US$117
con la Visa 4242 → «Transacción Aprobada» (ticket `8200-ba4285fbd111`) →
webhook `0a9eb542` procesado en 2,3 s → membresía `completo` activa. En
producción se comprobó que la web anuncia US$117 y que el checkout real abre a
US$117, **sin pagar**: ahí cualquier pago es dinero de verdad.
· ✅ **LA BRECHA ENTRE LOS DOS PLANES ES A PROPÓSITO, NO UN DESCUIDO.** Se le
  planteó a Cristian el mismo 2026-11-02 —con los números delante— y confirmó
  el precio: «Déjalo en 117». **No se re-pregunta ni se "corrige" subiéndolo.**
  Si algún día hay que moverlo, es con `/precios` y protegiendo a quien ya
  compró (grandfathering), no editando la constante a secas.
· ⚠️ **El anual sale a US$9,75/mes, la MITAD del mensual de US$19,70, y el
  ahorro saltó del 29% al 51% (US$119).** Es un descuento muy agresivo: hace
  que pagar mes a mes sea mal negocio para la alumna, así que es de esperar que
  casi todo el mundo elija el anual. Entra más dinero por venta y se cobra por
  adelantado, pero el ingreso mensual recurrente se vuelve un pago al año.
  Queda dicho por si el reparto entre planes se desvía de lo que se esperaba.
· ⚠️ **ONEPAY MANDA `cicle_frequency: "monthly"` EN UN PLAN ANUAL.** Visto en
  el cuerpo del evento de la prueba de QA. Es importante para el pendiente de
  "deducir el ciclo del evento" (ver el aviso del ciclo más arriba): ese campo
  NO sirve, mentiría. Lo que sí sirve es `internal_id`, que llegó como
  `completo-anual-117`.

⚠️ **QA APUNTA A LOS PLANES DE PRUEBA POR UN UPDATE DE DATOS, NO POR MIGRACIÓN**
(y así debe ser: los enlaces son configuración de cada entorno, no esquema —
ver `supabase/migrations/README.md`). La 0037 y la 0040 dejan los enlaces
REALES, que son los correctos para producción; en QA se sobrescriben después.
Si algún día QA vuelve a enseñar los enlaces reales, es que falta ese paso.
· ✅ **YA NO SE HACE A MANO: `npm run checkout:ver` y `npm run checkout:fijar`**
  (`scripts/checkout-enlace.mjs`, creado el 2026-11-02). Por defecto trabajan
  contra QA; hay que escribir `prod` para tocar producción.
· ⚠️ **PASÓ DE VERDAD ESE MISMO DÍA**: al aplicar la 0040 en QA, QA quedó
  apuntando al plan REAL de producción, o sea que el siguiente "pago de prueba"
  habría sido un cobro auténtico con una tarjeta auténtica. Se detectó con
  `checkout:ver` y se corrigió en el acto. **Después de CUALQUIER migración que
  toque enlaces, `npm run checkout:ver` no es opcional.**

Webhook ANTERIOR `ab3b6206` →
`https://qa.manoscreadoras.co/api/webhooks/onepay`, 9
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

## 📊 ANALÍTICA: QUÉ SE MIDE Y QUÉ NO (2026-11-01)

**El país ya va en TODOS los eventos.** No iba porque se calcula en el
SERVIDOR (Vercel, `lib/pais.ts`) y Mixpanel vive en el NAVEGADOR: el dato
estaba en `sesiones_pais` y nadie había hecho el puente. Ahora el layout raíz
se lo pasa a `<Analitica>` y se registra como SUPER PROPIEDAD (`pais`,
`region`, `fuente_pais`), así que se pega solo a todo lo que se mida, también
a los eventos que se añadan después. ⚠️ **No arregla el pasado.**

**El embudo de dentro del home** (`components/home/MedirHome.tsx`): entre
"abrió la página" y "tocó pagar" no había NADA, así que no se podía responder
dónde se atascan. Ahora hay `seccion_vista` (11 secciones con `data-seccion`),
`scroll_profundidad` (25/50/75/100) y `boton_click` con texto y sección —este
último copiado de El Charcu—. ⚠️ **Cada cosa se mide UNA vez por visita**: sin
eso, subir y bajar daría porcentajes por encima del 100%.

**EL EMBUDO DE VENTA, DE PUNTA A PUNTA** (para armarlo en Mixpanel):
`pagina_ventas_vista` → `seccion_vista` (seccion=precio) → `cta_inscribirme_click`
→ `checkout_abierto` → `pago_confirmado`.
· `cta_inscribirme_click` lleva `origen` (header, banner_precio, banda_1de16,
  navidad, precio, cierre, barra_movil…) y `plan`: dice QUÉ botón la movió.
· `checkout_abierto` solo salta cuando el botón abre OnePay de verdad, no
  cuando lleva al ancla del precio. Esa distinción ya existía.
· ⚠️ `pago_confirmado` LO MANDA EL SERVIDOR desde el webhook
  (`lib/analitica/mixpanel-servidor.ts`), porque el pago ocurre en OnePay y el
  navegador no lo ve. Se ata con el `user_id` de Supabase, el mismo del
  `identify`. Sin él, el salto más caro del negocio era invisible.

🟡 **GRABACIÓN DE SESIÓN ENCENDIDA, Y CON CONDICIONES QUE NO SON OPCIONALES.**
Estuvo apagada a propósito; Cristian pidió encenderla. Se hizo así:
· **La política de privacidad se cambió PRIMERO.** Decía literalmente "ni
  grabamos lo que haces en pantalla": encenderla sin tocar esa frase habría
  sido desmentir por escrito lo que la app promete, no una omisión.
· **Todo lo que ella escribe o sube va TAPADO** (`record_mask_text_selector:"*"`
  + bloqueo de `img,video,canvas,[data-privado]`). Aquí se suben fotos del
  trabajo y dudas personales, no recetas.
⚠️ **Aflojar el enmascarado rompe la promesa de la política.** El valor está en
ver DÓNDE se traba, y para eso no hace falta leer lo que escribió.

⚠️ **LAS COLUMNAS "City" Y "Country" DE MIXPANEL SALEN VACÍAS Y ES CORRECTO.**
Mixpanel las calcula desde la IP, y le mandamos `ip: false` a propósito: es
dato personal y la política promete no guardarla. Hay que mirar NUESTRAS
propiedades `pais`, `ciudad` y `region`, que van en todos los eventos desde el
2026-11-01 (la ciudad sale de `x-vercel-ip-city`). Si alguien "arregla" esto
poniendo `ip: true`, rellena esas columnas pero contradice la política.

⚠️ **Mixpanel: un proyecto por entorno** — producción `337702b9…` (id 4064037),
QA `4af968e2…` (id 4064035). Ver el aviso de más arriba sobre el token cruzado.

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
- [ ] **Faltan 20 enlaces del directorio** (hay 13 de Temu, migración 0041; los
      demás dicen "Pronto"). Tres enlaces que pasó Cristian NO se usaron a
      propósito (segundo terciopelo, cuentas "con patrones", cierre magnético UK):
      ver la cabecera de la 0041. ⚠️ El de **terciopelo**: al abrirlo, Temu titula
      la página "tela elástica cuadros material vellón" — que alguien lo confirme.
- [ ] **Fotos de los productos del directorio.** Temu bloquea la lectura
      automática con CAPTCHA. La pantalla ya las pinta si se llena
      `directorio_items.imagen_url` (URL de la foto); mientras, ícono por categoría.

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

- **"Crear mi cuenta gratis" ya no existe (2026-10-21, pedido de Cristian).** Los
  3 botones (aviso del catálogo, ficha de bolso bloqueado, Ojo agotado) usan
  `components/app/PagoConPlan.tsx`: selector anual/mensual (anual por defecto,
  el mismo estado que el bloque de precio) + "Inscribirme con el plan …" al
  enlace de `plan_checkout`. El selector es un INTERRUPTOR pequeño ("Mensual ⟷
  Anual −25%", `role="switch"`), no dos botones: la primera versión parecía
  otro botón gigante (corregido el mismo día). Mixpanel: `catalogo`,
  `ficha_bolso`, `ojo_agotado`. El mismo interruptor (`components/app/
  InterruptorPlan.tsx`) reemplazó la píldora partida del precio del home y de Mi
  plan. ⏸️ **Sin commitear: Cristian lo revisa antes.**
  Corregidos de paso "uno nuevo cada mes" y "40 preguntas y 8 fotos". Esto hace
  MÁS urgente el pendiente de abajo.
- **`/app` SIN MUROS DE ENTRAR (2026-10-21, pedido de Cristian).** Sin sesión se
  ven todas las pestañas: Mis bolsos, Directorio, **Ojo Experto** (2 preguntas
  gratis de visitante; al agotarlas o al mandar foto, caja de plan con
  `PagoConPlan`) y **Mi plan** (ya no redirige a `/entrar`). La última pestaña dice
  **"Entrar"** sin sesión y "Mi cuenta" con ella (`SesionContexto`, lo decide el
  layout) y es el ÚNICO sitio con el formulario. Cerrar sesión vuelve a `/app`.
  La ruta del Ojo marca `necesitaPlan` (también a la cuenta gratis que agota sus
  3). Arreglado de paso: el Ojo de visitante respondía "sesión inválida" porque
  mandaba `Authorization: Bearer` vacío. ⚠️ El plan es UNO solo: no existe
  "Creadora" desde el 13-oct.
- **Ojo interno en UN pantallazo (2026-10-21).** `.alto-ojo` (100dvh − barra en
  móvil, 100dvh en desktop): la barra de escribir queda anclada y solo el chat
  hace scroll. En móvil el vacío se compactó (sugerencias en filas, sin ícono ni
  nota al pie). Medido: 0 scroll de página a 390×844 y 1440×900.
- **Ojo v5 minimalista (2026-10-21, `design-ref/ojo-v5-claude-code`).** Solo
  estilos, misma lógica. Escritorio: cabecera con logo + píldoras (Mis bolsos,
  Directorio, Ojo, Mi plan) + "Entrar/Inscribirme" o avatar; barra lateral
  MARFIL con Nueva consulta, buscador (filtra en el cliente las 30 cargadas),
  historial y medidor de preguntas (lleva a Mi plan). Inicio centrado: ícono,
  titular, composer en píldora y 4 tarjetas (la de foto abre el selector).
  Conversación: veredicto en Cormorant si el 1er párrafo es corto (≤140), caja
  marfil para párrafos `**Etiqueta:** …`. Móvil: barra con ☰ · título · "+",
  cajón "Mis consultas" (cierra con X, fondo o Escape), barra de abajo de 4
  pestañas en todo `/app` (Mis bolsos, Ojo, Directorio, Cuenta; 64px, token
  `--alto-barra-inferior`). Se quitó el selector de bolso/paso: el estado sigue
  y se manda igual. Arreglado de paso: claves repetidas en los mensajes (la ruta
  devuelve el id del HILO como id de cada respuesta). Revisor: 27/40 · 10/20 ·
  FIEL — "no lista" por movimiento y controles; se aplicó lo que era estilo.
  Pendientes del v5 (necesitan lógica, no se inventaron):
  - Etiqueta "Vi en tu foto: …" (la ruta no devuelve qué entendió).
  - Renombrar consulta (no hay acción; por eso no se pintó el lápiz).
  - Respuestas rápidas bajo cada respuesta (no existen).
  - Detener una respuesta en curso y borrar consultas (pedidos del revisor).
  - Sin comprobar con Gemini real que el modelo escriba `**Prueba:**`: con IA
    simulada no sale la caja. Si no lo escribe, habría que pedirlo en el prompt.
  - Ya no se ve el contador de FOTOS del mes (la referencia solo muestra preguntas).
- **Mini Ojo del home, versión arena (2026-10-22, `design-ref/home-ojo-claude-code`).**
  Fondo arena plano, columna de texto corta + tarjeta marfil que abre con un
  ejemplo FIJO ("¿Por qué se me abomba la base?") que no llama a la API ni gasta
  preguntas; al preguntar, se reemplaza por la conversación real. 2 sugerencias
  (fila con scroll lateral en móvil), alto máximo con scroll interno, la caja
  de "usaste tus 2" FUERA del scroll. La cámara lleva a `#precio` (la demo no
  sube fotos). Misma lógica, endpoint y analítica.
- **Los dos Ojo, unificados (2026-10-22, pedido de Cristian).** Burbuja, avatar,
  composer, puntos de "escribiendo" y píldoras viven en `components/app/
  OjoPiezas.tsx` y los usan los dos. Paleta: cacao + marfil = alumna y enviar;
  espresso + `--gold-light` = el Ojo; arena = cámara. Texto del Ojo en espresso.
  Solo cambia el tamaño; el veredicto en Cormorant y la caja "Prueba" son solo
  de la app (en la tarjeta del home no caben).
- **"Inscribirme" también en la cabecera móvil del home (2026-10-22)**, a
  `#precio` como en escritorio; "Entrar" pierde el borde para caber a 375px.
- Pendientes de esta tanda:
  - 🟡 La respuesta del ejemplo del home es PROVISIONAL: la tiene que validar Elizabeth.
- **Home a color (2026-10-22, `design-ref/home-color-claude-code`).** Una
  sección, un color. Mapa final (orden de escritorio): cabecera crema · héroe
  crema · cápsulas ESPRESSO · curso gratis crema · banda "1 de 20" CAFÉ a todo
  el ancho · Ojo arena · Elizabeth (bio) ESPRESSO · alumnas crema · precio
  ARENA · preguntas crema · cierre CAFÉ · pie ESPRESSO. Sin sombras; capas
  fondo → tarjeta → chip. Piezas nuevas: `EyebrowLinea` y, en `globals.css`,
  `.sobre-oscuro` cambia solo el color de `.titulo-seccion`, `.eyebrow` y
  `.clave`. Las cápsulas en móvil dejaron de ser historias circulares (fila
  de tarjetas de 200px). El precio conserva el SWITCH de verdad (la
  referencia traía píldora partida; Cristian pidió el switch, 22-oct). Mismos textos,
  enlaces, anclas, pago y analítica.
  - ✅ (2026-10-23, pedido de Cristian) En móvil las cápsulas ya van DEBAJO
    del héroe, como en escritorio: un solo orden para todos los anchos. Con
    eso el héroe (crema) ya no queda pegado al curso gratis (crema).
  - Alumnas en 5 columnas desde 1024px (235px c/u, citas a 4 líneas, mismo
    alto); carrusel con snap en móvil y tableta. De paso: los enlaces del
    menú de la cabecera del home salen desde 1024px — a 768 empujaban
    "Inscribirme" 24px fuera de la pantalla.
  - **Planes: switch en café y tarjeta pulida (2026-10-22, `design-ref/planes-claude-code`).**
    El carril ya no se "apaga" en mensual: café en los dos estados sobre
    claro (`--gold-pale` sobre oscuro), bolita marfil sin sombra, chip
    espresso; grande = 64×36. Tarjeta: eyebrow "Plan anual/mensual", sin el
    enlace "o mensual por…" (lo hace el switch), fila de confianza con
    íconos al fondo, garantía con escudo y WhatsApp dentro del panel marfil.
    Nota: la barra fija de compra móvil NO lee el ciclo elegido (siempre
    "desde US$7,49/mes" → `#precio`); solo lo comparten precio y `PagoConPlan`.
- **Sección navideña entre el banner y las cápsulas (2026-10-31, pedido de
  Cristian; referencia: sparkle-bag-studio.lovable.app).**
  `components/home/Navidad.tsx`: **franja CAFÉ (`--cacao`) a todo el ancho, sin
  bordes crema ni radio** (así la pidió Cristian el 31-oct; nació como tarjeta
  redondeada sobre un respiro crema, como la referencia, para no pegarla al
  espresso de las cápsulas). Consecuencia aceptada: café toca espresso sin nada
  en medio, y el home pasa a tener dos oscuros seguidos.
  Badge en píldora con ícono de regalo, titular serif con
  *navideños* en `--gold-pale`.
  · El badge dice "Edición navideña" y no "Bono 4" como el original: aquí no
    hay bonos numerados.
  - **UNA SOLA FOTO EN DOS COLUMNAS (2026-11-02, pedido de Cristian).** Las 4
    fotos en rejilla 2×2 se cambiaron por la bandeja completa
    (`public/images/navidad-accesorios.webp`, 900×994 WebP q74, 159 KB) —
    enseña las ~20 piezas de golpe y pesa MENOS que las cuatro juntas (159 KB
    frente a 220 KB). Las 4 viejas (`navidad-{esferas,coronas,baston,regalo}`)
    están borradas.
    · Layout: `md:grid-cols-2` con la foto **primera en el DOM**. De ahí sale
      todo el responsive sin un solo `order-*`: en móvil cae arriba (foto →
      texto → CTA, como pidió Cristian) y en escritorio queda a la izquierda.
    · El texto ahora NOMBRA las piezas (lista `PIEZAS`, 11 nombres en dos
      columnas): la foto enseña cuentas, la lista dice que ahí hay un reno, una
      luna y un bastón de caramelo. En `text-cream`, no `on-dark-muted`: es
      información que se lee ítem por ítem.
    · Se perdió el enlace por pieza (origen `navidad_pieza` en Mixpanel): con
      una sola foto solo queda el CTA al pie, origen `navidad`.
    · ⚠️ La URL del archivo del bolso marfil y de la foto navideña NO cambió de
      nombre. Quien ya tenía la vieja en caché puede verla un rato hasta que el
      navegador revalide; se confirmó que el servidor ya devuelve la nueva.
      Pasó en la propia verificación: el navegador seguía pintando la foto
      vieja del hero mientras `curl` al mismo `/_next/image` ya devolvía la
      nueva. Si vuelve a pasar, NO es el código: es caché del cliente.
    · Corregido tras el revisor (2026-11-02): **12 piezas, par y en `columns-2`**
      (con 11 en rejilla el último quedaba huérfano, y la rejilla ordena por
      filas → se leía en zigzag); **stagger de 70ms** con una `Entrada` por
      bloque de texto (antes entraba todo a la vez); y el subtítulo dice **"12
      piezas … e incluidas en tu membresía"** (sin el número y sin el
      "incluidas", la sección dejaba sin responder cuántas son y si se pagan
      aparte).
    · ⚠️ **El número 12 del subtítulo está atado a `PIEZAS`**: si se añade o se
      quita una pieza, hay que cambiar el texto y mantener el total PAR. Y cada
      nombre tiene que caber en UNA línea a 375px (por eso son "Campanas" y no
      "Campanas doradas": con los nombres largos, 5 de los 12 partían en dos).
    · **Tres niveles de profundidad DENTRO de la franja plana** (revisor, 3ª
      pasada): foto ELEVADA con el halo dorado de la ficha
      (`0 20px 60px -20px`, gold 40%), franja cacao de BASE y la lista en
      superficie HUNDIDA (`--espresso-2`, radio 22, hairline dorado 20%). Era la
      forma de darle los 3 niveles sin devolverle el borde crema ni el radio que
      Cristian le quitó.
    · **El CTA sigue crema** (es lo único que destaca sobre el cacao) pero con
      hairline dorado 45% + el mismo halo: en plano se leía como un botón
      secundario. En escritorio ya no ocupa toda la columna (`md:w-fit`).
    · **Micro-línea bajo el botón**: "Ver planes y precio · garantía de 7 días"
      (cream, con la garantía en gold-pale) y un chevron-down dentro del botón:
      dicen adónde lleva sin tocar la palabra "Inscribirme", que es cosa juzgada.
      También se añadió el hairline dorado ARRIBA (`border-y`): el cacao chocaba
      en seco con el crema del header y la costura se leía como un fallo.
    · **La foto va CUADRADA y recortada** (2026-11-02, segundo pedido de
      Cristian): `aspect-square object-cover`. A su alto real (900×994) se veía
      alargada, sobre todo en escritorio, donde estiraba la columna muy por
      debajo del texto. El recorte se come 94px repartidos arriba y abajo y la
      bandeja está centrada, así que no se pierde ninguna pieza.
    - **Revisor visual, 4 pasadas: 28 → 29 → 34 → 33/40 · 17/20 craft · 16/20
      copy.** Craft y copy PASAN el gate (≥16); usabilidad NO llega a 36 y la
      pantalla queda formalmente **NO LISTA**. Lo que le falta son las dos
      decisiones de Cristian que no se re-discuten: los tres "Inscribirme"
      simultáneos con tres apariencias (cabecera, sección, barra fija) y la
      franja oscura a sangre dentro de un home crema (= los 2 fallos de
      fidelidad). Todo lo demás que pidió el revisor está hecho.
  - 🟡 **LA SECCIÓN ANUNCIA LOS VIDEOS PARA DICIEMBRE (2026-11-02, decisión de
    Cristian).** El subtítulo decía "en video paso a paso e incluidas en tu
    membresía" en presente, y los videos navideños NO están cargados: quien
    pagaba por esta sección entraba y no encontraba nada. Ahora dice "incluidas
    en tu membresía: los videos paso a paso **se publican en diciembre**", con
    el plazo en `--gold-pale` dentro de la misma frase —no en una nota al pie—
    y el rótulo del bloque dice "Lo que vas a tejer · 12 videos".
    ⚠️ **DOS COSAS QUE HAY QUE HACER EN DICIEMBRE, O ESTO SE CONVIERTE EN UNA
    MENTIRA AL REVÉS:** (1) subir los 12 videos al catálogo con la forma de los
    llaveros (ver el punto de abajo), y (2) **quitar "se publican en diciembre"
    del subtítulo** — si se queda después de publicarlos, manda a esperar algo
    que ya se puede ver. La fecha no se puso en el rótulo porque con ella parte
    en dos líneas a 375px.
  - Revisor visual: 28/40 → **31/40 · 15/20 craft · 13/20 copy · FIEL (0
    desvíos de 6)**. Corregido tras su nota: rejilla 2×2 en móvil (la fila con
    scroll escondía 2 de las 4 piezas y no tenía dots ni flechas), subtítulo
    anclado al deseo #1/#4 del avatar y `gap` de 16 en vez de 12.
  - **CTA al pie (2026-10-31, pedido de Cristian):** botón "Inscribirme" a
    `#precio`, origen `navidad` en Mixpanel. Dice solo "Inscribirme" sin el
    precio porque "Inscribirme · desde US$X/mes" parte en dos líneas a 375px y
    el precio ya está en la barra fija que se ve a la vez.
    ⚠️ **El texto se queda en "Inscribirme" — decisión de Cristian
    (2026-10-31), no se re-pregunta.** El revisor bajó la nota de 31/40 a 28/40
    por esto: a 375px quedan TRES botones "Inscribirme" a la vez (cabecera,
    panel y barra fija) con destinos distintos, y proponía "Ver los planes",
    que es lo que ya dice la banda "1 de 20" cuando manda al mismo `#precio`.
    Se planteó y Cristian prefirió "Inscribirme". Riesgo aceptado.
  - 🟡 **Los videos navideños NO están en el catálogo.** Cuando se carguen:
    van con la forma de los llaveros (un video completo por pieza, sin
    lecciones) y entran en el plan de pago. Faltan sus IDs de Bunny — no se
    pueden buscar desde el repo, que solo guarda `BUNNY_TOKEN_KEY` (firmar),
    no la clave de API que lista la biblioteca.
- **Ficha del bolso con el video DENTRO (2026-10-23, `design-ref/app-interna-claude-code/02-ficha-bolso`).**
  Cristian eligió la imagen (reproductor en la ficha) sobre el texto del prompt
  (3 columnas sin video). `components/app/FichaBolso.tsx`: el paso a paso
  cambia el video sin salir de la página; "Siguiente paso/parte"; materiales en
  tarjeta espresso con medidas y "Ver en el directorio". El servidor firma las
  URL SOLO con acceso (verificado: bolso de plan sin sesión = 0 enlaces). El
  avance sigue con `BotonVisto` (probado: 0→1 de 6 y vuelta). Las páginas
  `/app/bolsos/<bolso>/<orden>` siguen existiendo. Dos columnas desde 1280px
  (con la barra lateral, a 1024 no cabían).
- **Navegación unificada de la app (2026-10-23, secciones 1 y 2 del prompt).**
  Fuera la barra lateral. La pone el layout de `/app` (`CabeceraApp` y
  `BarraInferior` en `NavegacionApp.tsx`), igual en todas las páginas y en el
  Ojo: escritorio = cabecera del home (logo "M", píldoras, Entrar/Inscribirme o
  "Plan anual" + avatar); móvil = cabecera de marca (salvo ficha, lección y
  Ojo, que traen la suya) y 5 pestañas con el Ojo al centro en un círculo que
  sobresale. Ojo: panel arena, "Historial" + "+" en móvil, cajón "Tus
  consultas". "Inscribirme" lleva a Mi plan. Tokens: `--alto-cabecera-app`
  68px, `--alto-barra-inferior` 72px, `--elevacion-ojo` 30px. Probado sin y
  con sesión, a 1440 y 390.
- **Páginas de la app según sus referencias (2026-10-23, sección 3).**
  Mis bolsos: eyebrow con línea, *gratis* en cursiva, tarjeta café plana (fila
  con switch oscuro + botón crema en escritorio; fila tocable a Mi plan en
  móvil), filtros en una fila, tarjetas 4:5 a 5 columnas. Directorio: franja
  arena con título y buscador, 4 columnas / lista en móvil, "Comprar" café o
  "Enlace pronto" punteado. Mi plan: página arena y tarjeta como el precio del
  home. Cuenta: tarjeta partida con foto + formulario (también en `/entrar`).
  Fuera todos los degradados de la app (`PagoConPlan` ahora café / gold-pale).
  Verificado sin y con sesión a 1440 y 390: 0 degradados, 0 dorado sobre
  oscuro, 0 desbordes.
- **Ficha: materiales por paso, banner y "elegir = ver" (2026-10-23,
  `PROMPT-ficha-materiales-por-paso.md` + pedido de Cristian).**
  · Paso Materiales: "Lo que *necesitas*" completo (`MaterialesDelBolso`,
    tarjeta marfil, "nombre · cantidad", chip opcional, franja MEDIDAS). Pasos
    1-5: solo la fila "Materiales del bolso · N" (`AccesoMateriales`), que abre
    cajón derecho (escritorio) u hoja de abajo (móvil). El video NO se
    reinicia al abrir/cerrar (verificado: mismo iframe).
  · Marcar "ya lo tengo" se conservó: la fila entera es el interruptor (la
    referencia no dibuja casilla, pero quitarlo era quitar una función).
  · Bolso con plan: el mismo banner café de Mis bolsos (`BannerPlan`).
  · Elegir un paso (o "Siguiente paso") arranca el video con sonido y sube
    hasta él (probado en móvil: de 303px abajo al video bajo la barra).
  - 🟡 Las páginas de cada paso (`/app/bolsos/<bolso>/<paso>`) siguen con la
    lista vieja (`ListaMateriales`) en su panel lateral.
  - 🟡 En iPhone, Safari puede bloquear el sonido dentro del reproductor de
    Bunny (pendiente conocido): el video arranca mudo y hay que tocar el volumen.
- **Videos: tocar un paso = verlo, y tocar el video = detenerlo (2026-10-23).**
  Revisados todos: ficha (ya), curso gratis del home (tocar la fila del
  temario ahora reproduce y sube al video), páginas de cada paso (`?ver=1` al
  llegar desde un paso → arranca solo; sin él, no), cápsulas (abren sonando).
  En el visor de cápsulas: bordes = pasar, CENTRO = detener y destapar los
  controles de Bunny (volumen incluido); si Bunny ignora la pausa al arrancar,
  se reenvía. Si el navegador obliga a mudo, sale "Activar sonido" (visor y
  `ReproductorEnSitio`).
- **Historias de cápsulas en móvil, de vuelta (2026-10-23).** Círculos arriba
  del héroe + tarjetas bajo el héroe, con estado compartido
  (`ProveedorCapsulas`: vistas y un solo visor). Anillo dorado liso. Etiquetas
  de UNA palabra: Hilo, Arranque, Empate, Firmeza, Aro (`seed-capsulas.mjs`,
  cargado en QA).
  - ⚠️ Al pasar a producción: correr `ENV_FILE=.env.prod node scripts/seed-capsulas.mjs`
    para que las etiquetas cortas lleguen también allí.
- **🔴→✅ Los enlaces de acceso no salían (resuelto 2026-10-23, QA y prod).**
  Supabase manda los correos por Resend con una clave de Resend como
  contraseña SMTP; el 17-oct se creó una clave nueva y se BORRÓ la vieja, y
  Supabase siguió con la muerta → `500 Error sending magic link email` desde
  el 15-oct. Se puso la clave vigente (`RESEND_API_KEY`) como `smtp_pass` en
  los dos proyectos. Probado: el enlace llega en QA y en prod.
  ⚠️ Si se vuelve a rotar la clave de Resend, hay que actualizarla TAMBIÉN en
  Supabase → Authentication → SMTP (las dos bases).
  · De paso: 5 de las 6 plantillas de correo eran inválidas (notas con
    `{{ }}` dentro de comentarios HTML). Arregladas en `supabase/templates/` y
    subidas a QA y prod; validadas con el motor de Go.
  - 🟡 A quien entra POR PRIMERA VEZ con el enlace le llega el correo genérico
    de Supabase en inglés ("Confirm your email address"), no "Confirma tu
    correo". Nuestras plantillas están bien (se validaron y renderizan); la
    causa está del lado de Supabase. Pendiente de investigar.
  - 🟡 "Ver el programa" del formulario apunta a `/#oferta`, ancla que ya no
    existe en el home (hoy es `#precio`). No se cambió: es un enlace.
  - 🟡 `PagoConPlan` (caja de pago en la ficha bloqueada) aún usa el botón en
    degradado; el prompt pide quitarlo en toda la app interna.
  - 🟡 El pie de la referencia trae columnas (Curso / Ayuda) con enlaces que
    hoy no están; se respetaron los enlaces actuales.
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

- ✅ **AUDITORÍA DE /app EN 3 ESTADOS (2026-10-23) — CORREGIDA.** La página de cada
  paso ya no existe como pantalla: `/app/bolsos/[slug]/[orden]` redirige a la ficha
  con `?video=N&ver=1` (se borraron PanelLeccion, PasoAPaso y ListaMateriales).
  Cuenta gratis ve la oferta y "Inscribirme"; "Continúa" solo con avance real;
  404 propio dentro de la app; Ojo pagado sin "0 de 600" (se avisa al 80%).
  ✅ Cupos del Ojo decididos por Cristian (2026-10-23): visitante 2 preguntas en
  total, cuenta gratis **8 al mes** (migración 0036, aplicada en QA y en
  producción el 2026-10-23). No se re-pregunta.

- 🔴 **CÁPSULAS SIN AUDIO — DIAGNÓSTICO DEL 2026-10-21.** En Chrome de escritorio
  SÍ suenan (probado con toque real: el reproductor dice `getMuted=false`,
  volumen 100, y no salta el plan B). En TELÉFONOS no: (1) Safari de iPhone no
  deja que un iframe de OTRO dominio (`mediadelivery.net`) arranque con sonido
  aunque haya toque → a los 2 s el plan B lo remonta mudo; (2) con datos lentos,
  si `ready` tarda más de 6 s también se silencia. Arreglo de raíz propuesto:
  `<video>` propio con el MP4 directo de Bunny (existen 360p-1080p y responden
  desde el dominio; desde localhost dan 403) y `play()` dentro del toque. Las
  cápsulas son gratis, así que el archivo directo no expone nada de pago.
  ⏸️ Pendiente del OK de Cristian; solo se puede comprobar en un iPhone, en QA.
- 🟡 **EL AUDIO DE LOS VIDEOS: SIN OÍR EN UN TELÉFONO REAL** (2026-10-20).
  Los **tres** sitios con video —cápsulas, curso gratis y lecciones de `/app`—
  comparten el mismo reproductor y la misma lógica: intentan sonar y, si no
  les dejan, se remontan mudos. El peor caso es un video mudo, nunca parado.
  ✅ **2026-10-31: el botón "Activar sonido" ya no es una trampa.** Desaparecía
  en cuanto lo tocabas, y Safari de iPhone ignora el `unmute` hacia un iframe
  de otro dominio EN SILENCIO → botón fuera, video mudo, sin forma de
  insistir. Ahora se pregunta `getMuted` 400 ms después y el botón solo se
  retira con la confirmación; si sigue mudo pasa a "Toca el video para el
  volumen". La confirmación va en un estado APARTE de `mudo`, que es la `key`
  del iframe (tocarla remontaría el video desde cero). Probado simulando los
  mensajes de Bunny, las tres ramas. **No sustituye a oírlo en un iPhone.**
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
- ~~🟡 **El token del enlace mágico llega como `pkce_…`**~~ ✅ **RESUELTO DE RAÍZ
  EL 2026-10-31: YA NO SE ENTRA CON ENLACE, SE ENTRA CON UN CÓDIGO DE 6 DÍGITOS.**
  Era exactamente el problema que se temía aquí, y El Charcu lo midió antes que
  nosotros: de 8 personas que tocaron su enlace mágico en una semana, **7 no
  consiguieron entrar** (enlace abierto en otro navegador, y filtros de
  Outlook/Hotmail que lo gastan al comprobarlo).
  · El correo lleva el código y **ningún enlace**: comparten el mismo token de
    un solo uso, así que juntos el filtro gasta el código (El Charcu lo probó
    con los dos y falló así). No reponer el botón en las plantillas.
  · Una sola casilla, no seis: el celular pega el código entero.
  · Lo verifica el NAVEGADOR (`verificarCodigo` en `lib/auth.ts`), porque el
    límite de intentos de Supabase va por IP y desde el servidor todas
    compartirían la de Vercel.
  · `/auth/callback` sigue vivo para los correos ya enviados y para los enlaces
    de `npm run alumna:crear`.
  · En los DOS paneles (QA y producción) están las plantillas nuevas y
    «Email OTP length» en **6**. Al tocar esto, el orden importa: **primero la
    plantilla, después el código**; al revés, la alumna recibe un enlace y la
    pantalla le pide un número.
  · ⚠️ Al pegar en el panel, exportar con `LC_ALL=en_US.UTF-8 pbcopy`: sin eso
    los acentos llegan rotos («cv≥digo») y así se guardó la primera vez.
  **Probado entrando de verdad en los dos sitios** (2026-10-31): correo recibido
  con su código de 6, código equivocado → mensaje claro, código bueno → sesión
  abierta y `?entrada=`. En producción salió la plantilla de «Confirma tu
  correo» porque ese correo no tenía cuenta allí, así que las dos quedaron
  verificadas.
- **Los precios por token de `lib/costo-ia.ts` no están verificados** contra la
  lista de Google (los tokens sí). Contrastar un mes de `ai_spend` con la factura.
- 🔴 **PRODUCCIÓN ESTUVO MANDANDO SUS EVENTOS AL PROYECTO DE QA** hasta el
  2026-11-01. La variable `NEXT_PUBLIC_MIXPANEL_TOKEN` de Vercel **Production**
  tenía el token de «manos creadoras qa» (`4af968e2…`), así que el proyecto
  «Manos creadoras» (`337702b9…`, id 4064037) estaba vacío y todo caía mezclado
  con las pruebas. Corregido y verificado: producción sirve el token de
  producción, QA el suyo, y en el panel ya entran `pagina_ventas_vista`,
  `plan_toggle` y los automáticos.
  ⚠️ Lo de ANTES de esa fecha se queda en el proyecto de QA —no se puede
  mover—, así que el de producción empieza desde cero y lo que se veía en QA
  no era solo QA.
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
  BFF · **Supabase Auth** con código de 6 dígitos al correo, sin contraseñas.
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

**En vivo:** https://manos-creadoras.vercel.app (rama `main`; PR #2 `82338ce` y PR #3 `9d9623e` del 2026-10-21: `/app` sin muros, botones de pago con interruptor).
`manoscreadoras.co` y `www` (→ redirige al apex) ya están en el proyecto, **falta
el DNS** en Namecheap: `A @ 216.198.79.1` y `CNAME www
54c77d9c2092c13e.vercel-dns-017.com`.

**Base de producción (`icbh…`):** 36 migraciones aplicadas con `db push` (la 0002
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
- 💵 **Planes gratuitos POR AHORA — decisión de Cristian (2026-10-21).** Se
  sigue en Vercel Hobby y Supabase Free. Lo que eso implica, para revisarlo al
  encender la venta: Vercel Hobby **prohíbe el uso comercial** (vender el curso
  lo es → Pro, US$20/mes); Supabase Free **pausa la base tras 7 días sin
  actividad** (con visitas reales no pasa; si pasa, *Restore project* y no se
  pierde nada) y **no hace copias de seguridad** (Pro, US$25/mes).
- **Gemini puede fallar por "alta demanda"** (pasó en la primera prueba en vivo:
  503 de Google). La pregunta se devuelve, pero la alumna ve un error. Conviene un
  reintento corto o un modelo de respaldo.
- ~~El correo de acceso en producción no se probó con un envío real.~~ ✅ Probado
  el 2026-10-31 entrando de verdad con el código de 6 dígitos.
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
