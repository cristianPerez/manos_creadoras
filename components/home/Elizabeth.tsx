import Image from "next/image";
import { Entrada } from "@/components/home/Entrada";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";
import { PROFESORA, TESTIMONIOS } from "@/lib/landing";

/**
 * "Hola, soy Elizabeth Valencia." y lo que tejen sus alumnas.
 *
 * ⚠️ HASTA LA V3 EL HOME NO ENSEÑABA A LA PROFESORA. Se nombraba en el banner y
 * en el Ojo Experto ("con las fichas de Elizabeth"), pero nunca se veía su cara.
 * En un curso de oficio se compra a la persona que enseña: es la primera
 * objeción de la ficha de avatar ("¿y esta quién es?").
 *
 * Los testimonios NO se pintan mientras `TESTIMONIOS` esté vacía. Ver la nota en
 * `lib/landing.ts`: no se inventan.
 */
export function Elizabeth({ bolsos, videos }: { bolsos: number; videos: number }) {
  const cifras = [
    { valor: bolsos, pie: "bolsos", pieCorto: "bolsos" },
    { valor: videos, pie: "videos paso a paso", pieCorto: "videos" },
    { valor: 7, pie: "días de garantía", pieCorto: "días de garantía" },
  ];

  return (
    <>
      {/*
        ⚠️ HOME A COLOR (2026-10-22): LA BIO VA EN ESPRESSO. El 22-oct había
        pasado a crema para separarse del Ojo en arena; con el mapa de color
        nuevo, el espresso hace esa separación mejor y le da a la profesora el
        peso de una sección propia. Las alumnas van aparte, en crema.
      */}
      <section id="elizabeth" className="bg-espresso sobre-oscuro grain-oscuro px-5 py-14 md:py-22">
        <Entrada className="mx-auto max-w-[1240px]">
          <div className="grid items-center gap-8 md:grid-cols-12 md:gap-16">
            <div className="relative aspect-square overflow-hidden rounded-(--radius-foto) max-md:rounded-bloque md:col-span-5 md:aspect-[4/5]">
              <Image
                src={PROFESORA.foto}
                alt={PROFESORA.alt}
                fill
                loading="lazy"
                sizes="(min-width: 768px) 460px, 100vw"
                className="object-cover"
              />
            </div>

            <div className="md:col-span-7">
              <EyebrowLinea>Tu profesora</EyebrowLinea>
              <h2 className="titulo-seccion mt-3 text-balance">
                Hola, soy <em className="clave">{PROFESORA.nombre}.</em>
              </h2>

              <p className="text-on-dark-muted mt-5 max-w-xl text-base md:text-lg">
                {PROFESORA.texto}
              </p>

              {/* Las cifras en tarjetas espresso-2: la segunda capa sobre el
                  fondo, sin sombras. */}
              <ul className="mt-7 grid grid-cols-3 gap-2 md:gap-3">
                {cifras.map((c) => (
                  <li
                    key={c.pie}
                    className="bg-espresso-2 border-espresso-line rounded-[18px] border p-4 md:p-5"
                  >
                    <span
                      className="font-display text-gold-pale block"
                      style={{ fontWeight: 500, fontSize: "clamp(36px, 3.4vw, 48px)", lineHeight: 1 }}
                    >
                      {c.valor}
                    </span>
                    <span className="text-on-dark-muted mt-2 block text-sm">
                      <span className="md:hidden">{c.pieCorto}</span>
                      <span className="max-md:hidden">{c.pie}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Entrada>
      </section>

      {TESTIMONIOS.length > 0 && (
        /* Separada de la bio (home a color): su propio fondo crema y su aire. */
        <section aria-labelledby="alumnas" className="px-5 py-14 md:py-22">
          <Entrada className="mx-auto max-w-[1240px]">
            <header className="text-center">
              <EyebrowLinea centrado>Comunidad</EyebrowLinea>
              <h2 id="alumnas" className="titulo-seccion mt-3">
                Lo que tejen mis <em className="clave">alumnas</em>
              </h2>
              {/* De dónde salen, dicho: es lo que separa una foto real de una
                  de catálogo, y quien duda lo primero que pregunta es "¿esto
                  es real?". */}
              <p className="text-ink-body mt-2">Fotos reales de la comunidad de alumnas en Telegram.</p>
            </header>
            {/*
              En móvil y tableta, carrusel horizontal de tarjetas de 260px: cinco
              apiladas serían media página de scroll. Desde 1024px, las CINCO en
              una fila (2026-10-22): a tres por fila cada foto medía ~550×690 y
              dos alumnas quedaban relegadas a una segunda fila.

              ⚠️ FOTO 4:5 Y NO 4:3 COMO LA REFERENCIA: las fotos reales son
              verticales (capturas de teléfono) y a 4:3 se cortaban el asa o la
              base del bolso, que es justo lo que se quiere ver.
            */}
            <ul className="sin-barra -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mt-10 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0">
              {TESTIMONIOS.map((t) => (
                <li
                  key={t.foto}
                  className="bg-ivory border-line flex w-65 shrink-0 snap-start flex-col overflow-hidden rounded-lg border lg:w-auto"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={t.foto}
                      alt={`Bolso tejido por ${t.nombre}`}
                      fill
                      loading="lazy"
                      sizes="(min-width: 1024px) 240px, 260px"
                      className="object-cover"
                    />
                    {t.detalle && (
                      <span className="bg-cream/92 text-espresso absolute top-2.5 left-2.5 rounded-sm px-2 py-1 text-xs font-bold">
                        {t.detalle}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    {t.frase && (
                      /* 17px y 4 líneas como máximo: las cinco tarjetas
                         quedan del mismo alto, y una frase larga se corta
                         con "…" en vez de estirar su tarjeta. */
                      <blockquote
                        className="font-display text-espresso line-clamp-4 italic"
                        style={{ fontSize: 17, lineHeight: 1.3 }}
                      >
                        {/* Un diálogo ya lleva sus rayas: no se le ponen comillas encima. */}
                        {t.frase.startsWith("—") ? t.frase : `“${t.frase}”`}
                      </blockquote>
                    )}
                    <p className="text-gold mt-auto pt-3 text-xs font-semibold">{t.nombre}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Entrada>
        </section>
      )}
    </>
  );
}
