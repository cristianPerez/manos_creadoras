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
}: {
  valor: Frecuencia;
  alCambiar: (f: Frecuencia) => void;
  /** "oscuro" sobre espresso/cacao; "claro" sobre crema o arena. */
  tono?: "claro" | "oscuro";
  /** "grande" para la sección de precios, donde es la decisión principal. */
  tamano?: "normal" | "grande";
}) {
  const oscuro = tono === "oscuro";
  const grande = tamano === "grande";
  const anual = valor === "anual";

  /* La activa en semibold y la otra en medium (planes, 2026-10-22): con las dos
     en semibold no se veía de un vistazo cuál estaba elegida. */
  const texto = (activo: boolean) =>
    activo
      ? `${oscuro ? "text-cream" : "text-espresso"} font-semibold`
      : `${oscuro ? "text-white/55" : "text-ink-muted"} font-medium`;

  return (
    <div
      role="group"
      aria-label="Elige cómo pagar"
      className={`flex items-center justify-center ${grande ? "gap-4 text-base" : "gap-3 text-sm"}`}
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
        {/*
          ⚠️ EL CARRIL NO SE APAGA (planes, 2026-10-22). Mensual y anual son dos
          opciones válidas, no encendido y apagado: en gris, "mensual" se leía
          como desactivado. Lo que se mueve es la bolita. Café sobre claro —el
          color de las acciones de compra del home; el dorado de antes daba
          ~3,9:1 sobre arena y competía con el botón— y `--gold-pale` sobre
          oscuro, donde el café no se vería. Plano: sin sombra en la bolita.
        */}
        <span
          aria-hidden="true"
          className={`relative block rounded-full ${grande ? "h-9 w-16" : "h-7 w-12"} ${
            oscuro ? "bg-gold-pale" : "bg-cacao"
          }`}
        >
          <span
            className={`absolute top-1 left-1 block rounded-full transition-transform duration-200 ease-out ${
              oscuro ? "bg-espresso" : "bg-ivory"
            } ${grande ? "size-7" : "size-5"} ${anual ? (grande ? "translate-x-7" : "translate-x-5") : ""}`}
          />
        </span>
      </button>

      <button
        type="button"
        onClick={() => alCambiar("anual")}
        className={`flex min-h-11 items-center gap-1.5 px-1 transition-colors [touch-action:manipulation] ${texto(anual)}`}
      >
        Anual
        {/* Espresso sobre claro: el `--gold-pale` de antes casi no se
            distinguía sobre arena. Sobre oscuro se queda en `--gold-pale`. */}
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            oscuro ? "bg-gold-pale text-espresso" : "bg-espresso text-gold-pale"
          }`}
        >
          {grande ? `Ahorra ${ahorroAnualDe().pct}%` : `−${ahorroAnualDe().pct}%`}
        </span>
      </button>
    </div>
  );
}
