"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { marcarLeccion } from "@/app/(app)/cursos/acciones";

/**
 * Marca la lección como vista. Es OPTIMISTA: el check cambia al instante y,
 * si el servidor falla, vuelve atrás y lo dice — nunca se queda mintiendo.
 *
 * Terminar una lección es el ÚNICO hito real de esta pantalla: se celebra (shimmer
 * dorado, nivel medio de la ficha) y se ofrece la salida obvia — la siguiente lección —
 * para que la alumna no quede parada sin saber qué sigue.
 */
export function BotonCompletar({
  leccionId,
  completada,
  siguiente,
}: {
  leccionId: string;
  completada: boolean;
  siguiente: { id: string; titulo: string } | null;
}) {
  const [hecha, setHecha] = useState(completada);
  const [celebrar, setCelebrar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  function alternar() {
    if (pendiente) return;
    const proximo = !hecha;
    setHecha(proximo);
    setError(null);
    setCelebrar(proximo);

    empezar(async () => {
      const r = await marcarLeccion(leccionId, proximo);
      if (!r.ok) {
        setHecha(!proximo);
        setCelebrar(false);
        setError(r.error ?? "No pudimos guardar tu avance.");
      }
    });
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={alternar}
        aria-pressed={hecha}
        disabled={pendiente}
        className={`flex h-13 w-full items-center justify-center gap-2 rounded-full font-semibold transition-transform active:scale-[0.98] [touch-action:manipulation] ${
          hecha
            ? "border border-border-strong bg-surface-tertiary text-text-secondary"
            : "text-text-inverse"
        } ${celebrar ? "celebrate" : ""}`}
        style={{
          backgroundImage: hecha
            ? undefined
            : "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
          fontSize: "var(--text-base)",
        }}
      >
        {pendiente ? (
          <Loader2 className="animate-spin" size={17} aria-hidden="true" />
        ) : (
          <Check size={17} strokeWidth={hecha ? 2 : 2.5} aria-hidden="true" />
        )}
        {hecha ? "Vista — tocar para desmarcar" : "Marcar como vista"}
      </button>

      {hecha && siguiente && (
        <Link
          href={`/cursos/${siguiente.id}`}
          className="reveal mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-full font-semibold text-text-inverse transition-transform active:scale-[0.98] [touch-action:manipulation]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
            fontSize: "var(--text-base)",
          }}
        >
          <span className="min-w-0 truncate">Siguiente: {siguiente.titulo}</span>
          <ArrowRight size={17} className="shrink-0" aria-hidden="true" />
        </Link>
      )}

      {error && (
        <p
          className="text-status-error mt-2 text-center"
          style={{ fontSize: "var(--text-xs)" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
