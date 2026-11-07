"use client";

import { usePrecios } from "@/components/app/Precios";
import { Check, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { PrecioQueCuenta } from "@/components/app/PrecioQueCuenta";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { EntradaB, PiezaB } from "@/components/home-b/EntradaB";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { elegirFrecuencia, useFrecuenciaElegida } from "@/lib/frecuencia-elegida";
import { WHATSAPP_URL } from "@/lib/landing";
import { ANCLA_MATERIALES, INCLUYE, type Frecuencia } from "@/lib/planes";

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
/*
 * v2 (2026-11-05): ABSORBE "ESTE ES SOLO UNO", que deja de ser un bloque
 * propio. Las tres piezas y el "+N" coronan la tarjeta y el titular dice
 * "El gratis es solo uno. Llévate todos.": el deseo ("¿y los demás?") y el
 * precio quedan en la misma pantalla, en vez de con dos secciones de por medio.
 *
 * Profundidad: la sección va en BASE, la tarjeta ELEVADA y el "Incluye" en un
 * panel HUNDIDO dentro de ella — se lee como "lo que te llevas", aparte de lo
 * que pagas.
 *
 * Un bolso, un llavero y un accesorio: tres bolsos contradirían un texto que
 * promete proyectos variados. Fotos topo (ver `lib/fotos-topo.ts`).
 */
/*
 * ⚠️ LA GARANTÍA CON NOMBRE, Y EL NOMBRE ES LA POLÍTICA TAL CUAL. El revisor
 * pidió nombrarla (una garantía sin nombre se lee como letra pequeña) y
 * propuso "Garantía Primer Bolso"; no se usó porque insinúa una condición
 * ("si no terminas tu primer bolso") que la política no tiene. Lo que dice
 * `lib/legal-textos.ts` → reembolso: 7 días desde el primer pago, completo,
 * sin preguntas. Va aquí y no en `GARANTIA` de `lib/planes` porque aquella
 * la usa también el control, que no se toca mientras dure el experimento.
 */
const GARANTIA_B = {
  titulo: "Garantía sin preguntas de 7 días",
  texto: "Si no es para ti, te devolvemos todo dentro de los 7 días de tu primer pago.",
};

const MUESTRAS = [
  "/images/topo/bolso-icono.webp",
  "/images/topo/bolso-boho.webp",
  "/images/topo/bolso-llavero-mora.webp",
];

export function PrecioB({
  enlaces,
  proyectos,
}: {
  enlaces: Record<Frecuencia, string | null>;
  /** El catálogo ENTERO (bolsos, llaveros y adornos): para el "+N". */
  proyectos: number;
}) {
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
    <section id="precio" data-seccion="precio" className="pt-9 pb-11 lg:pt-18 lg:pb-20">
      <EntradaB className="contenedor-b contenedor-precio-b" escalonado={0.05}>
        {/* Tres piezas de verdad y "+N": que hay muchas más se VE. El borde
            del color del fondo las separa al superponerse, sin sombra. */}
        <div className="flex justify-center" aria-hidden="true">
          {MUESTRAS.map((src, n) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={128}
              height={128}
              loading="lazy"
              sizes="64px"
              className={`rounded-foto-b border-cream size-13 border-3 object-cover lg:size-16 ${
                n > 0 ? "-ml-3 lg:-ml-3.5" : ""
              }`}
            />
          ))}
          <span className="bg-espresso-2 text-gold-light rounded-foto-b border-cream font-display -ml-3 flex size-13 items-center justify-center border-3 text-xl font-semibold lg:-ml-3.5 lg:size-16 lg:text-2xl">
            +{Math.max(0, proyectos - MUESTRAS.length)}
          </span>
        </div>
        <h2 className="titulo-seccion-b mt-4 text-center text-balance lg:mt-4.5">
          El gratis es solo uno. <em className="clave">Llévate todos.</em>
        </h2>

        <div className="mx-auto mt-5 max-w-115 lg:mt-6.5">
          <SelectorCicloB valor={frecuencia} alCambiar={elegir} quieto={Boolean(quieto)} />
        </div>

        <div
          className="bg-ivory rounded-tarjeta-b mt-5 overflow-hidden lg:mt-7 lg:flex"
          /* La pieza más importante de la página: la sombra elevada, un poco
             más larga que la de las tarjetas. */
          style={{
            boxShadow: "0 1px 2px rgba(46,36,64,.06), 0 16px 34px -18px rgba(46,36,64,.3)",
          }}
        >
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
                <PrecioQueCuenta hasta={pr.porMesNumero[frecuencia]} moneda={pr.moneda} quieto={Boolean(quieto)} />
              </span>
              <span className="text-ink-body text-base lg:text-lg">/mes</span>
            </p>
            <p className="text-ink-body mt-2 text-sm leading-snug text-balance lg:mt-2.5">
              {pr.nota(frecuencia)}
            </p>
            {/*
              EL ANCLA DE PRECIO (objeción 4 de FICHA-AVATAR: "es caro"). La
              comparación no es contra otro curso sino contra lo que ya gasta:
              la ficha estima US$15-20 al mes en materiales desperdiciados en
              intentos fallidos, más que cualquiera de los dos planes. Con la
              cifra y no con un adjetivo (revisor, 2ª ronda): "menos de lo que
              se pierde" sin número no convence. ⚠️ US$15-20 es la ESTIMACIÓN
              de la ficha, no un dato medido; si cambia allí, cambia aquí.
            */}
            <p className="text-espresso text-nota mt-1.5 font-semibold lg:text-sm">
              Un mes de intentos fallidos se lleva {ANCLA_MATERIALES[pr.moneda]} en materiales. Todo el plan,{" "}
              {pr.porMes(frecuencia)}/mes.
            </p>

            <EnlaceCompra
              href={enlace ?? `/pagar?ciclo=${frecuencia}`}
              origen="precio"
              plan={frecuencia}
              abrePago={Boolean(enlace)}
              className="boton-accion-b mt-5 flex h-13 items-center justify-center rounded-full font-bold transition-transform active:scale-[0.98] lg:mt-6.5 lg:h-14"
            >
              Quiero todos los proyectos
            </EnlaceCompra>

            {/* ⚠️ SI NO HAY ENLACE PARA ESE CICLO, NO SE FINGE QUE SE PUEDE
                PAGAR: el botón lleva a `/pagar` y aquí se dice qué va a pasar. */}
            {enlace ? (
              <p className="text-ink-body text-nota mt-3 text-center lg:mt-3.5">
                {/* Sin "cancelas cuando quieras": ya lo dice la nota del cobro,
                    dos renglones más arriba. */}
                Pago seguro · acceso por correo · tarjeta de crédito o débito
              </p>
            ) : (
              <p className="text-ink-body mt-4 text-sm">
                Te escribimos al correo con el enlace de pago y tu acceso.
              </p>
            )}
          </div>

          {/* ── Lo que se lleva ── */}
          <div className="bg-sand p-5 shadow-[inset_0_1px_0_var(--line)] lg:flex-[1.2] lg:p-10 lg:shadow-[inset_1px_0_0_var(--line)]">
            <p className="eyebrow-b eyebrow-b-centrado flex items-center gap-3">Incluye</p>
            <ul className="mt-3.5 flex flex-col gap-3 lg:mt-4.5 lg:gap-3.5">
              {INCLUYE.map((b) => (
                <PiezaB como="li" key={b} className="text-espresso flex items-start gap-3 leading-snug">
                  {/* Check propio: cuadrito lavanda con el check en el color de
                      acción. El ✓ del sistema se ve de otra fuente y delata la
                      maqueta. */}
                  <span className="bg-ivory text-gold rounded-chip-b flex size-6 shrink-0 items-center justify-center">
                    <Check size={14} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                  {b}
                </PiezaB>
              ))}
            </ul>

            <div className="bg-ivory rounded-foto-b mt-4 flex gap-3 p-3.5 lg:mt-6 lg:p-4.5">
              <ShieldCheck
                size={22}
                strokeWidth={1.8}
                className="text-espresso mt-px shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-espresso font-bold">{GARANTIA_B.titulo}</p>
                <p className="text-ink-body mt-1 text-nota leading-snug lg:text-sm">
                  {GARANTIA_B.texto}
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
      </EntradaB>
    </section>
  );
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * EL SELECTOR MENSUAL / ANUAL DEL HOME B — que el 50% se VEA (2026-11-05)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Pedido de Cristian: «que llame la atención ese toggle, que la gente se vea
 * tentada a moverlo para ver ese descuentazo». El anual pasó a costar
 * EXACTAMENTE la mitad (US$87,60 al año = US$7,30/mes frente a US$14,60).
 *
 * ⚠️ NO REUTILIZA `InterruptorPlan`: aquel es un interruptor pequeño con un
 * "Ahorra X%" discreto al lado, y lo usa también el home de control, que no se
 * toca durante el experimento. Aquí, en cambio:
 *
 *   · Las dos opciones son GRANDES y llevan el precio por mes dentro: la
 *     diferencia (14,60 contra 7,30) se ve sin tocar nada.
 *   · El anual lleva la etiqueta "−50%" en el color de acción, y da un saltito
 *     cada pocos segundos HASTA QUE alguien elige el anual (después sobra: ya
 *     lo vio). Con movimiento reducido no salta.
 *   · Debajo, mientras está en mensual, una línea que se toca: "Cámbiate al
 *     anual y paga la mitad". En anual, lo que se ahorra en dinero.
 *
 * Todas las cifras salen de la base (`usePrecios`): si el precio cambia, el
 * porcentaje y el ahorro se recalculan solos. Accesible como `radiogroup`.
 */
