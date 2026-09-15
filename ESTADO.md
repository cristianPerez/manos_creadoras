# ESTADO — Manos Creadoras App
Última actualización: 2026-08-08 · El detalle de cada sesión vive en el historial de git; aquí queda solo lo que sigue siendo cierto y accionable.

⏸️ **CHECKPOINT (2026-08-08)** — **La app ya es instalable y manda notificaciones push**, que era la pieza que justificaba construir esto y llevaba desde la Sesión 6 sin hacerse sin que nadie lo notara. La app interna funciona con datos reales de Supabase y los videos ya no dependen de Hotmart. **Todo lo construido es el ambiente de QA.** Nada bloquea por el lado del código: lo que falta son cuentas y contenido.

---

## 🔴 BLOQUEOS PARA LANZAR (nada de esto es código)

- [x] ~~**Videos: elegir dónde alojarlos**~~ — ✅ **BUNNY FUNCIONANDO 2026-08-08.** Biblioteca QA `manos-creadoras-qa` (Library ID `723241`, Frankfurt + São Paulo). Token authentication activo y **verificado**: el video reproduce dentro de la app, todas las peticiones a Bunny responden 200 (ni un 403), el enlace va firmado y caduca en 6 h. Falta subir el curso real.
- [ ] **Subir los videos del curso a Bunny** (hoy hay 1 de prueba conectado a `s2-l01`). No hacen falta los 58 para lanzar.
- [ ] ⚠️ **Al publicar**: crear la biblioteca de PRODUCCIÓN y agregar el dominio de Vercel en *Allowed domains* (hoy solo está `localhost`).
- [x] ~~**Resend + SMTP en Supabase**~~ — ✅ **RESUELTO 2026-08-08.** Dominio `contacto.manoscreadoras.co` verificado (Namecheap, us-east-1), SMTP configurado y plantilla con `token_hash` aplicada. **Probado de verdad**: correo enviado desde el login real → Resend lo reporta `delivered` en Gmail. Se inspeccionó el HTML entregado: Supabase NO envuelve la plantilla (una sola etiqueta `<html>`, el `<meta color-scheme>` sobrevive) y el enlace sale bien armado con su `http://`. Plantilla versionada en `supabase/templates/magic-link.html`.
- [ ] ⚠️ **Al publicar: cambiar el Site URL** de `http://localhost:3000` a la URL de Vercel. Si se olvida, los correos de las alumnas traerán enlaces a localhost — que en su celular no existe. También subir Rate Limits → "emails per hour".
- [ ] **Hotmart: crear el producto de SUSCRIPCIÓN.** `lib/config.ts` apunta al producto VIEJO de pago único ($25), así que los botones cobran lo equivocado. **Esto bloquea vender.**
- [ ] **Supabase de PRODUCCIÓN**: crear proyecto nuevo y correr ahí las 7 migraciones. El actual (`cazqmaluaehyikkstkoi`) queda como QA. → ver "Ambientes".
- [ ] **Hotmart — configurar el webhook**: panel → Herramientas → Webhook → apuntar a `https://TU-DOMINIO/api/webhooks/hotmart` y pegar el hottok en `HOTMART_HOTTOK`. ⚠️ Verificar ahí los nombres EXACTOS de los eventos de suscripción y contrastarlos con la tabla `EVENTO_A_ESTADO` del webhook — el catálogo varía por cuenta.
- [x] ~~**Vercel**: crear la cuenta y conectar el repo~~ — ✅ **HECHO 2026-09-15 (Cristian).** Conectado a QA; cada `push` a `develop` despliega solo.

### ⚠️ Seguridad
- [x] ~~**Confirmar que la clave secreta de Supabase fue ROTADA**~~ — ✅ **CONFIRMADO 2026-09-15 por Cristian.** Incidente del 2026-08-02 cerrado. Comprobado además que la clave que hay en `.env.local` funciona contra QA (4 perfiles), así que el rotado no dejó los scripts locales rotos.

### Material de la dueña (bloquea la calidad, no el lanzamiento)
- [ ] **Listado completo de lecciones** de las secciones 2, 3 y 4 (~49 faltan; hoy hay 9 cargadas).
- [ ] **Nombres reales de los tutoriales**: en Hotmart se llaman "Tutorial 2", "Tutorial 3"… La alumna no puede recordar dónde está la técnica que busca. Bastaría una línea por lección.
- [ ] **2-3 testimonios reales** (las capturas de WhatsApp) para la landing.

---

## 🎯 PLAN EN CURSO — Embudo de entrada sin webhook (portado de El Charcu)

