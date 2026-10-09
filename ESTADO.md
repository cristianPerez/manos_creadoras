# ESTADO — Manos Creadoras App

**Última actualización: 2026-10-09.** Aquí solo entra lo que sigue siendo cierto
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

**El código está listo y probado contra servicios reales.** Lo que falta para
vender no es código: son cuentas, contenido y dos datos de Cristian.

QA vive en Vercel, es público y despliega solo con cada `push` a `develop`.

⚠️ **Las dos bases de Supabase se PAUSARON solas** tras tres semanas sin uso
(plan gratuito) y hubo que despertarlas a mano el 2026-10-09. **Volverá a pasar**
si el proyecto queda quieto otras tres semanas: la app seguirá cargando la página
de ventas pero el login, los tutoriales y el Ojo Experto darán error. Se arregla
con *Restore project* en supabase.com, y **no se pierde nada** — se comprobó:
las 4 cuentas, las 8 concesiones y las 9 lecciones estaban intactas.

---

## 🔴 Bloqueos para vender

- [ ] **Hotmart: crear el producto de SUSCRIPCIÓN.** `lib/config.ts` apunta al
      producto VIEJO de pago único ($25), así que los botones cobran lo que no
      es. **Es el único que impide cobrar.** Después: webhook a
      `https://DOMINIO/api/webhooks/hotmart` y el hottok en `HOTMART_HOTTOK`.
      ⚠️ Verificar en su panel los nombres EXACTOS de los eventos de suscripción
      y contrastarlos con la tabla `EVENTO_A_ESTADO` del webhook — el catálogo
      varía por cuenta.
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
- [ ] **Nombres reales de los tutoriales.** Hoy se llaman "Tutorial 2",
      "Tutorial 3"… La alumna no puede recordar dónde estaba la técnica que
      busca, y en pantalla se leen como marcadores de posición.
- [ ] **Listado completo de lecciones** de las secciones 2, 3 y 4 (~49 faltan).
- [ ] **2-3 testimonios reales** (capturas de WhatsApp) para la landing.

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
