"use client";

import { Check, CreditCard, Lock, Mail, ShieldCheck } from "lucide-react";
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
  GARANTIA,
  incluyeCon,
  notaDelCobro,
  precioPorMesDe,
  type Frecuencia,
} from "@/lib/planes";

/**
 * El precio, en el home.
 *
 * ⚠️ EL PRECIO SE ENSEÑA SIEMPRE POR MES, pague como pague. Es lo único que se
 * puede comparar de un vistazo: "US$167 al año" frente a "US$19,70 al mes"
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
  porWhatsApp = false,
}: {
  enlaces: Record<Frecuencia, string | null>;
  bolsos: number;
  videos: number;
  /**
   * Colombia paga por WhatsApp y no por la pasarela (migración 0038). Cambia
   * lo que PROMETE el botón, no a dónde va: el enlace ya viene resuelto por
   * región desde la base. Prometer "Pago seguro con OnePay" y abrir un chat
   * sería mentir justo en el momento de dar el dinero.
   */
  porWhatsApp?: boolean;
}) {
  // Compartida con el otro toggle de la página: ver `lib/frecuencia-elegida.ts`.
  const frecuencia = useFrecuenciaElegida();
  const quieto = useReducedMotion();
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
          {/* ── Lo que se paga ── `flex-col` para que la fila de confianza
              baje al fondo y las dos mitades midan lo mismo. */}
          <div className="bg-espresso sobre-oscuro grain-oscuro flex flex-col px-5.5 py-6 md:p-11">
            <p className="eyebrow">Plan {frecuencia}</p>
            <h3
              className="font-display text-cream mt-2 text-balance"
              style={{ fontWeight: 500, fontSize: "clamp(26px, 2.6vw, 34px)", lineHeight: 1.15 }}
            >
              Curso completo de bolsos de perlas
            </h3>

            <p className="mt-4 flex items-baseline gap-2">
              <span
                className="font-display text-gold-pale"
                /*
                 * ⚠️ EL MÍNIMO BAJÓ DE 64px A 52px EL 2026-10-31. Con el precio
                 * viejo la cifra tenía 3 dígitos ("US$7,49") y sobraba sitio; con
                 * "US$13,92" y "US$19,70" el bloque llegaba a 15px del borde en un
                 * móvil de 375px y el número dejaba de dominar la tarjeta. Si algún
                 * día el precio vuelve a tener 3 dígitos, se puede subir otra vez.
                 */
                style={{ fontWeight: 500, fontSize: "clamp(52px, 7vw, 84px)", lineHeight: 1 }}
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

            {/*
              ⚠️ SIN EL "o mensual por… / o anual por…" DE DEBAJO (planes,
              2026-10-22). El switch está justo encima y hace lo mismo; el
              enlace duplicaba el control y le restaba fuerza a este botón.
            */}
            <EnlaceCompra
              href={enlace ?? `/pagar?ciclo=${frecuencia}`}
              origen="precio"
              plan={frecuencia}
              abrePago={Boolean(enlace)}
              className="bg-gold-pale text-espresso mt-6 flex h-13.5 items-center justify-center rounded-full text-base font-semibold transition-transform active:scale-[0.98]"
            >
              {porWhatsApp
                ? "Inscribirme por WhatsApp"
                : `Inscribirme con el plan ${frecuencia}`}
            </EnlaceCompra>

            {/*
              ⚠️ SI NO HAY ENLACE PARA ESE CICLO, NO SE FINGE QUE SE PUEDE PAGAR.
              El botón lleva a `/pagar` y aquí se dice qué va a pasar.
            */}
            <div className="border-espresso-line mt-6 border-t pt-4 md:mt-auto">
              {enlace ? (
                <ul className="text-on-dark-muted flex flex-col gap-2.5 text-sm md:flex-row md:flex-wrap md:gap-x-5">
                  {/* Cada lista describe lo que de verdad va a pasar al tocar
                      el botón: en Colombia se abre un chat y el pago se
                      acuerda ahí; fuera, se abre la pasarela. */}
                  <li className="flex items-center gap-2">
                    <Lock size={15} className="text-gold-light shrink-0" aria-hidden="true" />
                    {porWhatsApp ? "Te atiende Elizabeth" : "Pago seguro con OnePay"}
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard size={15} className="text-gold-light shrink-0" aria-hidden="true" />
                    {porWhatsApp
                      ? "Acordamos cómo pagar por chat"
                      : "Tarjeta de crédito o débito"}
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail size={15} className="text-gold-light shrink-0" aria-hidden="true" />
                    {porWhatsApp ? "Acceso apenas confirmes" : "Acceso inmediato por correo"}
                  </li>
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
          <div className="bg-ivory flex flex-col px-5.5 py-6 md:p-11">
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

            <div className="bg-sand mt-6 flex gap-3 rounded-[18px] p-5 md:mt-auto">
              <ShieldCheck size={22} className="text-cacao mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-espresso font-semibold">{GARANTIA.titulo}</p>
                <p className="text-ink-body mt-1 text-sm">{GARANTIA.texto}</p>
              </div>
            </div>

            {/* Dentro del panel marfil (planes, 2026-10-22): equilibra el alto
                de las dos columnas. */}
            <p className="text-ink-body mt-4 text-sm">
              ¿Dudas antes de inscribirte?{" "}
              <EnlaceWhatsApp
                href={WHATSAPP_URL}
                origen="precio"
                className="text-gold inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
              >
                Escríbenos por WhatsApp
              </EnlaceWhatsApp>
            </p>
          </div>
        </div>
      </Entrada>
    </section>
  );
}
