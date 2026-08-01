# RETENCIÓN DE INGRESOS — No Perder el Dinero que ya Entró

> **Cuándo cargar este archivo:**
> - Cuando la gente CANCELA (churn voluntario), FALLAN los pagos (churn involuntario → dunning) o se acerca la RENOVACIÓN anual
> - Cuando ya hay clientes y el dueño quiere proteger el LTV: cancelación retentiva, win-back, referidos, renovación anual
> - Es el brazo que ejecuta `PROMPT-RETENER-INGRESOS.txt` (`/retener-ingresos`)
>
> **Se combina con:**
> - `24-GAMIFICACION.md` — distinción explícita: **24 retiene el USO (el hábito); este archivo retiene el INGRESO (la suscripción)**. La gamificación evita que el usuario llegue al botón "cancelar"; este archivo rescata a quien ya llegó.
> - `18-VENTA-HOTMART.md` — los webhooks de cancelación/reembolso y el estado `past_due` sobre el que opera el dunning; todos los emails salen por el Resend montado ahí.
> - `59-SOPORTE-CLIENTE.md` — el rescate por soporte: un buen soporte evita reembolsos y reseñas negativas antes de que el cliente llegue a cancelar (marco legal/fiscal en `47-LEGAL-FISCAL-Y-PRIVACIDAD.md`).
> - `36-ANALITICA-Y-EVENTOS.md` — medir el churn (voluntario vs involuntario), la recuperación por dunning y qué oferta de rescate funciona (event_log).
>
> **Por qué existe:** cada cliente retenido vale más que uno nuevo, y recuperar un pago fallido es la conversión más barata que existe. El día después del lanzamiento (`35-LANZAMIENTO.md`), el trabajo es proteger el ingreso que entró: frenar el churn voluntario e involuntario (dunning), traer de vuelta a los que se fueron (win-back), convertir clientes felices en canal (referidos) y atender el acantilado de la renovación anual.

---

## RETENCIÓN Y CHURN VOLUNTARIO (que no se vayan por decisión propia)

Churn voluntario = el usuario decide cancelar. Bajarlo unos puntos compone enormemente el LTV. La estrategia de retención del producto (mecánicas, gamificación) vive en `02-VALIDACION.md` y `24-GAMIFICACION.md`; aquí va lo específico del **momento de cancelar**.

