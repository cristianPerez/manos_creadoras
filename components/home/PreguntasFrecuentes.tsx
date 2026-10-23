"use client";

import { Minus, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { PREGUNTAS_FRECUENTES, WHATSAPP_URL } from "@/lib/landing";

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
    /* Home a color (2026-10-22): crema, y en escritorio en dos columnas — el
       encabezado a la izquierda y el acordeón a la derecha. */
    <section id="faq" className="px-5 py-14 md:py-22">
      <Entrada className="mx-auto grid max-w-[1080px] gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] md:gap-16">
        <header>
          <EyebrowLinea>Dudas</EyebrowLinea>
          <h2 className="titulo-seccion mt-3">
            Preguntas <em className="clave">frecuentes</em>
          </h2>
          <p className="text-ink-body mt-3">
            ¿No está la tuya?{" "}
            <EnlaceWhatsApp
              href={WHATSAPP_URL}
              origen="faq"
              className="text-gold inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
            >
              Escríbenos
            </EnlaceWhatsApp>
            .
          </p>
        </header>

        <ul className="border-line border-t">
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

