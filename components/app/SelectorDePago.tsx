"use client";

import { InterruptorPlan } from "@/components/app/InterruptorPlan";
import { Check, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { PrecioQueCuenta } from "@/components/app/PrecioQueCuenta";
import { useState } from "react";
import {
  GARANTIA,
  INCLUYE,
  NOTA_PAGO,
  precioPorMesDe,
  notaDelCobro,
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
  /*
   * ⚠️ SI ESTA PERSONA SIGUE DENTRO DE SUS 24h DE OFERTA. Llega como dato y no
   * se calcula aquí: depende de una cookie que solo el servidor lee, y además
   * decide el PRECIO — tenerlo en dos sitios es tener dos precios.
   */
}) {
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(frecuenciaInicial);
  const url = enlaces[frecuencia];
  const quieto = useReducedMotion();

  return (
    <div className="mt-8">
      {/* Interruptor y no píldora partida (2026-10-21, pedido de Cristian):
          el mismo de toda la app — `components/app/InterruptorPlan.tsx`. */}
      <InterruptorPlan valor={frecuencia} alCambiar={setFrecuencia} tamano="grande" />

      {/*
        ⚠️ LA MISMA TARJETA QUE EL PRECIO DEL HOME (app interna, 2026-10-23):
        lo que se paga en espresso a la izquierda, lo que se lleva en marfil a
        la derecha. Antes era un bloque con `--card-destacada` en degradado,
        de otro sistema que el home.
      */}
      <section className="border-line mt-8 grid overflow-hidden rounded-(--radius-foto) border max-md:rounded-bloque md:grid-cols-2">
        <div className="bg-espresso sobre-oscuro px-6 py-7 md:p-11">
          <p className="eyebrow">Plan {frecuencia}</p>
          <h2
            className="font-display text-cream mt-2 text-balance max-md:hidden"
            style={{ fontWeight: 500, fontSize: "clamp(26px, 2.6vw, 34px)", lineHeight: 1.15 }}
          >
            Curso completo de bolsos de perlas
          </h2>
          <p className="mt-4 flex items-baseline gap-2">
            <span
              className="font-display text-gold-pale"
              style={{ fontWeight: 500, fontSize: "clamp(64px, 7vw, 84px)", lineHeight: 1 }}
            >
              {/*
                ⚠️ EL PRECIO CUENTA, no aparece de golpe: al pasar de mensual a
                anual, ver el número BAJAR es la demostración del descuento.
              */}
              <PrecioQueCuenta hasta={precioPorMesDe()[frecuencia]} quieto={Boolean(quieto)} />
            </span>
            <span className="text-on-dark-muted text-lg">/mes</span>
          </p>
          {/* La nota cambia con un fundido corto: sustituir el texto de golpe
              bajo un número que se está moviendo es un salto más de los que el
              ojo puede seguir a la vez. */}
          <div className="text-on-dark-muted relative mt-2 grid text-base">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={frecuencia}
                className="col-start-1 row-start-1"
                initial={quieto ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={quieto ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                {notaDelCobro(frecuencia)}
              </motion.p>
            </AnimatePresence>
          </div>

          {/*
            ⚠️ MIENTRAS NO HAYA PASARELA, EL BOTÓN NO FINGE COBRAR: lleva a
            contacto —donde se explica que el enlace de pago llega por correo— y
            lo DICE antes de que se pulse.
          */}
          <Link
            href={url ?? "/contacto"}
            className="bg-gold-pale text-espresso mt-6 flex h-14 items-center justify-center rounded-full font-semibold transition-transform active:scale-[0.98]"
          >
            {/* Con enlace de pago dice lo mismo que el home y Mis bolsos
                (auditoría 2026-10-23); sin él no promete inscribir. */}
            {url ? "Inscribirme con el plan" : "Quiero el plan"} {frecuencia === "anual" ? "anual" : "mensual"}
          </Link>
          <p className="text-on-dark-muted mt-4 text-center text-sm md:text-left">
            {url ? NOTA_PAGO : "Te escribimos al correo con el enlace de pago y tu acceso."}
          </p>
        </div>

        <div className="bg-ivory flex flex-col px-6 py-7 md:p-11">
          <p className="eyebrow">Incluye</p>
          <ul className="mt-4 flex flex-col gap-3">
            {INCLUYE.map((b) => (
              <li key={b} className="text-espresso flex items-start gap-3 text-base">
                <Check size={17} strokeWidth={2.5} className="text-gold mt-1 shrink-0" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
          <div className="bg-sand mt-6 flex items-start gap-3 rounded-[18px] p-5 md:mt-auto">
            <ShieldCheck size={22} className="text-cacao mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-ink-body text-sm">
              <strong className="text-espresso font-semibold">{GARANTIA.titulo}.</strong>{" "}
              {GARANTIA.texto}
            </p>
          </div>
        </div>
      </section>

      {/*
        ⚠️ LA ÚNICA PRUEBA SOCIAL QUE PODEMOS DEMOSTRAR. Dice "sin experiencia
        previa" a propósito: responde la objeción nº1 de la ficha de avatar
        ("¿y si no sirvo para esto?"). Sin valoración: el "4,9/5" se retiró el
        2026-10-17 porque no hay reseñas que lo sostengan.
      */}
      <p className="text-ink-body mt-6 text-center">
        <strong className="text-espresso font-semibold">+1.200 alumnas</strong> en Latinoamérica
        empezaron sin experiencia previa.
      </p>

      {/*
        ⚠️ EL CORREO, FUERA DE LA TARJETA DE VENTA: como pie, no como
        protagonista en el punto exacto de la decisión.
      */}
      {correo && (
        <p className="text-ink-muted mt-3 text-center text-xs">
          El acceso se abre en tu cuenta:{" "}
          <strong className="text-ink-body font-semibold">{correo}</strong>
        </p>
      )}
    </div>
  );
}
