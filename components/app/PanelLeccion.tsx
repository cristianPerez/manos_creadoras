"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ListaMateriales } from "@/components/app/ListaMateriales";
import { PasoAPaso } from "@/components/app/PasoAPaso";
import type { BolsoConDetalle } from "@/lib/bolsos-logica";

/**
 * El panel que acompaña al video: los pasos y los materiales, en pestañas.
 *
 * En escritorio va al lado; en móvil, debajo. Las pestañas existen porque las
 * dos listas juntas son demasiado largas para mirarlas mientras tejes — y
 * tejiendo se mira de reojo, no se lee.
 */
export function PanelLeccion({
  bolso,
  ordenActual,
  paso,
}: {
  bolso: BolsoConDetalle;
  ordenActual: number;
  paso: number | null;
}) {
  const [pestana, setPestana] = useState<"pasos" | "materiales">("pasos");

  return (
    <aside className="min-w-0">
      <div className="bg-sand flex rounded-full p-1.5">
        {(
          [
            ["pasos", "Pasos"],
            ["materiales", "Materiales"],
          ] as const
        ).map(([id, texto]) => (
          <button
            key={id}
            type="button"
            aria-pressed={pestana === id}
            onClick={() => setPestana(id)}
            className={`h-11 flex-1 rounded-full text-sm font-semibold transition-colors [touch-action:manipulation] ${
              pestana === id ? "bg-espresso text-white" : "text-ink-body"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {pestana === "pasos" ? (
          <PasoAPaso bolso={bolso} ordenActual={ordenActual} />
        ) : (
          <ListaMateriales materiales={bolso.materiales} />
        )}
      </div>

      {/*
        La tarjeta del Ojo Experto dice lo que YA sabe. No es un adorno: el
        enlace lleva el bolso y el paso, así que la primera respuesta llega con
        contexto en vez de empezar preguntando "¿qué bolso estás haciendo?".
      */}
      <Link
        href={`/app/ojo?bolso=${bolso.slug}${paso ? `&paso=${paso}` : ""}`}
        className="bg-sand mt-5 flex items-start gap-4 rounded-[var(--radius-lg)] p-5"
      >
        <span
          aria-hidden="true"
          className="bg-espresso text-gold-light flex size-10 shrink-0 items-center justify-center rounded-full"
        >
          <Sparkles size={17} />
        </span>
        <span>
          <span className="text-espresso block font-semibold">¿Se te complicó?</span>
          <span className="text-ink-body block text-sm">
            El Ojo Experto ya sabe que estás en {bolso.nombre}
            {paso ? `, paso ${paso}` : ""}.
          </span>
        </span>
      </Link>
    </aside>
  );
}
