"use client";

import { ChevronRight, Play } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { Entrada } from "@/components/home/Entrada";
import Link from "next/link";
import { useState } from "react";

export type PasoGratis = {
  /** 0 = materiales. Es el orden del video dentro del bolso. */
  orden: number;
  numero: number | null;
  titulo: string;
  descripcion: string;
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
          {/* ── La tarjeta del video ── */}
          <Link
            href={`/app/bolsos/${slug}/${paso.orden}`}
            className="bg-espresso relative block overflow-hidden rounded-(--radius-foto) max-md:h-95 md:min-h-130"
          >
            {portadaUrl && (
              <Image
                src={portadaUrl}
                alt={`Bolso ${nombre}`}
                fill
                sizes="(min-width: 768px) 620px, 100vw"
                className="object-cover"
              />
            )}

            <span className="bg-gold-light text-espresso absolute top-5 left-5 rounded-full px-4 py-2 text-xs font-bold tracking-wider uppercase">
              Gratis · sin cuenta
            </span>

            <span
              aria-hidden="true"
              className="bg-cream text-espresso absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            >
              <Play size={28} fill="currentColor" />
            </span>

            {/*
              ⚠️ VIDRIO, NO UN BLOQUE NEGRO. La franja tiene que dejar ver la
              foto detrás: un rectángulo opaco encima tapa justo la parte del
              bolso que convence, y convierte una pieza bonita en un banner.
            */}
            <span
              className="absolute inset-x-4 bottom-4 block rounded-[var(--radius-capsula)] border border-white/20 p-5"
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
                  {/* Crece hasta su valor en vez de saltar: es lo que hace que
                      el temario y el video se sientan la misma pieza. */}
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
          </Link>

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
                        onClick={() => setAbierto(i)}
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
                            <Link
                              href={`/app/bolsos/${slug}/${p.orden}`}
                              className="text-espresso flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold"
                              style={{ backgroundImage: "var(--boton-dorado)" }}
                            >
                              <Play size={14} fill="currentColor" aria-hidden="true" />
                              Ver este paso
                            </Link>
                            {i < pasos.length - 1 && (
                              <button
                                type="button"
                                onClick={() => setAbierto(i + 1)}
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
