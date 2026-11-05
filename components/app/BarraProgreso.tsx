"use client";

import { useEffect, useState } from "react";

export function BarraProgreso({ pct, label }: { pct: number; label: string }) {
  const [ancho, setAncho] = useState(0);

  /*
   * La barra crece desde 0 en el fotograma siguiente al montarse. El cambio de
   * estado va SIEMPRE dentro de `requestAnimationFrame` (no directo en el
   * efecto, que encadena un render extra y lo marca el lint). Con movimiento
   * reducido no se salta este paso: es la TRANSICIÓN la que se apaga
   * (`motion-reduce:transition-none`), así que la barra aparece llena sin
   * animarse, igual que antes.
   */
  useEffect(() => {
    const id = requestAnimationFrame(() => setAncho(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full border border-border-default bg-surface-tertiary"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
        style={{
          width: `${ancho}%`,
          backgroundImage:
            "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
        }}
      />
    </div>
  );
}
