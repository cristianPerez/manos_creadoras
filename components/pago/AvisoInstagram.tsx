"use client";

import { ExternalLink, X } from "lucide-react";
import { useSyncExternalStore } from "react";

const CLAVE = "mc_aviso_ig_cerrado";

/* ¿Lo cerró en esta visita? Se lee de `sessionStorage` como una fuente
   externa: así el home y `/pagar` oyen lo mismo y no hace falta un efecto. */
const oyentes = new Set<() => void>();
let cerradoEnMemoria = false;
function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
}
function leerCerrado(): boolean {
  if (cerradoEnMemoria) return true;
  try {
    return sessionStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}
function cerrarAviso() {
  cerradoEnMemoria = true;
  try {
    sessionStorage.setItem(CLAVE, "1");
  } catch {
    /* Igual se cierra en esta página; solo no se recuerda. */
  }
  oyentes.forEach((avisar) => avisar());
}

/**
 * "Para pagar sin problemas, ábrelo en tu navegador." — solo dentro del
 * navegador de Instagram o Facebook (lo decide el servidor con el user-agent
 * y llega en `visible`).
 *
 * ⚠️ NO BLOQUEA NADA: es una franja arriba, con ✕. Ahí OnePay a veces no abre
 * o no deja copiar el correo, y el 70% del tráfico entra por Instagram; mejor
 * decirlo antes que perder el pago. El cierre se recuerda en esta visita
 * (`sessionStorage`): el home y `/pagar` la comparten, así que quien la cerró
 * en uno no la vuelve a ver en el otro.
 */
export function AvisoInstagram({ visible }: { visible: boolean }) {
  const cerrado = useSyncExternalStore(suscribir, leerCerrado, () => false);
  if (!visible || cerrado) return null;

  return (
    <div role="note" className="bg-sand border-line border-b">
      <div className="mx-auto flex max-w-270 items-start gap-2.5 py-2.5 pr-1 pl-4 lg:px-8">
        <ExternalLink size={18} className="text-ink-body mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-ink-body min-w-0 flex-1 text-sm leading-snug text-pretty">
          <strong className="text-espresso font-bold">Para pagar sin problemas, ábrelo en tu navegador.</strong> Toca ⋯
          arriba a la derecha → Abrir en el navegador externo.
        </p>
        <button
          type="button"
          onClick={cerrarAviso}
          aria-label="Cerrar aviso"
          className="text-ink-body -my-1 flex size-10 shrink-0 items-center justify-center rounded-full active:scale-[0.95]"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
