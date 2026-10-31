import Link from "next/link";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { NAVEGACION } from "@/lib/landing";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";

/**
 * La cabecera del home.
 *
 * En móvil: logo, "Entrar" e "Inscribirme". Hasta el 2026-10-22 iba solo
 * "Entrar", porque la barra fija de compra de abajo ya lleva el "Inscribirme";
 * Cristian lo pidió también arriba, como ruta al pago siempre a mano.
 *
 * Ya no es un componente de cliente: sin menú desplegable no hay estado que
 * guardar, así que se renderiza en el servidor y baja menos JavaScript.
 */
export function Header() {
  return (
    /* Opaca y con línea abajo (v3): translúcida sobre el bloque espresso del Ojo
       dejaba una franja gris turbia encima del titular. */
    <header className="bg-cream border-line sticky top-0 z-(--z-sticky) border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:py-4">
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

        {/* Los enlaces, desde 1024px. Entre 768 y 1023 no caben junto a
            "Entrar" e "Inscribirme": empujaban el botón 24px fuera de la
            pantalla (2026-10-22). */}
        <nav className="hidden items-center gap-7 lg:flex">
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
            alumna no viene a comprar otra vez—. En móvil es el único botón de
            la cabecera, con borde: lo oscuro se reserva para comprar.
          */}
          <Link
            href="/entrar"
            className="text-ink-body hover:text-espresso hidden h-11 items-center px-3 text-sm font-semibold transition-colors md:flex"
          >
            Entrar
          </Link>

          {/* En móvil, "Entrar" sin borde (2026-10-22): con "Inscribirme" al
              lado, dos botones con caja no caben a 375px junto al nombre. */}
          <Link
            href="/entrar"
            className="text-espresso flex h-11 items-center px-2 text-sm font-semibold md:hidden"
          >
            Entrar
          </Link>

          {/*
            ⚠️ EL CTA DEL HEADER DEJÓ DE SER "EMPIEZA GRATIS" (home v3). El gratis
            ya tiene su botón dorado en el banner, que es lo primero que se ve;
            arriba, fijo durante todo el scroll, va el que compra.
          */}
          <EnlaceCompra
            href="#precio"
            origen="header"
            plan={FRECUENCIA_POR_DEFECTO}
            className="bg-espresso text-gold-pale flex h-11 items-center rounded-full px-4 text-sm font-bold whitespace-nowrap transition-transform active:scale-[0.98] md:px-7"
          >
            Inscribirme
          </EnlaceCompra>
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
