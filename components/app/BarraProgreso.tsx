"use client";

import { useEffect, useState } from "react";

export function BarraProgreso({ pct, label }: { pct: number; label: string }) {
  const [ancho, setAncho] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAncho(pct);
      return;
    }
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
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${ancho}%`,
          backgroundImage:
            "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
        }}
      />
    </div>
  );
}
