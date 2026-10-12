import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/app/Reveal";
import { CIERRE } from "@/lib/landing";

/**
 * El cierre: una tarjeta espresso ancha con la última llamada.
 *
 * Repite la oferta del héroe a propósito. Quien llega hasta aquí ya leyó todo y
 * no debería tener que subir cuatro pantallas para encontrar el botón.
 */
export function CtaFinal() {
  return (
    <section className="px-5 pb-20 md:pb-28">
      <Reveal>
        <div className="bg-espresso mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[var(--radius-xl)] p-9 md:flex-row md:items-center md:p-14">
          <div>
            <h2
              className="font-display text-balance text-white"
              style={{
                fontWeight: 500,
                fontSize: "clamp(32px, 3.4vw, 44px)",
                lineHeight: 1.08,
                letterSpacing: "-0.015em",
              }}
            >
              {CIERRE.titulo}{" "}
              <em className="text-gold-light italic" style={{ fontWeight: 400 }}>
                {CIERRE.clave}
              </em>
              .
            </h2>
            <p className="mt-3 text-white/70">{CIERRE.texto}</p>
          </div>

          <a
            href="/pagar"
            className="text-espresso flex h-14 shrink-0 items-center justify-center gap-2 rounded-full px-8 font-semibold transition-transform active:scale-[0.98]"
            style={{ backgroundImage: "var(--boton-dorado)" }}
          >
            {CIERRE.cta}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
