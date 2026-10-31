"use client";

import { ChevronRight, ChevronUp, Package, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { MaterialesDelBolso } from "@/components/app/MaterialesDelBolso";
import type { Material } from "@/lib/bolsos-logica";

/**
 * "Materiales del bolso · N": la fila de acceso rápido de los pasos 1 a 5.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL ESTADO DEL PANEL VIVE AQUÍ, NO EN LA FICHA (2026-10-23)
 * ════════════════════════════════════════════════════════════════════════════
 * Mientras teje, la alumna necesita un dato puntual ("¿cuánto hilo era?") sin
 * perder su sitio en el video. Si el abierto/cerrado viviera en `FichaBolso`,
 * cada apertura volvería a pintar la ficha entera, reproductor incluido. Aquí,
 * hermano del reproductor, abrirlo y cerrarlo no lo toca: el video sigue.
 *
 * Diálogo modal de verdad: el foco entra a la X al abrir y vuelve a la fila al
 * cerrar, Tab no se escapa, Escape / X / fondo cierran, y la página de atrás no
 * hace scroll mientras está abierto.
 */
export function AccesoMateriales({
  materiales,
  medidas,
  irAMateriales,
}: {
  materiales: Material[];
  medidas: [string, number][];
  /** Lleva al paso 0 ("Ver el paso de materiales"). */
  irAMateriales: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const idPanel = `${id}-panel`;
  const idTitulo = `${id}-titulo`;
  const fila = useRef<HTMLButtonElement>(null);
  const cerrarBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const cerrar = () => {
    setAbierto(false);
    fila.current?.focus();
  };

  useEffect(() => {
    if (!abierto) return;
    cerrarBtn.current?.focus();
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setAbierto(false);
        fila.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      /* El foco no se escapa del panel: de la última pieza vuelve a la primera. */
      const enfocables = panel.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (enfocables.length === 0) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = antes;
    };
  }, [abierto]);

  return (
    <>
      <button
        ref={fila}
        type="button"
        onClick={() => setAbierto(true)}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls={idPanel}
        className="bg-ivory border-line hover:bg-sand flex h-14 w-full items-center justify-between gap-3 rounded-bloque border px-5 transition-colors duration-150"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="bg-sand text-cacao flex size-9 shrink-0 items-center justify-center rounded-full"
          >
            <Package size={18} />
          </span>
          <span className="text-espresso truncate font-semibold" style={{ fontSize: 15 }}>
            Materiales del bolso <span className="text-ink-muted cifra font-normal">· {materiales.length}</span>
          </span>
        </span>
        <ChevronRight size={20} className="text-ink-muted shrink-0 max-lg:hidden" aria-hidden="true" />
        <ChevronUp size={20} className="text-ink-muted shrink-0 lg:hidden" aria-hidden="true" />
      </button>

      {/* Fondo: por encima de la cabecera y de la barra de abajo con el Ojo. */}
      <div
        aria-hidden="true"
        onClick={cerrar}
        className={`bg-(--surface-overlay) fixed inset-0 z-(--z-modal) transition-opacity duration-250 ease-(--ease-out) motion-reduce:transition-none ${
          abierto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        ref={panel}
        id={idPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        inert={!abierto}
        className={`bg-cream border-line fixed z-(--z-modal) flex flex-col transition-transform duration-250 ease-(--ease-out) motion-reduce:transition-none
          max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[75dvh] max-lg:rounded-t-(--radius-cajon) max-lg:border-t max-lg:pb-[env(safe-area-inset-bottom)]
          lg:inset-y-0 lg:right-0 lg:w-100 lg:border-l
          ${abierto ? "translate-x-0 translate-y-0" : "max-lg:translate-y-full lg:translate-x-full"}`}
      >
        {/* El tirador de la hoja, en móvil. */}
        <span aria-hidden="true" className="bg-line-strong mx-auto mt-2.5 block h-1 w-10 shrink-0 rounded-full lg:hidden" />

        <div className="flex shrink-0 items-start justify-between gap-4 px-4.5 pt-4 pb-3 lg:px-6 lg:pt-6 lg:pb-4">
          <div>
            <p className="eyebrow">Para este bolso</p>
            <h2
              id={idTitulo}
              className="font-display text-espresso mt-1"
              style={{ fontWeight: 500, fontSize: 28, lineHeight: 1.1 }}
            >
              Lo que <em className="clave">necesitas</em>
            </h2>
          </div>
          <button
            ref={cerrarBtn}
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="bg-ivory border-line text-espresso flex size-11 shrink-0 items-center justify-center rounded-full border"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <MaterialesDelBolso materiales={materiales} medidas={medidas} variante="panel" />

        <div className="border-line shrink-0 border-t px-4.5 py-4 lg:px-6">
          <button
            type="button"
            onClick={() => {
              setAbierto(false);
              irAMateriales();
            }}
            className="border-line-strong text-espresso hover:bg-sand flex h-12 w-full items-center justify-center rounded-full border font-semibold transition-colors"
          >
            Ver el paso de materiales
          </button>
        </div>
      </div>
    </>
  );
}
