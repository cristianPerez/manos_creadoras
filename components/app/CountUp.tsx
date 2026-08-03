"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Número que cuenta hasta su valor (baseline 2 de animación del SO).
 *
 * Anima TAMBIÉN cuando el valor cambia después de montarse: antes solo contaba una vez,
 * así que el medidor del Ojo Experto seguía marcando "40 de 40" después de gastar una
 * pregunta — la barra se movía y el número no.
 */
export function CountUp({
  to,
  duration = 700,
  prefix = "",
  suffix = "",
  locale = "es",
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
}) {
  const [value, setValue] = useState(0);
  const valorRef = useRef(0);

  useEffect(() => {
    const desde = valorRef.current;
    if (desde === to) return;

    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = sinMovimiento ? 0 : duration;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = total === 0 ? 1 : Math.min((now - start) / total, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const actual = Math.round(desde + (to - desde) * eased);
      valorRef.current = actual;
      setValue(actual);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, duration]);

  return (
    <span className="tabular">
      {prefix}
      {value.toLocaleString(locale)}
      {suffix}
    </span>
  );
}
