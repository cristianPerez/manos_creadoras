"use client";

import { Check, Lock } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { InterruptorPlan } from "@/components/app/InterruptorPlan";
import { PrecioQueCuenta } from "@/components/app/PrecioQueCuenta";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { elegirFrecuencia, useFrecuenciaElegida } from "@/lib/frecuencia-elegida";
import { WHATSAPP_URL } from "@/lib/landing";
import {
  ahorroAnualDe,
  GARANTIA,
  incluyeCon,
  notaDelCobro,
  precioPorMes,
  precioPorMesDe,
  type Frecuencia,
} from "@/lib/planes";

/**
 * El precio, en el home.
 *
 * ⚠️ EL PRECIO SE ENSEÑA SIEMPRE POR MES, pague como pague. Es lo único que se
 * puede comparar de un vistazo: "US$89,90 al año" frente a "US$9,99 al mes"
 * obliga a dividir mentalmente, y quien tiene que hacer cuentas para entender
 * una oferta normalmente no la acepta. El cobro real va justo debajo, dicho con
 * todas las palabras.
 *
 * ⚠️ HOME V3 (2026-10-20): el botón ABRE EL PAGO DIRECTAMENTE. Antes decía
 * "Quiero el plan…" y el enlace era el mismo; ahora dice "Inscribirme con el
 * plan…", que es lo que hace. Los enlaces salen de `plan_checkout` por país
 * (ver `lib/checkout.ts`); si un ciclo no tiene enlace, cae a `/pagar`, que lo
 * explica — nunca a una página de pago que no carga.
 *
 * Las cifras salen de `lib/planes.ts` y del catálogo: ni una escrita en el JSX.
 */
