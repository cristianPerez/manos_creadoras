import { Gift } from "lucide-react";
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
 * Las fotos son las de la referencia, reescaladas a 720×1000 WebP (las de la
 * página original eran JPG de 1000×1400 y pesaban 4× más).
 */
const PIEZAS = [
  {
    archivo: "navidad-esferas",
    titulo: "Esferas de perla y cristal",
    alt: "Esferas navideñas tejidas en perlas blancas, cristal rojo y cristal transparente, sostenidas en una mano",
  },
  {
    archivo: "navidad-coronas",
    titulo: "Coronas navideñas",
    alt: "Dos coronas navideñas tejidas en cuentas verdes, rojas y blancas con lazos rojos",
  },
  {
    archivo: "navidad-baston",
    titulo: "Bastón de caramelo",
    alt: "Bastón de caramelo tejido en cristal rojo y transparente sobre terciopelo",
  },
  {
    archivo: "navidad-regalo",
    titulo: "Cajita de regalo",
    alt: "Cajita de regalo tejida en cristal rosa y verde, colgada de una cinta plateada",
  },
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
      className="bg-cacao sobre-oscuro grain-oscuro border-b border-[color-mix(in_srgb,var(--gold-light)_25%,transparent)] px-5 py-18 md:py-24"
    >
      <Entrada className="mx-auto max-w-[1240px]">
        <header className="mx-auto max-w-2xl text-center">
          {/* `--gold-pale` y no el `--gold-light` que `.sobre-oscuro` pone por
              defecto: la ficha reserva gold-light para fondos ESPRESSO, y
              sobre cacao se queda en 4,4:1 — justo por debajo del 4,5 que
              necesita un texto de 12px en versalitas. Pale sube a 5,5:1 y
              sigue siendo dorado. */}
          <p className="eyebrow text-gold-pale inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--gold-pale)_40%,transparent)] px-4 py-2">
            <Gift aria-hidden="true" size={15} />
            <span>Edición navideña</span>
          </p>
          <h2 id="navidad-titulo" className="titulo-seccion mt-5 text-balance">
            Accesorios <em className="clave">navideños</em> en cuentas
          </h2>
          {/* El subtítulo del original era catálogo puro ("esferas, coronas,
                bastones…"). El revisor lo bajó a 10/20 de copy: cero deseo. La
                segunda frase ancla en el deseo #1 y #4 de la ficha de avatar —
                regalar algo que no parezca casero, mostrarlo sin vergüenza— y
                conserva "paso a paso", palabra obligatoria de la ficha. */}
          <p className="text-on-dark-muted mt-3 text-balance">
            Cuatro piezas en perla y cristal, en video paso a paso. Para regalar
            algo hecho por ti que no parezca casero.
          </p>
        </header>

        {/*
            ⚠️ REJILLA 2×2 EN MÓVIL, NO FILA CON SCROLL (revisor visual,
            2026-10-31). La primera versión copiaba el carrusel de las cápsulas
            y a 375px se veía una tarjeta y media de cuatro, sin dots ni flechas
            ni nada que delatara que había más: la mitad de las piezas no
            existían para quien no arrastra por instinto. Son cuatro fotos
            fijas, caben las cuatro, y así se ven las cuatro.
          */}
        {/* `gap-4` (16px) y no 12: el margen lateral de la sección es 20, y
              la regla interno≤externo pedía que el aire entre fotos no fuera
              MENOR que el del bloque que las contiene (revisor, 2026-10-31). */}
        <ul className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:grid-cols-4">
          {PIEZAS.map((p, i) => (
            <li key={p.archivo}>
              <Entrada retraso={Math.min(i, 3) * 0.06}>
                {/*
                  Cada foto es un enlace a los planes (2026-10-31, pedido de
                  Cristian). Antes eran `figure` inertes con la misma forma que
                  las cápsulas —que sí navegan—, y eso rompía la regla UX 11:
                  lo que parece tocable tiene que hacer algo.

                  ⚠️ EL ZOOM VA EN LA IMAGEN, NO EN LA TARJETA. Escalar el
                  enlace entero movería también el título y el degradado, y el
                  texto escalado se ve borroso. Con `overflow-hidden` en el
                  enlace, la foto crece por dentro y el recorte no se mueve.

                  Sin `motion-safe:`: `globals.css` ya corta TODAS las
                  transiciones bajo `prefers-reduced-motion`, así que con esa
                  preferencia el zoom es instantáneo en vez de animado. Y
                  Tailwind envuelve `group-hover` en `@media (hover: hover)`
                  solo: en un celular no se dispara al tocar.
                */}
                <EnlaceCompra
                  href="#precio"
                  origen="navidad_pieza"
                  plan={FRECUENCIA_POR_DEFECTO}
                  ariaLabel={`${p.titulo} — ver los planes`}
                  className="group bg-espresso-2 relative block overflow-hidden rounded-(--radius-capsula) aspect-[3/4.4]"
                >
                  <Image
                    src={`/images/${p.archivo}.webp`}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 768px) 300px, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* El mismo degradado de las cápsulas: sin él, el título se
                        pierde sobre las fotos claras (la de la cajita de regalo
                        es casi blanca abajo). */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ backgroundImage: "var(--capsula-degradado)" }}
                  />
                  <span className="font-display text-cream absolute inset-x-0 bottom-0 block p-4 text-lg leading-tight text-balance">
                    {p.titulo}
                  </span>
                </EnlaceCompra>
              </Entrada>
            </li>
          ))}
        </ul>

        {/*
            El CTA al pie (2026-10-31, pedido de Cristian). El revisor había
            puntuado la sección como "catálogo bonito sin destino": enseñaba
            deseo y lo dejaba muerto. Va a `#precio`, como la banda "1 de 20",
            y no al pago directo: quien va bajando todavía no ha visto el
            precio, y mandarlo a OnePay sería pedirle la tarjeta antes de
            decirle cuánto cuesta.
          */}
        <div className="mt-8 flex justify-center md:mt-10">
          <EnlaceCompra
            href="#precio"
            origen="navidad"
            plan={FRECUENCIA_POR_DEFECTO}
            className="bg-cream text-espresso flex h-13.5 shrink-0 items-center justify-center rounded-full px-8 font-semibold transition-transform active:scale-[0.98] max-md:w-full"
          >
            {/* Solo "Inscribirme", sin el precio: a 375px
                  "Inscribirme · desde US$X/mes" parte en dos líneas y un botón
                  de dos renglones se lee como un párrafo. El precio ya está en
                  la barra fija de abajo, que se ve a la vez que este botón. */}
            Inscribirme
          </EnlaceCompra>
        </div>
      </Entrada>
    </section>
  );
}
