import Image from "next/image";
import { EntradaB, PiezaB } from "@/components/home-b/EntradaB";
import { TESTIMONIOS } from "@/lib/landing";

/**
 * "Bolsos de boutique, hechos por alumnas." (v2, 2026-11-05)
 *
 * ⚠️ UN MOSAICO Y UNA SOLA CITA, NO EL CARRUSEL DE CINCO TARJETAS DEL HOME DE
 * SIEMPRE. Las fotos se leen de un vistazo, como se ven en un grupo de
 * Telegram, y la frase es UNA, entera, con su nombre.
 *
 * ⚠️ LA CITA ES LA DE JENIFER ("—¿En cuánto tiempo lo hiciste? —1 día.",
 * `TESTIMONIOS[1]`), no la primera con frase. Es la que responde la objeción
 * de "no tengo tiempo" y la que hace creíble "de boutique": un bolso así en un
 * día. Se elige por posición porque la decisión es de copy, no de datos.
 *
 * ⚠️ QUÉ FOTOS: en el teléfono 3 (una alta y dos apiladas) y en escritorio 4
 * (la cuarta, ancha, abajo a la derecha). La del bolso "en proceso" no entra:
 * el titular dice "de boutique" y una pieza sin terminar lo contradice.
 *
 * ⚠️ SI FALTAN FOTOS O LA CITA, LA SECCIÓN NO SE PINTA. No se inventan.
 */
const ALTA = TESTIMONIOS[0];
const DOS = TESTIMONIOS[1];
const TRES_ESCRITORIO = TESTIMONIOS[2];
const ANCHA = TESTIMONIOS[4];
const CITA = TESTIMONIOS[1];

export function ComunidadB() {
  if (!ALTA?.foto || !DOS?.foto || !ANCHA?.foto || !CITA?.frase) return null;

  const comun = "size-full object-cover";
  /* Las fotos del mosaico entran una a una (`PiezaB`, 80 ms entre cada una):
     se lee como un álbum que se va llenando, no como un bloque que aparece. */

  return (
    <section id="comunidad" data-seccion="comunidad" className="pb-11 lg:pt-10 lg:pb-20">
      <EntradaB className="contenedor-b lg:flex lg:items-center lg:gap-16" escalonado={0.08}>
        <div className="lg:flex-1">
          <p className="eyebrow-b flex items-center gap-3">Comunidad</p>
          <h2 className="titulo-seccion-b mt-2.5 text-balance lg:mt-3">
            Bolsos de <em className="clave">boutique</em>, hechos por alumnas
          </h2>

          {/* Móvil: el mosaico va AQUÍ, entre el titular y la cita (en
              escritorio va en su columna, a la derecha). */}
          <div className="mt-4.5 grid grid-cols-2 grid-rows-[150px_150px] gap-1.5 lg:hidden">
            <PiezaB className="relative row-span-2 overflow-hidden rounded-l-(--radius-foto-b)">
              <Image src={ALTA.foto} alt={`Bolso tejido por ${ALTA.nombre}`} fill loading="lazy" sizes="50vw" className={comun} />
            </PiezaB>
            <PiezaB className="relative overflow-hidden rounded-tr-(--radius-foto-b)">
              <Image src={DOS.foto} alt={`Bolso tejido por ${DOS.nombre}`} fill loading="lazy" sizes="50vw" className={comun} />
            </PiezaB>
            <PiezaB className="relative overflow-hidden rounded-br-(--radius-foto-b)">
              <Image src={ANCHA.foto} alt={`Bolso tejido por ${ANCHA.nombre}`} fill loading="lazy" sizes="50vw" className={comun} />
            </PiezaB>
          </div>

          <figure className="mt-4.5 lg:mt-6.5">
            {/* La comilla de apertura, grande y en el color de apoyo. */}
            <span
              aria-hidden="true"
              className="font-display text-apoyo block h-5.5 text-[44px] leading-[0.6] lg:h-6.5 lg:text-[56px]"
            >
              “
            </span>
            <blockquote className="font-display text-espresso text-[21px] leading-[1.3] text-balance italic lg:text-[26px]">
              {CITA.frase}
            </blockquote>
            <figcaption className="text-ink-body text-nota mt-2 font-bold lg:mt-3 lg:text-sm">
              {CITA.nombre} · alumna en Telegram
            </figcaption>
          </figure>
        </div>

        <div className="hidden lg:grid lg:flex-[1.6] lg:grid-cols-3 lg:grid-rows-[220px_220px] lg:gap-2">
          <PiezaB className="relative row-span-2 overflow-hidden rounded-l-(--radius-foto-b)">
            <Image src={ALTA.foto} alt={`Bolso tejido por ${ALTA.nombre}`} fill loading="lazy" sizes="300px" className={comun} />
          </PiezaB>
          <PiezaB className="relative overflow-hidden">
            <Image src={DOS.foto} alt={`Bolso tejido por ${DOS.nombre}`} fill loading="lazy" sizes="300px" className={comun} />
          </PiezaB>
          <PiezaB className="relative overflow-hidden rounded-tr-(--radius-foto-b)">
            {TRES_ESCRITORIO?.foto && (
              <Image src={TRES_ESCRITORIO.foto} alt={`Bolso tejido por ${TRES_ESCRITORIO.nombre}`} fill loading="lazy" sizes="300px" className={comun} />
            )}
          </PiezaB>
          <PiezaB className="relative col-span-2 overflow-hidden rounded-br-(--radius-foto-b)">
            <Image src={ANCHA.foto} alt={`Bolso tejido por ${ANCHA.nombre}`} fill loading="lazy" sizes="600px" className={comun} />
          </PiezaB>
        </div>
      </EntradaB>
    </section>
  );
}