export function PrecioHome({
  enlaces,
  bolsos,
  videos,
}: {
  enlaces: Record<Frecuencia, string | null>;
  bolsos: number;
  videos: number;
}) {
  // Compartida con el otro toggle de la página: ver `lib/frecuencia-elegida.ts`.
  const frecuencia = useFrecuenciaElegida();
  const quieto = useReducedMotion();
  const otra: Frecuencia = frecuencia === "anual" ? "mensual" : "anual";
  const enlace = enlaces[frecuencia];

  const elegir = (f: Frecuencia) => {
    if (f === frecuencia) return;
    elegirFrecuencia(f);
    medir(EVENTOS.planToggle, { plan: f });
  };

  return (
    /* Home a color (2026-10-22): arena, entre la crema de las alumnas y la de
       las preguntas. La tarjeta se parte en dos: lo que se paga en espresso,
       lo que se lleva en marfil. */
    <section id="precio" className="bg-sand px-5 py-14 md:py-22">
      <Entrada className="mx-auto max-w-[1080px]">
        <header className="text-center">
          <EyebrowLinea centrado>Inscripción</EyebrowLinea>
          <h2 className="titulo-seccion mt-3 text-balance">
            Un solo plan, <em className="clave">todo incluido</em>.
          </h2>
          <p className="text-ink-body mt-3 max-md:hidden">Paga cada mes o ahorra pagando el año.</p>
        </header>

        <div className="mt-6 md:mt-8">
          {/* Interruptor de verdad y no píldora partida (2026-10-21 y de nuevo
              el 22-oct, pedido de Cristian): el mismo de toda la app. */}
          <InterruptorPlan valor={frecuencia} alCambiar={elegir} tamano="grande" />
        </div>

        <div className="border-line mt-6 grid overflow-hidden rounded-(--radius-foto) border max-md:rounded-bloque md:mt-8 md:grid-cols-2">
          {/* ── Lo que se paga ── */}
          <div className="bg-espresso sobre-oscuro grain-oscuro p-6 md:p-12">
            <h3 className="font-display text-cream text-2xl text-balance md:text-3xl" style={{ fontWeight: 500 }}>
              Curso completo de bolsos de perlas
            </h3>

            <p className="mt-4 flex items-baseline gap-2">
              <span
                className="font-display text-gold-pale"
                style={{ fontWeight: 500, fontSize: "clamp(64px, 7vw, 84px)", lineHeight: 1 }}
              >
                {/*
                  ⚠️ `PrecioQueCuenta` Y NO `NumeroQueCuenta`: aquel cuenta cuando
                  el número ENTRA EN PANTALLA, y aquí el número ya está a la vista
                  — lo que cambia es el ciclo. Con el otro, al cambiar se quedaba
                  en US$0,00, que en un precio es lo más parecido a un error.
                */}
                <PrecioQueCuenta hasta={precioPorMesDe()[frecuencia]} quieto={Boolean(quieto)} />
              </span>
              <span className="text-on-dark-muted text-lg">/mes</span>
            </p>
            <p className="text-on-dark-muted mt-2 text-base text-balance">{notaDelCobro(frecuencia)}</p>

            <EnlaceCompra
              href={enlace ?? `/pagar?ciclo=${frecuencia}`}
              origen="precio"
              plan={frecuencia}
              abrePago={Boolean(enlace)}
              className="bg-gold-pale text-espresso mt-6 flex h-13.5 items-center justify-center rounded-full text-lg font-bold transition-transform active:scale-[0.98]"
            >
              Inscribirme con el plan {frecuencia}
            </EnlaceCompra>

            {/* Cambiar de ciclo desde aquí: quien duda entre los dos no tiene que
                volver arriba al selector para comparar. */}
            <button
              type="button"
              onClick={() => elegir(otra)}
              className="text-gold-pale decoration-gold-pale mx-auto mt-3 block min-h-11 text-sm font-semibold underline underline-offset-4"
            >
              {otra === "mensual"
                ? `o mensual por ${precioPorMes("mensual")}/mes`
                : `o anual por ${precioPorMes("anual")}/mes (ahorras ${ahorroAnualDe().pct}%)`}
            </button>

            {/*
              ⚠️ SI NO HAY ENLACE PARA ESE CICLO, NO SE FINGE QUE SE PUEDE PAGAR.
              El botón lleva a `/pagar` y aquí se dice qué va a pasar.
            */}
            <div className="border-espresso-line mt-4 border-t pt-4">
              {enlace ? (
                <ul className="text-on-dark-muted flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Lock size={14} aria-hidden="true" />
                    Pago seguro con OnePay
                  </li>
                  <li>Tarjeta de crédito o débito</li>
                  <li className="max-md:hidden">Acceso inmediato por correo</li>
                </ul>
              ) : (
                <p className="text-on-dark-muted text-sm">
                  Te escribimos al correo con el enlace de pago y tu acceso.
                </p>
              )}
            </div>
          </div>

          {/* ── Lo que se lleva ── En móvil va debajo (orden del DOM): primero
              se decide y se paga, y quien aún duda baja a leer. */}
          <div className="bg-ivory p-6 md:p-12">
            <p className="eyebrow">Incluye</p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {incluyeCon({ bolsos, videos }).map((b) => (
                <li key={b} className="text-espresso flex items-start gap-3 text-base">
                  <Check
                    size={17}
                    strokeWidth={2.5}
                    className="text-gold mt-1 shrink-0"
                    aria-hidden="true"
                  />
                  {b}
                </li>
              ))}
            </ul>

            <div className="bg-sand mt-6 rounded-lg p-5">
              <p className="text-espresso font-semibold">{GARANTIA.titulo}</p>
              <p className="text-ink-body mt-1 text-sm">{GARANTIA.texto}</p>
            </div>
          </div>
        </div>

        <p className="text-ink-body mt-6 text-center">
          ¿Dudas antes de inscribirte?{" "}
          <EnlaceWhatsApp
            href={WHATSAPP_URL}
            origen="precio"
            className="text-gold inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
          >
            Escríbenos por WhatsApp
          </EnlaceWhatsApp>
        </p>
      </Entrada>
    </section>
  );
}
