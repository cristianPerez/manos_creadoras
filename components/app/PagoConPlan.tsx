"use client";

import { InterruptorPlan } from "@/components/app/InterruptorPlan";
import { EnlaceCompra, type OrigenCompra } from "@/components/home/EnlaceCompra";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { elegirFrecuencia, useFrecuenciaElegida } from "@/lib/frecuencia-elegida";
import { notaDelCobro, precioPorMes, type Frecuencia } from "@/lib/planes";

/**
 * El botón de pagar con su selector anual / mensual (2026-10-21).
 *
 * ⚠️ SUSTITUYE A LOS "CREAR MI CUENTA GRATIS" de la app (catálogo, ficha de un
 * bolso bloqueado y el Ojo cuando se agotan las preguntas). Pedido de Cristian:
 * esos botones llevan a PAGAR, no a registrarse. Anual por defecto; el selector
 * deja cambiar a mensual sin salir de donde está.
 *
 * El selector es el MISMO estado que el del bloque de precio
 * (`lib/frecuencia-elegida.ts`): si elige mensual aquí, todos los demás
 * botones de la página se mueven con él. Dos selectores en desacuerdo en la
 * misma pantalla serían dos precios.
 *
 * ⚠️ SI UN CICLO NO TIENE ENLACE (venta apagada en producción, 2026-10-21) el
 * botón cae a `/pagar`, que lleva a Mi plan y de ahí a Contacto. Nunca a un
 * enlace inventado.
 */
export function PagoConPlan({
  enlaces,
  origen,
  tono = "claro",
  disposicion = "columna",
}: {
  enlaces: Record<Frecuencia, string | null>;
  origen: OrigenCompra;
  /** "oscuro" sobre espresso/cacao; "claro" sobre crema o arena. */
  tono?: "claro" | "oscuro";
  /**
   * "fila": el selector y el botón en una línea, con el precio en el botón
   * (la tarjeta café de Mis bolsos, app interna 2026-10-23).
   */
  disposicion?: "columna" | "fila";
}) {
  const frecuencia = useFrecuenciaElegida();
  const enlace = enlaces[frecuencia];
  const oscuro = tono === "oscuro";

  const elegir = (f: Frecuencia) => {
    if (f === frecuencia) return;
    elegirFrecuencia(f);
    medir(EVENTOS.planToggle, { plan: f });
  };

  if (disposicion === "fila") {
    return (
      <div className="flex flex-wrap items-center gap-6">
        <InterruptorPlan valor={frecuencia} alCambiar={elegir} tono={tono} />
        <EnlaceCompra
          href={enlace ?? `/pagar?ciclo=${frecuencia}`}
          origen={origen}
          plan={frecuencia}
          abrePago={Boolean(enlace)}
          className="bg-cream text-espresso flex h-13 items-center justify-center rounded-full px-8 font-semibold whitespace-nowrap transition-transform active:scale-[0.98]"
        >
          Inscribirme · {precioPorMes(frecuencia)}/mes
        </EnlaceCompra>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <InterruptorPlan valor={frecuencia} alCambiar={elegir} tono={tono} />

      {/* Plano (app interna, 2026-10-23): sin el dorado en degradado. Café
          sobre claro, `--gold-pale` sobre oscuro — el mismo par que el home. */}
      <EnlaceCompra
        href={enlace ?? `/pagar?ciclo=${frecuencia}`}
        origen={origen}
        plan={frecuencia}
        abrePago={Boolean(enlace)}
        className={`flex h-12 items-center justify-center rounded-full px-6 font-semibold transition-transform active:scale-[0.98] ${
          oscuro ? "bg-gold-pale text-espresso" : "bg-cacao text-ivory"
        }`}
      >
        Inscribirme con el plan {frecuencia}
      </EnlaceCompra>

      <p className={`text-center text-xs ${oscuro ? "text-on-dark-muted" : "text-ink-muted"}`}>
        {precioPorMes(frecuencia)}/mes · {notaDelCobro(frecuencia).split(" · ")[0]}
      </p>
    </div>
  );
}
