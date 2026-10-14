"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Un número que cuenta hasta su valor cuando entra en pantalla.
 *
 * ⚠️ SE RESERVA EL ANCHO DESDE EL PRIMER FOTOGRAMA. Si el texto creciera de "0"
 * a "1.200" mientras cuenta, el renglón entero se movería a cada cifra. Por eso
 * se pinta el valor final en un hueco invisible y el contador va encima.
 */
export function NumeroQueCuenta({
  hasta,
  formato,
  duracion = 1.1,
}: {
  hasta: number;
  /** Cómo se escribe: separador de miles, coma decimal, lo que haga falta. */
  formato: (n: number) => string;
  duracion?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "-40px" });
  const quieto = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!visible || quieto) return;
    const control = animate(0, hasta, {
      duration: duracion,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setN,
    });
    return () => control.stop();
  }, [visible, quieto, hasta, duracion]);

  return (
    <span ref={ref} className="relative inline-grid">
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {formato(hasta)}
      </span>
      <span className="col-start-1 row-start-1">{formato(quieto ? hasta : n)}</span>
    </span>
  );
}
