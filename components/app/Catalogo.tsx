"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TarjetaBolso } from "@/components/app/TarjetaBolso";
import { estadoDe, siguienteVideo, type Bolso } from "@/lib/bolsos-logica";

type Filtro = "todos" | "en-curso" | "terminados";

/**
 * La rejilla de bolsos con sus filtros.
 *
 * Es de cliente solo por los filtros. Todo lo demás —los datos, el avance, qué
 * está bloqueado— se calcula en el servidor y llega resuelto: así la primera
 * pintada ya trae los 14 bolsos y no hay un parpadeo de carga.
 */
export function Catalogo({
  bolsos,
  continuar,
  tieneAcceso,
}: {
  bolsos: Bolso[];
  continuar: Bolso | null;
  tieneAcceso: boolean;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const cuenta = {
    todos: bolsos.length,
    "en-curso": bolsos.filter((b) => estadoDe(b) === "en-curso").length,
    terminados: bolsos.filter((b) => estadoDe(b) === "terminado").length,
  };

  const visibles = bolsos.filter((b) => {
    if (filtro === "en-curso") return estadoDe(b) === "en-curso";
    if (filtro === "terminados") return estadoDe(b) === "terminado";
    return true;
  });

  return (
    <>
      {continuar && <ContinuaDondeQuedaste bolso={continuar} />}

      <div
        role="group"
        aria-label="Filtrar bolsos"
        className="mt-10 flex flex-wrap gap-2.5"
      >
        {(
          [
            ["todos", "Todos"],
            ["en-curso", "En curso"],
            ["terminados", "Terminados"],
          ] as const
        ).map(([id, texto]) => {
          const activo = filtro === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={activo}
              onClick={() => setFiltro(id)}
              className={`flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors [touch-action:manipulation] ${
                activo ? "bg-espresso text-white" : "border-line text-ink-body border"
              }`}
            >
              {texto}
              <span className={activo ? "text-white/60" : "text-ink-muted"}>{cuenta[id]}</span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        /*
          Un filtro sin resultados NO es un error, así que no se pinta como tal:
          se dice qué pasa y se ofrece la salida, que es volver a "Todos".
        */
        <p className="text-ink-muted mt-10 text-sm">
          Todavía no tienes bolsos aquí.{" "}
          <button
            type="button"
            onClick={() => setFiltro("todos")}
            className="text-gold font-semibold underline"
          >
            Ver los 14
          </button>
          .
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] lg:gap-x-5">
          {visibles.map((b) => (
            <li key={b.id}>
              <TarjetaBolso bolso={b} bloqueado={!b.gratis && !tieneAcceso} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/**
 * La tarjeta de retomar.
 *
 * Es la pieza más importante de la pantalla: quien vuelve no quiere elegir,
 * quiere seguir. Por eso va antes que los filtros y ocupa el ancho entero.
 */
function ContinuaDondeQuedaste({ bolso }: { bolso: Bolso }) {
  const siguiente = siguienteVideo(bolso);
  if (!siguiente) return null;

  return (
    <Link
      href={`/app/bolsos/${bolso.slug}/${siguiente.orden}`}
      className="bg-sand mt-8 grid overflow-hidden rounded-[var(--radius-lg)] sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      <div className="bg-espresso relative flex aspect-[16/10] items-center justify-center sm:aspect-auto">
        <span
          aria-hidden="true"
          className="bg-ivory/90 text-espresso flex size-14 items-center justify-center rounded-full"
        >
          <Play size={20} fill="currentColor" />
        </span>
      </div>

      <div className="p-6 md:p-8">
        <p className="eyebrow">Continúa donde quedaste</p>
        <h2 className="font-display text-espresso mt-2 text-2xl" style={{ fontWeight: 500 }}>
          {bolso.nombre}
        </h2>
        <p className="text-ink-body mt-1 text-sm">{siguiente.etiqueta}</p>

        <div className="mt-5 flex items-center gap-4">
          <span className="bg-line h-1.5 flex-1 overflow-hidden rounded-full">
            <span
              className="bg-gold block h-full rounded-full"
              style={{ width: `${Math.round((bolso.vistos / bolso.videos) * 100)}%` }}
            />
          </span>
          <span className="text-ink-muted shrink-0 text-sm">
            {bolso.vistos} de {bolso.videos} videos
          </span>
        </div>
      </div>
    </Link>
  );
}
