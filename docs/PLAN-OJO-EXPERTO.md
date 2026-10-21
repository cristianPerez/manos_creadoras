# PLAN — El Ojo Experto como asistente creativa

> Encargo de Cristian del 2026-10-20.
>
> **ESTADO: F1, F2 y F3 implementadas y verificadas el 2026-10-20.** Quedan
> F4 (Dale vida a tu bolso), F5 (banco de evaluación) y F6 (diseño premium),
> que son producto nuevo y no arreglos de algo que ya se promete en pantalla.

---

## Lo que encontré antes de planear

Tres cosas cambian el plan, y conviene leerlas antes que nada.

### 🔴 F0 · Las preguntas nuevas chocan con el filtro de tema

El prompt del sistema (`app/api/ojo-experto/route.ts`) dice, literal:

> *"Solo de tejido de bolsos en cuentas y malla plástica… Si te preguntan de
> CUALQUIER otro tema, marca `es_del_tema = false`"*

Permite "cómo fotografiar o poner precio a un bolso terminado" y **nada más**.
Las cuatro preguntas que ya instalé en la pantalla incluyen *"videos llamativos
para mis redes sociales"* y *"diseños originales"*, que ese filtro muy
probablemente **rechaza con el desvío amable**.

No pude confirmarlo con la IA real (la cuota de visitante estaba agotada), así
que **el primer paso de la Fase 1 es ejecutar las cuatro y ver cuáles rebotan**.
Mientras tanto, la pantalla promete cuatro puertas y puede que dos estén
cerradas.

### 🔴 F0b · El historial de conversaciones está roto

El panel lateral lista las conversaciones pasadas y cada una enlaza a
`/app/ojo/<id>`. **Esa ruta no existe**: solo hay `app/(interna)/app/ojo/page.tsx`.
Cada conversación del menú es un 404.

Es decir: lo que Cristian pide —"acceder con un menú hamburguesa a sus
conversaciones pasadas y seguir en ese contexto"— está a medio construir. La
lista se ve; abrirla, no.

### ✅ F0c · Lo que SÍ está hecho y no hay que rehacer

- El menú hamburguesa y el panel lateral con el historial agrupado por fecha.
- `bolsoSlug` y `paso` ya viajan al endpoint en cada consulta.
- Desde la lección del curso ya se llega con el contexto:
  `PanelLeccion.tsx` enlaza a `/app/ojo?bolso=<slug>&paso=<n>`.
- El selector de bolso dentro de la pantalla.
- Cupos separados para visitante y alumna, dos presupuestos de IA y la barrera
  anti-promesas.

Lo que falta no es la tubería: es que **el modelo sepa usarla** y que la
pantalla lo **enseñe**.

---

## ✅ Fase 1 · Que las cuatro puertas abran — HECHA

Sin esto, la pantalla miente desde hoy.

1. **Ejecutar las 4 preguntas sugeridas** contra la IA real y anotar cuáles
   marca `es_del_tema = false`.
2. **Reescribir `INSTRUCCIONES`** con las cinco áreas del encargo en vez de una:

   | Área | Qué cubre |
   |---|---|
   | Materiales y tejido | Cuentas, hilos, herrajes, proveedores, errores al tejer |
   | Fotografía | Fondos, escenarios, luz, prompts para mejorar fotos |
   | Diseño creativo | Ideas de bolsos, combinaciones de color, acabados |
   | Contenido | Reels, guiones, ideas para redes |
   | Marca y ventas | Nombres de diseños, descripciones, publicaciones |

3. **El filtro no se quita, se reescribe.** Sigue haciendo falta: sin él, el Ojo
   responde recetas y tareas escolares con el presupuesto de IA de Cristian. La
   regla pasa de *"solo tejido"* a *"solo el negocio de bolsos tejidos de esta
   alumna"*, con los mismos NUNCA (ingresos, precios del programa, consejos
   médicos/legales/financieros).
4. **Subir el tope de 3 frases.** Un guion de reel o una lista de proveedores no
   caben en tres frases; hoy el prompt las fuerza. Tope por área, no global.

**Riesgo a vigilar:** cuanto más se abre el tema, más fácil es que alguien use
el Ojo como ChatGPT general. La defensa es el filtro reescrito + los cupos, no
la restricción de tema.

