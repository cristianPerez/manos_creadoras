"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AHORRO_ANUAL_PCT,
  COBRO_ANUAL,
  NOTA_PAGO,
  PLANES,
  precioPorMes,
  type Frecuencia,
  type PlanId,
} from "@/lib/planes";

/**
 * Los planes de pago, para elegir uno.
 *
 * ⚠️ SOLO LOS DE PAGO. Aquí no aparece Aprendiz: quien llega a esta pantalla ya
 * decidió pagar, y ofrecerle el gratis en el último paso es invitarle a no
 * hacerlo. El gratis se ofrece en la landing y en el catálogo, que es donde
 * todavía está decidiendo.
 */
const DE_PAGO = PLANES.filter((p) => p.precioMes.anual !== null);

export function SelectorDePago({
  planInicial,
  cicloInicial,
  correo,
}: {
  planInicial: string | null;
  cicloInicial: Frecuencia;
  correo: string | null;
}) {
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(cicloInicial);
  const [elegido, setElegido] = useState<PlanId>(
    DE_PAGO.some((p) => p.id === planInicial) ? (planInicial as PlanId) : "creadora",
  );

  const plan = DE_PAGO.find((p) => p.id === elegido) ?? DE_PAGO[0];
  const url = plan.checkout[frecuencia];

  return (
    <div className="mt-10">
      {/* Mensual / anual */}
      <div className="flex justify-center">
        <div className="bg-sand inline-flex items-center rounded-full p-1.5">
          {(["anual", "mensual"] as const).map((f) => {
            const activo = frecuencia === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={activo}
                onClick={() => setFrecuencia(f)}
                className={`flex h-11 items-center gap-2.5 rounded-full px-6 font-semibold transition-colors [touch-action:manipulation] ${
                  activo ? "bg-espresso text-white" : "text-ink-body"
                }`}
              >
                {f === "anual" ? "Anual" : "Mensual"}
                {f === "anual" && activo && (
                  <span className="bg-gold-light text-espresso rounded-full px-2.5 py-1 text-xs font-bold">
                    −{AHORRO_ANUAL_PCT}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Los planes */}
      <div
        role="radiogroup"
        aria-label="Elige tu plan"
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        {DE_PAGO.map((p) => {
          const activo = p.id === elegido;
          const mes = p.precioMes[frecuencia];
          const alAno = COBRO_ANUAL[p.id];

          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => setElegido(p.id)}
              className={`bg-ivory rounded-[var(--radius-lg)] p-6 text-left transition-colors [touch-action:manipulation] ${
                activo ? "border-gold border-2" : "border-line border"
              }`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-display text-espresso text-xl" style={{ fontWeight: 500 }}>
                  {p.nombre}
                </span>
                {activo && (
                  <span
                    aria-hidden="true"
                    className="bg-gold flex size-6 shrink-0 items-center justify-center rounded-full text-white"
                  >
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </span>

              <span
                className="font-display text-espresso mt-2 block text-3xl"
                style={{ fontWeight: 500 }}
              >
                {precioPorMes(mes)}
                <span className="text-ink-muted text-sm"> /mes</span>
              </span>

              <span className="text-ink-muted mt-1 block text-sm">
                {frecuencia === "anual" && alAno
                  ? `Se cobra US$${alAno.toFixed(2).replace(".", ",")} una vez al año`
                  : "Se cobra cada mes"}
              </span>

              <ul className="mt-4 flex flex-col gap-2">
                {p.beneficios.map((b) => (
                  <li key={b} className="text-ink-body flex items-start gap-2 text-sm">
                    <Check size={14} strokeWidth={2.5} className="text-gold mt-0.5 shrink-0" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/*
        ⚠️ MIENTRAS NO HAYA PASARELA, EL BOTÓN NO FINGE COBRAR.
        `checkout` está vacío en `lib/planes.ts`, así que lleva a contacto —donde
        se explica que el enlace de pago llega por correo— y lo DICE antes de
        que se pulse. Un botón que promete pagar y abre un formulario es una
        sorpresa justo en el momento de más intención.
      */}
      <Link
        href={url !== "" ? url : "/contacto"}
        className="text-espresso mt-8 flex h-14 items-center justify-center rounded-full font-semibold transition-transform active:scale-[0.98]"
        style={{ backgroundImage: "var(--boton-dorado)" }}
      >
        {url !== "" ? `Pagar ${precioPorMes(plan.precioMes[frecuencia])} al mes` : `Quiero el plan ${plan.nombre}`}
      </Link>

      {url === "" && (
        <p className="text-ink-muted mt-3 text-center text-sm">
          Te escribimos al correo con el enlace de pago y tu acceso.
        </p>
      )}

      {correo && (
        <p className="text-ink-muted mt-2 text-center text-sm">
          Tu cuenta: <strong className="text-espresso font-semibold">{correo}</strong>
        </p>
      )}

      <p className="text-ink-muted mt-6 text-center text-sm">{NOTA_PAGO}</p>
    </div>
  );
}
