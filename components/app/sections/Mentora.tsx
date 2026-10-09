import Image from "next/image";
import { Reveal } from "@/components/app/Reveal";
import { MENTORA } from "@/lib/landing";

/**
 * Quién enseña.
 *
 * Va sobre arena, entre los planes y las preguntas, y cumple una función
 * concreta del embudo: justo después de ver el precio, la pregunta que aparece
 * es "¿y quién me va a enseñar?". Por eso la foto es grande — la cara de
 * alguien responde esa pregunta mejor que cualquier párrafo.
 */
export function Mentora() {
  return (
    <section id="mentora" className="bg-sand px-5 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)]">
            <Image
              src="/images/mentora-elizabeth.webp"
              alt="Elizabeth Valencia, mentora de Manos Creadoras"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <p className="eyebrow">Tu mentora</p>
            <h2 className="titulo-seccion mt-3">{MENTORA.nombre}</h2>

            {MENTORA.parrafos.map((p) => (
              <p key={p.slice(0, 24)} className="text-ink-body mt-4">
                {p}
              </p>
            ))}

            <dl className="mt-10 grid grid-cols-3 gap-5">
              {MENTORA.cifras.map((c) => (
                <div key={c.pie} className="border-line border-t pt-4">
                  <dt className="sr-only">{c.pie}</dt>
                  <dd>
                    <span
                      className="font-display text-espresso block text-2xl"
                      style={{ fontWeight: 500 }}
                    >
                      {c.valor}
                    </span>
                    <span className="text-ink-muted mt-0.5 block text-xs">{c.pie}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