### ✅ Verificado contra la IA real (2026-10-20)

Se ejecutaron las cuatro preguntas con `AI_SIMULAR_IA=0`. **Ninguna se marcó
fuera de tema**, y las respuestas son concretas, no genéricas:

| Pregunta | Resultado |
|---|---|
| Materiales | ✅ Vías de compra concretas (AliExpress, Shopee, local) |
| Fotos sin buena cámara | ✅ *"el teléfono que tienes es suficiente… Haz esto hoy: 1. Luz natural indirecta…"* |
| Videos para redes | ✅ *"Reel de 7 s en CapCut… 1. Zoom suave (Ken Burns)…"* — **esta es la que el prompt viejo habría rechazado** |

⚠️ Durante las pruebas Google devolvió varios **503 "high demand"**. Es una
caída suya, no del código, pero conviene saber que pasa: la pantalla lo enseña
como "No pudimos conectar con el Ojo Experto". Si se vuelve frecuente, toca
reintentar automáticamente en el servidor.

---

## ✅ Fase 2 · Que siempre sepa de qué bolso se habla — HECHA

El dato ya llega al endpoint. Lo que falta:

1. **El contexto se ve en pantalla.** Hoy la alumna no tiene forma de saber si
   el Ojo está mirando su bolso o hablando en general. Una píldora fija sobre el
   campo de escritura: *"Hablando de Gota de Rocío · paso 3"*, con una ✕ para
   soltarlo.
2. **El prompt recibe más que el nombre.** Hoy `construirContexto` manda poco;
   debería inyectar los materiales y los pasos del bolso para que *"¿qué hilo
   uso?"* se responda con el hilo DE ESE bolso, no con una lista genérica.
3. **Entrar desde la lección ya funciona** — solo hay que comprobar que la
   píldora aparezca al llegar con `?bolso=&paso=`.

---

## ✅ Fase 3 · El historial que ya se promete — HECHA

⚠️ **Y la causa de fondo era peor que una ruta que faltaba: CADA PREGUNTA
ABRÍA UNA CONVERSACIÓN NUEVA.** El "chat" era, por dentro, una ristra de
consultas sueltas — no había hilos que retomar. Por eso el historial crecía
una entrada por pregunta.

1. ✅ **Ruta `app/(interna)/app/ojo/[id]/page.tsx`** creada.
2. ✅ **El endpoint acepta `conversacionId`** y escribe en ese hilo en vez de
   abrir uno nuevo. Solo si el hilo es de esa alumna (`.eq("user_id")`): el id
   lo manda el navegador, y sin esa comprobación se podría escribir en el hilo
   de otra.
3. ✅ **La conversación recuerda su bolso** al reabrirla.
4. ⬜ **Títulos por área** (*"Fotos · fondo para Cherry"*) — pendiente, menor.

Verificado: tres preguntas seguidas caen en el mismo hilo, y abrir
`/app/ojo/<id>` muestra los tres mensajes y deja seguir escribiendo.

---

## Fase 4 · "Dale vida a tu bolso"

La pieza más ambiciosa y la que más hay que acotar, porque **hay dos cosas
distintas y conviene no mezclarlas**:

| | Qué es | Coste | Viabilidad |
|---|---|---|---|
| **A. Dar instrucciones** | El Ojo escribe el prompt y las indicaciones para que ella lo use donde quiera | El de una respuesta normal (~US$0,002) | ✅ Inmediata |
| **B. Generar la imagen** | La app devuelve la foto con el fondo cambiado | **10-50× más** por imagen | ⚠️ Decisión de negocio |

**Propuesta: empezar por A.** Es útil desde el primer día, no cambia la
arquitectura y permite medir cuánta gente lo usa antes de gastar en B.

⚠️ **Lo de "conservando el diseño real del bolso, sus cuentas y sus detalles"
es la parte difícil de B.** Un modelo de imagen genérico *reinventa* el bolso:
cambia el número de cuentas, el herraje, el color. Para una alumna que acaba de
tejer el suyo, eso no es "mejorar la foto", es que no es su bolso. La técnica
que sí lo respeta es el *inpainting* (cambiar solo el fondo conservando el
recorte), y hay que verificar que el proveedor elegido lo soporte **antes** de
prometerlo en la landing.

