"use client";

import { useEffect } from "react";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";

/**
 * Los botones y enlaces que se tocan DENTRO de la app (2026-11-04).
 *
 * ⚠️ HASTA HOY `boton_click` SOLO EXISTÍA EN EL HOME (`MedirHome`). Con la
 * primera alumna de pago se vio el agujero: Mixpanel tenía 226 clics suyos
 * dentro de la app y ninguno decía QUÉ tocó — solo el autocapture, sin texto.
 * Esto es la misma red de seguridad que el home: un botón que nadie
 * instrumentó a mano igual aparece, con su texto y la página donde estaba.
 *
 * ⚠️ NO MANDA LO QUE ELLA ESCRIBE. Solo el texto de botones y enlaces, que es
 * nuestro. Un `<textarea>` o un `<input>` no son `button, a`, así que su
 * contenido nunca sale de aquí.
 */
export function MedirApp() {
  useEffect(() => {
    const alClic = (ev: MouseEvent) => {
      const destino = ev.target;
      if (!(destino instanceof Element)) return;
      const control = destino.closest("button, a");
      if (!control) return;

      const texto = (control.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
      medir(EVENTOS.botonClick, {
        texto: texto || control.getAttribute("aria-label") || "(sin texto)",
        pagina: window.location.pathname,
        seccion: control.closest("[data-seccion]")?.getAttribute("data-seccion") ?? undefined,
        destino: control instanceof HTMLAnchorElement ? (control.getAttribute("href") ?? "") : "",
      });
    };
    document.addEventListener("click", alClic, { capture: true });
    return () => document.removeEventListener("click", alClic, { capture: true });
  }, []);

  return null;
}
