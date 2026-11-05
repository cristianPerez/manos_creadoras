import Image from "next/image";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";

/**
 * La edición navideña del home B v2 (2026-11-05): UNA TARJETA COMPACTA.
 *
 * ⚠️ YA NO ES UNA BANDA OSCURA. Con la profesora justo encima (oscura) y el
 * cierre abajo, eran tres bloques espresso y el ritmo de la página se volvía
 * pesado; además la Navidad es un EXTRA del plan, no un argumento principal, y
 * no merece una sección entera. Una tarjeta elevada que lleva al precio.
 *
 * ⚠️ SIN "DICIEMBRE" EN EL TEXTO. En cuanto pase la fecha, "diciembre" deja la
 * página vieja; "incluidos en tu plan" es verdad todo el año.
 *
 * Toda la tarjeta es el enlace (un solo destino, un solo toque): "Ver planes →"
 * es la pista visible de que se toca.
 */
export function NavidadB() {
  return (
    <section id="navidad" data-seccion="navidad" className="pt-9 pb-2 lg:pt-16 lg:pb-0">
      <Entrada className="contenedor-b lg:max-w-215">
        <EnlaceCompra
          href="#precio"
          origen="navidad"
          plan={FRECUENCIA_POR_DEFECTO}
          className="elevado-b rounded-tarjeta-b flex items-center gap-3.5 p-2.5 transition-transform active:scale-[0.99] lg:gap-6 lg:p-3.5 lg:pr-7"
        >
          <Image
            src="/images/navidad-accesorios.webp"
            alt="Adornos navideños tejidos en perla y cristal"
            width={320}
            height={280}
            loading="lazy"
            sizes="(min-width: 1024px) 160px, 108px"
            className="rounded-foto-b size-27 shrink-0 object-cover lg:h-35 lg:w-40"
          />
          <span className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-1.5">
            <span className="text-ink-body text-micro font-bold tracking-[0.16em] uppercase">
              Edición navideña
            </span>
            <span className="font-display text-espresso text-[23px] leading-[1.05] font-semibold lg:text-[32px]">
              Accesorios <em className="clave">navideños</em>
              <span className="max-lg:hidden"> en cuentas</span>
            </span>
            <span className="text-ink-body text-nota leading-snug lg:text-[15px]">
              12 adornos en video · incluidos en tu plan
            </span>
          </span>
          <span className="text-apoyo shrink-0 text-[15px] font-bold max-lg:hidden">
            Ver planes →
          </span>
        </EnlaceCompra>
      </Entrada>
    </section>
  );
}
