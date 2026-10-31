import type { ReactNode } from "react";

/**
 * El eyebrow con línea del home a color (2026-10-22): una raya de 24px en
 * móvil y 32 en escritorio, y el texto en `.eyebrow`.
 *
 * El color sale del fondo y no de una prop: dentro de `.sobre-oscuro` el
 * `.eyebrow` pasa solo a `--gold-light` (ver `globals.css`), y la raya usa
 * `currentColor` para seguirlo. Así no hay forma de dejar `--gold` sobre
 * espresso por olvido.
 *
 * `centrado`: la raya a los dos lados, para los encabezados centrados
 * (Comunidad, Inscripción).
 */
export function EyebrowLinea({
  children,
  centrado = false,
}: {
  children: ReactNode;
  centrado?: boolean;
}) {
  const raya = <span aria-hidden="true" className="block h-px w-6 bg-current md:w-8" />;
  return (
    <p className={`eyebrow flex items-center gap-3 ${centrado ? "justify-center" : ""}`}>
      {raya}
      <span>{children}</span>
      {centrado && raya}
    </p>
  );
}
