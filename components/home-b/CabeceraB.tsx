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
const MENU = [
  { destino: "#capsulas", texto: "Cápsulas gratis" },
  { destino: "#navidad", texto: "Navidad" },
  { destino: "#elizabeth", texto: "Elizabeth" },
  { destino: "#precio", texto: "Planes" },
  { destino: "#faq", texto: "Dudas" },
];

export function CabeceraB() {
  return (
    <header className="bg-cream border-line sticky top-0 z-(--z-sticky) border-b">
      <div className="contenedor-b flex items-center gap-3 py-3 md:py-4">
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
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
          <Logo />
          {/*
            ⚠️ EL NOMBRE SE PARTE EN DOS LÍNEAS EN MÓVIL, Y ES LO QUE PIDE LA
            REFERENCIA (`screenshots/movil-375/01-cabecera.png`): "Manos /
            Creadoras". A 375px no hay forma de que quepa en una línea junto a
            "Entrar" y al botón — el intento anterior lo cortaba con puntos
            suspensivos ("Manos Cread…"), y el nombre de la marca es lo último
            que puede salir a medias en una página de ventas. La cabecera queda
            unos píxeles más alta y no pasa nada.

            `leading-tight` para que las dos líneas no la estiren de más.
          */}
          <span
            className="font-display text-espresso leading-tight lg:whitespace-nowrap"
            style={{ fontWeight: 500, fontSize: 19 }}
          >
            Manos Creadoras
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-6 lg:flex">
          {MENU.map((e) => (
            <a
              key={e.destino}
              href={e.destino}
              className="text-ink-body hover:text-espresso text-sm transition-colors"
            >
              {e.texto}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 md:gap-3">
          {/* "Entrar" es para quien ya paga: nunca puede desaparecer de la
              cabecera. Sin caja — lo oscuro se reserva para comprar. */}
          <Link
            href="/entrar"
            className="text-espresso flex h-11 items-center px-2 text-sm font-semibold"
          >
            Entrar
          </Link>

          <EnlaceCompra
            href="#precio"
            origen="header"
            plan={FRECUENCIA_POR_DEFECTO}
            className="bg-espresso-2 text-gold-light flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-bold whitespace-nowrap transition-transform active:scale-[0.98] md:h-11 md:px-6"
          >
            Inscribirme
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
      className="bg-espresso-2 text-gold-light rounded-foto-b flex size-9 shrink-0 items-center justify-center"
    >
      <span className="font-display italic" style={{ fontWeight: 500, fontSize: 23, lineHeight: 1 }}>
        M
      </span>
    </span>
  );
}
