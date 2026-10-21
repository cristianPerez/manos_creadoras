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
  agruparSiempre = false,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  /**
   * Fuerza el punto de los miles en números de cuatro cifras.
   *
   * ⚠️ Por defecto va APAGADO porque el español, bien escrito, NO separa cuatro
   * cifras: "1200", no "1.200" (así lo hace `toLocaleString` y así debe quedar
   * en los medidores). Se enciende solo donde la marca ya escribe "+1.200" —el
   * héroe del home— para no desviarse del diseño en su cifra más visible.
   */
  agruparSiempre?: boolean;
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
      {value.toLocaleString(locale, agruparSiempre ? { useGrouping: "always" } : undefined)}
      {suffix}
    </span>
  );
}
