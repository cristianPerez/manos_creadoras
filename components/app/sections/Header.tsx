import Link from "next/link";
import { NAVEGACION } from "@/lib/landing";

/**
 * La cabecera del home.
 *
 * ⚠️ EN MÓVIL SE QUEDA EN LO MÍNIMO: logo y "Entrar". Antes había un menú
 * hamburguesa, pero el home v2 trae una barra fija abajo (Inicio · Bolso gratis
 * · Ojo Experto · Entrar) que está siempre a la vista. Dos formas de navegar lo
 * mismo acaban siempre igual: una de las dos se queda sin actualizar.
 *
 * Ya no es un componente de cliente: sin menú desplegable no hay estado que
 * guardar, así que se renderiza en el servidor y baja menos JavaScript.
 */
export function Header() {
  return (
    <header className="bg-cream/90 sticky top-0 z-(--z-sticky) backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
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
        <nav className="hidden items-center gap-7 md:flex">
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
          {/*
            ⚠️ "ENTRAR" FALTABA, Y ERA EL PEOR HUECO DE LA LANDING: una alumna
            que ya paga entraba a manoscreadoras.co y no tenía por dónde pasar.

            En escritorio va discreto y antes del botón oscuro —quien ya es
            alumna no viene a comprar otra vez—. En móvil es el ÚNICO botón, y
            por eso ahí sí va destacado.
          */}
          <Link
            href="/entrar"
            className="text-ink-body hover:text-espresso hidden h-11 items-center px-3 text-sm font-semibold transition-colors md:flex"
          >
            Entrar
          </Link>

          <Link
            href="/entrar"
            className="bg-espresso flex h-11 items-center rounded-full px-6 text-sm font-semibold text-white transition-transform active:scale-[0.98] md:hidden"
          >
            Entrar
          </Link>

          <a
            href="#gratis"
            className="bg-espresso hidden h-11 items-center rounded-full px-7 text-sm font-semibold text-white transition-transform active:scale-[0.98] md:flex"
          >
            Empieza gratis
          </a>
        </div>
      </div>

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
