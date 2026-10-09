import Image from "next/image";
import { Reveal } from "@/components/app/Reveal";
import { COLECCION } from "@/lib/landing";

/**
 * La colección: la única sección a pantalla completa sobre espresso.
 *
 * Es el respiro oscuro en mitad de la página y hace un trabajo concreto: las
 * fotos de los bolsos están tomadas sobre fondo negro, así que sobre crema
 * flotarían como recortes. Sobre espresso se funden con la página y parecen
 * una vitrina.
 */
export function Coleccion() {
  return (
    <section id="coleccion" className="bg-espresso px-5 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-12 md:items-start">
          <header className="md:col-span-7">
            <p className="eyebrow text-gold-light">La colección crece cada mes</p>
            <h2
              className="font-display mt-3 text-balance text-white"
              style={{
                fontWeight: 500,
                fontSize: "clamp(36px, 4vw, 54px)",
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
              }}
            >
              Un modelo nuevo,{" "}
              <em className="text-gold-light italic" style={{ fontWeight: 400 }}>
                cada mes
              </em>
              .
            </h2>
          </header>
          <p className="text-sm text-white/70 md:col-span-4 md:col-start-9 md:pt-2">
            Mientras sigas en la membresía, tu biblioteca no deja de crecer. Estos son algunos de los
            modelos que ya puedes tejer.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5">
          {COLECCION.map((bolso, i) => (
            <Reveal key={bolso.nombre} delay={Math.min(i, 4) * 0.06}>
              <li>
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)]">
                  <Image
                    src={`/images/${bolso.imagen}.webp`}
                    alt={`Bolso ${bolso.nombre}, tejido en cuentas`}
                    fill
                    sizes="(min-width: 768px) 280px, 45vw"
                    className="object-cover"
                  />
                  <span className="bg-ivory text-espresso absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold tracking-[0.1em] uppercase">
                    {bolso.etiqueta}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <p className="font-display truncate text-lg text-white" style={{ fontWeight: 500 }}>
                    {bolso.nombre}
                  </p>
                  {/* "Nuevo" pide más luz que "Disponible": es el único que
                      marca novedad, y el dorado claro lo separa del resto. */}
                  <span
                    className={`shrink-0 text-xs ${
                      bolso.estado === "Nuevo" ? "text-gold-light font-semibold" : "text-gold"
                    }`}
                  >
                    {bolso.estado}
                  </span>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
