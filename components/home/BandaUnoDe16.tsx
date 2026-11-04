import Image from "next/image";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";

/**
 * "Este es solo uno. Llévate todos los demás." — justo después del bolso gratis.
 *
 * ⚠️ VA AQUÍ PORQUE ES EL PUNTO DE MÁS DESEO DEL HOME. Acaba de ver un bolso
 * entero, gratis y completo, y la pregunta que se hace sola es "¿y los demás?".
 * Ponerlo antes sería pedir dinero por algo que todavía no ha visto.
 *
 * Sustituye a la tarjeta "Acabas de hacer uno. Te faltan 15." de la v2: misma
 * idea, pero ahora con el precio en el botón — quien llega aquí ya quiere
 * saberlo, y "Ver los planes" a secas obligaba a bajar para enterarse.
 *
 * El "+N" se calcula con el catálogo ENTERO (bolsos y accesorios): la
 * membresía son proyectos, no solo bolsos (pedido de Cristian, 2026-11-02).
 */
/* Un bolso, un accesorio y un adorno (revisor visual, 2026-11-02): tres bolsos
   contradecían un texto que promete proyectos. El Ónix y no el Mora: el morado
   era el único color frío del home. */
const MUESTRAS = [
  { src: "/images/bolso-cristal-brillante.webp", alt: "Bolso Cristal Brillante" },
  { src: "/images/bolso-llavero-onix.webp", alt: "Llavero Ónix" },
  { src: "/images/navidad-accesorios.webp", alt: "Adornos navideños en perlas" },
];

/** `desde`: "US$14,70", de la base (`lib/precios.ts`), ya formateado por la página. */
export function BandaUnoDe16({ proyectos, desde }: { proyectos: number; desde: string }) {
  return (
    /*
      ⚠️ HOME A COLOR (2026-10-22): FRANJA CAFÉ A TODO EL ANCHO, no una tarjeta
      dentro de la crema. Es el punto de más deseo del home y como franja corta
      la página en dos: lo gratis arriba, lo que se compra abajo.
    */
    <section className="bg-cacao sobre-oscuro grain-oscuro px-5 py-12 md:py-18">
      <Entrada className="mx-auto flex max-w-[1240px] flex-col gap-6 md:flex-row md:items-center md:gap-10">
        {/* Tres piezas de verdad y "+N": que hay muchas más se ve, no solo se lee. */}
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {MUESTRAS.map((m, i) => (
            <span
              key={m.src}
              className={`border-cacao relative block size-18 overflow-hidden rounded-full border-3 md:size-22 ${
                i > 0 ? "-ml-5 md:-ml-6" : ""
              }`}
            >
              <Image src={m.src} alt={m.alt} fill sizes="88px" className="object-cover" />
            </span>
          ))}
          <span
            className="bg-gold-pale border-cacao text-espresso font-display -ml-5 flex size-18 items-center justify-center rounded-full border-3 md:-ml-6 md:size-22"
            style={{ fontWeight: 500, fontSize: 28 }}
          >
            +{Math.max(0, proyectos - MUESTRAS.length)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className="font-display text-cream text-balance"
            style={{ fontWeight: 500, fontSize: "clamp(28px, 3vw, 40px)", lineHeight: 1.12 }}
          >
            Este es solo uno.{" "}
            <em className="clave">Llévate todos los demás.</em>
          </h2>
          <p className="text-sand mt-2">
            Bolsos, accesorios y adornos paso a paso, y el Ojo Experto para que te queden
            de boutique.
          </p>
        </div>

        <EnlaceCompra
          href="#precio"
          origen="banda_1de16"
          plan={FRECUENCIA_POR_DEFECTO}
          className="bg-cream text-espresso flex h-13.5 shrink-0 items-center justify-center rounded-full px-8 font-semibold transition-transform active:scale-[0.98] max-md:w-full"
        >
          Ver el plan · desde {desde}/mes
        </EnlaceCompra>
      </Entrada>
    </section>
  );
}