```
ENCUESTA DE CANCELACIÓN (al pulsar "cancelar", antes de confirmar):
  - 1 pregunta con opciones: muy caro / no lo uso / le falta X / encontré algo mejor / otro.
  - Sirve para 2 cosas: datos del backoffice (¿por qué se van?) Y ramificar la oferta de rescate.

ALTERNATIVAS A LA BAJA (⚠️ realidad Hotmart primero — leer antes de implementar nada):
  LA FACTURACIÓN LA CONTROLA HOTMART, NO TU APP. Un flag "paused" en Supabase NO detiene el
  cobro recurrente: el cliente seguiría pagando mientras cree que está "pausado" → reembolsos,
  reclamos y reseñas negativas en Hotmart. PROHIBIDO ofrecer una "pausa que no factura" que tu
  sistema no puede cumplir. Las jugadas REALES, en orden de preferencia:

  A) DESCUENTO PARA QUEDARSE (cupón de oferta): en vez de cancelar, ofrecer X% de descuento por
     1-3 meses vía cupón/oferta de Hotmart sobre la suscripción (verificar en el panel cómo
     aplicarlo a una suscripción activa; si el panel no lo permite, la variante es cancelar +
     recomprar con cupón, ver B). Es la respuesta natural al "muy caro".
  B) CANCELAR + CUPÓN DE REGRESO CON FECHA: se cancela de verdad (Hotmart deja de cobrar, cero
     sorpresas) y el cliente se lleva un cupón de recompra con fecha límite ("vuelve antes del
     [fecha] con 40% off y tu cuenta tal como la dejaste"). Sus datos se conservan (periodo de
     gracia, abajo) → la "pausa" honesta del modelo Hotmart: sin cobro Y con puente de regreso.
  C) PAUSA SOLO-DE-ACCESO con aviso honesto (solo si hay una razón real, ej. quiere conservar
     una racha/cupo): congelar el USO en la app, PERO diciendo explícitamente qué pasa con el
     cobro: "Hotmart seguirá cobrando tu suscripción con normalidad; lo que pausamos es tu
     [racha/contenido/cupo]". Si no puedes explicarla sin que suene a trampa, no la ofrezcas.
  → En los 3 casos: registrar la elección en el event_log (21/36) para medir qué rescata churn.

OFERTA DE RESCATE SEGÚN LA RAZÓN (ramificar con la respuesta de la encuesta):
  - "Muy caro"        → descuento 30-50% por 1-2 meses, o downgrade a un plan más barato.
  - "No lo uso"       → re-onboarding ("aquí está el valor que te perdiste") + tip de uso.
  - "Le falta X"      → si está en el roadmap, decirlo + acceso anticipado; si no, escuchar.
  - "Encontré algo mejor" → diferenciador + oferta; difícil, pero los datos valen oro.

PERIODO DE GRACIA (no borrar datos al cancelar):
  - Conservar datos 30-90 días. Email a los 7 días ("tus [47 resultados] te esperan").
  - El webhook ya marca cancelación al fin de ciclo sin borrar (archivo 18) — respetarlo.

WIN-BACK (recuperar al que ya se fue) — consolida la estrategia del archivo 02:
  - Emails a los 30 / 60 / 90 días: novedades + oferta de regreso (precio especial de vuelta).
  - El que ya usó el producto y se fue convierte mucho mejor que un lead frío.

RENOVACIÓN ANUAL — el "acantilado" del mes 12 (el churn que casi nadie atiende):
  - Una suscripción ANUAL no churnea poco a poco: llega íntegra al mes 12 y ahí decide de golpe.
    Si el cobro recurrente anual sorprende al cliente, cancela o pide reembolso (y un reembolso
    anual duele 12× más que uno mensual).
  - Cadencia PRE-renovación (suave, no agresiva): email a los ~30 días y ~7 días antes del cobro
    recordando el VALOR recibido en el año ("esto lograste / creaste / ahorraste con la app") +
    la fecha exacta de renovación. Convertir el cobro en algo esperado, no en una emboscada.
  - Es transparencia que retiene: el cliente que ve su año resumido renueva con gusto; el que se
    siente cobrado "a escondidas" cancela y deja reseña negativa en Hotmart.
```

> **⚠️ El cliente TAMBIÉN puede cancelar directo en el portal del comprador de Hotmart**, saltándose
> tu encuesta y tu pantalla de cancelar. Por eso el webhook de cancelación es la red obligatoria:
> al recibirlo, dispara el email de salida con la encuesta de 1 pregunta + la oferta de rescate,
> aunque el cliente nunca haya tocado tu pantalla de cancelar.

#### PROMPT para el flujo de retención de cancelación
```
Diseña el FLUJO de cancelación retentivo de [NOMBRE APP] (suscripción Hotmart). Entrega:
1. La encuesta de cancelación (pregunta + opciones) y cómo ramifica la oferta de rescate.
2. La alternativa a la baja que aplique (descuento vía cupón / cancelar + cupón de regreso con
   fecha / pausa solo-de-acceso con aviso honesto del cobro — NUNCA prometer "pausa que no
   factura": la facturación la controla Hotmart, ver archivo 58) con su copy exacto.
3. La oferta de rescate por cada razón (copy de cada una, sin confirmshaming ni manipulación).
4. La secuencia win-back de 3 emails (días 30/60/90) lista para Resend (archivo 18).
Tono empático (nunca culpar al usuario), idioma del avatar. PROHIBIDO dark patterns: cancelar
debe ser fácil; la retención se gana con valor y oferta honesta, no escondiendo el botón.
```

---

## DUNNING — recuperar pagos fallidos (la conversión más barata que existe)

Churn INVOLUNTARIO = el cliente NO quería irse, pero su pago falló (tarjeta vencida, sin fondos, límite). **Quería seguir pagando.** Recuperarlo no requiere convencer a nadie — solo arreglar el método de pago. Es la conversión de menor costo y mayor ROI del negocio, y la más ignorada.

