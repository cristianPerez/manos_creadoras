"use client";

import { usePrecios } from "@/components/app/Precios";
import { Check, CreditCard, Lock, Mail, ShieldCheck, X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { InterruptorPlan } from "@/components/app/InterruptorPlan";
import { PrecioQueCuenta } from "@/components/app/PrecioQueCuenta";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { elegirFrecuencia, useFrecuenciaElegida } from "@/lib/frecuencia-elegida";
import { WHATSAPP_URL } from "@/lib/landing";
import { GARANTIA, INCLUYE, type Frecuencia } from "@/lib/planes";

/**
 * El precio, en la paleta B.
 *
 * ⚠️ EL PRECIO SE ENSEÑA SIEMPRE POR MES, pague como pague. Es lo único que se
 * puede comparar de un vistazo: "US$96 al año" frente a "US$14,60 al mes"
 * obliga a dividir mentalmente, y quien tiene que hacer cuentas para entender
 * una oferta normalmente no la acepta. El cobro real va justo debajo, dicho con
 * todas las palabras.
 *
 * ⚠️ NI UNA CIFRA ESCRITA A MANO. Todas salen de `lib/precios` por el contexto
 * `usePrecios()`: el precio, el ahorro, la nota del cobro. El día que cambie el
 * plan en OnePay, esta pantalla lo dice sola — y dice lo mismo que el control,
 * que es condición del experimento (si las dos ramas anunciaran precios
 * distintos, no se estaría midiendo el diseño).
 *
 * ⚠️ FRENTE A LA DEL HOME DE SIEMPRE: las garantías de pago suben AL LADO DEL
 * BOTÓN (eran un pie de la mitad oscura) y el "incluye" baja a su propia
 * mitad. La objeción "¿y si me cobran para siempre?" aparece donde se toma la
 * decisión, no tres bloques después.
 */
const CONFIANZA = [
  { Icono: Lock, texto: "Pago seguro" },
  { Icono: CreditCard, texto: "Crédito o débito" },
  { Icono: Mail, texto: "Acceso por correo" },
  { Icono: X, texto: "Cancelas cuando quieras" },
];

export function PrecioB({ enlaces }: { enlaces: Record<Frecuencia, string | null> }) {
  const pr = usePrecios();
  // Compartida con el resto de la página: ver `lib/frecuencia-elegida.ts`.
  const frecuencia = useFrecuenciaElegida();
  const quieto = useReducedMotion();
  const enlace = enlaces[frecuencia];

  const elegir = (f: Frecuencia) => {
    if (f === frecuencia) return;
    elegirFrecuencia(f);
    medir(EVENTOS.planToggle, { plan: f });
  };

  return (
    <section id="precio" data-seccion="precio" className="bg-sand py-12 lg:py-20">
      <Entrada className="contenedor-b contenedor-precio-b">
        <p className="eyebrow-b eyebrow-b-centrado text-center">Inscripción</p>
        <h2 className="titulo-seccion-b mt-2.5 text-center text-balance lg:mt-3">
          Un solo plan, <em className="clave">todo incluido.</em>
        </h2>

        {/* ⚠️ SIN UNA ETIQUETA "AHORRA X%" AQUÍ: `InterruptorPlan` ya pinta la
            suya junto a "Anual", y el primer intento la puso dos veces en la
            misma pantalla (se vio en el render a 375px). La del interruptor es
            la buena — está pegada a la opción que de verdad ahorra. */}
        <div className="mt-5 lg:mt-6.5">
          <InterruptorPlan valor={frecuencia} alCambiar={elegir} tamano="grande" />
        </div>

        <div className="bg-ivory rounded-precio-b shadow-md mt-5.5 overflow-hidden lg:mt-8 lg:flex">
          {/* ── Lo que se paga ── va primero en el DOM: en móvil se decide y
              se paga arriba, y quien aún duda baja a leer qué incluye. */}
          <div className="p-5.5 lg:flex-1 lg:p-10">
            <p className="eyebrow-b eyebrow-b-centrado flex items-center gap-3">Plan {frecuencia}</p>
            <p
              className="font-display text-espresso mt-1.5 text-balance lg:mt-2"
              style={{ fontWeight: 500, fontSize: "clamp(27px, 2.6vw, 30px)", lineHeight: 1.1 }}
            >
              Membresía Manos Creadoras
            </p>

            <p className="mt-3 flex items-baseline gap-2 lg:mt-4.5">
              <span
                className="font-display text-gold"
                /* `PrecioQueCuenta` y no `NumeroQueCuenta`: aquel cuenta cuando
                   el número ENTRA en pantalla, y aquí ya está a la vista — lo
                   que cambia es el ciclo. Con el otro, al cambiar se quedaba en
                   US$0,00, que en un precio es lo más parecido a un error. */
                style={{ fontWeight: 600, fontSize: "clamp(52px, 6vw, 72px)", lineHeight: 1 }}
              >
                <PrecioQueCuenta hasta={pr.porMesNumero[frecuencia]} quieto={Boolean(quieto)} />
              </span>
              <span className="text-ink-body text-base lg:text-lg">/mes</span>
            </p>
            <p className="text-ink-body mt-2 text-sm leading-snug text-balance lg:mt-2.5">
              {pr.nota(frecuencia)}
            </p>

            <EnlaceCompra
              href={enlace ?? `/pagar?ciclo=${frecuencia}`}
              origen="precio"
              plan={frecuencia}
              abrePago={Boolean(enlace)}
              className="boton-accion-b mt-5 flex h-13 items-center justify-center rounded-full font-bold transition-transform active:scale-[0.98] lg:mt-6.5 lg:h-14"
            >
              Inscribirme con el plan {frecuencia}
            </EnlaceCompra>

            {/* ⚠️ SI NO HAY ENLACE PARA ESE CICLO, NO SE FINGE QUE SE PUEDE
                PAGAR: el botón lleva a `/pagar` y aquí se dice qué va a pasar. */}
            {enlace ? (
              <ul className="text-ink-body mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[12.5px] lg:mt-5 lg:gap-x-4 lg:text-sm">
                {CONFIANZA.map(({ Icono, texto }) => (
                  <li key={texto} className="flex items-center gap-1.5">
                    <Icono size={15} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
                    {texto}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-body mt-4 text-sm">
                Te escribimos al correo con el enlace de pago y tu acceso.
              </p>
            )}
          </div>

          {/* ── Lo que se lleva ── */}
          <div className="bg-cream border-line border-t p-5.5 lg:flex-[1.2] lg:border-t-0 lg:border-l lg:p-10">
            <p className="eyebrow-b eyebrow-b-centrado flex items-center gap-3">Incluye</p>
            <ul className="mt-3.5 flex flex-col gap-3 lg:mt-4.5 lg:gap-3.5">
              {INCLUYE.map((b) => (
                <li key={b} className="text-espresso flex items-start gap-3 leading-snug">
                  {/* Check propio: cuadrito lavanda con el check en el color de
                      acción. El ✓ del sistema se ve de otra fuente y delata la
                      maqueta. */}
                  <span className="bg-sand text-gold rounded-chip-b flex size-6 shrink-0 items-center justify-center">
                    <Check size={14} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="bg-sand rounded-foto-b mt-5 flex gap-3 p-3.5 lg:mt-6 lg:p-4.5">
              <ShieldCheck
                size={22}
                strokeWidth={1.8}
                className="text-espresso mt-px shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-espresso font-bold">{GARANTIA.titulo}</p>
                <p className="text-ink-body mt-1 text-nota leading-snug lg:text-sm">
                  {GARANTIA.texto}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-ink-body mt-4.5 text-sm lg:mt-5.5 lg:text-center lg:text-base">
          ¿Dudas antes de inscribirte?{" "}
          <EnlaceWhatsApp
            href={WHATSAPP_URL}
            origen="precio"
            className="text-apoyo inline-flex min-h-11 items-center font-bold underline underline-offset-4"
          >
            Escríbenos por WhatsApp
          </EnlaceWhatsApp>
        </p>
      </Entrada>
    </section>
  );
}
