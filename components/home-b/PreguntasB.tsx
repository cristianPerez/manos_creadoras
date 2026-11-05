"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { EntradaB, PiezaB } from "@/components/home-b/EntradaB";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { PREGUNTAS_FRECUENTES, WHATSAPP_URL } from "@/lib/landing";

/**
 * Las preguntas frecuentes, en la paleta B.
 *
 * Mismo contenido y misma accesibilidad que el acordeón del home de siempre
 * (`aria-expanded`, `aria-controls`, `inert` cuando está cerrada, la primera
 * abierta para que se vea que las demás también se abren) y el mismo evento
 * `faq_open`, que es lo que dice cuál es la objeción número uno.
 *
 * ⚠️ LO ÚNICO QUE CAMBIA ES EL CUADRITO DEL +/−: radio 6 y un signo de texto en
 * vez del icono de Lucide. Es el gesto de "menos redondez" de la B, y el signo
 * tipográfico pesa menos que un SVG en una lista de cinco. Existe como
 * componente aparte en vez de como una prop del otro para no meterle al control
 * una rama que depende del experimento.
 */
export function PreguntasB() {
  const [abierta, setAbierta] = useState<number | null>(0);
  const quieto = useReducedMotion();
  const base = useId();

  return (
    <section id="faq" data-seccion="faq" className="py-12 lg:py-20">
      <EntradaB className="contenedor-b lg:flex lg:flex-wrap lg:gap-x-18 lg:gap-y-8">
        <header className="lg:flex-1 lg:min-w-75">
          <p className="eyebrow-b flex items-center gap-3">Dudas</p>
          <h2 className="titulo-seccion-b mt-2.5 text-balance lg:mt-3">
            Preguntas <em className="clave">frecuentes</em>
          </h2>
          <p className="text-ink-body mt-2.5 lg:mt-3.5 lg:text-base">
            ¿No está la tuya?{" "}
            <EnlaceWhatsApp
              href={WHATSAPP_URL}
              origen="faq"
              className="text-apoyo inline-flex min-h-11 items-center font-bold underline underline-offset-4"
            >
              Escríbenos
            </EnlaceWhatsApp>
            .
          </p>
        </header>

        <ul className="border-line mt-5.5 border-t lg:mt-0 lg:flex-[2] lg:min-w-130">
          {PREGUNTAS_FRECUENTES.map((p, i) => {
            const abiertaEsta = abierta === i;
            const idRespuesta = `${base}-r${i}`;
            return (
              <PiezaB como="li" key={p.q} className="border-line border-b">
                <button
                  type="button"
                  aria-expanded={abiertaEsta}
                  aria-controls={idRespuesta}
                  onClick={() => {
                    setAbierta(abiertaEsta ? null : i);
                    /* Solo al ABRIR: lo que se quiere saber es qué duda pesa,
                       y cerrarla no dice nada de eso. */
                    if (!abiertaEsta) medir(EVENTOS.faqOpen, { pregunta: p.q });
                  }}
                  className="text-espresso flex min-h-16 w-full items-center justify-between gap-4 py-3.5 text-left text-base font-semibold [touch-action:manipulation] lg:min-h-17 lg:py-4 lg:text-lg"
                >
                  {p.q}
                  <span
                    aria-hidden="true"
                    className="bg-sand text-espresso rounded-chip-b flex size-8 shrink-0 items-center justify-center text-xl font-medium lg:size-8.5"
                    style={{ lineHeight: 1 }}
                  >
                    {abiertaEsta ? "−" : "+"}
                  </span>
                </button>
                <motion.div
                  id={idRespuesta}
                  role="region"
                  initial={false}
                  animate={{ height: abiertaEsta ? "auto" : 0, opacity: abiertaEsta ? 1 : 0 }}
                  transition={{ duration: quieto ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                  /* Cerrada no debe poder enfocarse ni leerse: está, pero no se ve. */
                  inert={!abiertaEsta}
                >
                  <p className="text-ink-body pr-11 pb-4.5 leading-relaxed lg:pr-14 lg:pb-5 lg:text-base">
                    {p.a}
                  </p>
                </motion.div>
              </PiezaB>
            );
          })}
        </ul>
      </EntradaB>
    </section>
  );
}