> **Primera línea de defensa del dunning (ANTES de que exista un pago fallido): el AVISO PRE-COBRO del puente del trial (`02C` → EL PUENTE DEL TRIAL, D6)** — un cobro anunciado con fecha y monto exactos genera menos reembolsos, chargebacks y disputas "no sabía que me cobrarían" que cualquier email de recuperación posterior.

```
EN HOTMART: los reintentos de cobro recurrente los gestiona Hotmart automáticamente, y dispara
PURCHASE_DELAYED (retraso/pago pendiente) y los eventos de expiración/cancelación
(PURCHASE_EXPIRED / SUBSCRIPTION_CANCELLATION) → tu webhook marca el perfil como `past_due`
(ya implementado en 18-VENTA-HOTMART.md). El estado `past_due` mantiene el ACCESO durante la
gracia (NO cortar de golpe — el cliente quiere pagar).
⚠️ Los nombres exactos de los eventos se VERIFICAN en el panel de Hotmart (Herramientas → Webhook)
antes de codear el handler — el catálogo cambia; no codear contra nombres de memoria.

NUESTRA CADENCIA DE RECUPERACIÓN (sobre el estado past_due, con Resend del archivo 18):
  DÍA 1:  email suave — "no pudimos procesar tu pago, suele ser la tarjeta. Actualízala aquí →"
          + banner NO bloqueante en la app (link para actualizar el método en Hotmart).
  DÍA 3:  recordatorio — reforzar QUÉ pierde si no resuelve (framing de pérdida) + link directo.
  DÍA 5:  urgencia — "tu acceso se suspende en X días. Un clic para mantenerlo." + link.
  DÍA 7:  último aviso — "hoy es el último día antes de suspender." Tras esto, Hotmart agota
          reintentos → evento de cancelación → degradar a free (NO borrar datos: win-back).

ACTUALIZAR TARJETA / RECUPERACIÓN VÍA HOTMART:
  - El cliente actualiza el método en SU panel de comprador de Hotmart (el link va en los emails).
  - Hotmart reintenta el cobro; si entra → evento PURCHASE_APPROVED → el webhook lo reactiva a
    `active` (la máquina de estados del 18 ya permite past_due → active).
  - El banner en la app desaparece al volver a `active`.
```

> **Por qué importa tanto:** una parte grande del churn de suscripción es involuntario (tarjetas que vencen). Cada cliente que el dunning recupera es LTV que ya tenías y casi pierdes — sin costo de adquisición. Conecta directo con el estado `past_due` del webhook del archivo 18: la cadencia de aquí es lo que CONVIERTE ese estado en una recuperación, en vez de dejar la suscripción en limbo hasta que muere.

#### PROMPT para la cadencia de dunning (emails)
```
Escribe la cadencia de DUNNING de [NOMBRE APP] (suscripción Hotmart, estado past_due del webhook
del archivo 18): 4 emails (días 1/3/5/7) listos para Resend, cada uno con asunto + preview +
cuerpo HTML simple y 1 CTA "Actualizar mi método de pago" (link al panel de comprador de Hotmart).
Tono: servicial, NO acusatorio (el cliente no falló a propósito — fue la tarjeta). Escalar la
urgencia día a día con framing de pérdida honesto. Incluye también el copy del BANNER no bloqueante
in-app para el estado past_due. Idioma del avatar.
```

---

## REFERIDOS / MEMBER-GET-MEMBER (el cliente feliz como canal más barato)

El usuario que ya vive la transformación es tu mejor vendedor: su recomendación llega con confianza que ningún ad compra. Un programa de referidos baja el CAC (`40`) y, de paso, RETIENE — el que refiere se compromete más con el producto. Es a la vez retención y adquisición orgánica, por eso vive entre `34` y este archivo.

