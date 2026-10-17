# Los webhooks de pago: probarlos y vigilarlos

Cuando alguien paga en OnePay, OnePay nos manda un aviso a
`/api/webhooks/onepay`. Ese aviso es lo ÚNICO que abre el acceso de la alumna:
si se pierde, alguien pagó y se quedó fuera. De ahí todo lo que sigue.

---

## Probarlo en tu máquina

```bash
npm run webhook:probar
```

Manda un pago firmado igual que lo firmaría OnePay, usando las claves de
`.env.local`. **No salta la seguridad**: si las claves no son las del panel,
recibe el mismo 401 que cualquiera.

```bash
# Un pago de una alumna concreta
npm run webhook:probar -- --correo ella@gmail.com

# Una cancelación, un cobro rebotado, una suscripción vencida
npm run webhook:probar -- --tipo cancelada --correo ella@gmail.com
npm run webhook:probar -- --tipo impagada --correo ella@gmail.com
npm run webhook:probar -- --tipo vencida  --correo ella@gmail.com

# El mismo evento dos veces: debe responder "repetido" y NO duplicar nada
npm run webhook:probar -- --repetir

# Un cuerpo que no entendemos: debe quedar anotado, no reventar
npm run webhook:probar -- --tipo basura

# La renovación del mes siguiente: MISMA suscripción, otra vez
npm run webhook:probar -- --sub sub_de_ella --correo ella@gmail.com
npm run webhook:probar -- --sub sub_de_ella --correo ella@gmail.com

# Contra QA en vez de contra tu máquina
npm run webhook:probar -- --url https://qa.manoscreadoras.co
```

### ¿Y un túnel (ngrok y compañía)?

Hace falta **una sola vez**: para ver con qué forma exacta llega un pago de
verdad, porque la documentación de OnePay se contradice consigo misma y
`lib/webhooks/onepay.ts` acepta las dos formas por si acaso.

```bash
npx cloudflared tunnel --url http://localhost:3000
```

Eso da una URL pública temporal. Se pone en el panel de OnePay (en **modo
prueba**) y se hace una suscripción de prueba con sus tarjetas de prueba.

⚠️ Al terminar, **devuelve la URL del webhook a la de QA**. Un webhook
apuntando a un túnel muerto es un pago que no llega y nadie se entera.

Para el día a día el túnel estorba: obliga a tener un pago real a mano cada vez
que quieras probar algo. `webhook:probar` te da el evento que quieras cuando
quieras.

---

## Ver qué ha pasado

```bash
npm run webhook:ver              # los 15 últimos
npm run webhook:ver -- --malos   # solo los que necesitan atención
```

```
✓ 7f8d4cb3 17/10, 09:11   2851ms  suscripcion.pagada
? 64272e8b 17/10, 09:11   1107ms  suscripcion.impagada   nadie con el correo nadie@ejemplo.com
✗ d41eed3d 17/10, 09:11        -  desconocido            cuerpo con forma desconocida
```

| | |
|---|---|
| `✓` | procesado, todo bien |
| `?` | **huérfano**: alguien pagó y no sabemos quién. Hay que activarlo a mano |
| `✗` | error: llegó algo que no entendimos |

Para la historia completa de uno, con el cuerpo tal cual llegó:

```bash
npm run webhook:ver -- --traza 64272e8b
```

---

## La traza: seguir UN pago

Cada aviso recibe un código de 8 letras. Ese código está en la fila de la base
**y en todas sus líneas de log**. Sin él, con dos pagos a la vez, los logs se
entrelazan y no se sabe qué línea es de cuál.

Con él, buscando ese código en los logs de Vercel sale la historia entera:

```
{"que":"recibido","traza":"64272e8b","ms":2,"bytes":122}
{"que":"firma correcta","traza":"64272e8b","ms":3}
{"que":"entendido","traza":"64272e8b","ms":4,"tipo":"suscripcion.impagada","con_correo":true}
{"que":"correo sin cuenta","traza":"64272e8b","ms":840,"por":"correo"}
{"que":"huerfano","traza":"64272e8b","ms":841,"motivo":"correo desconocido"}
{"que":"procesado","traza":"64272e8b","ms":1107,"lento":false}
```

El `ms` es acumulado: se ve en qué paso se va el tiempo.

**⚠️ OnePay corta a los 10 segundos.** Si no respondemos a tiempo lo da por
fallido y lo reintenta; si se repite, **desactivan el endpoint** y dejamos de
enterarnos de todos los pagos siguientes. Por eso cada evento guarda su
`duracion_ms` y el log marca `lento: true` al pasar de 8s.

---

## Por qué no usamos Datadog ni Mixpanel

Se evaluó el 2026-10-17 y se decidió que no, por motivos concretos:

**Datadog** guarda líneas de log que caducan. `webhook_eventos` ya guarda el
**cuerpo entero** de cada evento, para siempre, y permite reprocesarlo — es
más de lo que daría la herramienta, y sin coste mensual. Datadog está pensado
para vigilar decenas de servicios; aquí hay un endpoint.

**Mixpanel** responde "¿cuánto vendimos?". Esto responde "¿por qué falló ESTE
pago?". Son preguntas distintas y mezclarlas ensucia las dos: el embudo se
llena de ruido técnico y los fallos se pierden entre eventos de producto.
Mixpanel sigue teniendo sentido para el evento de negocio, no para esto.

Se reconsidera si algún día hay varios servicios que vigilar a la vez.

## Por qué no es una Edge Function de Supabase

También se evaluó. Hoy el webhook comparte código con el resto de la app: la
lógica de proveedores (`lib/webhooks/`), el envío de correo (`lib/correo.ts`) y
los precios (`lib/planes.ts`). Moverlo a Supabase significaría otro lenguaje
(Deno), **duplicar** ese código, un segundo juego de secretos y **dos sitios
donde buscar** cuando algo falle.

No resuelve ningún problema actual: la ruta responde en menos de 3 segundos.
Tendría sentido si quisiéramos que el webhook siguiera vivo aunque Vercel se
caiga — hoy no es el caso.
