"use client";

import { LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";

/**
 * Un velo con un círculo que gira, ENCIMA del enlace que se acaba de tocar,
 * mientras Next trae la pantalla siguiente.
 *
 * Va DENTRO de un `<Link>` (es la única forma de que `useLinkStatus` sepa de
 * qué enlace hablamos) y su padre tiene que ser `relative`.
 *
 * ⚠️ POR QUÉ (Mixpanel, 30 días al 2026-11-06): "Ver los proyectos" del home
 * acumuló 46 toques en vacío de 30 personas, y las tarjetas de bolso 24. Los
 * dos son enlaces que SÍ funcionan, pero tardan: el `loading.tsx` de la app
 * no sale hasta que el servidor arma la cabecera, y entre medias no cambiaba
 * nada. Con esto, el toque se ve en el mismo fotograma.
 *
 * Aparece con 120 ms de retraso a propósito: en una red rápida la pantalla
 * llega antes y no hay parpadeo.
 */
export function VeloCargando({ redondeo = "rounded-[inherit]" }: { redondeo?: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      {/* Lo que oye un lector de pantalla: el velo es solo visual. La región
          existe SIEMPRE y solo cambia su texto, porque casi ningún lector
          anuncia una región viva que nace ya con contenido. */}
      <span role="status" className="sr-only">
        {pending ? "Abriendo…" : ""}
      </span>
      {/* Velo al 65% + borde crema por dentro: sobre fotos ya oscuras, el velo
          solo no bastaba para ver qué tarjeta se tocó (revisor, 2026-11-06). */}
      <span
        aria-hidden="true"
        className={`bg-espresso/65 ring-cream/70 pointer-events-none absolute inset-0 flex items-center justify-center ring-2 transition-opacity duration-150 ring-inset motion-reduce:transition-none ${redondeo} ${
          pending ? "opacity-100 delay-120" : "opacity-0"
        }`}
      >
        {/* En una pastilla CLARA (revisor visual, 2026-11-06): suelto, el
            círculo se perdía sobre las perlas; en pastilla oscura, sobre el
            velo oscuro, la tarjeta se leía "bloqueada" en vez de "abriendo".
            Va SIEMPRE montada: el velo ya hace el fundido, y desmontarla dejaba
            el velo vacío durante los 150 ms de salida. Con menos movimiento, el
            giro pasa a un pulso: quieto, el círculo abierto parecía roto. */}
        <span className="bg-ivory flex size-10 items-center justify-center rounded-full shadow-sm">
          <LoaderCircle size={20} className="text-espresso animate-spin motion-reduce:animate-pulse" />
        </span>
      </span>
    </>
  );
}
