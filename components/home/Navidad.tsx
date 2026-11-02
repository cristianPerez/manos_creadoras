import { ChevronDown, Gift } from "lucide-react";
import Image from "next/image";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";

/**
 * Los accesorios navideños, entre el banner y las cápsulas.
 *
 * ⚠️ FRANJA CAFÉ A TODO EL ANCHO, SIN BORDE CREMA (2026-10-31, pedido de
 * Cristian). Nació como tarjeta redondeada sobre un respiro crema, igual que
 * la referencia, justamente para no pegarla a las cápsulas —que son espresso a
 * sangre— y conservar la alternancia del home a color. Cristian la quiso a
 * sangre, así que ahora `--cacao` toca `--espresso` sin nada en medio: son dos
 * marrones distintos y la costura se ve, pero el home pasa de
 * alternar claro/oscuro a tener dos oscuros seguidos. Decisión suya, no se
 * re-discute; si un día se quiere recuperar el respiro, basta devolver el
 * `bg-cream` y el `rounded` de abajo.
 *
 * El badge dice "Edición navideña" y no "Bono 4" como la referencia: aquí no
 * hay bonos numerados, y numerar uno obligaría a inventar los otros tres.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ UNA SOLA FOTO, NO CUATRO (2026-11-02, pedido de Cristian)
 * ════════════════════════════════════════════════════════════════════════════
 * Eran cuatro fotos en rejilla 2×2 (`navidad-{esferas,coronas,baston,regalo}`,
 * borradas). Cristian las cambió por la bandeja completa: una sola imagen donde
 * se ven las ~20 piezas de golpe, que enseña MÁS variedad que cuatro recortes y
 * pesa menos que las cuatro juntas (159 KB frente a 220 KB).
 *
 * Y como la foto ya enseña la variedad, el texto la NOMBRA: la lista de piezas
 * es lo que convierte "accesorios navideños" en algo concreto. Quien mira la
 * bandeja ve cuentas; quien lee la lista sabe que ahí hay un reno, una luna y
 * un bastón de caramelo con su video.
 *
 * ⚠️ LA FOTO VA PRIMERO EN EL HTML, y de ahí sale todo el responsive: en móvil
 * cae arriba por orden natural (imagen → texto → CTA, como pidió Cristian) y en
 * escritorio el `md:grid-cols-2` la pone a la izquierda sin ninguna inversión
 * de orden. Cero `order-*`: el orden del DOM ES el orden que se lee.
 */

/**
 * Lo que aprende a tejer en esta edición. Sale de la propia foto.
 *
 * ⚠️ SON 12 Y TIENEN QUE SER PARES. Empezó en 11 y el revisor lo marcó: en dos
 * columnas, el impar deja el último nombre huérfano con un hueco a su derecha.
 * Si algún día se quita o se añade una pieza, se ajusta para que el total siga
 * siendo par.
 *
 * ⚠️ Y CADA NOMBRE CABE EN UNA LÍNEA A 375px. Con los nombres largos
 * ("Campanas doradas", "Papá Noel y su gorro") cinco de los doce partían en dos
 * renglones y la lista perdía el aspecto de inventario que es justo lo que la
 * hace legible de un vistazo. Antes de alargar uno, mídelo a 375.
 */
const PIEZAS = [
  "Esferas de perla",
  "Campanas",
  "Coronas",
  "Copos de nieve",
  "Estrellas",
  "Bastones",
  "Renos y caballitos",
  "Moños y lazos",
  "Lunas de perla",
  "Corazones",
  "Papá Noel",
  "Cajitas de regalo",
] as const;

