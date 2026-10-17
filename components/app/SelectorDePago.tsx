"use client";

import { Check, ShieldCheck } from "lucide-react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  AHORRO_ANUAL_PCT,
  GARANTIA,
  INCLUYE,
  NOTA_PAGO,
  PRECIO_POR_MES,
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
/**
 * El precio, contando hasta su valor cada vez que cambia.
 *
 * ⚠️ NO SIRVE `NumeroQueCuenta`, Y SE INTENTÓ. Aquel cuenta cuando el número
 * ENTRA EN PANTALLA (`useInView` + `once: true`), que es lo correcto para el
 * home. Aquí el número no entra: ya está a la vista y lo que cambia es el plan
 * elegido. Montándolo de nuevo con `key` el contador arrancaba en 0 y se
 * quedaba ahí — al volver a "Anual" el precio se leía **US$0,00**, que en una
 * pantalla de cobro es lo más parecido a un error que puede pasar.
 *
 * Este cuenta al cambiar el VALOR, sin mirar el scroll.
 */
function PrecioQueCuenta({ hasta, quieto }: { hasta: number; quieto: boolean }) {
  const [n, setN] = useState(hasta);
  const anterior = useRef(hasta);

  useEffect(() => {
    // Con `prefers-reduced-motion` no se anima NI se toca el estado: el valor
    // se pinta directo abajo. Escribirlo aquí sería un `setState` en un efecto
    // para nada.
    if (quieto) return;
    const control = animate(anterior.current, hasta, {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setN,
    });
    anterior.current = hasta;
    return () => control.stop();
  }, [hasta, quieto]);

  const texto = (v: number) => `US$${v.toFixed(2).replace(".", ",")}`;

  /* El ancho se reserva con el valor final invisible: si no, el renglón entero
     se movería a cada cifra mientras cuenta. */
  return (
    <span className="relative inline-grid">
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {texto(hasta)}
      </span>
      <span className="col-start-1 row-start-1">{texto(quieto ? hasta : n)}</span>
    </span>
  );
}

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
  const quieto = useReducedMotion();
  // `layoutId` tiene que ser único por instancia: dos selectores en la misma
  // página compartirían la píldora y se la robarían el uno al otro.
  const idPildora = useId();

  return (
    <div className="mt-10">
      <div className="flex justify-center">
        <div className="bg-sand inline-flex items-center rounded-full p-1.5">
          {(["anual", "mensual"] as const).map((f) => {
            const activo = frecuencia === f;
            return (
              <motion.button
                key={f}
                type="button"
                aria-pressed={activo}
                onClick={() => setFrecuencia(f)}
                whileTap={quieto ? undefined : { scale: 0.97 }}
                className={`relative flex h-11 items-center gap-2.5 rounded-full px-6 font-semibold [touch-action:manipulation] ${
                  activo ? "text-white" : "text-ink-body"
                }`}
              >
                {/*
                  ⚠️ LA PÍLDORA ES UN ELEMENTO QUE SE MUEVE, NO UN FONDO QUE SE
                  ENCIENDE Y SE APAGA. Con `layoutId`, Motion la desliza de una
                  opción a la otra: se ve de dónde viene el cambio. Antes los
                  dos botones cambiaban de color a la vez y el ojo no seguía
                  nada — parecía un parpadeo, no una elección.
                */}
                {activo && (
                  <motion.span
                    aria-hidden="true"
                    layoutId={quieto ? undefined : `pildora-${idPildora}`}
                    className="bg-espresso absolute inset-0 rounded-full"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}

                {/* `relative` para quedar POR ENCIMA de la píldora absoluta. */}
                <span className="relative">{f === "anual" ? "Anual" : "Mensual"}</span>
                {f === "anual" && (
                  <span
                    className={`relative rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                      activo ? "bg-gold-light text-espresso" : "bg-gold-light/50 text-ink-body"
                    }`}
                  >
                    Ahorra {AHORRO_ANUAL_PCT}%
                  </span>
                )}
              </motion.button>
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
              {/*
                ⚠️ EL PRECIO CUENTA, no aparece de golpe — es la baseline 2 del
                sistema y aquí además hace un trabajo concreto: al pasar de
                mensual a anual, ver el número BAJAR de 25,00 a 20,83 es la
                demostración del descuento. Escrito de golpe, el ahorro hay que
                deducirlo; contando, se ve.

                `key` fuerza que se remonte en cada cambio, que es lo que
                dispara el conteo otra vez.
              */}
              <PrecioQueCuenta hasta={PRECIO_POR_MES[frecuencia]} quieto={Boolean(quieto)} />
            </span>
            <span className="text-lg text-white/60">/mes</span>
          </p>

          {/* La nota cambia con un fundido corto: sustituir el texto de golpe
              bajo un número que se está moviendo es un salto más de los que el
              ojo puede seguir a la vez. */}
          <div className="relative mt-2 grid text-sm text-white/70">
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

          <p className="mt-3 text-center text-xs text-white/70">
            {url ? NOTA_PAGO : "Te escribimos al correo con el enlace de pago y tu acceso."}
          </p>

          {/*
            ⚠️ LA ÚNICA PRUEBA SOCIAL QUE PODEMOS DEMOSTRAR, y va justo debajo
            del botón: es donde aparece la duda de "¿y si no sirvo para esto?",
            que es la objeción nº1 de la ficha de avatar.

            Dice "sin experiencia previa" a propósito — el número solo, suelto,
            impresiona pero no responde a esa duda concreta.

            ⚠️ NO LLEVA VALORACIÓN. Había un "4,9/5" por la app y Cristian lo
            retiró el 2026-10-17: no hay un sistema de reseñas que lo sostenga.
            Una cifra que no se puede demostrar, si alguien la cuestiona, se
            lleva por delante la credibilidad del resto de la página.
          */}
          <p className="mt-4 border-t border-white/10 pt-4 text-center text-sm text-white/75">
            <strong className="font-semibold text-white">+1.200 alumnas</strong> en Latinoamérica
            empezaron sin experiencia previa.
          </p>
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

      {/*
        ⚠️ EL CORREO, FUERA DE LA TARJETA DE VENTA. Estaba dentro, debajo del
        botón, y ahí era un dato administrativo compitiendo con el CTA en el
        punto exacto de la decisión. Sigue haciendo falta —es a esa cuenta a la
        que se le abre el acceso— pero como pie de página, no como protagonista.
      */}
      {correo && (
        <p className="text-ink-muted mt-4 text-center text-xs">
          El acceso se abre en tu cuenta:{" "}
          <strong className="text-ink-body font-semibold">{correo}</strong>
        </p>
      )}
    </div>
  );
}
