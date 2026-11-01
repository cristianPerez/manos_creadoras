"use client";

import { useEffect } from "react";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";

/**
 * El embudo de dentro del home: qué vio, hasta dónde bajó y qué tocó.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ EXISTE (2026-11-01)
 * ════════════════════════════════════════════════════════════════════════════
 * Entre "abrió la página de ventas" y "tocó pagar" no se medía NADA. Se sabía
 * cuánta gente entraba y cuánta llegaba al checkout, pero no por dónde se caían
 * los demás: si se iban en el banner, si llegaban al precio, si bajaban hasta
 * la garantía. Cristian preguntó dónde se atascan antes del pago y la respuesta
 * honesta era que no se podía saber.
 *
 * Tres medidas, un solo componente, cero cambios en las secciones salvo un
 * atributo:
 *
 *   1. `seccion_vista` — cada bloque con `data-seccion` avisa cuando entra en
 *      pantalla. Da el embudo visual: de 100 que entran, cuántos llegan al
 *      precio.
 *   2. `scroll_profundidad` — 25 / 50 / 75 / 100. Sirve cuando alguien se va
 *      sin llegar a ninguna sección medida.
 *   3. `boton_click` — cualquier botón o enlace, con su texto y su sección. Es
 *      la red: un botón que nadie instrumentó aparece igual. Copiado de El
 *      Charcu, donde ya evitó varios puntos ciegos.
 *
 * ⚠️ CADA COSA SE MIDE UNA SOLA VEZ POR VISITA. Sin esto, bajar y volver a
 * subir multiplicaría los números y el embudo daría porcentajes por encima del
 * 100% — un panel que miente de una forma perfectamente creíble.
 *
 * ⚠️ NO MIDE NADA ESCRITO POR LA PERSONA. Del botón se guarda su texto, que lo
 * escribimos nosotros, nunca lo que ella teclea.
 */
export function MedirHome() {
  useEffect(() => {
    const vistas = new Set<string>();

    /* ── 1. Secciones que entran en pantalla ───────────────────────────── */
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const nombre = e.target.getAttribute("data-seccion");
          if (!nombre || vistas.has(nombre)) continue;
          vistas.add(nombre);
          medir(EVENTOS.seccionVista, { seccion: nombre });
        }
      },
      /* 35% visible: con menos, una sección alta cuenta como "vista" cuando
         solo asomó un borde al final de la pantalla. */
      { threshold: 0.35 },
    );
    for (const el of document.querySelectorAll("[data-seccion]")) observador.observe(el);

    /* ── 2. Hasta dónde bajó ───────────────────────────────────────────── */
    const hitos = [25, 50, 75, 100];
    const alcanzados = new Set<number>();
    let pendiente = false;

    const mirarScroll = () => {
      pendiente = false;
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto <= 0) return;
      const pct = Math.min(100, Math.round((window.scrollY / alto) * 100));
      for (const h of hitos) {
        if (pct >= h && !alcanzados.has(h)) {
          alcanzados.add(h);
          medir(EVENTOS.scrollProfundidad, { hasta: h });
        }
      }
    };
    /* El scroll dispara decenas de veces por segundo: sin esto se mediría en
       cada fotograma y se notaría en un Android de gama media. */
    const alScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(mirarScroll);
    };
    window.addEventListener("scroll", alScroll, { passive: true });
    mirarScroll();

    /* ── 3. Botones y enlaces ──────────────────────────────────────────── */
    const alClic = (ev: MouseEvent) => {
      const destino = ev.target;
      if (!(destino instanceof Element)) return;
      const control = destino.closest("button, a");
      if (!control) return;

      const texto = (control.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
      const etiqueta = texto || control.getAttribute("aria-label") || "(sin texto)";
      const seccion = control.closest("[data-seccion]")?.getAttribute("data-seccion") ?? "otra";

      medir(EVENTOS.botonClick, {
        texto: etiqueta,
        seccion,
        destino: control instanceof HTMLAnchorElement ? control.getAttribute("href") ?? "" : "",
      });
    };
    document.addEventListener("click", alClic, { capture: true });

    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", alScroll);
      document.removeEventListener("click", alClic, { capture: true });
    };
  }, []);

  return null;
}
