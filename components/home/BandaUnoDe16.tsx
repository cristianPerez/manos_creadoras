import Image from "next/image";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { FRECUENCIA_POR_DEFECTO, precioDesde } from "@/lib/planes";

/**
 * "Este es 1 de 16 bolsos. Llévate los otros 15." — justo después del bolso gratis.
 *
 * ⚠️ VA AQUÍ PORQUE ES EL PUNTO DE MÁS DESEO DEL HOME. Acaba de ver un bolso
 * entero, gratis y completo, y la pregunta que se hace sola es "¿y los demás?".
 * Ponerlo antes sería pedir dinero por algo que todavía no ha visto.
 *
 * Sustituye a la tarjeta "Acabas de hacer uno. Te faltan 15." de la v2: misma
 * idea, pero ahora con el precio en el botón — quien llega aquí ya quiere
 * saberlo, y "Ver los planes" a secas obligaba a bajar para enterarse.
 *
 * Las cifras se calculan con el catálogo: si entra un bolso, la frase lo sigue.
 */
/** Tres portadas del catálogo para la fila de círculos (ya están en `public/images`). */
const MUESTRAS = [
  { src: "/images/bolso-cristal-brillante.webp", alt: "Bolso Cristal Brillante" },
  { src: "/images/bolso-marfil-elegante.webp", alt: "Bolso Marfil Elegante" },
  { src: "/images/bolso-nacar-sonado.webp", alt: "Bolso Nácar Soñado" },
];

export function BandaUnoDe16({ bolsos, videos }: { bolsos: number; videos: number }) {
  return (
    /*
      ⚠️ HOME A COLOR (2026-10-22): FRANJA CAFÉ A TODO EL ANCHO, no una tarjeta
      dentro de la crema. Es el punto de más deseo del home y como franja corta
      la página en dos: lo gratis arriba, lo que se compra abajo.
    */
    <section className="bg-cacao sobre-oscuro grain-oscuro px-5 py-12 md:py-18">
      <Entrada className="mx-auto flex max-w-[1240px] flex-col gap-6 md:flex-row md:items-center md:gap-10">
        {/* Tres bolsos de verdad y "+N": el "1 de 20" se ve, no solo se lee. */}
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
            +{Math.max(0, bolsos - MUESTRAS.length)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className="font-display text-cream text-balance"
            style={{ fontWeight: 500, fontSize: "clamp(28px, 3vw, 40px)", lineHeight: 1.12 }}
          >
            Este es 1 de {bolsos} bolsos.{" "}
            <em className="clave">Llévate los otros {bolsos - 1}.</em>
          </h2>
          <p className="text-sand mt-2">
            {videos} videos paso a paso, la ficha de materiales de cada bolso y el Ojo Experto
            para tus dudas.
          </p>
        </div>

        <EnlaceCompra
          href="#precio"
          origen="banda_1de16"
          plan={FRECUENCIA_POR_DEFECTO}
          className="bg-cream text-espresso flex h-13.5 shrink-0 items-center justify-center rounded-full px-8 font-semibold transition-transform active:scale-[0.98] max-md:w-full"
        >
          Ver el plan · desde {precioDesde()}/mes
        </EnlaceCompra>
      </Entrada>
    </section>
  );
}
