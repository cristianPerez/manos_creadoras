import type { ReactNode } from "react";

/**
 * El grupo `(conbarra)` ya no añade nada (2026-10-23).
 *
 * Aquí vivía la barra lateral de escritorio. Desde la navegación unificada la
 * pone el layout de `/app` como cabecera superior, la misma en todas las
 * páginas, también en el Ojo. Se deja el grupo para no mover rutas.
 */
export default function LayoutConBarra({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
