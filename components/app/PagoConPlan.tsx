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
}: {
  enlaces: Record<Frecuencia, string | null>;
  origen: OrigenCompra;
  /** "oscuro" sobre espresso/cacao; "claro" sobre crema o arena. */
  tono?: "claro" | "oscuro";
}) {
  const frecuencia = useFrecuenciaElegida();
  const enlace = enlaces[frecuencia];
  const oscuro = tono === "oscuro";

  const elegir = (f: Frecuencia) => {
    if (f === frecuencia) return;
    elegirFrecuencia(f);
    medir(EVENTOS.planToggle, { plan: f });
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <InterruptorPlan valor={frecuencia} alCambiar={elegir} tono={tono} />

      <EnlaceCompra
        href={enlace ?? `/pagar?ciclo=${frecuencia}`}
        origen={origen}
        plan={frecuencia}
        abrePago={Boolean(enlace)}
        className="text-espresso flex h-12 items-center justify-center rounded-full bg-(image:--boton-dorado) px-6 font-semibold transition-transform active:scale-[0.98]"
      >
        Inscribirme con el plan {frecuencia}
      </EnlaceCompra>

      <p className={`text-center text-xs ${oscuro ? "text-white/65" : "text-ink-muted"}`}>
        {precioPorMes(frecuencia)}/mes · {notaDelCobro(frecuencia).split(" · ")[0]}
      </p>
    </div>
  );
}
