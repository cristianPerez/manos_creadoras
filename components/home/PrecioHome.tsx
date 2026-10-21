"use client";

import { Check, Lock, ShieldCheck } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { InterruptorPlan } from "@/components/app/InterruptorPlan";
import { PrecioQueCuenta } from "@/components/app/PrecioQueCuenta";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { IconoWhatsApp } from "@/components/home/IconoWhatsApp";
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
    <section id="precio" className="px-5 py-12 md:py-16">
      <Entrada className="mx-auto max-w-5xl">
        <header className="text-center">
          <p className="eyebrow">Inscripción</p>
          <h2
            className="font-display text-espresso mt-2 text-balance"
            style={{ fontWeight: 500, fontSize: "clamp(36px, 4.4vw, 60px)", lineHeight: 1.06 }}
          >
            Un solo plan, todo incluido.
          </h2>
          <p className="text-ink-body mt-3 max-md:hidden">Paga cada mes o ahorra pagando el año.</p>
        </header>

        {/* Interruptor y no píldora partida (2026-10-21, pedido de Cristian):
            el mismo de toda la app — `components/app/InterruptorPlan.tsx`. */}
        <div className="mt-6 md:mt-8">
          <InterruptorPlan valor={frecuencia} alCambiar={elegir} tamano="grande" />
        </div>

        {/*
          ⚠️ ESPRESSO SÓLIDO, SIN DEGRADADO (v3). La tarjeta de la v2 llevaba
          `--card-destacada` (cacao → espresso); al lado de la banda "1 de 16",
          que ahora es cacao sólido, el degradado hacía que las dos piezas
          oscuras de la página parecieran de dos sistemas distintos.
        */}
        <div className="bg-espresso sobre-oscuro grain-oscuro mt-6 grid overflow-hidden rounded-lg text-white max-md:rounded-bloque md:mt-8 md:grid-cols-2">
          <div className="p-6 md:p-10">
            <h3 className="font-display text-cream text-2xl text-balance md:text-3xl" style={{ fontWeight: 500 }}>
              Curso completo de bolsos de perlas
            </h3>

            <p className="mt-4 flex items-baseline gap-2">
              <span
                className="font-display text-gold-pale"
                style={{ fontWeight: 500, fontSize: "clamp(64px, 8vw, 96px)", lineHeight: 1 }}
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
            <p className="text-cream/85 mt-2 text-base text-balance">{notaDelCobro(frecuencia)}</p>

            {/* Cambiar de ciclo desde aquí: quien duda entre los dos no tiene que
                volver arriba al selector para comparar. */}
            <button
              type="button"
              onClick={() => elegir(otra)}
              className="text-gold-pale decoration-gold-pale mt-4 min-h-11 text-base font-bold underline underline-offset-4"
            >
              {otra === "mensual"
                ? `o mensual por ${precioPorMes("mensual")}/mes`
                : `o anual por ${precioPorMes("anual")}/mes (ahorras ${ahorroAnualDe().pct}%)`}
            </button>

            <EnlaceCompra
              href={enlace ?? `/pagar?ciclo=${frecuencia}`}
              origen="precio"
              plan={frecuencia}
              abrePago={Boolean(enlace)}
              className="bg-gold-pale text-espresso rounded-boton mt-4 flex h-14 items-center justify-center text-lg font-extrabold transition-transform active:scale-[0.98]"
            >
              Inscribirme con el plan {frecuencia}
            </EnlaceCompra>

            {/*
              ⚠️ SI NO HAY ENLACE PARA ESE CICLO, NO SE FINGE QUE SE PUEDE PAGAR.
              El botón lleva a `/pagar` y aquí se dice qué va a pasar.
            */}
            {enlace ? (
              <ul className="text-on-dark-muted mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:gap-x-6">
                <li className="flex items-center gap-2">
                  <Lock size={14} aria-hidden="true" />
                  Pago seguro con OnePay
                </li>
                <li>Tarjeta de crédito o débito</li>
                {/* En móvil no cabe en la misma línea (ref. 20 lo omite). */}
                <li className="max-md:hidden">Acceso inmediato por correo</li>
              </ul>
            ) : (
              <p className="text-on-dark-muted mt-4 text-sm">
                Te escribimos al correo con el enlace de pago y tu acceso.
              </p>
            )}
          </div>

          {/* En móvil, "Incluye" va DESPUÉS del botón (orden natural del DOM):
              primero se decide y se paga, y quien aún duda baja a leer. */}
          <div className="border-espresso-line mx-6 border-t py-6 md:mx-0 md:border-t-0 md:border-l md:p-10 md:pt-16">
            <p className="text-gold-pale text-xs font-bold tracking-[0.18em] uppercase max-md:hidden">
              Incluye
            </p>
            <ul className="flex flex-col gap-4 md:mt-5">
              {incluyeCon({ bolsos, videos }).map((b) => (
                <li key={b} className="text-cream flex items-start gap-3 text-base">
                  <Check
                    size={17}
                    strokeWidth={2.5}
                    className="text-gold-light mt-1 shrink-0"
                    aria-hidden="true"
                  />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="bg-ivory border-line flex items-center gap-4 rounded-md border p-5">
            <ShieldCheck size={24} className="text-gold shrink-0" aria-hidden="true" />
            <span>
              <span className="text-espresso block font-semibold">{GARANTIA.titulo}</span>
              <span className="text-ink-body block text-sm">{GARANTIA.texto}</span>
            </span>
          </div>

          {/* Escritorio: tarjeta con botón. Móvil: botón a todo el ancho (ref. 20). */}
          <div className="bg-ivory border-line hidden items-center justify-between gap-4 rounded-md border p-5 md:flex">
            <span>
              <span className="text-espresso block font-semibold">¿Dudas antes de inscribirte?</span>
              <span className="text-ink-body block text-sm">Escríbenos y te respondemos.</span>
            </span>
            <EnlaceWhatsApp
              href={WHATSAPP_URL}
              origen="precio"
              className="border-espresso text-espresso rounded-boton flex h-12 shrink-0 items-center gap-2 border px-5 font-bold"
            >
              <IconoWhatsApp size={18} />
              WhatsApp
            </EnlaceWhatsApp>
          </div>
          <EnlaceWhatsApp
            href={WHATSAPP_URL}
            origen="precio"
            className="border-espresso text-espresso rounded-md flex h-14 items-center justify-center gap-3 border font-bold md:hidden"
          >
            <IconoWhatsApp size={20} />
            ¿Dudas? Escríbenos por WhatsApp
          </EnlaceWhatsApp>
        </div>
      </Entrada>
    </section>
  );
}