**Objetivo:** que alguien pueda entrar y usar el producto **sin esperar a ningún
webhook de compra** — 3 videos de regalo y llamadas al Ojo Experto — y que el
acceso se pueda **conceder a mano desde el primer día**. Cuando haya pasarela,
el webhook solo inserta una fila más.

Referencia leída: `~/Documents/goingTube/elcharcu` (ESTADO.md con D1–D21,
`useLeadWall.ts`, migraciones 0024/0025, `api/asistente/route.ts`, `fake.ts`,
`events.ts`, `auth/callback`). Se porta la **lección**, no el archivo: allí es
FSD (`src/entities`, `src/features`) y aquí el layout plano de Next — no se
reorganiza el repo.

### Decisiones de este plan

| #   | Decisión                                                                 | Por qué                                                                                                                                                                                    |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | **Se mantiene D12 de El Charcu: la puerta vive en la BASE**, no en la pantalla | Ya se cumple aquí con `tiene_acceso()` en la RLS de `secciones`/`lecciones`. No se toca ese principio, solo de dónde saca la respuesta.                                                    |
| E2  | **Dos mecanismos distintos, porque son problemas distintos**: `lecciones.es_libre` (contenido) + `accesos` (personas) | Los 3 videos de regalo son una propiedad del CATÁLOGO, no un permiso de cada alumna: con una concesión por persona habría que otorgar 3 filas a cada cuenta nueva, y cambiar el regalo obligaría a reescribir las filas de todo el mundo. Con la columna, cambiar el regalo es un `update` de una fila. |
| E3  | **`accesos` sustituye el origen del acceso DE UNA VEZ**, sin puente        | Cristian eligió cortar sin fase intermedia (2026-09-14). `tiene_acceso_de` ya no mira `profiles.status`: solo concesiones. ⚠️ La COLUMNA `status` se queda, y no sobra: la necesitan la defensa del webhook contra un `PURCHASE_APPROVED` tardío que resucitaría a quien reembolsó, y la pantalla "Mi cuenta". Lo que se cortó es su poder de decidir quién entra. |
| E4  | **NO se porta `visitor_id` ni el contador anónimo** (y con él, toda la migración 0024) | En El Charcu el asistente vive en la portada para anónimos (su D14) y por eso necesita contador por navegador, `link_visitor_to_user` y el arreglo del navegador compartido. Aquí la demostración son **los 3 videos**, que no gastan IA y no hay que contar. Sin consumo anónimo de IA no hace falta nada de esa maquinaria. Es la mayor reducción de complejidad disponible. |
| E5  | **El muro blando se dispara al tocar el Ojo Experto, no en la pregunta N+1** | Consecuencia de E4: si no hay cupo anónimo, no hay "segunda pregunta". El muro es cerrable (lección de El Charcu: sin salida, quien no deja el correo tampoco puede seguir viendo los videos, y se va). Cerrarlo devuelve la página, no el acceso. |
| E6  | ~~NO se porta Mixpanel~~ **REVERTIDA por Cristian (2026-09-15): SÍ se usa Mixpanel.** Sigue en pie no portar `cure-safety` ni `recipe-chat` | La propuesta era quedarse con el catálogo de nombres y evitar una cuenta, un costo y un banner de cookies. Cristian lo pidió explícitamente. ⚠️ Queda pendiente lo que motivaba la objeción: **la política de privacidad no menciona Mixpanel** y hay que actualizarla antes de vender. |
| E7  | **Sí se porta `fake.ts` con sus dos condiciones** (`AI_SIMULAR_IA=1` **y** no producción) | Permite probar el embudo entero en QA sin gastar un centavo, y la segunda condición no se puede apagar: una variable mal copiada haría que producción contestara texto inventado pareciendo sana. |

### ⚠️ Dos fallos reales encontrados al leer (no son del plan, son de aquí)

- **Redirect abierto en `app/auth/callback/route.ts:16`.** `next` se lee del
  enlace y se pega detrás del origen sin validar, así que `?next=//otro-sitio.co`
  redirige fuera del dominio **con la sesión recién creada**. La ruta viaja por
  correo: es entrada de fuera aunque la escribamos nosotros. El Charcu lo tapa
  con `safeNext`. Se arregla en la Fase 2.
- **`profiles.notas_tejido` entra literal en el prompt del Ojo Experto**
  (`route.ts:243`). Hoy la UI no lo expone, pero la política RLS deja a la alumna
  actualizar su propio perfil sin restricción de columnas, así que por la API
  podría escribir instrucciones ahí. Es la misma clase de agujero que el campo
  `product` de El Charcu. Se acota en la Fase 4 (longitud + posición en el prompt).

