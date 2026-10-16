"use client";

import { Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AHORRO_ANUAL_PCT,
  GARANTIA,
  INCLUYE,
  NOTA_PAGO,
  notaDelCobro,
  precioPorMes,
  type Frecuencia,
} from "@/lib/planes";

/**
 * El plan, para contratarlo.
 *
 * ⚠️ YA NO SE ELIGE PLAN, SE ELIGE CÓMO PAGARLO. Hasta el 2026-10-13 esta
 * pantalla ofrecía tres niveles; ahora hay uno y lo único que decide la alumna
 * es mes o año. Eso simplifica la decisión justo donde más cuesta tomarla.
 */
export function SelectorDePago({
  enlaces,
  frecuenciaInicial,
  correo,
}: {
  /*
   * ⚠️ LOS ENLACES LLEGAN YA RESUELTOS POR REGIÓN. Esta pantalla NO decide de
   * qué país es nadie: eso se hace en el servidor, que es quien ve la cabecera
   * de Vercel. Aquí solo se pinta lo que toque.
   */
  enlaces: Record<Frecuencia, string | null>;
  frecuenciaInicial: Frecuencia;
  correo: string | null;
}) {
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(frecuenciaInicial);
  const url = enlaces[frecuencia];

  return (
    <div className="mt-10">
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
                {f === "anual" && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      activo ? "bg-gold-light text-espresso" : "bg-gold-light/50 text-ink-body"
                    }`}
                  >
                    Ahorra {AHORRO_ANUAL_PCT}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <section
        className="mt-8 grid gap-8 rounded-[var(--radius-xl)] p-8 text-white md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-10"
        style={{ backgroundImage: "var(--card-destacada)" }}
      >
        <div>
          <h2 className="font-display text-2xl text-balance" style={{ fontWeight: 500 }}>
            Curso completo de bolsos de perlas
          </h2>

          <p className="mt-5 flex items-baseline gap-2">
            <span
              className="font-display text-gold-light"
              style={{ fontWeight: 500, fontSize: "clamp(56px, 8vw, 84px)", lineHeight: 1 }}
            >
              {precioPorMes(frecuencia)}
            </span>
            <span className="text-lg text-white/60">/mes</span>
          </p>
          <p className="mt-2 text-sm text-white/65">{notaDelCobro(frecuencia)}</p>

          {/*
            ⚠️ MIENTRAS NO HAYA PASARELA, EL BOTÓN NO FINGE COBRAR: lleva a
            contacto —donde se explica que el enlace de pago llega por correo— y
            lo DICE antes de que se pulse. Un botón que promete pagar y abre un
            formulario es una sorpresa justo en el momento de más intención.
          */}
          <Link
            href={url ?? "/contacto"}
            className="text-espresso mt-7 flex h-14 items-center justify-center rounded-full font-semibold transition-transform active:scale-[0.98]"
            style={{ backgroundImage: "var(--boton-dorado)" }}
          >
            Quiero el plan {frecuencia === "anual" ? "anual" : "mensual"}
          </Link>

          <p className="mt-3 text-center text-xs text-white/55">
            {url ? NOTA_PAGO : "Te escribimos al correo con el enlace de pago y tu acceso."}
          </p>

          {correo && (
            <p className="mt-2 text-center text-xs text-white/55">
              Tu cuenta: <strong className="font-semibold text-white">{correo}</strong>
            </p>
          )}
        </div>

        <div className="border-t border-white/12 pt-7 md:border-t-0 md:border-l md:pt-0 md:pl-10">
          <p className="text-gold-light text-xs font-bold tracking-[0.18em] uppercase">Incluye</p>
          <ul className="mt-4 flex flex-col gap-3">
            {INCLUYE.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/85">
                <Check size={15} strokeWidth={2.5} className="text-gold-light mt-0.5 shrink-0" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="bg-ivory border-line mt-5 flex items-start gap-4 rounded-[var(--radius-lg)] border p-5">
        <span
          aria-hidden="true"
          className="bg-sand text-gold flex size-10 shrink-0 items-center justify-center rounded-full"
        >
          <ShieldCheck size={19} />
        </span>
        <span>
          <span className="text-espresso block font-semibold">{GARANTIA.titulo}</span>
          <span className="text-ink-body block text-sm">{GARANTIA.texto}</span>
        </span>
      </div>
    </div>
  );
}
