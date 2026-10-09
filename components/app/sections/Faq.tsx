"use client";

import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PREGUNTAS } from "@/lib/landing";

/**
 * Las preguntas frecuentes.
 *
 * ⚠️ NO USA EL COMPONENTE `Accordion` QUE YA EXISTE. Ese pinta tarjetas con
 * borde, fondo y sombra, y el diseño de aquí es lo contrario: filas separadas
 * solo por una línea de 1px, sin cajas. Son dos formas distintas, no dos
 * configuraciones de la misma, y meterle cuatro props al Accordion para que
 * sepa dejar de ser tarjeta lo habría vuelto ilegible para las pantallas
 * internas que sí lo usan tal cual.
 */
export function Faq() {
  /* La primera abierta, como en el diseño: enseña de entrada que estas filas
     se despliegan, sin que nadie tenga que adivinarlo. */
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <section id="preguntas" className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2 className="titulo-seccion mt-3 text-balance">Lo que nos preguntan antes de unirse.</h2>
        </header>

        <dl className="border-line mt-12 border-t">
          {PREGUNTAS.map((p, i) => {
            const estaAbierta = abierta === i;
            return (
              <div key={p.q} className="border-line border-b">
                <dt>
                  <button
                    type="button"
                    onClick={() => setAbierta(estaAbierta ? null : i)}
                    aria-expanded={estaAbierta}
                    className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left [touch-action:manipulation]"
                  >
                    <span className="text-espresso font-semibold">{p.q}</span>
                    {/*
                      Más/menos en vez de una flecha que gira: el diseño lo pide
                      así, y además dice mejor "esto suma información" que una
                      punta de flecha, que sugiere ir a otro sitio.
                    */}
                    <span className="text-gold shrink-0" aria-hidden="true">
                      {estaAbierta ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                </dt>

                {/*
                  Se DESMONTA al cerrar, no se esconde con `height: 0`. Un `<dd>`
                  oculto así sigue en el árbol de accesibilidad: quien usa lector
                  de pantalla oiría las siete respuestas seguidas. `AnimatePresence`
                  deja que la salida se anime antes de quitarlo del DOM, así que
                  se consiguen las dos cosas.
                */}
                <AnimatePresence initial={false}>
                  {estaAbierta && (
                    <motion.dd
                      key="r"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="text-ink-body overflow-hidden text-sm"
                    >
                      <p className="pb-6">{p.a}</p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
