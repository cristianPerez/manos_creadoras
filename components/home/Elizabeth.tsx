import Image from "next/image";
import { Entrada } from "@/components/home/Entrada";
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
    /* ⚠️ CREMA Y NO ARENA (2026-10-22, pedido de Cristian): el mini Ojo de
       encima pasó a arena y las dos secciones se fundían en un solo bloque sin
       borde. Las tarjetas marfil llevan ahora `border-line`, porque marfil
       sobre crema casi no se distingue. */
    <section id="elizabeth" className="bg-cream px-5 py-12 md:py-20">
      <Entrada className="mx-auto max-w-6xl">
        <div className="grid items-center gap-6 md:grid-cols-12 md:gap-12">
          {/* La foto grande solo en escritorio; en móvil va pequeña junto al
              título, que es como la pide la referencia 19. */}
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-bloque md:col-span-5 md:block">
            <Image
              src={PROFESORA.foto}
              alt={PROFESORA.alt}
              fill
              loading="lazy"
              sizes="(min-width: 768px) 460px, 0px"
              className="object-cover"
            />
          </div>

          <div className="md:col-span-7">
            <p className="eyebrow">Tu profesora</p>

            <div className="mt-4 flex items-center gap-4 md:mt-3 md:block">
              <div className="relative aspect-[4/5] w-30 shrink-0 overflow-hidden rounded-fila md:hidden">
                <Image
                  src={PROFESORA.foto}
                  alt={PROFESORA.alt}
                  fill
                  loading="lazy"
                  sizes="120px"
                  className="object-cover"
                />
              </div>
              <h2
                className="font-display text-espresso text-balance"
                style={{ fontWeight: 500, fontSize: "clamp(34px, 4.2vw, 60px)", lineHeight: 1.04 }}
              >
                Hola, soy{" "}
                <em className="text-gold italic" style={{ fontWeight: 400 }}>
                  {PROFESORA.nombre}.
                </em>
              </h2>
            </div>

            <p className="text-ink-body mt-5 max-w-xl text-base md:text-lg">{PROFESORA.texto}</p>

            <ul className="mt-6 grid grid-cols-3 gap-2 md:max-w-xl md:gap-3">
              {cifras.map((c) => (
                <li key={c.pie} className="bg-ivory border-line rounded-md border p-4">
                  <span
                    className="font-display text-espresso block"
                    style={{ fontWeight: 500, fontSize: 36, lineHeight: 1 }}
                  >
                    {c.valor}
                  </span>
                  <span className="text-ink-body mt-1 block text-sm">
                    <span className="md:hidden">{c.pieCorto}</span>
                    <span className="max-md:hidden">{c.pie}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {TESTIMONIOS.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h3
              className="font-display text-espresso"
              style={{ fontWeight: 500, fontSize: "clamp(28px, 2.6vw, 36px)", lineHeight: 1.1 }}
            >
              Lo que tejen mis alumnas
            </h3>
            {/* De dónde salen, dicho: es lo que separa una foto real de una de
                catálogo, y quien duda lo primero que pregunta es "¿esto es
                real?". */}
            <p className="text-ink-body mt-2 text-sm">
              Fotos reales de la comunidad de alumnas en Telegram.
            </p>
            {/*
              En móvil, carrusel horizontal de tarjetas de 260px: cinco apiladas
              serían media página de scroll. En escritorio, las cinco en fila.

              ⚠️ FOTO 4:5 Y NO 4:3 COMO LA REFERENCIA: las fotos reales son
              verticales (capturas de teléfono) y a 4:3 se cortaban el asa o la
              base del bolso, que es justo lo que se quiere ver.
            */}
            <ul className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible">
              {TESTIMONIOS.map((t) => (
                <li
                  key={t.foto}
                  className="bg-ivory border-line flex w-65 shrink-0 snap-start flex-col rounded-bloque border p-3 md:w-auto"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                    <Image
                      src={t.foto}
                      alt={`Bolso tejido por ${t.nombre}`}
                      fill
                      loading="lazy"
                      sizes="(min-width: 768px) 220px, 260px"
                      className="object-cover"
                    />
                    {t.detalle && (
                      <span className="bg-cream/92 text-espresso absolute top-2 left-2 rounded-sm px-2 py-1 text-xs font-bold">
                        {t.detalle}
                      </span>
                    )}
                  </div>
                  {t.frase && (
                    <blockquote
                      className="font-display text-espresso mt-3 text-lg"
                      style={{ lineHeight: 1.25 }}
                    >
                      {/* Un diálogo ya lleva sus rayas: no se le ponen comillas encima. */}
                      {t.frase.startsWith("—") ? t.frase : `“${t.frase}”`}
                    </blockquote>
                  )}
                  <p className="text-ink-body mt-auto pt-3 text-sm font-semibold">{t.nombre}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Entrada>
    </section>
  );
}
