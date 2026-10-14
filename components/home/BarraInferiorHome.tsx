"use client";

import { House, LogIn, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

const DESTINOS = [
  { href: "#capsulas", texto: "Inicio", Icono: House, ancla: true },
  { href: "#gratis", texto: "Bolso gratis", Icono: ShoppingBag, ancla: true },
  { href: "#ojo", texto: "Ojo Experto", Icono: Sparkles, ancla: true },
  { href: "/entrar", texto: "Entrar", Icono: LogIn, ancla: false },
] as const;

/**
 * La barra fija del home en móvil.
 *
 * ⚠️ NO ES LA MISMA QUE LA DE LA APP. Aquella navega entre secciones de la
 * cuenta; esta mueve por una sola página larga. Son dos trabajos distintos y
 * compartir el componente habría significado que cada cambio en uno tuviera que
 * pensarse para el otro.
 *
 * El `padding-bottom` del contenido lo pone la página: una barra fija que tapa
 * el último bloque es el fallo más común de este patrón.
 */
export function BarraInferiorHome() {
  return (
    <nav
      aria-label="Secciones"
      className="border-line bg-cream/95 fixed inset-x-0 bottom-0 z-(--z-sticky) border-t backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex">
        {DESTINOS.map(({ href, texto, Icono, ancla }) => {
          const contenido = (
            <>
              <Icono size={19} aria-hidden="true" />
              <span className="text-[11px] font-semibold">{texto}</span>
            </>
          );
          const clases =
            "text-ink-body flex h-16 flex-col items-center justify-center gap-1 [touch-action:manipulation]";

          return (
            <li key={href} className="flex-1">
              {ancla ? (
                <a href={href} className={clases}>
                  {contenido}
                </a>
              ) : (
                <Link href={href} className={clases}>
                  {contenido}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
