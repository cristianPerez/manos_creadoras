import Image from "next/image";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";

/**
 * "Este es solo uno. Llévate todos los demás."
 *
 * ⚠️ VA JUSTO DESPUÉS DE "PRUÉBALO GRATIS" PORQUE ES EL PUNTO DE MÁS DESEO DEL
 * HOME: acaba de ver que hay un bolso entero gratis, y la pregunta que se hace
 * sola es "¿y los demás?". Ponerlo antes sería pedir dinero por algo que
 * todavía no ha visto.
 *
 * ⚠️ LAS FOTOS SON LAS "TOPO" (`public/images/topo/`), no las de siempre. Las
 * originales están sobre fondo café y madera: con la paleta lavanda ese café se
 * lee como durazno y pelea con el morado. Son las mismas fotos con el fondo
 * neutralizado. Ver `scripts/fotos-topo.mjs`.
 *
 * El "+N" se calcula con el catálogo ENTERO (bolsos, llaveros y adornos): la
 * membresía son proyectos, no solo bolsos.
 */
/* Un bolso, un llavero y un accesorio: tres bolsos contradecirían un texto que
   promete proyectos variados. */
const MUESTRAS = [
  { src: "/images/topo/bolso-icono.webp", alt: "Bolso Ícono" },
  { src: "/images/topo/bolso-boho.webp", alt: "Bolso Boho" },
  { src: "/images/topo/bolso-llavero-mora.webp", alt: "Llavero Mora" },
];

/** `desde`: "US$8", de la base, ya formateado por la página. */
export function SoloUnoB({ proyectos, desde }: { proyectos: number; desde: string }) {
  return (
    <section data-seccion="banda" className="bg-sand">
      <Entrada className="contenedor-b py-11 lg:flex lg:flex-wrap lg:items-center lg:gap-x-12 lg:gap-y-7 lg:py-14">
        {/* Tres piezas de verdad y "+N": que hay muchas más se VE, no solo se
            lee. El borde del color del fondo es lo que las separa al
            superponerse, sin necesidad de sombra. */}
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {MUESTRAS.map((m, i) => (
            <Image
              key={m.src}
              src={m.src}
              alt={m.alt}
              width={168}
              height={168}
              loading="lazy"
              sizes="84px"
              className={`rounded-foto-b border-sand size-18 border-3 object-cover lg:size-21 ${
                i > 0 ? "-ml-3.5 lg:-ml-4" : ""
              }`}
            />
          ))}
          <span className="bg-espresso-2 text-gold-light rounded-foto-b border-sand font-display -ml-3.5 flex size-18 items-center justify-center border-3 lg:-ml-4 lg:size-21">
            <span style={{ fontWeight: 600, fontSize: 26 }}>
              +{Math.max(0, proyectos - MUESTRAS.length)}
            </span>
          </span>
        </div>

        <h2
          className="font-display text-espresso mt-5.5 min-w-0 text-balance lg:mt-0 lg:flex-1"
          style={{ fontWeight: 500, fontSize: "clamp(32px, 3vw, 42px)", lineHeight: 1.08 }}
        >
          Este es solo uno. <em className="clave">Llévate todos los demás.</em>
        </h2>

        <p className="text-ink-body mt-2.5 text-base leading-relaxed lg:hidden">
          Bolsos, accesorios y adornos paso a paso, y el Ojo Experto para que te queden de
          boutique.
        </p>

        <EnlaceCompra
          href="#precio"
          origen="banda_1de16"
          plan={FRECUENCIA_POR_DEFECTO}
          className="bg-espresso-2 text-gold-light mt-5.5 flex h-13 shrink-0 items-center justify-center rounded-full font-bold transition-transform active:scale-[0.98] max-lg:w-full lg:mt-0 lg:h-13.5 lg:px-7"
        >
          Ver el plan · desde {desde}/mes
        </EnlaceCompra>
      </Entrada>
    </section>
  );
}
