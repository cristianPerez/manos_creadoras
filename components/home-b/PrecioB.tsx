"use client";

import { usePrecios } from "@/components/app/Precios";
import { Check, Lock } from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { PrecioQueCuenta } from "@/components/app/PrecioQueCuenta";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { EntradaB, PiezaB } from "@/components/home-b/EntradaB";
import { useContextoPago } from "@/components/pago/ContextoPago";
import {
  AsiSigue,
  GarantiaCorta,
  MediosDePago,
  NotaMoneda,
  SelectorCiclo,
  TestimonioCorto,
} from "@/components/pago/PiezasPago";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { elegirFrecuencia, useFrecuenciaElegida } from "@/lib/frecuencia-elegida";
import { WHATSAPP_URL } from "@/lib/landing";
import { INCLUYE, type Frecuencia } from "@/lib/planes";

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
const MUESTRAS = [
  "/images/topo/bolso-icono.webp",
  "/images/topo/bolso-boho.webp",
  "/images/topo/bolso-llavero-mora.webp",
];

/*
 * ── v3 (2026-11-08, canvas "Pagar · intermedia v2" → fila "Home v3") ───────
 *
 * ⚠️ LA TARJETA AHORA HACE EL TRABAJO DE `/pagar`. Comprar eran dos toques
 * (home → `/pagar` → OnePay) y `/pagar` repetía lo que el home ya decía. Aquí
 * queda todo lo que hace falta para decidir: precio en su moneda, en qué se
 * cobra, con qué se paga, garantía y un testimonio, y el botón DORADO (dorado
 * = pagar; morado = gratis: ver `.cta-pagar` en `globals.css`). `/pagar` se
 * recortó a lo que el home no explica: qué va a pasar en OnePay.
 *
 * El selector es el mismo de `/pagar` (`SelectorCiclo`), dentro de la tarjeta.
 * Se fueron: el selector grande con saltito, la caja de garantía del "Incluye"
 * (sube al lado del botón, en una línea) y el ancla de materiales.
 *
 * El botón obedece la flag `ruta_pago` (`conRuta` en `EnlaceCompra`): con
 * "puente" lleva a `/pagar`; con "directo" abre OnePay y aquí aparece "Así
 * sigue", lo único de `/pagar` que hace falta saber antes.
 */
export function PrecioB({
  enlaces,
  proyectos,
}: {
  enlaces: Record<Frecuencia, string | null>;
  /** El catálogo ENTERO (bolsos, llaveros y adornos): para el "+N". */
  proyectos: number;
}) {
  const pr = usePrecios();
  const ctx = useContextoPago();
  const pais = ctx?.pais ?? "";
  // Compartida con el resto de la página: ver `lib/frecuencia-elegida.ts`.
  const frecuencia = useFrecuenciaElegida();
  const quieto = useReducedMotion();
  const enlace = enlaces[frecuencia];
  const directo = ctx?.rutaPago === "directo" && Boolean(enlace);

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

        <div
          className="tarjeta-pago rounded-tarjeta-b mt-6 overflow-hidden border lg:mt-8 lg:flex"
          /* La pieza más importante de la página: la sombra elevada, un poco
             más larga que la de las tarjetas. */
          style={{
            boxShadow: "0 1px 2px rgba(46,36,64,.06), 0 16px 34px -18px rgba(46,36,64,.3)",
          }}
        >
          {/* ── Lo que se paga ── va primero en el DOM: en móvil se decide y
              se paga arriba, y quien aún duda baja a leer qué incluye. */}
          <div className="p-4 lg:flex-1 lg:p-8">
            <SelectorCiclo valor={frecuencia} alCambiar={elegir} />

            <p className="eyebrow-b eyebrow-b-centrado mt-6 flex items-center">
              Plan {frecuencia} · Membresía completa
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span
                className="font-display text-espresso"
                /* `PrecioQueCuenta` y no `NumeroQueCuenta`: aquel cuenta cuando
                   el número ENTRA en pantalla, y aquí ya está a la vista — lo
                   que cambia es el ciclo. */
                style={{ fontWeight: 600, fontSize: "clamp(52px, 6vw, 64px)", lineHeight: 1 }}
              >
                <PrecioQueCuenta hasta={pr.porMesNumero[frecuencia]} moneda={pr.moneda} quieto={Boolean(quieto)} />
              </span>
              <span className="text-ink-body text-base">/mes</span>
            </p>
            <p className="text-ink-body mt-2 text-sm leading-snug text-pretty">{pr.nota(frecuencia)}</p>

            <NotaMoneda moneda={pr.moneda} cobro={pr.precios[frecuencia]} pais={pais} />

            {/* `id`: con este botón a la vista, la barra fija se esconde
                (serían dos botones dorados iguales en la misma pantalla). */}
            <div id="cta-pagar-precio" className="mt-6">
              <EnlaceCompra
                href={enlace ?? `/pagar?ciclo=${frecuencia}&desde=precio`}
                origen="precio"
                plan={frecuencia}
                abrePago={Boolean(enlace)}
                conRuta
                posicion="precio"
                className="cta-pagar flex h-14 w-full items-center justify-center gap-2 px-4 whitespace-nowrap transition-transform active:scale-[0.98]"
              >
                {/* En mensual, a 375px el texto no cabe con el candado (19px es
                  el mínimo de contraste AA del blanco sobre dorado): cede el
                  candado, nunca el texto ni el tamaño. */}
                <Lock
                  size={18}
                  strokeWidth={2.4}
                  aria-hidden="true"
                  className={frecuencia === "mensual" ? "max-sm:hidden" : undefined}
                />
                Inscribirme con el plan {frecuencia}
              </EnlaceCompra>
            </div>

            {/* ⚠️ SI NO HAY ENLACE PARA ESE CICLO, NO SE FINGE QUE SE PUEDE
                PAGAR: el botón lleva a `/pagar` y aquí se dice qué va a pasar. */}
            {enlace ? (
              <MediosDePago moneda={pr.moneda} />
            ) : (
              <p className="text-ink-body mt-3 text-center text-sm">
                Te escribimos al correo con el enlace de pago y tu acceso.
              </p>
            )}

            {directo && <AsiSigue pais={pais} />}

            <div className="border-line mt-5 flex flex-col gap-4 border-t pt-5">
              <GarantiaCorta />
              <TestimonioCorto />
            </div>
          </div>

          {/* ── Lo que se lleva ── */}
          <div className="bg-sand p-5 shadow-[inset_0_1px_0_var(--line)] lg:flex-1 lg:p-8 lg:shadow-[inset_1px_0_0_var(--line)]">
            <p className="eyebrow-b eyebrow-b-centrado flex items-center gap-3">Incluye</p>
            <ul className="mt-4 flex flex-col gap-3">
              {INCLUYE.map((b) => (
                <PiezaB como="li" key={b} className="text-espresso flex items-start gap-3 leading-snug">
                  {/* Check propio: cuadrito marfil con el check en violeta. El
                      ✓ del sistema se ve de otra fuente y delata la maqueta. */}
                  <span className="bg-ivory text-gold rounded-chip-b flex size-6 shrink-0 items-center justify-center">
                    <Check size={14} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                  {b}
                </PiezaB>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-ink-body mt-4 text-sm lg:mt-6 lg:text-center lg:text-base">
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
