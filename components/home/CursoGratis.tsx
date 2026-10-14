"use client";

import { ChevronRight, Play } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Entrada } from "@/components/home/Entrada";
import Link from "next/link";
import { ReproductorEnSitio } from "@/components/home/ReproductorEnSitio";
import { useState } from "react";

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
    <section id="gratis" className="bg-sand/40 px-5 py-10 md:py-12">
      <Entrada className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Curso gratuito</p>
            <h2
              className="font-display text-espresso mt-2 text-balance"
              style={{ fontWeight: 500, fontSize: "clamp(32px, 3.6vw, 46px)", lineHeight: 1.08 }}
            >
              Tu primer bolso completo, gratis.
            </h2>
          </div>
          <p className="text-ink-muted text-sm max-md:hidden">
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
            <div className="relative overflow-hidden rounded-(--radius-foto) max-md:h-95 md:h-130">
              <ReproductorEnSitio
                /* `key` por paso: al cambiar de paso se monta un reproductor
                   nuevo en vez de reutilizar el anterior, que se quedaría con el
                   video viejo dentro. */
                key={paso.orden}
                onReproduciendo={setViendo}
                url={paso.urlVideo}
                poster={paso.poster}
                respaldo={portadaUrl}
                titulo={`${nombre} · ${paso.titulo}`}
                className="size-full"
              />

              <span
                className={`bg-gold-light text-espresso pointer-events-none absolute top-5 left-5 rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase transition-opacity duration-300 ${
                  viendo ? "opacity-0" : "opacity-100"
                }`}
              >
                Gratis · sin cuenta
              </span>

              <span
                /* Se desvanece, no se quita de golpe: un bloque que desaparece
                   de un fotograma a otro se lee como un fallo. */
                aria-hidden={viendo}
                className={`pointer-events-none absolute inset-x-4 bottom-4 block rounded-[var(--radius-capsula)] border border-white/20 p-5 transition-opacity duration-300 ${
                  viendo ? "opacity-0" : "opacity-100"
                }`}
                style={{
                  background: "var(--vidrio-fondo)",
                  backdropFilter: "blur(var(--vidrio-desenfoque))",
                }}
              >
                <span className="text-gold-light block text-xs font-bold tracking-[0.16em] uppercase">
                  {eyebrow}
                </span>
                <span
                  className="font-display text-cream mt-1.5 block text-balance"
                  style={{ fontWeight: 500, fontSize: "clamp(26px, 3vw, 34px)", lineHeight: 1.1 }}
                >
                  {paso.titulo}
                </span>

                <span className="mt-4 flex items-center gap-3">
                  <span className="block h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
                    <motion.span
                      className="bg-gold-light block h-full rounded-full"
                      initial={false}
                      animate={{ width: `${((abierto + 1) / pasos.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                  <span className="shrink-0 text-xs text-white/70">
                    {abierto + 1} de {pasos.length}
                  </span>
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

            <ul className="mt-4 flex flex-col gap-2.5">
              {pasos.map((p, i) => {
                const activo = i === abierto;
                const anterior = i < abierto;
                return (
                  <li key={p.orden}>
                    <div
                      className={`overflow-hidden rounded-[var(--radius-lg)] transition-colors ${
                        activo ? "bg-ivory border-gold border-2 shadow-md" : "bg-ivory border-line border"
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
                        className="flex w-full items-center gap-3.5 p-4 text-left [touch-action:manipulation]"
                      >
                        <span
                          aria-hidden="true"
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            anterior || activo ? "bg-gold text-white" : "bg-sand text-ink-body"
                          }`}
                        >
                          {p.numero ?? "·"}
                        </span>
                        <span className="text-espresso flex-1 font-semibold">{p.titulo}</span>
                        <ChevronRight
                          size={17}
                          aria-hidden="true"
                          className={`text-ink-muted shrink-0 transition-transform duration-200 ${activo ? "rotate-90" : ""}`}
                        />
                      </button>

                      {activo && (
                        <div id={`paso-${p.orden}`} className="px-4 pb-4">
                          <p className="text-ink-body text-sm">{p.descripcion}</p>
                          <div className="mt-3.5 flex flex-wrap gap-2.5">
                            {/* Antes era un enlace que sacaba del home. Ahora
                                solo marca cuál se reproduce arriba. */}
                            <button
                              type="button"
                              onClick={() => {
                                setAbierto(i);
                                setViendo(false);
                              }}
                              className="text-espresso flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold"
                              style={{ backgroundImage: "var(--boton-dorado)" }}
                            >
                              <Play size={14} fill="currentColor" aria-hidden="true" />
                              Ver este paso
                            </button>
                            {i < pasos.length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAbierto(i + 1);
                                  setViendo(false);
                                }}
                                className="border-line text-espresso flex h-11 items-center rounded-full border px-5 text-sm font-semibold"
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
          </div>
        </div>
      </Entrada>
    </section>
  );
}
