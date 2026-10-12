"use client";

import { Check, ExternalLink } from "lucide-react";
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
export function ListaMateriales({ materiales }: { materiales: Material[] }) {
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
    <div className="bg-ivory border-line rounded-[var(--radius-xl)] border p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-espresso text-xl" style={{ fontWeight: 500 }}>
          Materiales
        </h2>
        <p className="text-ink-muted text-sm">
          <strong className="text-espresso font-semibold">{listos}</strong> de {vista.length} listos
        </p>
      </div>

      <p className="text-ink-muted mt-2 text-sm">
        Márcalos a medida que los consigues. &ldquo;Comprar&rdquo; te lleva al producto en
        AliExpress.
      </p>

      <ul className="border-line mt-5 flex flex-col gap-1 border-t pt-4">
        {vista.map((material) => {
          /*
           * ⚠️ "Comprar" SOLO si hay enlace de verdad. Hoy los 33 productos del
           * directorio tienen la URL vacía, así que no aparece ninguno. Un botón
           * de comprar que no lleva a ningún sitio gasta la confianza justo
           * cuando la alumna estaba a punto de gastar dinero.
           */
          const compra = material.compras.find((c) => c.url);

          return (
            <li key={material.id} className="flex items-start gap-3 py-1.5">
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
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors [touch-action:manipulation] ${
                  material.tengo ? "bg-gold border-gold text-white" : "border-line"
                }`}
              >
                {material.tengo && <Check size={14} strokeWidth={3} aria-hidden="true" />}
              </button>

              <span
                className={`flex-1 text-sm ${
                  material.tengo ? "text-ink-muted line-through" : "text-ink-body"
                }`}
              >
                {material.texto}
              </span>

              {compra && (
                <a
                  href={compra.url ?? undefined}
                  target="_blank"
                  /* `sponsored`: son enlaces de afiliado y decirlo es lo correcto
                     —y lo que Google pide—. `noopener` evita que la pestaña nueva
                     pueda tocar la nuestra. */
                  rel="sponsored noopener"
                  className="text-gold shrink-0 text-sm font-semibold underline underline-offset-2"
                >
                  Comprar
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** El enlace al directorio, que vive junto a los materiales porque es su continuación. */
export function TarjetaDirectorio() {
  return (
    <a
      href="/app/directorio"
      className="bg-ivory border-line mt-5 flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border p-5 transition-colors"
    >
      <span>
        <span className="text-espresso block font-semibold">Directorio de proveedores</span>
        <span className="text-ink-muted block text-sm">Todos los materiales en AliExpress</span>
      </span>
      <ExternalLink size={18} className="text-gold shrink-0" aria-hidden="true" />
    </a>
  );
}