```
DOS FORMAS DE HACERLO EN EL MODELO HOTMART (elegir según control de facturación):

A) CONVERTIR CLIENTES EN AFILIADOS (lo más simple — usa la infra que YA existe en 34):
   - Hotmart tiene programa de afiliados nativo. Invita a tus clientes felices a afiliarse:
     ganan comisión por cada persona que traen. Cero desarrollo: es la afiliación del archivo 34
     aplicada a tu base de usuarios.
   - Ideal para nichos donde el cliente tiene audiencia (creadores, coaches, profesionales).
   - El costo (comisión) ya está modelado en la economía unitaria de 40 — respeta ese margen.

B) RECOMPENSA IN-APP "DA Y RECIBE" (más fricción, más viral, requiere reconciliación):
   - Cada usuario tiene un código/enlace. El referido compra por Hotmart con ese código (UTM/SRC
     o cupón dedicado); el webhook de 18 atribuye la venta y, al confirmarse (PURCHASE_APPROVED),
     tu servidor premia a AMBOS: al referido (ej. descuento de bienvenida) y al que refirió
     (ej. 1 mes gratis, créditos extra, o un add-on premium).
   - La recompensa al que refiere se otorga SOLO cuando el referido PAGA y pasa la garantía
     (evita fraude y reembolsos que dejan la recompensa regalada). Tope de referidos premiables
     por mes para proteger el margen (40).
```

```
REGLAS DE UN PROGRAMA QUE FUNCIONA (no "comparte por compartir"):
- Pedir el referido en el momento de MÁXIMA felicidad: justo tras una victoria real (un hito de
  racha, un resultado exportado, un logro) — NUNCA al instalar ni en frío. Engancha con 24.
- La recompensa de doble lado (referidor Y referido ganan) convierte mucho más que la de un lado.
- Recompensa atada al VALOR de la app (más uso/créditos/tiempo), no efectivo: refuerza el hábito
  en vez de atraer cazadores de dinero.
- Hacer el acto de referir de 1 toque (link/código copiable + share nativo, ver 03).
- Medirlo: eventos de referido en el event_log (21/36) — cuántos invitan, cuántos convierten (factor K).
```

> **Cuándo NO montarlo:** antes de tener la curva de retención aplanada (`24`). Un programa de referidos sobre un producto que no retiene solo acelera la llegada de gente que también se irá — y te cuesta recompensas. Primero el producto retiene; después se amplifica con referidos.

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`18-VENTA-HOTMART.md`**: el DUNNING de aquí opera sobre el estado **`past_due`** del webhook (`PURCHASE_DELAYED` y los eventos de expiración/cancelación — nombres verificados en el panel) y la máquina de estados (`past_due → active` al recuperar). Los webhooks de cancelación/reembolso marcan el fin de ciclo sin borrar datos (periodo de gracia). Todos los emails (retención, win-back, dunning, pre-renovación) usan el **Resend** ya montado ahí.
- **`24-GAMIFICACION.md`**: la retención del PRODUCTO (rachas, hitos, re-enganche) retiene el USO; este archivo retiene el INGRESO — la gamificación evita llegar al "cancelar"; este archivo rescata a quien ya llegó.
- **`35-LANZAMIENTO.md`**: el lanzamiento mete el ingreso; este archivo lo protege. La oferta de fundadores con "precio bloqueado de por vida" es en sí una palanca anti-churn.
- **`02-VALIDACION.md`**: la estrategia de retención y el win-back nacen ahí; este archivo operacionaliza el MOMENTO de cancelar (encuesta, alternativas a la baja, rescate) y el dunning.
- **`40-UNIT-ECONOMICS.md`**: la recompensa de referidos y la comisión de afiliados consumen margen — la economía unitaria fija cuánto puedes premiar sin romper el LTV:CAC. La renovación anual bien atendida sube el LTV (menos churn en el mes 12).
- **`21-BACKOFFICE.md` + `36-ANALITICA-Y-EVENTOS.md`**: el churn voluntario vs involuntario, la recuperación por dunning y los eventos de rescate/referidos se MIDEN ahí (event_log + métricas de negocio).
- **`59-SOPORTE-CLIENTE.md`** (+ `47-LEGAL-FISCAL-Y-PRIVACIDAD.md`): el soporte-como-retención rescata clientes ANTES de que lleguen al botón de cancelar o al reembolso; el soporte opera la encuesta de cancelación y las alternativas a la baja de este archivo.
- **`PROMPT-RETENER-INGRESOS.txt`** (`/retener-ingresos`): el brazo ejecutor de este archivo (cancelación retentiva, dunning, win-back, renovación anual).
