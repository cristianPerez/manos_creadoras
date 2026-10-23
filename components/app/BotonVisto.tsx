"use client";

import { Check } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { marcarVideo } from "@/app/(interna)/app/acciones";

/**
 * "Marcar como visto".
 *
 * Es un interruptor, no un botón de una sola dirección: quien lo marca sin
 * querer tiene que poder deshacerlo. Por eso `aria-pressed` y por eso el texto
 * cambia.
 */
export function BotonVisto({
  bolsoId,
  videoId,
  visto,
}: {
  bolsoId: string;
  videoId: string;
  visto: boolean;
}) {
  const [, empezar] = useTransition();
  const [optimista, cambiar] = useOptimistic(visto, (_: boolean, nuevo: boolean) => nuevo);

  return (
    <button
      type="button"
      aria-pressed={optimista}
      onClick={() =>
        empezar(async () => {
          cambiar(!optimista);
          await marcarVideo(bolsoId, videoId, !optimista);
        })
      }
      /* Plano (app interna, 2026-10-23): con borde mientras falta, arena al
         marcarlo. El dorado en degradado de antes competía con "Siguiente
         paso", que es la acción principal de la ficha. */
      className={`flex h-13 shrink-0 items-center justify-center gap-2 rounded-full px-6 font-semibold transition-colors [touch-action:manipulation] ${
        optimista ? "bg-sand text-espresso" : "border-line-strong text-espresso border"
      }`}
    >
      <Check size={18} strokeWidth={2.5} aria-hidden="true" />
      {optimista ? "Visto" : "Marcar como visto"}
    </button>
  );
}
