"use client";

import { useSyncExternalStore } from "react";
import { FRECUENCIA_POR_DEFECTO, type Frecuencia } from "@/lib/planes";

/**
 * Mensual o anual: UNA sola elección para toda la página.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ UN ALMACÉN SUELTO Y NO UN CONTEXT
 * ════════════════════════════════════════════════════════════════════════════
 * En el home conviven DOS toggles: el de la barra de oferta, arriba del todo, y
 * el del bloque de precio, a media página. Cada uno tenía su propio `useState`,
 * así que cambiar uno dejaba al otro en lo contrario: la barra ofrecía el
 * precio anual y, al bajar, la tarjeta enseñaba el mensual. Dos precios
 * distintos a la vez para la misma persona.
 *
 * Lo normal sería un Context, pero su Provider tiene que envolver a los dos
 * componentes, y aquí el padre común es `app/page.tsx`, que es un Server
 * Component y no puede sostener estado. Habría que envolver la página entera en
 * un cliente solo para compartir una palabra.
 *
 * Esto es más pequeño: una variable de módulo y los avisos. `useSyncExternalStore`
 * es justo el hook que React da para leer algo así sin romper la hidratación.
 *
 * ⚠️ `SelectorDePago` NO lo usa a propósito: vive en `/app/plan`, donde es el
 * único toggle de la pantalla. Meterlo aquí le haría heredar lo que alguien
 * eligió en la landing hace tres días, porque esto vive mientras viva la
 * pestaña.
 * ════════════════════════════════════════════════════════════════════════════
 */

/*
 * ⚠️ ARRANCA EN "mensual" Y ESO LO FIJA EL SERVIDOR TAMBIÉN. Si el valor
 * inicial del servidor y el del navegador no coinciden, React avisa de un
 * error de hidratación en lo primero que se ve de la página.
 *
 * Era "anual" hasta el 2026-11-01; lo cambió Cristian. Sale de
 * `FRECUENCIA_POR_DEFECTO` para que no haya dos sitios que puedan discrepar.
 */
let elegida: Frecuencia = FRECUENCIA_POR_DEFECTO;
const oyentes = new Set<() => void>();

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
}

function leer(): Frecuencia {
  return elegida;
}

/** En el HTML del servidor no hay elección previa: siempre el valor de salida. */
function leerEnServidor(): Frecuencia {
  return "anual";
}

export function elegirFrecuencia(f: Frecuencia) {
  if (f === elegida) return;
  elegida = f;
  for (const avisar of oyentes) avisar();
}

/** La elección vigente. Todo el que lo use se mueve a la vez. */
export function useFrecuenciaElegida(): Frecuencia {
  return useSyncExternalStore(suscribir, leer, leerEnServidor);
}
