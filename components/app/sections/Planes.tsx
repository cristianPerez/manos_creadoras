"use client";

import { Check, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import {
  AHORRO_ANUAL_PCT,
  FRECUENCIA_POR_DEFECTO,
  NOTA_PAGO,
  PLANES,
  PLAN_POR_DEFECTO,
  precioPorMes,
  type Frecuencia,
  type Plan,
  type PlanId,
} from "@/lib/planes";

/**
 * Los planes. La sección que decide si el negocio cobra.
 *
 * ⚠️ TIENE DOS DISEÑOS DISTINTOS, no uno adaptado. En escritorio se ven las tres
 * tarjetas a la vez para poder compararlas; en móvil eso serían tres columnas de
 * 110px donde no cabe nada, así que el diseño cambia de forma: un selector de
 * tres mini tarjetas y UNA sola tarjeta completa debajo. No es el mismo
 * componente encogido — es otra manera de elegir.
 *
 * Por eso los dos layouts conviven con `hidden`/`lg:hidden` en vez de intentar
 * que un solo marcado sirva para ambos: forzarlo habría dejado la peor versión
 * de cada uno.
 */
export function Planes() {
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(FRECUENCIA_POR_DEFECTO);
  const [elegido, setElegido] = useState<PlanId>(PLAN_POR_DEFECTO);

  const planElegido = PLANES.find((p) => p.id === elegido) ?? PLANES[1];

  return (
    <section id="planes" className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <header className="text-center">
          <p className="eyebrow">Planes</p>
          <h2 className="titulo-seccion mt-3 text-balance">Elige cómo quieres crear.</h2>
          <p className="text-ink-body mx-auto mt-4 max-w-xl text-balance">
            Empieza con un curso gratis. Cuando quieras más, un bolso nuevo cada mes.
          </p>
        </header>

        {/* ── ESCRITORIO ──────────────────────────────────────────── */}
        <div className="mt-10 hidden lg:block">
          <ConmutadorPildora frecuencia={frecuencia} alCambiar={setFrecuencia} />

          {/*
            `items-start` y no `items-stretch`: la tarjeta destacada es MÁS ALTA
            a propósito (sobresale por arriba y por abajo). Estirarlas todas a la
            misma altura mataría justo el gesto que la hace destacar.
          */}
          <div className="mt-12 grid grid-cols-3 items-start gap-6">
            {PLANES.map((plan) => (
              <TarjetaPlan key={plan.id} plan={plan} frecuencia={frecuencia} />
            ))}
          </div>
        </div>

        {/* ── MÓVIL ───────────────────────────────────────────────── */}
        <div className="mt-8 lg:hidden">
          <ConmutadorInterruptor frecuencia={frecuencia} alCambiar={setFrecuencia} />

          <SelectorDePlan
            elegido={elegido}
            frecuencia={frecuencia}
            alElegir={setElegido}
          />

          <div className="mt-5">
            <TarjetaPlan plan={planElegido} frecuencia={frecuencia} />
          </div>
        </div>

        <p className="text-ink-muted mt-8 flex items-center justify-center gap-2 text-center text-sm">
          <ShieldCheck size={15} className="text-gold shrink-0" aria-hidden="true" />
          {NOTA_PAGO}
        </p>
      </div>
    </section>
  );
}

/**
 * El conmutador de escritorio: una píldora sobre arena con el lado activo en
 * espresso.
 *
 * ⚠️ Son dos botones de verdad, no un `<input>` disfrazado: cada lado anuncia
 * con `aria-pressed` si está activo. Un interruptor binario aquí obligaría al
 * lector de pantalla a decir "activado/desactivado" sobre algo que tiene dos
 * nombres propios, y "desactivado" no significa "mensual".
 */
function ConmutadorPildora({
  frecuencia,
  alCambiar,
}: {
  frecuencia: Frecuencia;
  alCambiar: (f: Frecuencia) => void;
}) {
  return (
    <div className="flex justify-center">
      <div className="bg-sand inline-flex items-center rounded-full p-1.5">
        {(["anual", "mensual"] as const).map((f) => {
          const activo = frecuencia === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={activo}
              onClick={() => alCambiar(f)}
              className={`flex h-11 items-center gap-2.5 rounded-full px-6 font-semibold transition-colors [touch-action:manipulation] ${
                activo ? "bg-espresso text-white" : "text-ink-body hover:text-espresso"
              }`}
            >
              {f === "anual" ? "Anual" : "Mensual"}
              {/* El badge solo tiene sentido dentro del lado anual y solo cuando
                  está activo: sobre arena, el dorado claro no se lee. */}
              {f === "anual" && activo && (
                <span className="bg-gold-light text-espresso rounded-full px-2.5 py-1 text-xs font-bold">
                  Ahorra {AHORRO_ANUAL_PCT}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * El conmutador de móvil: "Mensual ◯ Anual −25%".
 *
 * Aquí SÍ es un `role="switch"`, como pedía el encargo, porque la forma es la de
 * un interruptor físico y eso es lo que la persona ve. `aria-checked` va atado a
 * "¿está en anual?", que es el estado que el interruptor representa.
 */
function ConmutadorInterruptor({
  frecuencia,
  alCambiar,
}: {
  frecuencia: Frecuencia;
  alCambiar: (f: Frecuencia) => void;
}) {
  const anual = frecuencia === "anual";

  return (
    <div className="flex items-center justify-center gap-3">
      <span className={anual ? "text-ink-muted" : "text-espresso font-semibold"}>Mensual</span>

      <button
        type="button"
        role="switch"
        aria-checked={anual}
        aria-label="Cobrar al año en vez de cada mes"
        onClick={() => alCambiar(anual ? "mensual" : "anual")}
        /* 44px de alto real aunque la pista mida 32: el área táctil mínima no se
           negocia, y en un control de 32px el dedo falla una de cada tres veces. */
        className="flex h-11 items-center [touch-action:manipulation]"
      >
        <span className="bg-espresso relative block h-8 w-16 rounded-full">
          <span
            aria-hidden="true"
            className={`bg-gold-light absolute top-1 size-6 rounded-full transition-[left] duration-200 ${
              anual ? "left-9" : "left-1"
            }`}
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          />
        </span>
      </button>

      <span className={anual ? "text-espresso font-semibold" : "text-ink-muted"}>Anual</span>
      <span className="text-gold font-bold">−{AHORRO_ANUAL_PCT}%</span>
    </div>
  );
}

/**
 * Las tres mini tarjetas de móvil.
 *
 * `radiogroup` y no una lista de botones: elegir plan es escoger UNO de tres
 * excluyentes, que es literalmente lo que un grupo de radio comunica. Con
 * botones sueltos, quien navega a ciegas no sabe que elegir uno descarta los
 * otros.
 */
function SelectorDePlan({
  elegido,
  frecuencia,
  alElegir,
}: {
  elegido: PlanId;
  frecuencia: Frecuencia;
  alElegir: (p: PlanId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Elige tu plan" className="mt-5 grid grid-cols-3 gap-2.5">
      {PLANES.map((plan) => {
        const activo = plan.id === elegido;
        const precio = plan.precioMes[frecuencia];
        return (
          <button
            key={plan.id}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => alElegir(plan.id)}
            className={`bg-ivory flex min-h-16 flex-col items-center justify-center rounded-[var(--radius-lg)] px-2 py-3 text-center transition-colors [touch-action:manipulation] ${
              activo ? "border-gold border-2" : "border-line border"
            }`}
          >
            <span className="text-espresso text-sm font-semibold">{plan.nombre}</span>
            <span className="font-display text-espresso mt-0.5 text-lg">
              {precio === null ? "Gratis" : `$${precio.toFixed(2).replace(".", ",")}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Una tarjeta de plan. La misma pieza en escritorio y en móvil. */
function TarjetaPlan({ plan, frecuencia }: { plan: Plan; frecuencia: Frecuencia }) {
  const precio = plan.precioMes[frecuencia];
  const destacado = plan.destacado === true;

  return (
    <article
      className={`flex flex-col rounded-[var(--radius-xl)] p-7 md:p-8 ${
        destacado
          ? "text-white shadow-[var(--shadow-lg)] lg:-my-6 lg:py-14"
          : "bg-ivory border-line border"
      }`}
      style={destacado ? { backgroundImage: "var(--card-destacada)" } : undefined}
    >
      {destacado && plan.insignia && (
        <p className="bg-gold-light text-espresso mb-5 w-fit rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.12em] uppercase">
          {plan.insignia}
        </p>
      )}

      <h3
        className={`font-display text-2xl ${destacado ? "text-white" : "text-espresso"}`}
        style={{ fontWeight: 500 }}
      >
        {plan.nombre}
      </h3>

      {/* El PRECIO. En la tarjeta oscura va en dorado pálido — sobre cacao, el
          dorado normal (--gold) se hunde y deja de leerse como precio. */}
      <p className="mt-3 flex items-baseline gap-1.5">
        <span
          /* Sin `cifra`: esa clase fuerza la sans y aquí la guía pide Cormorant
             (ver el comentario de `.cifra` en globals.css). */
          className={`font-display text-5xl ${destacado ? "text-gold-pale" : "text-espresso"}`}
          style={{ fontWeight: 500, letterSpacing: "-0.015em" }}
        >
          {precio === null ? "Gratis" : precioPorMes(precio)}
        </span>
        {precio !== null && (
          <span className={`text-sm ${destacado ? "text-gold-pale/80" : "text-ink-muted"}`}>
            /mes
          </span>
        )}
      </p>

      <p className={`mt-1.5 text-sm ${destacado ? "text-white/70" : "text-ink-muted"}`}>
        {plan.nota[frecuencia]}
      </p>

      <ul className="mt-7 flex flex-1 flex-col gap-3.5">
        {plan.beneficios.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <Check
              size={16}
              strokeWidth={2.5}
              className={`mt-0.5 shrink-0 ${destacado ? "text-gold-light" : "text-gold"}`}
              aria-hidden="true"
            />
            <span className={`text-sm ${destacado ? "text-white/90" : "text-ink-body"}`}>{b}</span>
          </li>
        ))}
      </ul>

      <BotonPlan plan={plan} frecuencia={frecuencia} destacado={destacado} />
    </article>
  );
}

/**
 * El botón de cada plan.
 *
 * ⚠️ MIENTRAS NO HAYA PASARELA, NO FINGE COBRAR. OnePay no tiene checkout
 * alojado (ver `lib/planes.ts`), así que no hay URL a la que mandar. Un botón
 * dorado que diga "Suscribirme" y lleve a una página rota es peor que no
 * tenerlo: gasta el momento en que la persona estaba decidida.
 *
 * Mientras `checkout` esté vacío, el plan gratuito manda a crear la cuenta —que
 * sí funciona— y los de pago a contacto, donde se atiende de verdad. El evento
 * se mide igual, así que el embudo sigue contando quién quiso pagar.
 */
function BotonPlan({
  plan,
  frecuencia,
  destacado,
}: {
  plan: Plan;
  frecuencia: Frecuencia;
  destacado: boolean;
}) {
  /*
   * ⚠️ `/cuenta` ESTABA ROTO: esa ruta ya no existe (redirige a /app/cuenta), y
   * además mandaba a la pantalla de cuenta cuando lo que hay que hacer es CREAR
   * la cuenta. Ahora el gratis va a `/entrar` y los de pago a `/pagar`, que es
   * la pantalla que cobrará cuando OnePay esté.
   */
  const url = plan.checkout[frecuencia];
  const destino =
    plan.id === "aprendiz"
      ? "/entrar"
      : `/pagar?plan=${plan.id}&ciclo=${frecuencia}`;

  const base =
    "mt-8 flex h-14 w-full items-center justify-center rounded-full font-semibold transition-transform active:scale-[0.98] [touch-action:manipulation]";

  /*
   * ⚠️ SIN PASARELA, EL BOTÓN TIENE QUE DECIR A DÓNDE LLEVA. Pulsar
   * "Suscribirme" y aterrizar en un formulario de contacto sin aviso es una
   * sorpresa justo en el momento de más intención — se lee como que la página
   * está rota. La etiqueta se respeta (es la del diseño) y debajo se dice en
   * una línea qué va a pasar, que es lo que faltaba.
   */
  const avisa = url === "" && plan.id !== "aprendiz";
  void url;

  return (
    <>
      <a
        href={destino}
        onClick={() => medir(EVENTOS.checkoutAbierto, { plan: plan.id, frecuencia })}
        className={
          destacado
            ? `${base} bg-gold-light text-espresso`
            : `${base} border-espresso text-espresso border`
        }
      >
        {plan.cta}
      </a>
      {avisa && (
        <p
          className={`mt-3 text-center text-xs ${destacado ? "text-white/60" : "text-ink-muted"}`}
        >
          Te escribimos para activar tu acceso.
        </p>
      )}
    </>
  );
}
