import { Reveal } from "@/components/app/Reveal";
import { PASOS } from "@/lib/landing";

/**
 * Los tres pasos. La única sección sobre fondo arena, que es lo que la separa
 * del crema de arriba y de abajo sin necesidad de una línea divisoria.
 */
export function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-sand px-5 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/*
          El titular ocupa la izquierda y el párrafo se va abajo a la derecha,
          como en el diseño. En móvil eso no tiene sentido —serían dos bloques
          raquíticos— así que se apilan y el párrafo pasa a leerse como bajada.
        */}
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <header className="md:col-span-7">
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="titulo-seccion mt-3 text-balance">
              Una membresía pensada para que nunca te quedes sin qué crear.
            </h2>
          </header>
          <p className="text-ink-body md:col-span-4 md:col-start-9">
            Empiezas desde cero, con acceso a toda la biblioteca, y cada mes se suma un modelo nuevo
            a tu colección.
          </p>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {PASOS.map((paso, i) => (
            <Reveal key={paso.n} delay={i * 0.08}>
              <li className="bg-ivory h-full rounded-[var(--radius-xl)] p-7">
                {/* El número en Cormorant cursiva dorada es el gesto de la guía:
                    ordena sin gritar, al revés que una insignia de color. */}
                <p className="font-display text-gold text-3xl italic" style={{ fontWeight: 400 }}>
                  {paso.n}
                </p>
                <h3 className="text-espresso mt-4 font-semibold">{paso.titulo}</h3>
                <p className="text-ink-body mt-2 text-sm">{paso.texto}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