**Si se hace B**, la arquitectura obliga a asíncrono: generar una imagen tarda
más que los 10 s que aguanta una petición. Eso es cola + aviso al terminar —
toda una pieza nueva, no un parámetro.

---

## Fase 5 · Calidad de las respuestas

1. **Banco de 20 preguntas reales** (4 por área) con la respuesta esperada.
2. **Correrlas antes y después** de cada cambio del prompt. Sin esto, "mejorar
   las respuestas" es una opinión.
3. **Separar lo que la IA HACE de lo que INDICA** — pedido explícito de
   Cristian. En la respuesta debe quedar claro: *"te escribo el prompt"* no es
   *"te hago la imagen"*. Prometer de más aquí se paga en soporte.
4. **Aprovechar los pulgares** que ya existen en la pantalla: hoy se guardan y
   nadie los mira. Son la señal más barata de qué respuestas fallan.

---

## Fase 6 · Diseño: que parezca un asistente, no un formulario

Cristian: *"el diseño es muy básico, que sea más premium y parezca más un
asistente de IA"*. Lo concreto:

1. **Respuesta en streaming**, no un bloque que aparece. Hoy se espera mirando
   un spinner; el estándar es texto que se escribe con cursor. Es el cambio que
   más dice "esto es una IA de verdad" y el sistema ya lo pide (archivo 15).
2. **Las 4 áreas como identidad visual**, no solo como botones de arranque: cada
   respuesta marcada con su ícono y su color, para que se vea que el Ojo tiene
   especialidades.
3. **Burbujas con profundidad**: hoy las dos partes se diferencian poco.
4. **Estado de espera con carácter**: en vez de un spinner, el Ojo "mirando la
   foto" / "buscando entre los materiales de Gota de Rocío".
5. **Pasarlo por el `revisor-visual`** al cerrar, como cualquier pantalla.

---

## Objetivo comercial

La propuesta de Cristian —**2 consultas gratis, ilimitado en Premium**— se
sostiene, con dos avisos:

⚠️ **"Ilimitado" con IA de imagen no es sostenible.** Una consulta de texto
cuesta ~US$0,0018; una imagen generada, entre 10 y 50 veces más. Con la Fase 4A
(solo instrucciones) el ilimitado aguanta sin problema.

✅ **TOPE DECIDIDO POR CRISTIAN (2026-10-20): 30 imágenes al mes en Premium.**
Las consultas de TEXTO siguen ilimitadas; lo que se topa son las imágenes
generadas, por caras.

Cómo se implementa, cuando llegue la 4B:
- El tope vive en `plan_cupos`, **no en una constante del código** — es la
  misma regla que ya siguen las preguntas y las fotos, y permite subirlo sin
  desplegar.
- Se mira y se descuenta **en la misma operación** (como `consumir_cupo`), o
  con la app abierta en dos sitios se cuelan generaciones gratis.
- Al llegar a 30 se enseña **un paywall con valor, nunca un error técnico**:
  cuántas lleva, cuándo se renueva y qué sí puede seguir haciendo (los prompts
  de la 4A no se topan).
- ⚠️ **Se dice en la página de ventas ANTES de comprar.** Un "ilimitado" que
  resulta tener tope es la clase de letra pequeña que produce reembolsos.

⚠️ **Los presupuestos de IA son globales por público, no por persona.** Una
sola alumna intensiva puede agotar el de `miembro` y dejar el Ojo mudo para las
demás. Antes de vender el Ojo como argumento central hay que pasar el tope a
por cuenta.

---

## Orden sugerido

| | Fase | Por qué ahí |
|---|---|---|
| 1 | **F1** — que las 4 puertas abran | La pantalla ya las promete |
| 2 | **F3** — historial | Hay enlaces que dan 404 hoy |
| 3 | **F2** — contexto del bolso | Lo que hace la respuesta útil y no genérica |
| 4 | **F6** — diseño premium | Con el contenido resuelto, la forma luce |
| 5 | **F4A** — instrucciones de foto | Valor nuevo, coste casi cero |
| 6 | **F5** — banco de evaluación | Cuando haya suficiente que medir |
| 7 | **F4B** — generar imágenes | Solo si A demuestra demanda |

Las fases 1 a 3 son arreglos de cosas que ya se prometen en pantalla. De la 4
en adelante es producto nuevo.