### Fases (cada una se ejecuta con aprobación explícita)

- **Fase 1 · Acceso — ✅ HECHA Y VERIFICADA CONTRA QA (2026-09-15).**
  `0008_accesos.sql` (tabla `accesos` + `tiene_acceso_de` leyendo solo de ahí +
  `otorgar_acceso`/`revocar_acceso` + traspaso de las alumnas que ya tenían
  acceso) y `0009_lecciones_libres.sql` (`es_libre`, RLS `es_libre or
  tiene_acceso()`, las 3 libres son `s2-l01/02/03`). El webhook escribe
  concesiones (`sincronizarAcceso`), `lib/curso.ts` pregunta a la base en vez de
  reconstruir la regla, y existe `npm run acceso:dar|quitar|ver`.
  **Medido con la clave pública, como un desconocido:** ve 3 lecciones y 1
  sección, y CERO en `accesos`/`profiles`/`user_progress`/`ai_conversations`;
  `otorgar_acceso` y `tiene_acceso_de(uid)` le responden "permission denied".
  Las 4 alumnas que ya tenían acceso lo conservaron. Probado dar y quitar a
  mano: con `status='active'` en Hotmart y la concesión revocada, **no entra** —
  que es la prueba de que el corte es real.
  ⚠️ `0010` existe porque la `0009` tenía un fallo: la política preguntaba
  `tiene_acceso()`, que estaba revocada para `anon` desde la 0002, así que el
  visitante recibía un error 42501 y cero filas en vez de los videos libres.
  **La primera prueba lo dio por bueno** porque no miraba el error, solo contaba
  filas — de ahí la regla de mirar SIEMPRE el error, no el `length`.
- **Fase 2 · Embudo sin registro — FUNCIONA, NO PASA EL LISTÓN VISUAL
  (2026-09-15).** `/cursos` y `/ojo-experto` salieron de las rutas privadas; sin
  sesión `cargarCurso` devuelve `alumna: null` y la base entrega solo lo libre.
  Pantallas nuevas: `CursoDeVisita`, `LeccionDelPrograma` (una lección de pago
  invita en vez de dar 404), `MuroDeCortesia`, `OfertaEnUnaLinea`. La bottom-nav
  cambia "Mi cuenta" por "Entrar". Tapado el redirect abierto del callback
  (`destinoSeguro`).
  🟡 **3 rondas del revisor: 28→29→31/40 usabilidad y 13→14/20 craft.** El
  listón es 36/40 y 16/20, así que **ninguna de las dos pantallas está lista**.
  Lo que falta, por impacto:
  1. ~~Las franjas blancas del video~~ — **cerrado por decisión: el curso se
     graba horizontal, el marco 16:9 se queda.** Lo que se ve hoy es el video de
     prueba. El defecto que más bajaba la nota desaparece con el contenido real,
     sin tocar código.
  2. ~~La caja "Sube la foto de tu bolso…" parecía un campo real y llevaba a la
     landing~~ — **corregido**: ahora es un botón secundario que dice
     "Desbloquear para subir mi foto". Era una trampa que introduje yo.
  3. "Tutorial 2"/"Tutorial 3" se leen como marcadores de posición. Bloqueado
     por el material de la dueña (nombres reales).
  4. Faltan animaciones baseline en estas dos pantallas (CountUp en las cifras).

  **No se volvió a pasar el revisor tras estos dos cierres** (Cristian pidió
  avanzar). La última nota medida es 31/40 · 14/20 y los dos puntos de arriba no
  están contados en ella: hay que volver a puntuar antes de dar la Fase 2 por
  cerrada.
  ⚠️ **El revisor propuso DOS VECES anclar el precio en "$25"**. Ese es el pago
  único del producto VIEJO, que se eliminó de toda la app por ser información
  falsa. Los precios reales salen de `lib/config`. No revivirlo.
