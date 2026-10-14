"use client";

import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { Capsula } from "@/lib/capsulas";

/**
 * El visor de cápsulas: modal en escritorio, pantalla completa en móvil.
 *
 * ⚠️ UN MODAL MAL HECHO ES UNA TRAMPA. Se abre encima de todo y se come el
 * teclado, así que aquí van las tres cosas que lo hacen salible: Escape cierra,
 * el foco queda ATRAPADO dentro (si no, tabular se escapa a la página de atrás
 * y quien navega con teclado se pierde) y al cerrar el foco VUELVE al botón que
 * lo abrió, no al principio de la página.
 */
export function StoryViewer({
  capsulas,
  indice,
  vistas,
  irA,
  marcarVista,
  cerrar,
}: {
  capsulas: Capsula[];
  indice: number;
  vistas: string[];
  irA: (i: number) => void;
  marcarVista: (id: string) => void;
  cerrar: () => void;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const abridor = useRef<Element | null>(null);
  const capsula = capsulas[indice];

  const avanzar = useCallback(() => {
    // Después de la última se cierra: seguir dando vueltas no deja salir.
    if (indice >= capsulas.length - 1) cerrar();
    else irA(indice + 1);
  }, [indice, capsulas.length, irA, cerrar]);

  /* Se marca vista al ABRIRLA, no al terminar el video: son cápsulas de menos
     de un minuto y lo que la alumna recuerda es "esa ya la vi". */
  useEffect(() => {
    if (capsula) marcarVista(capsula.id);
  }, [capsula, marcarVista]);

  useEffect(() => {
    abridor.current = document.activeElement;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    caja.current?.focus();

    return () => {
      document.body.style.overflow = previo;
      (abridor.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  function alTeclado(e: React.KeyboardEvent) {
    if (e.key === "Escape") return cerrar();
    if (e.key === "ArrowRight") return avanzar();
    if (e.key === "ArrowLeft") return irA(Math.max(0, indice - 1));

    // La trampa de foco: Tab en el último vuelve al primero, y al revés.
    if (e.key === "Tab") {
      const focos = caja.current?.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focos?.length) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
  }

  if (!capsula) return null;

  return (
    <div
      className="bg-espresso/86 fixed inset-0 z-(--z-modal) flex items-center justify-center backdrop-blur-sm"
      onKeyDown={alTeclado}
    >
      {/* La cortina: cerrar tocando fuera es lo que todo el mundo intenta primero. */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={cerrar}
        className="absolute inset-0 cursor-default"
      />

      <Flecha lado="izquierda" onClick={() => irA(Math.max(0, indice - 1))} oculta={indice === 0} />
      <Flecha lado="derecha" onClick={avanzar} oculta={false} />

      <div
        ref={caja}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Cápsula ${indice + 1} de ${capsulas.length}: ${capsula.titulo}`}
        className="bg-espresso relative flex w-full flex-col overflow-hidden outline-none max-md:h-dvh md:h-[88vh] md:max-h-(--visor-alto) md:w-(--visor-ancho) md:rounded-(--radius-foto)"
      >
        <div className="absolute inset-0">
          {capsula.portadaUrl && (
            <Image
              src={capsula.portadaUrl}
              alt=""
              fill
              sizes="380px"
              priority
              className="object-cover"
            />
          )}
          {/* ⚠️ El texto blanco NUNCA va directo sobre la foto: estos dos
              degradados son los que lo hacen legible con cualquier portada. */}
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(42,31,25,.62) 0%, rgba(42,31,25,0) 26%, rgba(42,31,25,0) 52%, rgba(42,31,25,.88) 100%)",
            }}
          />
        </div>

        {/* En móvil: el tercio izquierdo retrocede, el resto avanza. */}
        <div className="absolute inset-0 flex md:hidden">
          <button type="button" aria-label="Anterior" className="w-1/3" onClick={() => irA(Math.max(0, indice - 1))} />
          <button type="button" aria-label="Siguiente" className="w-2/3" onClick={avanzar} />
        </div>

        <header className="relative z-10 p-4">
          <div className="flex gap-1.5" aria-hidden="true">
            {capsulas.map((c, n) => (
              <span
                key={c.id}
                className={`h-1 flex-1 rounded-full ${
                  n === indice || vistas.includes(c.id) ? "bg-cream" : "bg-cream/35"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="bg-cream flex size-9 shrink-0 items-center justify-center rounded-full"
            >
              <span className="font-display text-espresso text-base italic" style={{ fontWeight: 500, lineHeight: 1 }}>
                M
              </span>
            </span>
            <span className="flex-1 text-sm font-semibold text-white">
              Cápsula {indice + 1} de {capsulas.length}
            </span>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="flex size-11 items-center justify-center text-white [touch-action:manipulation]"
            >
              <X size={22} />
            </button>
          </div>
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center">
          {/*
            ⚠️ TODAVÍA NO HAY VIDEOS DE CÁPSULAS. Cuando `videoId` llegue, aquí
            va el reproductor 9:16. Mientras tanto NO se pinta un play que no
            reproduce nada: se dice lo que pasa. Un botón que no responde gasta
            más confianza que un aviso honesto.
          */}
          {capsula.videoId ? (
            <span
              aria-hidden="true"
              className="bg-cream text-espresso flex size-20 items-center justify-center rounded-full"
            >
              <Play size={28} fill="currentColor" />
            </span>
          ) : (
            <p className="bg-espresso/55 mx-6 rounded-[var(--radius-lg)] px-5 py-4 text-center text-sm text-white/80 backdrop-blur-sm">
              Estamos grabando este video. Mientras tanto, el bolso gratis ya está completo.
            </p>
          )}
        </div>

        <footer className="relative z-10 p-5">
          <h3
            className="font-display text-cream text-balance"
            style={{ fontWeight: 500, fontSize: "30px", lineHeight: 1.1 }}
          >
            {capsula.titulo}
          </h3>
          <p className="mt-1.5 text-sm text-white/75">{capsula.subtitulo}</p>

          <a
            href="#gratis"
            onClick={cerrar}
            className="bg-cream text-espresso mt-5 flex h-13 items-center justify-center rounded-full font-semibold"
          >
            Seguir con el bolso gratis
          </a>
        </footer>
      </div>
    </div>
  );
}

function Flecha({
  lado,
  onClick,
  oculta,
}: {
  lado: "izquierda" | "derecha";
  onClick: () => void;
  oculta: boolean;
}) {
  const Icono = lado === "izquierda" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={lado === "izquierda" ? "Cápsula anterior" : "Cápsula siguiente"}
      className={`absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-sm transition-colors hover:bg-white/20 md:flex ${
        lado === "izquierda"
          ? "left-[calc(50%-(var(--visor-ancho)/2)-56px)]"
          : "right-[calc(50%-(var(--visor-ancho)/2)-56px)]"
      } ${oculta ? "invisible" : ""}`}
    >
      <Icono size={22} />
    </button>
  );
}