function SelectorCicloB({
  valor,
  alCambiar,
  quieto,
}: {
  valor: Frecuencia;
  alCambiar: (f: Frecuencia) => void;
  quieto: boolean;
}) {
  const pr = usePrecios();
  const [yaVioElAnual, setYaVioElAnual] = useState(false);
  const elegir = (f: Frecuencia) => {
    if (f === "anual") setYaVioElAnual(true);
    alCambiar(f);
  };
  const saltar = !quieto && !yaVioElAnual && valor !== "anual";

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Elige cómo pagar"
        className="hundido-b rounded-tarjeta-b relative flex gap-1 p-1"
      >
        <OpcionCicloB ciclo="mensual" titulo="Mensual" activa={valor === "mensual"} precio={pr.porMes("mensual")} alElegir={elegir} />
        <div className="relative flex flex-1">
          <OpcionCicloB ciclo="anual" titulo="Anual" activa={valor === "anual"} precio={pr.porMes("anual")} alElegir={elegir} />
          {/* La etiqueta del descuento, montada sobre la esquina del anual. */}
          <motion.span
            aria-hidden="true"
            className="bg-gold text-ivory pointer-events-none absolute -top-3 -right-1.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-[0_6px_14px_-6px_rgba(107,79,160,0.8)]"
            animate={saltar ? { y: [0, -5, 0, -2, 0], rotate: [0, -4, 0, 2, 0] } : { y: 0, rotate: 0 }}
            transition={
              saltar
                ? { duration: 0.9, ease: "easeOut", repeat: Infinity, repeatDelay: 2.2 }
                : { duration: 0.2 }
            }
          >
            −{pr.ahorro.pct}%
          </motion.span>
        </div>
      </div>

      {valor === "mensual" ? (
        <button
          type="button"
          onClick={() => elegir("anual")}
          /* Texto corrido y no `flex`: con flex cada trozo era una caja y "Con
             el anual pagas" se partía en una columna estrecha a 375px. */
          className="text-ink-body mt-2.5 block min-h-11 w-full cursor-pointer py-2.5 text-center text-sm"
        >
          Con el anual pagas <s className="decoration-apoyo">{pr.porMes("mensual")}</s>{" "}
          <strong className="text-gold">{pr.porMes("anual")}/mes</strong> ·{" "}
          <span className="text-apoyo font-bold underline underline-offset-3">cámbiate</span>
        </button>
      ) : (
        <p className="text-espresso mt-2.5 flex min-h-11 items-center justify-center text-center text-sm font-semibold">
          Pagas la mitad: ahorras {pr.ahorro.texto} al año frente al mensual.
        </p>
      )}
    </div>
  );
}

/** Una de las dos opciones del selector: el ciclo y su precio por mes dentro. */
function OpcionCicloB({
  ciclo,
  titulo,
  activa,
  precio,
  alElegir,
}: {
  ciclo: Frecuencia;
  titulo: string;
  activa: boolean;
  /** "US$7,30" — ya formateado, de la base. */
  precio: string;
  alElegir: (f: Frecuencia) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={activa}
      onClick={() => alElegir(ciclo)}
      className={`relative flex min-h-16 flex-1 cursor-pointer flex-col items-center justify-center rounded-[10px] px-3 py-2.5 transition-[background-color,box-shadow,transform] active:scale-[0.98] ${
        activa ? "elevado-b" : "hover:bg-sand-hover"
      }`}
    >
      <span className={`text-sm ${activa ? "text-espresso font-bold" : "text-ink-body font-semibold"}`}>
        {titulo}
      </span>
      <span className={`cifra mt-0.5 text-[15px] ${activa ? "text-gold font-bold" : "text-ink-body font-medium"}`}>
        {precio}
        <span className="text-nota font-medium">/mes</span>
      </span>
    </button>
  );
}
