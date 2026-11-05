import Link from "next/link";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";

/**
 * La cabecera del home B.
 *
 * ⚠️ NO REUTILIZA `components/app/sections/Header.tsx`, y no es por capricho.
 * Aquel tiene el logo REDONDO y la referencia de la B lo pide cuadrado con
 * radio 8 — es el gesto que marca toda la paleta B ("menos redondez"). Si se le
 * metiera un `if` por paleta, el componente del sitio de hoy pasaría a depender
 * del experimento, que es justo lo que no puede pasar: el control tiene que
 * quedarse intacto hasta que se decida.
 *
 * El menú solo desde 1024px: entre 768 y 1023 no cabe junto a "Entrar" e
 * "Inscribirme" (el mismo motivo que en el header de siempre).
 */
/* v2 (2026-11-05): el menú sigue el orden nuevo de la página. */
const MENU = [
  { destino: "#gratis", texto: "Gratis" },
  { destino: "#comunidad", texto: "Alumnas" },
  { destino: "#elizabeth", texto: "Elizabeth" },
  { destino: "#precio", texto: "Planes" },
  { destino: "#faq", texto: "Dudas" },
];

export function CabeceraB() {
  return (
    /* La raya de abajo es una sombra interior y no un `border-b`: el borde
       suma 1px a la altura y la cabecera pasaba de los 56 del contrato a 57,
       empujando toda la primera pantalla. */
    <header className="bg-cream sticky top-0 z-(--z-sticky) shadow-[inset_0_-1px_0_var(--line)]">
      {/* 56px exactos en el teléfono (el contrato de la primera pantalla). */}
      <div className="contenedor-b flex h-14 items-center gap-2.5 lg:h-18 lg:gap-7">
        {/*
          ⚠️ `flex-1` + `min-w-0` EN EL LOGO, Y NO `ml-auto` EN LOS BOTONES.
          Con `ml-auto` la cabecera se desbordaba a 375px y "Entrar" salía
          pegado a "Creadoras", sin un pixel de aire: entre el logo (36), el
          nombre sin cortar (~140), "Entrar" y el botón no caben 375, así que no
          quedaba hueco que repartir y el margen automático valía 0.

          Ahora el nombre es lo que cede: ocupa lo que sobra y, si no cabe, se
          corta con puntos suspensivos. Es el único de los cuatro que se puede
          recortar sin perder nada — el logo ya dice la marca, y los otros dos
          son las acciones.
        */}
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5 max-[374px]:gap-2">
          <Logo />
          {/*
            ⚠️ v2: EL NOMBRE VA EN UNA LÍNEA (18px), como pide el contrato de
            la primera pantalla: la cabecera tiene que medir 56 y dos líneas
            la estiraban. Nunca con puntos suspensivos: el nombre de la marca
            no sale a medias. A 360 (Android de gama media) se partía en dos;
            por debajo de 375 la marca baja a 17px y los rellenos de los
            botones ceden 2-4px, y así entra en una línea (medido a 360).
          */}
          <span className="font-display text-espresso text-lg leading-tight font-medium whitespace-nowrap max-[374px]:text-[17px] lg:text-[22px]">
            Manos Creadoras
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-6.5 lg:flex">
          {MENU.map((e) => (
            <a
              key={e.destino}
              href={e.destino}
              className="text-ink-body hover:text-espresso text-[15px] font-medium transition-colors"
            >
              {e.texto}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 md:gap-3.5">
          {/* "Entrar" es para quien ya paga: nunca puede desaparecer de la
              cabecera. Sin caja — lo oscuro se reserva para comprar. */}
          <Link
            href="/entrar"
            className="text-espresso flex h-11 items-center px-1.5 text-sm font-semibold max-[374px]:px-1 lg:text-[15px]"
          >
            Entrar
          </Link>

          {/*
            ⚠️ CONTORNO Y "VER PLANES", NO PÍLDORA OSCURA "INSCRIBIRME"
            (revisor v2, aprobado por Cristian). Con el relleno oscuro pesaba
            casi como el botón del héroe y en la primera pantalla había dos
            acciones distintas peleando: probar gratis y pagar. La de pagar
            queda visible y a un toque, pero cede el protagonismo; y "Ver
            planes" dice lo que de verdad hace (baja al precio), "Inscribirme"
            prometía un registro que no ocurre.
          */}
          <EnlaceCompra
            href="#precio"
            origen="header"
            plan={FRECUENCIA_POR_DEFECTO}
            className="border-espresso-2 text-espresso hover:bg-sand flex h-10 shrink-0 items-center rounded-full border-[1.5px] px-4 text-sm font-bold whitespace-nowrap transition-[transform,background-color] active:scale-[0.98] max-[374px]:px-3 md:h-11 md:px-5.5 lg:text-[15px]"
          >
            Ver planes
          </EnlaceCompra>
        </div>
      </div>
    </header>
  );
}

/**
 * La "M" en un cuadrado con radio 8 — el logo de la paleta B.
 *
 * Va en texto y no como imagen: es una fuente que ya cargamos, pesa nada y se
 * ve nítida en cualquier pantalla.
 */
function Logo() {
  return (
    <span
      aria-hidden="true"
      className="bg-espresso-2 text-gold-light rounded-foto-b flex size-8.5 shrink-0 items-center justify-center lg:size-10"
    >
      <span className="font-display text-[22px] leading-none font-medium italic lg:text-[25px]">
        M
      </span>
    </span>
  );
}
