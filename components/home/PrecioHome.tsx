"use client";

import { Check, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { PrecioQueCuenta } from "@/components/app/PrecioQueCuenta";
import { Entrada } from "@/components/home/Entrada";
import { elegirFrecuencia, useFrecuenciaElegida } from "@/lib/frecuencia-elegida";
import {
  ahorroAnualDe,
  precioPorMesDe,
  GARANTIA,
  INCLUYE,
  NOTA_PAGO,
  notaDelCobro,
  type Frecuencia,
} from "@/lib/planes";

/**
 * El precio, en el home.
 *
 * ⚠️ EL PRECIO SE ENSEÑA SIEMPRE POR MES, pague como pague. Es lo único que se
 * puede comparar de un vistazo: "US$250 al año" frente a "US$25 al mes" obliga a
 * dividir mentalmente, y quien tiene que hacer cuentas para entender una oferta
 * normalmente no la acepta. El cobro real va debajo, en letra pequeña pero
 * dicho con todas las palabras.
 *
 * Las cifras salen de `lib/planes.ts`: ni una escrita en el JSX.
 */
export function PrecioHome({
  enlaces,
  enOferta,
}: {
  enlaces: Record<Frecuencia, string | null>;
  /*
   * ⚠️ SI ESTA PERSONA SIGUE DENTRO DE SUS 24h DE OFERTA. Llega como dato y no
   * se calcula aquí: depende de una cookie que solo el servidor lee, y además
   * decide el PRECIO — tenerlo en dos sitios es tener dos precios.
   */
  enOferta: boolean;
}) {
  // Compartida con el otro toggle de la página: ver `lib/frecuencia-elegida.ts`.
  const frecuencia = useFrecuenciaElegida();
  const quieto = useReducedMotion();

  return (
    <section id="precio" className="px-5 py-10 md:py-12">
      <Entrada className="mx-auto max-w-4xl">
        <header className="text-center">
          <p className="eyebrow">Inscripción</p>
          <h2
            className="font-display text-espresso mt-2 text-balance"
            style={{ fontWeight: 500, fontSize: "clamp(32px, 3.6vw, 46px)", lineHeight: 1.08 }}
          >
            Un solo plan, todo incluido.
          </h2>
          <p className="text-ink-body mt-3">Paga cada mes o ahorra pagando el año.</p>
        </header>

        <div className="mt-8 flex justify-center">
          <div className="bg-sand inline-flex items-center rounded-full p-1.5">
            {(["anual", "mensual"] as const).map((f) => {
              const activo = frecuencia === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => elegirFrecuencia(f)}
                  className={`relative flex h-11 items-center gap-2.5 rounded-full px-6 font-semibold [touch-action:manipulation] ${
                    activo ? "text-white" : "text-ink-body"
                  }`}
                >
                  {/*
                    La píldora oscura es UN SOLO elemento que se desliza entre las
                    dos opciones (`layoutId`), no dos fondos que se encienden y
                    apagan. Es lo que hace que el cambio se lea como un gesto.
                  */}
                  {activo && (
                    <motion.span
                      layoutId="pildora-precio"
                      className="bg-espresso absolute inset-0 rounded-full"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="relative">{f === "anual" ? "Anual" : "Mensual"}</span>
                  {f === "anual" && (
                    <span
                      className={`relative rounded-full px-2.5 py-1 text-xs font-bold ${
                        activo ? "bg-gold-light text-espresso" : "bg-gold-light/55 text-ink-body"
                      }`}
                    >
                      Ahorra {ahorroAnualDe(enOferta).pct}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="mt-8 grid gap-8 rounded-[var(--radius-xl)] p-8 text-white md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-10"
          style={{ backgroundImage: "var(--card-destacada)" }}
        >
          <div>
            <h3 className="font-display text-xl text-balance" style={{ fontWeight: 500 }}>
              Curso completo de bolsos de perlas
            </h3>

            <p className="mt-4 flex items-baseline gap-2">
              <span
                className="font-display text-gold-pale"
                style={{ fontWeight: 500, fontSize: "clamp(56px, 8vw, 84px)", lineHeight: 1 }}
              >
                {/*
                  ⚠️ `PrecioQueCuenta` Y NO `NumeroQueCuenta`, y la diferencia
                  importa: aquel cuenta cuando el número ENTRA EN PANTALLA
                  (`useInView` + `once`), que vale para el home pero no aquí.
                  Este número ya está a la vista y lo que cambia es el ciclo
                  elegido — con el otro, al cambiar se quedaba en **US$0,00**,
                  que en un bloque de precio es lo más parecido a un error.
                  El mismo fallo apareció antes en la pantalla de planes.
                */}
                <PrecioQueCuenta
                  hasta={precioPorMesDe(enOferta)[frecuencia]}
                  quieto={Boolean(quieto)}
                />
              </span>
              <span className="text-lg text-white/60">/mes</span>
            </p>
            <p className="mt-2 text-sm text-white/65">{notaDelCobro(frecuencia, enOferta)}</p>

            {/*
              ⚠️ SI NO HAY ENLACE PARA ESE CICLO, NO SE FINGE QUE SE PUEDE PAGAR.
              Hoy el plan ANUAL todavía no existe en OnePay: ese botón lleva a
              contacto y lo DICE debajo. Un botón que promete pagar y abre un
              formulario es una sorpresa en el peor momento.
            */}
            <Link
              href={enlaces[frecuencia] ?? `/pagar?ciclo=${frecuencia}`}
              className="text-espresso mt-7 flex h-14 items-center justify-center rounded-full font-semibold transition-transform active:scale-[0.98]"
              style={{ backgroundImage: "var(--boton-dorado)" }}
            >
              Quiero el plan {frecuencia === "anual" ? "anual" : "mensual"}
            </Link>

            <p className="mt-3 text-center text-xs text-white/55">
              {enlaces[frecuencia]
                ? NOTA_PAGO
                : "Te escribimos al correo con el enlace de pago y tu acceso."}
            </p>
          </div>

          <div className="border-t border-white/12 pt-7 md:border-t-0 md:border-l md:pt-0 md:pl-10">
            <p className="text-gold-light text-xs font-bold tracking-[0.18em] uppercase">Incluye</p>
            <ul className="mt-4 flex flex-col gap-3">
              {INCLUYE.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-white/85">
                  <Check
                    size={15}
                    strokeWidth={2.5}
                    className="text-gold-light mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

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
      </Entrada>
    </section>
  );
}
