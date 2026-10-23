"use client";

import { ahorroAnualDe, type Frecuencia } from "@/lib/planes";

/**
 * El interruptor "Mensual ⟷ Anual". UNO SOLO para toda la app (2026-10-21).
 *
 * ⚠️ PARECE UN INTERRUPTOR, NO DOS BOTONES (pedido de Cristian). Las versiones
 * anteriores eran píldoras partidas en dos —en el precio del home, en Mi plan y
 * junto a cada botón de pagar— y se leían como otro botón grande al lado del de
 * pagar. Un switch se reconoce como "elegir una opción", no como "hacer algo".
 *
 * Encendido = anual (la opción por defecto y la que ahorra). Se puede tocar el
 * switch o cualquiera de las dos palabras, y el renglón mide ≥44px de alto.
 *
 * No guarda estado: quien lo usa decide de dónde sale el valor — el estado
 * compartido de la página (`lib/frecuencia-elegida.ts`) o uno local.
 */
export function InterruptorPlan({
  valor,
  alCambiar,
  tono = "claro",
  tamano = "normal",
  variante = "interruptor",
}: {
  valor: Frecuencia;
  alCambiar: (f: Frecuencia) => void;
  /** "oscuro" sobre espresso/cacao; "claro" sobre crema o arena. */
  tono?: "claro" | "oscuro";
  /** "grande" para la sección de precios, donde es la decisión principal. */
  tamano?: "normal" | "grande";
  /**
   * "segmentado": píldora de dos opciones, con la elegida en espresso. SOLO la
   * usa el precio del home a color (2026-10-22, su referencia lo pide así).
   * En el resto de la app sigue el interruptor, que es lo que pidió Cristian
   * el 21-oct para que no pareciera otro botón al lado del de pagar.
   */
  variante?: "interruptor" | "segmentado";
}) {
  const oscuro = tono === "oscuro";
  const grande = tamano === "grande";
  const anual = valor === "anual";

  if (variante === "segmentado") {
    const opcion = (activa: boolean) =>
      `flex h-11 items-center gap-2 rounded-full px-5 text-base transition-colors duration-200 [touch-action:manipulation] ${
        activa ? "bg-espresso text-cream font-semibold" : "text-ink-body hover:text-espresso"
      }`;
    return (
      <div
        role="group"
        aria-label="Elige cómo pagar"
        className="bg-ivory border-line mx-auto flex w-max items-center gap-1 rounded-full border p-1"
      >
        <button type="button" aria-pressed={!anual} onClick={() => alCambiar("mensual")} className={opcion(!anual)}>
          Mensual
        </button>
        <button type="button" aria-pressed={anual} onClick={() => alCambiar("anual")} className={opcion(anual)}>
          Anual
          <span className="bg-gold-pale text-espresso rounded-full px-2 py-0.5 text-xs font-bold">
            Ahorra {ahorroAnualDe().pct}%
          </span>
        </button>
      </div>
    );
  }

  const texto = (activo: boolean) =>
    activo ? (oscuro ? "text-cream" : "text-espresso") : oscuro ? "text-white/55" : "text-ink-muted";

  return (
    <div
      role="group"
      aria-label="Elige cómo pagar"
      className={`flex items-center justify-center font-semibold ${grande ? "gap-4 text-base" : "gap-3 text-sm"}`}
    >
      <button
        type="button"
        onClick={() => alCambiar("mensual")}
        className={`min-h-11 px-1 transition-colors [touch-action:manipulation] ${texto(!anual)}`}
      >
        Mensual
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={anual}
        aria-label="Pagar anual"
        onClick={() => alCambiar(anual ? "mensual" : "anual")}
        className="flex min-h-11 items-center [touch-action:manipulation]"
      >
        <span
          aria-hidden="true"
          className={`relative block rounded-full transition-colors duration-200 ${
            grande ? "h-8 w-14" : "h-7 w-12"
          } ${anual ? "bg-gold" : oscuro ? "bg-white/25" : "bg-line-strong"}`}
        >
          <span
            className={`bg-cream absolute top-1 left-1 block rounded-full shadow-sm transition-transform duration-200 ease-out ${
              grande ? "size-6" : "size-5"
            } ${anual ? (grande ? "translate-x-6" : "translate-x-5") : ""}`}
          />
        </span>
      </button>

      <button
        type="button"
        onClick={() => alCambiar("anual")}
        className={`flex min-h-11 items-center gap-1.5 px-1 transition-colors [touch-action:manipulation] ${texto(anual)}`}
      >
        Anual
        <span className="bg-gold-pale text-espresso rounded-full px-2 py-0.5 text-xs font-bold">
          {grande ? `Ahorra ${ahorroAnualDe().pct}%` : `−${ahorroAnualDe().pct}%`}
        </span>
      </button>
    </div>
  );
}
