import Image from "next/image";
import { Entrada } from "@/components/home/Entrada";
import { TESTIMONIOS } from "@/lib/landing";

/**
 * "Lo que tejen mis alumnas."
 *
 * ⚠️ UN MOSAICO Y UNA SOLA CITA, NO EL CARRUSEL DE CINCO TARJETAS DEL HOME DE
 * SIEMPRE. El carrusel enseñaba cinco fotos con cinco frases cortadas a cuatro
 * líneas: mucho que mirar y nada que se quede. Aquí las fotos se leen de un
 * vistazo como un mosaico —que es como se ven de verdad en un grupo de
 * Telegram— y la frase es UNA, entera, con su nombre. Una frase que se lee vale
 * más que cinco que se hojean.
 *
 * ⚠️ LAS FOTOS SON REALES Y SE DICE. Lo primero que piensa quien duda es "¿esto
 * es real?", y el pie lo responde sin que haya que preguntarlo.
 *
 * ⚠️ SI `TESTIMONIOS` ESTÁ VACÍA, LA SECCIÓN NO SE PINTA. No se inventan (ver
 * la nota en `lib/landing.ts`).
 */
export function ComunidadB() {
  const conFrase = TESTIMONIOS.find((t) => t.frase);
  const fotos = TESTIMONIOS.filter((t) => t.foto);
  if (fotos.length < 3 || !conFrase) return null;

  /* Móvil: una alta a la izquierda y dos apiladas a la derecha (3 fotos).
     Escritorio: una alta y tres más (4), que es lo que llena la fila. */
  const [alta, dos, tres, cuatro] = fotos;

  /* Los radios SOLO en las esquinas de afuera: por dentro las fotos se tocan y
     el mosaico se lee como una sola pieza, no como tres recortes sueltos. */
  const comun = "size-full object-cover";

  return (
    <section data-seccion="comunidad" className="py-11 lg:py-20">
      <Entrada className="contenedor-b lg:flex lg:items-center lg:gap-16">
        <div className="lg:order-1 lg:flex-1">
          <p className="eyebrow-b flex items-center gap-3">Comunidad</p>
          <h2 className="titulo-seccion-b mt-2.5 text-balance lg:mt-3">
            Lo que tejen mis <em className="clave">alumnas</em>
          </h2>

          <figure className="mt-4.5 lg:mt-7">
            {/* La comilla de apertura, en grande y en el color de apoyo: es el
                gesto editorial que separa una cita de un párrafo cualquiera. */}
            <span
              aria-hidden="true"
              className="font-display text-apoyo block"
              style={{ fontSize: "clamp(44px, 4vw, 56px)", lineHeight: 0.6, height: 24 }}
            >
              “
            </span>
            <blockquote
              className="font-display text-espresso italic text-balance"
              style={{ fontSize: "clamp(21px, 2vw, 25px)", lineHeight: 1.3 }}
            >
              {conFrase.frase}
            </blockquote>
            <figcaption className="text-ink-body text-nota mt-2 font-bold lg:mt-3 lg:text-sm">
              {conFrase.nombre} · alumna en Telegram
            </figcaption>
          </figure>
        </div>

        {/* En móvil va ANTES de la cita en pantalla (order), porque las fotos
            son lo que para el scroll; el texto las explica después. */}
        <div className="mt-4.5 grid grid-cols-2 grid-rows-[150px_150px] gap-1.5 max-lg:order-first max-lg:mt-0 max-lg:mb-5 lg:order-2 lg:mt-0 lg:grid-cols-3 lg:grid-rows-[230px_230px] lg:gap-2 lg:flex-[1.6]">
          <div className="relative row-span-2 overflow-hidden rounded-l-(--radius-foto-b)">
            <Image src={alta.foto} alt={`Bolso tejido por ${alta.nombre}`} fill loading="lazy" sizes="(min-width: 1024px) 300px, 50vw" className={comun} />
          </div>
          <div className="relative overflow-hidden rounded-tr-(--radius-foto-b) lg:rounded-tr-none">
            <Image src={dos.foto} alt={`Bolso tejido por ${dos.nombre}`} fill loading="lazy" sizes="(min-width: 1024px) 300px, 50vw" className={comun} />
          </div>
          {/* La cuarta foto solo en escritorio: en móvil la rejilla es de 2×2 y
              una quinta dejaría un hueco. */}
          <div className="relative overflow-hidden rounded-br-(--radius-foto-b) lg:rounded-tr-(--radius-foto-b) lg:rounded-br-none">
            <Image src={tres.foto} alt={`Bolso tejido por ${tres.nombre}`} fill loading="lazy" sizes="(min-width: 1024px) 300px, 50vw" className={comun} />
          </div>
          {cuatro && (
            <div className="relative hidden overflow-hidden rounded-br-(--radius-foto-b) lg:col-span-2 lg:block">
              <Image src={cuatro.foto} alt={`Bolso tejido por ${cuatro.nombre}`} fill loading="lazy" sizes="(min-width: 1024px) 600px, 50vw" className={comun} />
            </div>
          )}
        </div>
      </Entrada>
    </section>
  );
}
