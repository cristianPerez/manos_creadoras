"use client";

import { Check } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { marcarMaterial } from "@/app/(interna)/app/acciones";
import type { Material } from "@/lib/bolsos-logica";

/**
 * La lista de la compra de un bolso.
 *
 * Se guarda en la base, no en el navegador: la alumna mira los materiales en el
 * teléfono mientras compra y los marca ahí, pero teje mirando el portátil. Si
 * esto viviera en `localStorage`, cada aparato tendría su propia lista y
 * ninguna sería la buena.
 */
export function ListaMateriales({
  materiales,
  aparte = null,
}: {
  materiales: Material[];
  /** Lo que va a la derecha en escritorio (debajo en móvil): medidas y directorio. */
  aparte?: React.ReactNode;
}) {
  const [, empezar] = useTransition();

  /*
   * `useOptimistic`: la casilla se marca al instante y la base se entera
   * después. Marcar materiales es un gesto rápido y repetido —vas por la lista
   * tocando cinco seguidos— y esperar al servidor en cada uno haría que
   * pareciera que la app no responde.
   */
  const [vista, marcarOptimista] = useOptimistic(
    materiales,
    (actual: Material[], cambio: { id: string; tengo: boolean }) =>
      actual.map((m) => (m.id === cambio.id ? { ...m, tengo: cambio.tengo } : m)),
  );

  const listos = vista.filter((m) => m.tengo).length;

  return (
    /* App interna (2026-10-23): tarjeta ESPRESSO bajo el video. Los aros en
       `--gold-light`: `--gold` sobre espresso no pasa el contraste. */
    /* `@container`: la tarjeta se ordena según SU ancho, no el de la
       pantalla. Con la barra lateral, a 1024px de pantalla la tarjeta mide
       ~700px y a 1440 mide ~650: por el ancho de pantalla se partía mal. */
    <section aria-label="Materiales" className="bg-espresso sobre-oscuro @container rounded-(--radius-foto)">
      <div className="flex flex-col gap-6 p-6 @2xl:flex-row @2xl:p-8">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-cream text-2xl" style={{ fontWeight: 500 }}>
            Lo que necesitas
          </h2>
          <p className="text-on-dark-muted cifra text-sm">
            {listos} de {vista.length} listos
          </p>
        </div>

        <ul className="mt-4 grid gap-x-6 gap-y-1 @md:grid-cols-2">
          {vista.map((material) => {
            /*
             * ⚠️ "Comprar" SOLO si hay enlace de verdad. Un botón de comprar
             * que no lleva a ningún sitio gasta la confianza justo cuando la
             * alumna estaba a punto de gastar dinero.
             */
            const compra = material.compras.find((c) => c.url);

            return (
              <li key={material.id} className="flex items-center gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={material.tengo}
                  aria-label={`Ya tengo: ${material.texto}`}
                  onClick={() =>
                    empezar(async () => {
                      marcarOptimista({ id: material.id, tengo: !material.tengo });
                      await marcarMaterial(material.id, !material.tengo);
                    })
                  }
                  className="flex size-11 shrink-0 items-center justify-center [touch-action:manipulation]"
                >
                  <span
                    aria-hidden="true"
                    className={`flex size-6 items-center justify-center rounded-full border-2 transition-colors ${
                      material.tengo
                        ? "bg-gold-light border-gold-light text-espresso"
                        : "border-gold-light"
                    }`}
                  >
                    {material.tengo && <Check size={13} strokeWidth={3} />}
                  </span>
                </button>

                <span
                  className={`min-w-0 flex-1 text-base ${
                    material.tengo ? "text-on-dark-muted line-through" : "text-cream"
                  }`}
                >
                  {material.texto}
                </span>

                {compra && (
                  <a
                    href={compra.url ?? undefined}
                    target="_blank"
                    /* `sponsored`: son enlaces de afiliado y decirlo es lo
                       correcto. `noopener` evita que la pestaña nueva toque la
                       nuestra. */
                    rel="sponsored noopener"
                    className="text-gold-pale shrink-0 text-sm font-semibold underline underline-offset-2"
                  >
                    Comprar
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {aparte && <div className="flex shrink-0 flex-col gap-5 @2xl:w-64">{aparte}</div>}
      </div>
    </section>
  );
}

