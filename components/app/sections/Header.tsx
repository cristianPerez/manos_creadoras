"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { NAVEGACION } from "@/lib/landing";

/**
 * La cabecera del home.
 *
 * ⚠️ EL DISEÑO SOLO RESUELVE ESCRITORIO. En la referencia la navegación son
 * cinco enlaces en fila, que a 375px no caben ni encogiéndolos. Como el diseño
 * móvil (imagen 04) tampoco los muestra, la decisión es nuestra: los cinco
 * enlaces se guardan en un panel que se abre con el botón de menú, y el CTA
 * se queda SIEMPRE visible.
 *
 * Que el CTA no se esconda es deliberado: es la única acción de toda la
 * cabecera que da dinero, y meterla detrás de un menú la mata.
 */
export function Header() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="bg-cream/90 sticky top-0 z-(--z-sticky) backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3" onClick={() => setAbierto(false)}>
          <Logo />
          {/* `whitespace-nowrap`: a 375px, junto al botón y al menú, el nombre
              se partía en dos líneas y duplicaba la altura de la cabecera. */}
          <span
            className="font-display text-espresso text-base whitespace-nowrap md:text-xl"
            style={{ fontWeight: 500 }}
          >
            Manos Creadoras
          </span>
        </Link>

        {/* Los enlaces, en escritorio */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAVEGACION.map((e) => (
            <a
              key={e.destino}
              href={e.destino}
              className="text-ink-body hover:text-espresso text-sm transition-colors"
            >
              {e.texto}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#planes"
            className="bg-espresso flex h-11 items-center rounded-full px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98] md:px-7"
          >
            {/* En pantalla chica el texto largo no cabe junto al logo. */}
            <span className="hidden sm:inline">Unirme a la membresía</span>
            <span className="sm:hidden">Unirme</span>
          </a>

          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-label={abierto ? "Cerrar el menú" : "Abrir el menú"}
            className="text-espresso flex size-11 items-center justify-center lg:hidden"
          >
            {abierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {abierto && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="border-line bg-cream overflow-hidden border-t px-5 lg:hidden"
        >
          {NAVEGACION.map((e) => (
            <a
              key={e.destino}
              href={e.destino}
              onClick={() => setAbierto(false)}
              className="text-ink-body hover:text-espresso flex h-12 items-center text-base transition-colors"
            >
              {e.texto}
            </a>
          ))}
        </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/**
 * La "M" dentro del círculo espresso, tal cual la guía de marca.
 *
 * Va en SVG y no como imagen: es texto en una fuente que ya cargamos, pesa
 * nada y se ve nítido en cualquier pantalla.
 */
function Logo() {
  return (
    <span
      aria-hidden="true"
      className="bg-espresso flex size-10 shrink-0 items-center justify-center rounded-full"
    >
      <span
        className="font-display text-gold-light text-xl italic"
        style={{ fontWeight: 500, lineHeight: 1 }}
      >
        M
      </span>
    </span>
  );
}
