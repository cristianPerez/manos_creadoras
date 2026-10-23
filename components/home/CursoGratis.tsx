"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { Entrada } from "@/components/home/Entrada";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";
import Link from "next/link";
import { ReproductorEnSitio } from "@/components/home/ReproductorEnSitio";
import { useRef, useState } from "react";

export type PasoGratis = {
  /** 0 = materiales. Es el orden del video dentro del bolso. */
  orden: number;
  numero: number | null;
  titulo: string;
  descripcion: string;
  /** La URL FIRMADA del embed. La firma el servidor; la clave nunca baja aquí. */
  urlVideo: string | null;
  /** La miniatura que genera Bunny del propio video. */
  poster: string | null;
};

/**
 * El bolso gratis, con su temario.
 *
 * ⚠️ EL TEMARIO MANDA SOBRE LA TARJETA DEL VIDEO. Tocar un paso no solo abre su
 * descripción: cambia lo que dice la franja de abajo de la foto. Es lo que hace
 * que se sienta un reproductor y no dos bloques puestos al lado.
 */
export function CursoGratis({
  slug,
  nombre,
  pasos,
  portadaUrl,
}: {
  slug: string;
  nombre: string;
  pasos: PasoGratis[];
  portadaUrl: string | null;
}) {
  const [abierto, setAbierto] = useState(0);


  /*
   * ⚠️ LA FRANJA DESAPARECE MIENTRAS SE VE EL VIDEO. Es lo que la hace útil y no
   * un estorbo: cuando el video está quieto dice qué paso es y cuánto queda —
   * información que ayuda a decidir—; en cuanto empieza a reproducir, esa misma
   * franja tapa justo las manos de Elizabeth, que es lo único que importa.
   *
   * Vuelve al pausar, al terminar y al cambiar de paso.
   */
  const [viendo, setViendo] = useState(false);

  /*
   * ⚠️ "VER ESTE PASO" ANTES SOLO CAMBIABA QUÉ VIDEO ESTABA CARGADO ARRIBA:
   * dejaba el póster con su botón de play y había que buscarlo y tocarlo otra
   * vez. En móvil era peor, porque el reproductor quedaba fuera de pantalla —
   * se tocaba el botón y aparentemente no pasaba nada.
   *
   * Ahora el botón hace las tres cosas de una (pedido de Cristian,
   * 2026-10-19): carga el paso, ARRANCA el video con sonido y SUBE hasta él.
   *
   * `arranque` es un contador, no un booleano, y esa es la pieza: va dentro de
   * la `key` del reproductor, así que cada pulsación lo REMONTA. Con un
   * booleano, volver a pulsar "Ver este paso" en el mismo paso no haría nada
   * —la key no cambiaría— y es justo lo que alguien hace cuando quiere
   * repetir el video.
   */
  const [arranque, setArranque] = useState(0);
  /* En móvil se ven 3 pasos y "Ver los N pasos" despliega el resto (home a
     color, 2026-10-22): seis filas empujaban la sección a dos pantallas. */
  const [todos, setTodos] = useState(false);
  const cajaVideo = useRef<HTMLDivElement>(null);

  const verPaso = (i: number) => {
    setAbierto(i);
    setViendo(false);
    setArranque((n) => n + 1);
    /*
     * `block: "center"` y no `"start"`: con `start` el video se pega al borde
     * de arriba y la cabecera fija de la página le come la primera franja.
     * `Entrada` ya respeta `prefers-reduced-motion`, pero el scroll es aparte:
     * quien pide menos movimiento salta sin animación.
     */
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cajaVideo.current?.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "center" });
  };
  const paso = pasos[abierto] ?? pasos[0];

  if (!paso) return null;

  const eyebrow = paso.numero === null ? "Antes de empezar" : `Paso ${paso.numero} de ${pasos.length - 1}`;

  return (
    /*
      ⚠️ 48px ARRIBA Y ABAJO, NO 64. El aire de una sección SE SUMA al de la
      siguiente: con `py-16` en las dos quedaban 128px de blanco entre bloques y
      la página se sentía desarmada. Cada sección se veía bien por separado y el
      conjunto no. Si alguna vez hay que dar más aire, se da DENTRO del bloque,
      no entre bloques.
    */
    /* Home a color (2026-10-22): crema, sin el velo arena de antes. */
    <section id="gratis" className="px-5 py-14 md:py-22">
      <Entrada className="mx-auto max-w-[1240px]">
        <header>
          <EyebrowLinea>Curso gratuito</EyebrowLinea>
          <h2 className="titulo-seccion mt-3 text-balance">
            Tu primer bolso completo, <em className="clave">gratis</em>.
          </h2>
          <p className="text-ink-body mt-2">
            {nombre} · materiales + {pasos.length - 1} pasos · sin cuenta
          </p>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] md:gap-8">
          {/*
            ⚠️ ESTO YA NO LLEVA A OTRA PANTALLA. Antes era un enlace a
            `/app/bolsos/…`: para ver el primer video gratis había que salir del
            home, aterrizar en la app y buscar el paso. Tres clics para algo que
            es el gancho de toda la página.

            Ahora el video se reproduce AQUÍ. El temario de al lado cambia qué
            video está cargado, y nadie se mueve de sitio.
          */}
          <div>
            <div
              ref={cajaVideo}
              className="relative overflow-hidden rounded-(--radius-foto) max-md:h-95 md:h-130"
            >
              <ReproductorEnSitio
                /* `key` por paso: al cambiar de paso se monta un reproductor
                   nuevo en vez de reutilizar el anterior, que se quedaría con el
                   video viejo dentro. */
                key={`${paso.orden}-${arranque}`}
                /* `arranque > 0`: al cargar la página el video NO empieza solo.
                   Solo arranca cuando ella ha pulsado "Ver este paso". */
                arrancarAlMontar={arranque > 0}
                onReproduciendo={setViendo}
                url={paso.urlVideo}
                poster={paso.poster}
                respaldo={portadaUrl}
                titulo={`${nombre} · ${paso.titulo}`}
                className="size-full"
              />

              <span
                className={`bg-espresso text-cream pointer-events-none absolute top-5 left-5 rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase transition-opacity duration-300 ${
                  viendo ? "opacity-0" : "opacity-100"
                }`}
              >
                Gratis · sin cuenta
              </span>

              <span
                /* Se desvanece, no se quita de golpe: un bloque que desaparece
                   de un fotograma a otro se lee como un fallo.
                   Home a color: espresso SÓLIDO, sin el vidrio desenfocado. */
                aria-hidden={viendo}
                className={`bg-espresso pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-(--radius-capsula) px-5 py-4 transition-opacity duration-300 ${
                  viendo ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className="min-w-0">
                  <span className="text-gold-light block text-xs font-bold tracking-[0.16em] uppercase">
                    {eyebrow}
                  </span>
                  <span
                    className="font-display text-cream mt-1 block text-balance"
                    style={{ fontWeight: 500, fontSize: "clamp(24px, 2.6vw, 30px)", lineHeight: 1.1 }}
                  >
                    {paso.titulo}
                  </span>
                </span>
                <span className="text-on-dark-muted cifra shrink-0 pb-1 text-sm">
                  {abierto + 1} de {pasos.length}
                </span>
              </span>
            </div>
          </div>

          {/* ── El temario ── */}
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-espresso text-2xl" style={{ fontWeight: 500 }}>
                Temario
              </h3>
              <p className="text-ink-muted text-sm">Toca un paso</p>
            </div>

            {/*
              ⚠️ TEMARIO COMPACTO (home v3, 2026-10-20): filas de 54px (52 en
              móvil), radio 14 (12), número en cuadrito de 30px (28) y 8px entre
              filas (6). Con las filas de 72px de la v2, los seis pasos
              ocupaban más alto que el video de al lado.
            */}
            <ul className="mt-4 flex flex-col gap-2 max-md:gap-1.5">
              {pasos.map((p, i) => {
                const activo = i === abierto;
                const oculto = !todos && i >= 3 && !activo;
                return (
                  <li key={p.orden} className={oculto ? "max-md:hidden" : ""}>
                    {/* Activo en arena (sin borde ni sombra); el resto, marfil
                        con línea. Profundidad por capas, no por sombras. */}
                    <div
                      className={`rounded-fila overflow-hidden border transition-colors ${
                        activo ? "bg-sand border-transparent" : "bg-ivory border-line"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setAbierto(i);
                          setViendo(false);
                        }}
                        aria-expanded={activo}
                        aria-controls={`paso-${p.orden}`}
                        className="flex min-h-[54px] w-full items-center gap-3 px-4 py-2 text-left [touch-action:manipulation] max-md:min-h-[52px]"
                      >
                        <span
                          aria-hidden="true"
                          className={`flex size-[30px] shrink-0 items-center justify-center rounded-sm text-sm font-bold max-md:size-7 ${
                            activo ? "bg-cacao text-gold-pale" : "bg-sand text-cacao"
                          }`}
                        >
                          {p.numero ?? "·"}
                        </span>
                        <span className="text-espresso flex-1 font-semibold">{p.titulo}</span>
                      </button>

                      {activo && (
                        <div id={`paso-${p.orden}`} className="px-4 pb-4">
                          <p className="text-ink-body text-sm">{p.descripcion}</p>
                          <div className="mt-3.5 flex flex-wrap gap-2.5">
                            {/* Antes era un enlace que sacaba del home. Ahora
                                solo marca cuál se reproduce arriba. */}
                            <button
                              type="button"
                              onClick={() => verPaso(i)}
                              className="bg-cacao text-ivory flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-transform active:scale-[0.97]"
                            >
                              <Play size={14} fill="currentColor" aria-hidden="true" />
                              Ver este paso
                            </button>
                            {i < pasos.length - 1 && (
                              <button
                                type="button"
                                onClick={() => verPaso(i + 1)}
                                className="border-line-strong text-espresso flex h-11 items-center rounded-full border px-5 text-sm font-semibold"
                              >
                                Siguiente paso
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {!todos && pasos.length > 3 && (
              <button
                type="button"
                onClick={() => setTodos(true)}
                className="text-gold mx-auto mt-2 flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 md:hidden"
              >
                Ver los {pasos.length - 1} pasos
              </button>
            )}
          </div>
        </div>
      </Entrada>
    </section>
  );
}