- **Fase 3 · Cupo y presupuesto — ✅ HECHA Y MEDIDA CONTRA QA (2026-09-15).**
  Migración `0011`: `ai_spend` pasa a clave `(dia, publico)` con `publico`
  `regalo|miembro`, `publico_de(uid)` lo deduce de la **concesión** (no de
  `profiles.status`, que ya no decide nada), y `apuntar_gasto_ia` /
  `gasto_ia_de_hoy` reemplazan el leer-y-reescribir.
  El freno se comprueba **después** de saber de qué público es. Topes en
  `AI_DAILY_BUDGET_REGALO_USD` / `_MIEMBRO_USD`, con el `AI_DAILY_BUDGET_USD`
  viejo de respaldo para que un despliegue sin las variables nuevas no se quede
  sin presupuesto ninguno.
  **Dos fallos reales cerrados, no solo el del plan:**
  1. El gasto se apuntaba leyendo `usd` y reescribiendo `leído + costo`. Dos
     peticiones a la vez leían lo mismo y una se perdía. **Medido: 50 consultas
     simultáneas quedan 50/50 apuntadas** con la sentencia atómica.
  2. El costo era una estimación fija (`0.00025` pregunta / `0.0005` foto).
     Ahora se cobra sobre los tokens que devuelve Google (`lib/costo-ia.ts`).
  ⚠️ **Hallazgo de negocio: una consulta típica cuesta ~USD 0,0018 — SIETE VECES
  la estimación vieja.** Con 40 preguntas/mes por alumna son ~USD 0,07, sigue
  siendo <1% del ingreso, pero el número que se venía usando estaba mal.
  ⚠️ **Los precios por token de `lib/costo-ia.ts` NO están verificados contra la
  lista de Google.** Los tokens sí son exactos. Contrastar `select sum(usd) from
  ai_spend` de un mes real contra la factura de AI Studio y ajustar las dos
  constantes. Que el precio sea aproximado no rompe el freno: la cifra crece con
  el uso real.
  ⚠️ **Comprobado con una llamada real a Gemini:** la respuesta trae
  `thoughtsTokenCount` pero **no siempre `candidatesTokenCount`**. Por eso la
  salida se calcula también como `total − entrada` y gana la mayor de las dos —
  contar de menos en un freno de gasto es no tener freno.
  ⚠️ Los dos bolsillos son **globales por público, no por persona**: una sola
  alumna puede agotar el de `miembro`. Con las alumnas de hoy da igual; con
  varias decenas activas hay que decidir si el tope pasa a ser por cuenta.
- **Cuenta gratis con 3 consultas — ✅ HECHA Y MEDIDA (2026-09-15).** Opción B
  de Cristian. Migración `0012`: se quitó `shouldCreateUser: false`, un
  disparador en `auth.users` crea el perfil (con `status` NULO = nunca compró),
  y los cupos viven en la tabla `cupos` — `regalo` 3 preguntas + 1 foto,
  `miembro` 40 + 8. `publico_de` se simplificó a `tiene_acceso_de ? miembro :
  regalo`: una sola regla en vez de mirar motivos de concesión.
  **Medido con una sesión real de cuenta gratuita:** ve 3 lecciones y 1 sección,
  `tiene_acceso()` = false, cupo 3/1. **Crear cuenta NO regala el curso.** Y al
  comprar pasa a 40/8 sin perder nada.
  El webhook usa `upsert` porque el disparador ya creó la fila — un `insert`
  habría reventado dejando sin acceso a quien acababa de pagar.
  **Se eliminó la TERCERA copia de la regla de acceso** (`lib/ojo-experto.ts`);
  llevaba desde la 0008 enseñando "membresía en pausa" a quien sí tenía acceso
  por regalo. Y `LIMITE_PREGUNTAS`/`LIMITE_FOTOS` salieron de `lib/config.ts`:
  ya no puede haber UN límite porque hay dos públicos.
  🟡 **Pendiente de la charla del correo distinto** (ver abajo): las tres capas
  no están hechas.