export function Navidad() {
  return (
    <section
      id="navidad"
      aria-labelledby="navidad-titulo"
      /*
        `border-b` dorado al 25% y `py` generoso: desde que la franja es a
        sangre, su borde inferior toca el espresso de las cápsulas y el ojo
        perdía el "fin de sección" — cambiaba el tono, no el ritmo. El hilo de
        1px y el aire son lo que vuelve a marcar la frontera sin añadir un
        degradado (el home a color es PLANO: de ahí salieron todos).
      */
      /* `border-y` y no solo `border-b` (revisor, 2026-11-02): el borde de
         abajo estaba desde el 31-oct, pero arriba el cacao chocaba con el
         crema del header en seco y la costura se leía como un fallo de
         render. Es el mismo hilo, en los dos lados. */
      className="bg-cacao sobre-oscuro grain-oscuro border-y border-[color-mix(in_srgb,var(--gold-light)_25%,transparent)] px-5 py-18 md:py-20"
    >
      <Entrada className="mx-auto max-w-[1240px]">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
          {/* ── La foto. Primera en el DOM a propósito: ver la cabecera. ── */}
          <Image
            src="/images/navidad-accesorios.webp"
            alt="Bandeja con una veintena de accesorios navideños tejidos en perlas y cristal: esferas, campanas, coronas, copos de nieve, estrellas, bastones de caramelo, renos, caballitos, moños, lunas, caritas de Papá Noel y cajitas de regalo"
            width={900}
            height={994}
            sizes="(min-width: 768px) 560px, 100vw"
            /*
              ⚠️ CUADRADA Y RECORTADA, NO AL ALTO NATURAL (2026-11-02, pedido de
              Cristian). La foto es 900×994 y puesta a su alto real se veía
              alargada, sobre todo en escritorio, donde estiraba la columna muy
              por debajo del texto de al lado. `aspect-square` + `object-cover`
              recorta 94px repartidos arriba y abajo: la bandeja está centrada,
              así que no se pierde ninguna pieza.
            */
            className="aspect-square w-full rounded-(--radius-foto) object-cover"
            /* El halo dorado de la ficha, que es su detalle firma. Aquí hace
               falta además por una razón práctica: dentro de una franja que
               Cristian quiso PLANA y a sangre, es lo único que separa la foto
               del fondo como nivel elevado, en vez de dejarla pegada encima
               (revisor, 2026-11-02: "profundidad de un solo nivel"). */
            style={{ boxShadow: "0 20px 60px -20px color-mix(in srgb, var(--gold) 40%, transparent)" }}
          />

          {/*
            ── El texto y el CTA ──

            ⚠️ CADA BLOQUE EN SU PROPIA `Entrada`, con 70ms de diferencia. El
            revisor bajó la nota de movimiento a 2/5 porque la sección entera
            entraba como un solo bloque: foto, título, lista y botón aparecían
            a la vez, que es justo lo que el SO llama "estático con un fade
            encima". Con el escalonado el ojo entra por el título y acaba en el
            botón. `Entrada` ya respeta `prefers-reduced-motion`.
          */}
          <div>
            {/* `--gold-pale` y no el `--gold-light` que `.sobre-oscuro` pone por
                defecto: la ficha reserva gold-light para fondos ESPRESSO, y
                sobre cacao se queda en 4,4:1 — justo por debajo del 4,5 que
                necesita un texto de 12px en versalitas. Pale sube a 5,5:1 y
                sigue siendo dorado. */}
            <Entrada retraso={0.07}>
              <p className="eyebrow text-gold-pale inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--gold-pale)_40%,transparent)] px-4 py-2">
                <Gift aria-hidden="true" size={15} />
                <span>Edición navideña</span>
              </p>
              <h2 id="navidad-titulo" className="titulo-seccion mt-5 text-balance">
                Accesorios <em className="clave">navideños</em> en cuentas
              </h2>
            </Entrada>

            {/* El subtítulo del original era catálogo puro ("esferas, coronas,
                bastones…"). El revisor lo bajó a 10/20 de copy: cero deseo. La
                segunda frase ancla en el deseo #1 y #4 de la ficha de avatar —
                regalar algo que no parezca casero, mostrarlo sin vergüenza— y
                conserva "paso a paso", palabra obligatoria de la ficha.

                ⚠️ EL NÚMERO Y "INCLUIDAS" NO SON ADORNO (revisor, 2026-11-02):
                sin ellos la sección enseñaba un catálogo precioso y dejaba sin
                responder las dos preguntas que decide quien mira —cuántas son y
                si hay que pagarlas aparte—. Son 12 porque son las 12 de
                `PIEZAS`; si la lista cambia, este número cambia con ella.

                ⚠️ "SE PUBLICAN EN DICIEMBRE" NO ES LETRA PEQUEÑA, ES LA
                CORRECCIÓN DE UNA PROMESA FALSA (2026-11-02, decisión de
                Cristian). Antes decía "en video paso a paso e incluidas en tu
                membresía" en presente, y los videos navideños NO están cargados
                en el catálogo: quien pagaba hoy por esta sección entraba y no
                encontraba nada. Va en dorado y dentro de la misma frase, no en
                una nota al pie, justamente para que se lea.

                ⚠️ EN CUANTO LOS VIDEOS ESTÉN ARRIBA, ESTA FRASE SE CAMBIA. Si
                se quedara después de publicarlos, estaría mandando a la gente a
                esperar algo que ya puede ver. */}
            <Entrada retraso={0.14}>
              <p className="text-on-dark-muted mt-3 text-balance">
                12 piezas en perla y cristal, incluidas en tu membresía: los
                videos paso a paso{" "}
                <span className="text-gold-pale">se publican en diciembre</span>.
                Para regalar algo hecho por ti que no parezca casero.
              </p>
            </Entrada>

            {/*
              ⚠️ `columns-2`, NO `grid-cols-2`. Con la rejilla, los nombres se
              ordenan por FILAS y se leen en zigzag (Esferas → Campanas →
              Coronas → Copos); con columnas CSS el flujo es vertical y la lista
              se lee como lo que es, un inventario de arriba abajo. Lo marcó el
              revisor el 2026-11-02.

              `break-inside-avoid` en cada ítem: sin él, un nombre que ocupa dos
              líneas se parte entre el pie de una columna y la cabeza de la otra.
            */}
            {/*
              ⚠️ LA LISTA VA EN UNA SUPERFICIE HUNDIDA, y es la tercera pieza de
              la profundidad: la foto queda ELEVADA (su halo dorado), la franja
              es la BASE y esto es el nivel hundido. Son los 3 niveles que pide
              la ficha, conseguidos DENTRO de la franja —sin devolverle el borde
              crema ni el radio que Cristian le quitó el 31-oct—. Antes todo era
              un fill plano con grano y el revisor lo puntuaba 2/5.

              `--espresso-2` y no un cacao más oscuro inventado: ya existe en los
              tokens justo para esto, un bloque dentro de un fondo oscuro.
            */}
            <Entrada
              retraso={0.21}
              className="bg-espresso-2 mt-6 rounded-(--radius-capsula) border border-[color-mix(in_srgb,var(--gold-pale)_20%,transparent)] px-4 pt-4 pb-1.5"
            >
              {/* El rótulo del bloque (revisor, 2026-11-02): sin él, los 12
                  nombres se leen como una columna suelta y nadie sabe si son lo
                  que aprende, lo que incluye o lo que trae la foto.
                  Dice "12 videos" y no "12 videos en diciembre" por una razón
                  medida, no estética: con la fecha, el rótulo parte en dos
                  líneas a 375px y un rótulo de dos renglones deja de leerse
                  como rótulo. El plazo está dos líneas más arriba, en dorado,
                  dentro de la frase donde está la promesa. */}
              <p className="eyebrow text-gold-pale mb-3">Lo que vas a tejer · 12 videos</p>
              {/* `last:pb-0`: cada ítem lleva su `pb-2.5` para separarse del
                  siguiente, y el último se lo come el padding de la caja —
                  el aire de abajo se veía menor que el de arriba (revisor). */}
              <ul className="columns-2 gap-x-3 [&>li:last-child]:pb-0">
                {PIEZAS.map((pieza) => (
                  <li key={pieza} className="flex break-inside-avoid items-start gap-2.5 pb-2.5">
                    <span
                      aria-hidden="true"
                      className="bg-gold-pale mt-[0.55em] size-1.5 shrink-0 rounded-full"
                    />
                    {/* `text-cream` y no `on-dark-muted`: esto es información
                        concreta que se lee ítem por ítem, no texto de apoyo —
                        en muted a 14px sobre cacao se queda justo en el límite. */}
                    <span className="text-cream text-sm">{pieza}</span>
                  </li>
                ))}
              </ul>
            </Entrada>

            {/*
              El CTA al pie (2026-10-31, pedido de Cristian). El revisor había
              puntuado la sección como "catálogo bonito sin destino": enseñaba
              deseo y lo dejaba muerto. Va a `#precio`, como la banda "1 de 20",
              y no al pago directo: quien va bajando todavía no ha visto el
              precio, y mandarlo a OnePay sería pedirle la tarjeta antes de
              decirle cuánto cuesta.
            */}
            <Entrada retraso={0.28} className="mt-8">
              <EnlaceCompra
                href="#precio"
                origen="navidad"
                plan={FRECUENCIA_POR_DEFECTO}
                /*
                  ⚠️ CREMA CON HILO DORADO Y HALO, NO CREMA PLANO. El revisor
                  pedía cambiarlo al gradiente dorado de la ficha por
                  consistencia con el botón del héroe; el crema se queda —es el
                  único color que destaca de verdad sobre el cacao—, pero con el
                  hilo y el halo deja de leerse como un botón secundario o un
                  "cancelar", que era el problema real.
                */
                /* El halo va en una clase y no en `style` porque `EnlaceCompra`
                   no acepta `style`: es un `<a>` con props cerradas a
                   propósito, para que nadie le cuelgue estilos sueltos. */
                className="bg-cream text-espresso relative flex h-13.5 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--gold)_45%,transparent)] px-8 font-semibold shadow-[0_20px_60px_-20px_color-mix(in_srgb,var(--gold)_40%,transparent)] transition-transform active:scale-[0.98] md:w-fit md:pr-14"
              >
                {/* Solo "Inscribirme", sin el precio: a 375px
                    "Inscribirme · desde US$X/mes" parte en dos líneas y un botón
                    de dos renglones se lee como un párrafo. El precio ya está en
                    la barra fija de abajo, que se ve a la vez que este botón. */}
                Inscribirme
                {/* El chevron hacia abajo dice que esto BAJA a los planes y no
                    abre el pago (revisor, 2026-11-02). Es la única forma de
                    aclararlo sin tocar la palabra, que es cosa juzgada. */}
                <ChevronDown aria-hidden="true" size={16} className="ml-2" />
              </EnlaceCompra>

              {/*
                La micro-línea que el botón no puede decir. "Inscribirme" es la
                palabra que eligió Cristian y no se toca, pero sola no dice
                ADÓNDE lleva: quien la toca aquí no va al pago, va a ver los
                planes. Esto lo dice sin cambiarle el texto al botón, y de paso
                mete la garantía —el quitamiedos— al lado de la acción
                (revisor, 2026-11-02: eje acción 2/4).
              */}
              {/* En `text-cream` y no `on-dark-muted` (revisor, 2026-11-02):
                  era la línea que resuelve la oferta y el miedo, y estaba en el
                  gris más flojo de la sección. La garantía va en dorado porque
                  es el quitamiedos, no un detalle. */}
              <p className="text-cream mt-3 text-sm max-md:text-center">
                Ver planes y precio ·{" "}
                <span className="text-gold-pale">garantía de 7 días</span>
              </p>
            </Entrada>
          </div>
        </div>
      </Entrada>
    </section>
  );
}
