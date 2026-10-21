"use client";

import { Minus, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { Entrada } from "@/components/home/Entrada";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { PREGUNTAS_FRECUENTES } from "@/lib/landing";

/**
 * Las preguntas frecuentes del home v3.
 *
 * ⚠️ NO USA `components/app/Accordion.tsx`, Y A PROPÓSITO. Aquel es de la
 * primera plantilla —tarjetas con sombra, chevron, tokens que ya no existen
 * (`border-border-default`)— y nadie lo importa. La v3 pide filas separadas por
 * una línea y un +/− en un cuadrito arena; adaptarlo habría sido reescribirlo.
 *
 * Cada pregunta es un `<button>` con `aria-expanded` y `aria-controls`: se abre
 * con Enter o Espacio y el lector de pantalla dice si está abierta. La primera
 * empieza abierta, para que se vea que las demás también se abren.
 */
export function PreguntasFrecuentes() {
  const [abierta, setAbierta] = useState<number | null>(0);
  const quieto = useReducedMotion();
  const base = useId();

  return (
    <section id="faq" className="px-5 py-12 md:py-16">
      <Entrada className="mx-auto max-w-205">
        <h2
          className="font-display text-espresso text-center"
          style={{ fontWeight: 500, fontSize: "clamp(32px, 3.6vw, 46px)", lineHeight: 1.08 }}
        >
          Preguntas frecuentes
        </h2>

        <ul className="border-line mt-8 border-t">
          {PREGUNTAS_FRECUENTES.map((p, i) => {
            const abiertaEsta = abierta === i;
            const idRespuesta = `${base}-r${i}`;
            const Icono = abiertaEsta ? Minus : Plus;
            return (
              <li key={p.q} className="border-line border-b">
                <button
                  type="button"
                  aria-expanded={abiertaEsta}
                  aria-controls={idRespuesta}
                  onClick={() => {
                    setAbierta(abiertaEsta ? null : i);
                    // Solo al ABRIR: lo que se quiere saber es qué duda pesa,
                    // y cerrarla no dice nada de eso.
                    if (!abiertaEsta) medir(EVENTOS.faqOpen, { pregunta: p.q });
                  }}
                  className="text-espresso flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold [touch-action:manipulation] md:text-lg"
                >
                  {p.q}
                  <span
                    aria-hidden="true"
                    className="bg-sand text-cacao flex size-8 shrink-0 items-center justify-center rounded-sm"
                  >
                    <Icono size={16} strokeWidth={2.5} />
                  </span>
                </button>
                <motion.div
                  id={idRespuesta}
                  role="region"
                  initial={false}
                  animate={{ height: abiertaEsta ? "auto" : 0, opacity: abiertaEsta ? 1 : 0 }}
                  transition={{ duration: quieto ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                  // Cerrada no debe poder enfocarse ni leerse: está, pero no se ve.
                  inert={!abiertaEsta}
                >
                  <p className="text-ink-body pb-5 text-base">{p.a}</p>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </Entrada>
    </section>
  );
}