- **Correo distinto al de la compra — PENDIENTE, decidido el enfoque.**
  Alguien paga con un correo y entra con otro: hoy no le llega nada y cree que
  le robaron. Tres capas acordadas, ninguna implementada:
  ① aviso en la landing junto al botón ("usa el correo donde quieres el
  acceso"), ② en `/login`, tras "revisa tu correo", un "¿no te llega? puede que
  hayas comprado con otro correo" con salida a soporte, ③ comando
  `npm run alumna:mover -- viejo@x.com nuevo@y.com`.
  ⚠️ El ③ es **solo comando**, nunca un botón ni un formulario en la app:
  cualquier mecanismo automático de mover accesos es una forma de regalar
  acceso a quien engañe al soporte. La verificación la hace la dueña contra el
  comprobante de Hotmart.

- **Fase 4 · Asistente — ✅ HECHA Y MEDIDA (2026-09-15).** Tres piezas:
  1. **Modo simulado** (`lib/ia-simulada.ts`): contesta sin llamar a Google.
     ⚠️ **Dos condiciones y la segunda no se puede apagar** — `AI_SIMULAR_IA=1`
     **y** `VERCEL_ENV !== "production"`. **Medido con los 4 casos**: con la
     variable puesta en producción la simulación NO se enciende.
     Probado de punta a punta contra el servidor real: 3 consultas gratis
     respondidas, la 4ª cortada con 429, gasto apuntado en el bolsillo `regalo`.
  2. **Barrera de promesas** (`lib/promesas.ts`): la adaptación de
     `cure-safety`. Aquí el consejo no envenena a nadie, pero prometer ingresos
     es publicidad engañosa, motivo de que Hotmart tumbe el producto, y la forma
     más rápida de perder a Marcela. Estaba solo PEDIDO en el prompt, y un
     prompt no es una barrera. **Probada con 18 frases: 10 bloqueadas, 8
     dejadas pasar.** ⚠️ NO bloquea aconsejar el precio de un bolso — está
     permitido a propósito y es de lo más útil que hace; la diferencia es que
     el precio habla del BOLSO y la promesa habla del FUTURO DE ELLA. Una
     escapó en la primera prueba ("recuperas la inversión": el patrón pedía el
     infinitivo), de ahí que se pruebe con frases escritas a mano.
  3. **`notas_tejido` acotado** (300 caracteres, sin saltos de línea ni
     backticks). Era el agujero de la misma clase que el `product` de El Charcu.
     No es infalible, pero convierte un campo abierto en una frase de una línea.
  El camino simulado y el real comparten `guardarYResponder`: si el simulado se
  saltara la barrera o el conteo, en QA se probaría un flujo que no existe.
- **Fase 5 · Analítica con Mixpanel — CABLEADA, ENVÍO SIN VERIFICAR
  (2026-09-15).** 14 eventos en `lib/analitica/eventos.ts` (nombres en ESPAÑOL a
  propósito: los lee la dueña en el panel, no son código), `lib/analitica/mixpanel.ts`
  como único sitio por donde sale un evento, `<Medir>` para las pantallas de
  servidor y `<Analitica>` en el layout raíz.
  **Comprobado:** los 14 del catálogo están disparándose en 8 archivos y NINGUNO
  está escrito a mano fuera del catálogo — que es como un panel acaba con dos
  eventos que son el mismo y un embudo con el denominador partido.
  ✅ **VERIFICADO CONTRA MIXPANEL REAL (2026-09-15)**, con la cuenta y el token
  de Cristian: `pagina_ventas_vista`, `cortesia_vista` (tutoriales: 3),
  `leccion_abierta` (con id, título y `con_cuenta`), `leccion_bloqueada_vista`
  (con la lección pedida) y `muro_correo_visto` (lugar: ojo-experto) llegan a
  `api-js.mixpanel.com` con **HTTP 200**, y la petición lleva `ip=0`.
  ⚠️ **Se encontró y arregló un fallo silencioso en esa verificación.** `medir()`
  descartaba el evento si Mixpanel aún no estaba encendido, y eso pasaba de
  verdad: `<Medir>` vive dentro de la pantalla y `<Analitica>` está después en el
  layout raíz, así que React ejecutaba primero el de dentro. Resultado:
  `pagina_ventas_vista` —el denominador de TODO el negocio— no llegaba, mientras
  `cortesia_vista` sí, según cayera el orden. No daba ningún error: el panel
  habría enseñado números creíbles y equivocados. Ahora los eventos que llegan
  antes de tiempo esperan en una cola y salen al encender.
  🟡 Quedan sin comprobar en vivo los del Ojo Experto (`consulta_*`, `sin_cupo`,
  `sin_presupuesto`, `promesa_bloqueada`), `correo_enviado`, `checkout_abierto` y
  `cuenta_creada`/`cuenta_iniciada`: necesitan sesión y acciones reales.
  ⚠️ `correo_enviado` **no** es contacto nuevo: el muro le sale a cualquiera sin
  sesión. Quién es nuevo lo dicen `cuenta_creada`/`cuenta_iniciada`, que se
  disparan al abrir el enlace (`?entrada=` que pone el callback) — el único
  momento en que se puede saber sin permitir enumerar usuarias.
  ⚠️ **Grabación de sesión APAGADA**, al revés que El Charcu (graba el 100%): lo
  que se grabaría son mujeres subiendo fotos de su trabajo y escribiendo dudas
  desde su casa. Si algún día se enciende, la política de privacidad hay que
  actualizarla ANTES.
  ⚠️ A Mixpanel se le manda el **ID de Supabase, nunca el correo**, y con `ip:
  false`.
  ✅ **Política de privacidad reescrita (2026-09-15).** Ya nombra a los SEIS
  proveedores (Hotmart, Supabase, Google/Gemini, Bunny, Resend, Mixpanel) y dice
  qué recibe cada uno, además de las cookies y el plazo de conservación.
  ⚠️ Estaba desactualizada en algo más que Mixpanel: decía que el nombre y el
  correo se recogen "al comprar, vía Hotmart", y desde la 0012 cualquiera puede
  crear cuenta gratis sin comprar.
  ⚠️ **Regla nueva: si se cambia un proveedor o se enciende una función que
  recoja algo, esa página se actualiza EN EL MISMO COMMIT.** En particular, si
  algún día se enciende la grabación de sesión de Mixpanel (hoy en 0), hay que
  decirlo ahí ANTES de encenderla.
  🟡 **No la revisó un abogado.** Describe con exactitud lo que la app hace —que
  es el fondo del asunto— pero faltan los datos que solo puede poner Cristian:
  quién es el responsable legal (persona o empresa, con su identificación) y bajo
  qué país se rige. Sin eso no está completa para vender en LATAM.
- **Fase 6 · Errores — ✅ HECHA Y MEDIDA (2026-09-15).** `lib/fallos.ts` con
  `reportarFallo` / `reportarAviso`: JSON de una línea, sin proveedor (hoy a la
  consola, que en el servidor ya recoge Vercel). El día que entre Sentry o
  Datadog se cablea en ESE archivo y en ninguno más.
  **La distinción que lo hace útil:** aquí solo van las cosas ROTAS. Quedarse sin
  cupo, sin presupuesto o que se corrija una promesa NO son fallos — son el
  producto funcionando, y viven en Mixpanel. Mezclarlos hace que ninguna de las
  dos herramientas cuente la verdad.
  Conectado en 6 sitios donde antes el fallo se perdía, el más caro de ellos:
  **el webhook fallando a mitad de darle acceso a alguien que ya pagó** — antes
  solo quedaba una fila en `webhook_log` que nadie mira.
  `app/(app)/error.tsx` YA EXISTÍA pero no reportaba nada: le enseñaba a la
  alumna un mensaje amable y el fallo se perdía. Ahora reporta el `digest`.
  Nuevo `app/global-error.tsx` para cuando revienta el layout raíz. ⚠️ No usa
  NINGÚN token ni componente de la app, y los colores salen de
  `lib/marca.ts` (`COLORES_SIN_CSS`): si se está pintando, lo que falló pudo ser
  la carga del propio `globals.css`, y un error boundary que depende de lo que se
  rompió deja la pantalla en blanco — justo lo que venía a evitar.
  **Medido:** un webhook con basura en vez de JSON deja
  `{"nivel":"error","area":"webhook","mensaje":"Hotmart mandó algo que no es
  JSON","bytes":19}`. Revisados los 6 sitios: solo pasan códigos, contadores y
  longitudes. **Cero correos en los registros.**
  ⚠️ Nada personal en los logs, nunca: salen del edificio en cuanto haya un
  recolector. Ni correos, ni nombres, ni el texto de las preguntas, ni fotos.

**Regla de trabajo de este plan:** un cambio de esquema = un archivo de
migración nuevo, nunca SQL suelto. **Se aplican solo a QA**; a producción no
entra ninguna sin aprobación explícita, cada vez.

### Cómo se aplican las migraciones (2026-09-15)

QA es **`cazqmaluaehyikkstkoi`** ("Manos Creadoras qa"). El repo está enlazado a
ese proyecto; `npx supabase db push` aplica lo que falte.

⚠️ **Existe un segundo proyecto, `icbhtsdalysatlizjlys` ("Manos Creadoras",
creado el 2026-09-08), que parece ser el de PRODUCCIÓN.** No se ha tocado y no
se ha comprobado qué tiene dentro. Antes de empujarle nada hay que confirmar con
Cristian qué es y si ya tiene las migraciones 0001-0007.

⚠️ **La libreta de migraciones estaba descuadrada** y costó un rato: la base
tenía las 0001-0007 aplicadas pero anotadas con nombres de fecha
(`20260802022423`…), mientras los archivos se llaman `0001`…`0007`. El CLI las
veía como dos listas distintas y `db push` habría intentado recrear el proyecto
entero. Se arregló con `migration repair --status applied 0001…0007` +
`--status reverted` sobre las siete con nombre de fecha (eso solo toca el
registro, nunca el esquema). **Producción tendrá el mismo descuadre** si se
aplicó igual: comprobarlo ANTES de empujar allí, nunca con `db push` a ciegas.

⚠️ El conector MCP de Supabase de la sesión **no ve ningún proyecto**; el que sí
funciona es el CLI (`npx supabase`). No perder tiempo con el MCP.

---

## Estado actual del producto

**Funciona y está verificado contra los servicios reales:**
- Landing pública (10 secciones canónicas) + 4 páginas legales, con el checkout de Hotmart conectado.
- Login por enlace mágico (Supabase Auth). `shouldCreateUser: false` es deliberado: las cuentas solo las crea el webhook al pagar. Anti-enumeración activa.
- Webhook de Hotmart con las 4 defensas: autenticidad (hottok en tiempo constante), frescura (ventana de 5 min), idempotencia (PK sobre `event_id`) y máquina de estados (un `PURCHASE_APPROVED` tardío no resucita a quien reembolsó).
- App interna: `/cursos`, `/cursos/[leccion]`, `/ojo-experto`, `/cuenta` — **leyendo y escribiendo datos reales de Supabase**.
- El Ojo Experto responde de verdad (Gemini), con memoria por alumna, filtro de tema, uso justo (40 preguntas + 8 fotos/mes) y circuit-breaker de gasto diario. Probado con fotos reales de bolsos; intentos de inyección de prompt bloqueados.
- Supabase: 9 tablas, RLS en todas, 7 migraciones en `supabase/migrations/`.

- **App instalable (PWA) con avisos push**, verificada end-to-end contra FCM de Google.

**Calidad visual:** 3 rondas del subagente `revisor-visual` → subió de 28-30/40 a **31-35/40** usabilidad y 13-14/20 craft. **No llega al listón (36/40 · 16/20).**

⚠️ **CORRECCIÓN (2026-08-08) de algo mal anotado antes:** se decía que faltaban "3-5 fotos de bolsos" de la dueña y que por eso no se podía aplicar el dispositivo ownable. **Es falso: hay 9 fotos en `public/images/` y solo 4 se usan** (Hero + carrusel de la landing). Las otras 5 (glacier-blue, onix-cristal, pearl-bow, pearl-coin, pearl-royale) están sin usar. **Subir la nota del revisor NO depende de la dueña: depende de aplicar esas fotos a la app interna**, que es trabajo pendiente del lado del código.

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

**Orden de trabajo:** crear cuenta y **cargar saldo** (ver "Cómo se paga") → crear biblioteca QA con 1-2 videos → activar Token Authentication y agregar `localhost` a Allowed Referrers → pasarme Library ID + Token Key (⚠️ la clave **no se pega en el chat**, va a variables de entorno) → verifico end-to-end → repetir para producción.

### Cómo se paga Bunny (verificado el 2026-08-04)
**Es PREPAGO**, no factura a fin de mes: se carga saldo y el consumo lo va descontando.

- **Montos de recarga:** $10, $25, $50, $100, $250, $500, $1000, $2000 o un monto personalizado.
- **Formas de pago:** Visa, Mastercard, American Express, Discover, JCB, Diners, **PayPal**, Apple Pay y Bitcoin. Las tarjetas las guarda Braintree, no Bunny.
- **Mínimo de $1/mes** mientras haya zonas activas: si el consumo del mes queda por debajo, redondean a $1.
- **El saldo no vence** (los créditos de prueba sí vencen al terminar el trial).
- **Auto-Recharge es OPCIONAL.** Se dispara cuando el saldo baja de $5 y cobra el monto configurado.

⚠️ **CORRECCIÓN de lo que se anotó antes: Bunny NO tiene una función de "tope de gasto mensual".** No existe en su documentación. Lo que protege de una factura sorpresa es el modelo prepago en sí: **con Auto-Recharge apagado, el saldo cargado ES el techo.**

⚠️ **Pero eso corta en los dos sentidos:** si el saldo llega a cero, los videos podrían dejar de servirse **a alumnas que están pagando**. Su documentación no aclara qué pasa exactamente al agotarse. Recomendación: mantener un colchón holgado y revisar el saldo al menos una vez al mes; si se activa Auto-Recharge, dejarlo en un monto chico ($25-50) para que nunca haya un cobro grande inesperado.

---

## App instalable y avisos push (2026-08-08) — HECHO y verificado

Era **la razón de ser del proyecto**: el reporte de validación de la Sesión 1 concluyó que el negocio ya estaba probado (1.200 alumnas, 4.9/5) y que la oportunidad nueva era el **FORMATO** — app instalable con push, no una landing más. Estaba en la lista de la Sesión 6 y quedó fuera sin que nadie lo notara hasta el 2026-08-08.

### Qué existe
- `app/manifest.ts` + iconos 192/512/maskable/apple en `public/icons/`. Abre en `/cursos` porque quien instala ya compró.
- **Los iconos se generaron con sharp**: `logo.svg` es una firma horizontal con texto, ilegible a 48px. El nuevo es un aro de cuentas doradas sobre el casi-negro de la ficha — es literalmente el producto y no depende de ninguna fuente instalada.
- `public/sw.js` — **NO cachea nada a propósito.** Es una app de curso pagado: una caché mal invalidada serviría lecciones viejas o dejaría contenido en el dispositivo de quien ya canceló. El costo de no cachear es que necesita internet; el de cachear mal es peor.
- Migración `0007`: `push_subscriptions` con RLS. La llave es el **endpoint**, no el usuario: una alumna puede tener celular y tablet.
- `POST/DELETE /api/push/suscribir` — valida el token en servidor y exige membresía activa.
- `POST /api/push/enviar` — protegido por secreto comparado en tiempo constante; borra solo las suscripciones que devuelven 404/410 para que la tabla no se llene de basura.
- `components/app/ActivarAvisos.tsx` — el permiso se pide **dentro de Mi cuenta y solo si ella toca el botón**. Pedirlo al entrar es el anti-patrón que hace que la gente bloquee los avisos para siempre.

### Cómo envía un aviso la dueña
```
npm run push:enviar -- "Modelo nuevo" "Ya está el bolso Pearl Royale en tu app"
```
Para producción: `APP_URL=https://tu-app.vercel.app npm run push:enviar -- ...`. Es un comando, no hace falta panel; el backoffice puede venir después.

### ⚠️ Límite de iPhone (de Apple, no del código)
En iOS los avisos **solo funcionan si la alumna instala la app en su pantalla de inicio**. Ya se detecta y se le muestran las instrucciones (Compartir → Agregar a inicio) en vez de un botón que fallaría sin explicación. En Android funciona directo.

### ⚠️ Al montar Vercel hay que copiar 4 variables
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` · `VAPID_PRIVATE_KEY` · `VAPID_SUBJECT` · `PUSH_ADMIN_SECRET` (están en `.env.local`, que sigue fuera de git).

**Si algún día se cambian las llaves VAPID, TODAS las alumnas suscritas dejan de recibir avisos** y hay que volver a pedirles permiso. Ideal: una pareja distinta por ambiente, ya que las suscripciones viven en bases distintas.

### Verificado end-to-end (navegador real con permiso concedido)
Suscripción guardada contra FCM de Google → envío por el script → **el service worker recibió y mostró la notificación** con su título, cuerpo, icono y destino → desactivar la borra del navegador y de la base. Los endpoints pasan los 5 chequeos de autorización (401 sin secreto, 401 con secreto malo, 400 con cuerpo inválido, 401 sin sesión, 200 con secreto correcto). Captura: `.playwright-mcp/s9-avisos.png`.

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
- ~~Los videos son verticales y el contenedor está en 16:9~~ — **RESUELTO POR DECISIÓN (2026-09-15, Cristian): el curso real se graba HORIZONTAL.** El marco 16:9 se queda como está y no se toca. Las franjas blancas que se ven hoy son del video de PRUEBA, que sí es vertical, y desaparecen al subir el contenido real. No hay nada que arreglar en código. 🟡 Opcional para la dueña: pintar el fondo del reproductor con el casi-negro de la marca (panel de Bunny → Player) para que cualquier video con proporción rara no muestre blanco.
- La landing **no tiene testimonios con nombre**. Decisión deliberada: la dueña pidió inventarlos "mientras agregamos unos reales" y se rechazó (riesgo real de moderación de Hotmart y publicidad engañosa). Solo queda el agregado real (+1.200 alumnas · 4.9/5).
- `direcciones-abc.html` sigue en la raíz — borrarlo antes del deploy (no va a producción).
- Título de pestaña de `/login` no personalizado (es "use client" y no puede exportar `metadata`). Solucionable con un `layout.tsx` del grupo `(auth)`. No bloqueante.
- 1 aviso de lint preexistente: `BarraProgreso` llama setState dentro de un efecto. No rompe nada.
- **Pendiente del lado del código**: aplicar a la app interna las 5 fotos de bolsos que están sin usar. Es lo que más sube la nota del revisor y no depende de nadie más.

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
| 9 (08-08) | Fotos a WebP (9,6 MB → 1,2 MB) y basura de Next borrada. **PWA instalable + avisos push** (`manifest`, service worker, migración `0007`, endpoints y UI de permiso), verificados contra FCM |
| 10 (08-08) | **Correo y video funcionando**: Bunny Stream conectado y verificado (token firmado, 200 en todas las peticiones). **Correo**: dominio verificado en Resend, SMTP en Supabase y plantilla de marca (`supabase/templates/magic-link.html`). Verificado con envío real: `delivered` en Gmail |
