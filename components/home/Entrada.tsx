"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * Hace que un bloque entre con un desplazamiento corto en vez de aparecer de
 * golpe.
 *
 * ⚠️ `whileInView` Y NO AL CARGAR. Animar al cargar todo el home significa que
 * lo de abajo ya terminó su animación antes de que nadie llegue, y lo de arriba
 * compite con la lectura del titular. Cada bloque se mueve cuando entra.
 *
 * `prefers-reduced-motion` no es un extra: hay gente a la que el movimiento le
 * marea de verdad. Con esa preferencia el contenido simplemente está ahí.
 */
export function Entrada({
  children,
  retraso = 0,
  className,
}: {
  children: ReactNode;
  retraso?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // `once`: una vez entrado, se queda. Repetir al volver a subir marea.
  const visible = useInView(ref, { once: true, margin: "-80px" });
  const quieto = useReducedMotion();

  if (quieto) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={visible ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: retraso, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
