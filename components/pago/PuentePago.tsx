"use client";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarPlus,
  ClipboardList,
  Lock,
  MessageCircle,
  PlayCircle,
  ScanEye,
  ShieldCheck,
  Users,
  Award,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { usePrecios } from "@/components/app/Precios";
import { PrecioQueCuenta } from "@/components/app/PrecioQueCuenta";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { WHATSAPP_NUMERO, WHATSAPP_URL } from "@/lib/landing";
import type { OrigenCompra } from "@/lib/origen-compra";
import { formatoPrecio, GARANTIA, type Frecuencia, type Moneda } from "@/lib/planes";

/**
 * La página intermedia entre "quiero comprar" y OnePay. Ver la cabecera de
 * `app/(publicas)/pagar/page.tsx` para el porqué con datos.
 *
 * UNA MISIÓN: que salga hacia OnePay sabiendo qué compra, cuánto paga en su
 * moneda y qué le van a pedir. No es una segunda página de ventas (nada de
 * testimonios ni de repetir el home) y no pide ningún dato.
 *
 * ⚠️ SIN NÚMERO DE PROYECTOS. El encargo de diseño proponía "23 proyectos y
 * 106 videos", pero el 2026-11-01 Cristian quitó la cifra de toda la página:
 * un número cerrado es un techo ("¿por qué sigo pagando si ya los vi?"). Ver
 * `INCLUYE` en `lib/planes.ts`.
 *
 * ⚠️ SIN PROMETER PSE, NEQUI NI OXXO: solo "tarjeta de crédito o débito", que
 * es lo único confirmado para todos los planes.
 *
 * Funciona igual en las dos paletas del A/B: solo usa tokens (`--gold`,
 * `--espresso`…), que la B reasigna a violeta.
 */
export function PuentePago({
  enlaces,
  frecuenciaInicial,
  pais,
  correo,
  desde,
}: {
  enlaces: Record<Frecuencia, string | null>;
  frecuenciaInicial: Frecuencia;
  /** ISO-2 del país detectado en el servidor ("CO", "MX"…). */
  pais: string;
  /** El correo de la sesión, si la hay: el acceso llega ahí. */
  correo: string | null;
  /** Qué botón la trajo, para el embudo. */
  desde: OrigenCompra | null;
}) {
  const pr = usePrecios();
  const quieto = Boolean(useReducedMotion());
  const enLinea = useEnLinea();
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(frecuenciaInicial);
  const url = enlaces[frecuencia];

  /* Los dos botones del móvil (arriba, en la tarjeta, y al final). La barra
     fija solo sale cuando NINGUNO se ve: si no, habría dos botones iguales
     uno encima del otro. */
  const botonRef = useRef<HTMLDivElement>(null);
  const botonFinRef = useRef<HTMLDivElement>(null);
  const [botonVisible, setBotonVisible] = useState(true);
  useEffect(() => {
    const els = [botonRef.current, botonFinRef.current].filter((e): e is HTMLDivElement => Boolean(e));
    if (!els.length) return;
    const vistos = new Set<Element>();
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) vistos.add(e.target);
          else vistos.delete(e.target);
        }
        setBotonVisible(vistos.size > 0);
      },
      { threshold: 0 },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, []);

  /* Una vez por visita: llegó a la intermedia. */
  const medido = useRef(false);
  useEffect(() => {
    if (medido.current) return;
    medido.current = true;
    medir(EVENTOS.pagoPuenteVisto, { plan: frecuenciaInicial, moneda: pr.moneda, desde: desde ?? "directo" });
  }, [frecuenciaInicial, pr.moneda, desde]);

  /*
   * Entrada escalonada por CSS (`.reveal`, 70 ms entre bloques) y NO con
   * Motion: con Motion el contenido llega oculto en el HTML y no aparece hasta
   * que el JavaScript termina de cargar — en un Android con datos eso es
   * mirar una página vacía justo antes de pagar. El CSS corre en cuanto pinta.
   * `prefers-reduced-motion` lo apaga el bloque global de `globals.css`.
   */
  const entra = (i: number) => ({ className: "reveal", style: { "--reveal-delay": `${i * 70}ms` } as CSSProperties });

  const boton = <BotonPagar url={url} frecuencia={frecuencia} enLinea={enLinea} />;
  const botonTarjeta = <BotonPagar url={url} frecuencia={frecuencia} enLinea={enLinea} enTarjeta />;

  return (
    <div className="bg-surface-base grano-fondo min-h-dvh pb-28 lg:pb-16">
      {/* ── Cabecera mínima: es un paso de pago, sin menú. ── */}
      <header className="mx-auto flex max-w-270 items-center justify-between px-4 py-3 lg:px-8 lg:py-5">
        <BotonVolver />
        <p className="font-display text-espresso text-lg" style={{ fontWeight: 600 }}>
          Manos Creadoras
        </p>
        <p className="text-ink-muted flex min-h-11 items-center gap-1.5 text-sm font-semibold">
          <Lock size={15} aria-hidden="true" /> Pago seguro
        </p>
      </header>

      <main className="mx-auto grid max-w-270 gap-6 px-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12 lg:px-8">
        {/* ── Columna de lectura (en móvil: titular, plan, qué recibes, pasos) ── */}
        <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
          <div {...entra(0)} className="reveal pt-2 lg:pt-6">
            <p className="text-ink-muted text-xs font-bold tracking-[0.2em] uppercase">Último paso</p>
            <h1
              className="font-display text-espresso mt-2 text-balance"
              style={{ fontWeight: 500, fontSize: "clamp(36px, 4.4vw, 52px)", lineHeight: 1.05 }}
            >
              Esto es lo que <em className="clave text-gold">te llevas</em>
            </h1>
            <p className="text-ink-body mt-3 text-base text-pretty">
              Todos los proyectos paso a paso, desde cero aunque nunca hayas tejido, para que tus piezas tengan acabado profesional de boutique.
            </p>
          </div>

          {/* En móvil el plan va aquí, arriba: el botón se ve sin bajar. */}
          <div {...entra(1)} className="reveal lg:hidden">
            <TarjetaPlan
              frecuencia={frecuencia}
              alCambiar={setFrecuencia}
              quieto={quieto}
              pais={pais}
              boton={<div ref={botonRef}>{botonTarjeta}</div>}
            />
          </div>

          <section {...entra(2)} aria-labelledby="que-recibes">
            <h2 id="que-recibes" className="font-display text-espresso text-2xl" style={{ fontWeight: 600 }}>
              Qué recibes desde hoy
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <Beneficio icono={<PlayCircle size={22} />} titulo="Todos los proyectos en video" fotos>
                Bolsos, accesorios y adornos navideños, con cada paso grabado.
              </Beneficio>
              {/* El diferencial: ningún curso del nicho lo tiene. Destacado con
                  borde de acento y su etiqueta; el resto va compacto debajo. */}
              <Beneficio icono={<ScanEye size={22} />} titulo="El Ojo Experto" destacado>
                Le mandas la foto de tu tejido y te dice qué corregir.
              </Beneficio>
              <li className="bg-ivory border-line rounded-bloque border px-4 py-1 sm:col-span-2">
                <ul className="divide-line divide-y">
                  <FilaCompacta icono={<CalendarPlus size={18} />} titulo="Clases nuevas cada semana">
                    y las velas en diciembre, sin pagar de nuevo
                  </FilaCompacta>
                  <FilaCompacta icono={<ClipboardList size={18} />} titulo="Qué comprar y dónde">
                    para no volver a tirar cuentas y herrajes
                  </FilaCompacta>
                  <FilaCompacta icono={<Award size={18} />} titulo="Estrategias para vender">
                    y certificado por cada taller
                  </FilaCompacta>
                </ul>
              </li>
            </ul>
          </section>

          <section {...entra(3)} aria-labelledby="que-pasa">
            <PasosOnePay pais={pais} correo={correo} />
          </section>

          {/* Cierre del móvil: garantía y el botón otra vez, al final de leer. */}
          <div {...entra(4)} className="reveal flex flex-col gap-4 lg:hidden">
            <Garantia />
            <PruebaSocial />
            <ResumenFinal frecuencia={frecuencia} alCambiar={setFrecuencia} />
            <div ref={botonFinRef}>{boton}</div>
            <Dudas />
          </div>
        </div>

        {/* ── Escritorio: el resumen y el botón fijos a la derecha ── */}
        <aside {...entra(1)} className="reveal hidden lg:block">
          <div className="sticky top-6 flex flex-col gap-4 pt-6">
            <TarjetaPlan
              frecuencia={frecuencia}
              alCambiar={setFrecuencia}
              quieto={quieto}
              pais={pais}
              boton={botonTarjeta}
            />
            <Garantia />
            <PruebaSocial />
            <Dudas />
          </div>
        </aside>
      </main>

      {/* ── Móvil: barra fija cuando el botón de arriba ya no se ve ── */}
      <div
        aria-hidden={botonVisible}
        className={`bg-ivory border-line fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgba(42,31,25,0.35)] transition-transform duration-300 ease-out lg:hidden ${
          botonVisible ? "pointer-events-none translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-140 items-center gap-3">
          {/* El precio cede y se parte en renglones; el botón mide SIEMPRE lo
              mismo (176px), sea mensual o anual (revisor, 5ª ronda). */}
          <div className="min-w-0 flex-1">
            <p className="text-espresso text-base leading-tight font-bold">{pr.porMes(frecuencia)} al mes</p>
            <p className="text-ink-muted text-sm leading-tight">
              {frecuencia === "anual" ? `${pr.cobro("anual")} al año` : "plan mensual"}
            </p>
          </div>
          <div className="w-44 shrink-0">
            <BotonPagar url={url} frecuencia={frecuencia} enLinea={enLinea} compacto inerte={botonVisible} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ Piezas ═══════════════════════════════ */

/** El plan elegido, con su selector, el precio en su moneda y el botón. */
function TarjetaPlan({
  frecuencia,
  alCambiar,
  quieto,
  pais,
  boton,
}: {
  frecuencia: Frecuencia;
  alCambiar: (f: Frecuencia) => void;
  quieto: boolean;
  pais: string;
  boton: ReactNode;
}) {
  const pr = usePrecios();
  return (
    <section aria-label="Tu plan" className="tarjeta-pago rounded-bloque border p-4 lg:p-6">
      <SelectorCiclo valor={frecuencia} alCambiar={alCambiar} />

      <p className="mt-5 flex items-baseline gap-2">
        <span
          className="font-display text-(--tp-precio)"
          style={{ fontWeight: 600, fontSize: "clamp(48px, 5vw, 60px)", lineHeight: 1 }}
        >
          <PrecioQueCuenta hasta={pr.porMesNumero[frecuencia]} moneda={pr.moneda} quieto={quieto} />
        </span>
        <span className="text-base text-(--tp-texto-2)">/mes</span>
      </p>
      <p className="mt-2 text-sm leading-snug text-pretty text-(--tp-texto-2)">{pr.nota(frecuencia)}</p>

      <NotaMoneda moneda={pr.moneda} cobro={pr.precios[frecuencia]} pais={pais} />

      <div className="mt-5">{boton}</div>
    </section>
  );
}

/** Mensual o anual, con el precio por mes dentro de cada opción. */
function SelectorCiclo({ valor, alCambiar }: { valor: Frecuencia; alCambiar: (f: Frecuencia) => void }) {
  const pr = usePrecios();
  const opcion = (ciclo: Frecuencia, titulo: string) => {
    const activa = valor === ciclo;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={activa}
        onClick={() => alCambiar(ciclo)}
        className={`relative flex min-h-16 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl px-3 py-2 transition-[background-color,box-shadow,transform] duration-200 [touch-action:manipulation] active:scale-[0.98] ${
          activa ? "bg-(--tp-opcion) text-(--tp-opcion-texto) shadow-(--sombra-elevada)" : "text-(--tp-texto-2)"
        }`}
      >
        <span className={`text-sm ${activa ? "font-bold" : "font-medium"}`}>{titulo}</span>
        {/* Sin el código de moneda: ya va junto al precio grande, y con él
            "$29.992 COP/mes" se partía en dos renglones a 375px. */}
        <span className={`mt-0.5 text-base whitespace-nowrap ${activa ? "font-bold text-(--tp-opcion-precio)" : "font-medium"}`}>
          {pr.moneda === "USD" ? pr.porMes(ciclo) : formatoPrecio(pr.porMesNumero[ciclo], pr.moneda, { sinCodigo: true })}
          <span className="text-sm font-medium">/mes</span>
        </span>
      </button>
    );
  };
  return (
    <div role="radiogroup" aria-label="Elige cómo pagar" className="relative flex gap-1 rounded-2xl bg-(--tp-hundido) p-1">
      {opcion("mensual", "Mensual")}
      <div className="relative flex flex-1">
        {opcion("anual", "Anual")}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 -right-1 rounded-full bg-(--tp-badge) px-2 py-1 text-xs font-bold text-(--tp-badge-texto)"
        >
          −{pr.ahorro.pct}%
        </span>
      </div>
    </div>
  );
}

/**
 * En qué moneda se cobra y cómo lo va a ver en OnePay.
 *
 * ⚠️ ONEPAY ENSEÑA "$14.60" SIN DECIR "USD", con punto decimal. Una colombiana
 * no sabe si son pesos. En Colombia y México ya no pasa (sus planes van en su
 * moneda); para el resto se dice aquí, antes de salir, que son dólares.
 */
function NotaMoneda({ moneda, cobro, pais }: { moneda: Moneda; cobro: number; pais: string }) {
  const texto =
    moneda === "COP"
      ? "Pagas en pesos colombianos, sin conversiones ni sorpresas."
      : moneda === "MXN"
        ? "Pagas en pesos mexicanos, sin conversiones ni sorpresas."
        : `Se cobra en dólares (USD). En el pago verás $${cobro.toFixed(2)}: son dólares${
            pais === "CO" || pais === "MX" ? "" : ", y tu banco lo pasa a tu moneda"
          }.`;
  return (
    <p className="mt-3 flex items-start gap-2 text-sm leading-snug text-(--tp-texto)">
      <BadgeCheck size={18} className="mt-px shrink-0 text-(--tp-precio)" aria-hidden="true" />
      <span className="text-pretty">{texto}</span>
    </p>
  );
}

/** El botón que abre OnePay, con todos sus estados. */
function BotonPagar({
  url,
  frecuencia,
  enLinea,
  compacto = false,
  inerte = false,
  enTarjeta = false,
}: {
  url: string | null;
  frecuencia: Frecuencia;
  enLinea: boolean;
  compacto?: boolean;
  /** Dentro de la tarjeta del plan: toma sus colores (dorado pálido sobre espresso / violeta en la B). */
  enTarjeta?: boolean;
  /** La barra fija escondida: fuera del tabulador y de los lectores. */
  inerte?: boolean;
}) {
  const clase = `${enTarjeta ? "boton-tarjeta-pago" : "boton-accion-b"} flex w-full items-center justify-center gap-2 rounded-full font-bold transition-transform active:scale-[0.98] ${
    compacto ? "h-12 text-sm" : "h-14 text-base"
  }`;

  /* Sin conexión: no se finge que se puede pagar. */
  if (!enLinea) {
    return (
      <div className={compacto ? "" : "flex flex-col gap-2"}>
        <button type="button" disabled className={`${clase} cursor-not-allowed opacity-50`} tabIndex={inerte ? -1 : undefined}>
          <WifiOff size={18} aria-hidden="true" /> Sin conexión
        </button>
        {!compacto && (
          <p role="status" className={`text-center text-sm ${enTarjeta ? "text-(--tp-texto-2)" : "text-ink-body"}`}>
            Revisa tus datos o el wifi: el botón se activa solo cuando vuelva la señal.
          </p>
        )}
      </div>
    );
  }

  /* ⚠️ CICLO SIN PLAN EN ONEPAY: no se inventa un enlace. Lleva a WhatsApp,
     donde se le manda el enlace a mano, y lo dice ANTES de tocar. */
  if (!url) {
    return (
      <div className="flex flex-col gap-2">
        <EnlaceWhatsApp href={WHATSAPP_URL} origen="pagar_sin_enlace" className={clase}>
          <MessageCircle size={18} aria-hidden="true" /> Pedir mi enlace de pago
        </EnlaceWhatsApp>
        {!compacto && (
          <p className={`text-center text-sm ${enTarjeta ? "text-(--tp-texto-2)" : "text-ink-body"}`}>
            El plan {frecuencia} se paga por un enlace que te mandamos por WhatsApp.
          </p>
        )}
      </div>
    );
  }

  return (
    <div inert={inerte || undefined} className="flex flex-col">
      <EnlaceCompra href={url} origen="pagar" plan={frecuencia} abrePago directo className={clase}>
        Ir a mi pago seguro
      </EnlaceCompra>
    </div>
  );
}

/** Uno de los cuatro protagonistas de "Qué recibes". */
function Beneficio({
  icono,
  titulo,
  fotos = false,
  destacado = false,
  children,
}: {
  icono: ReactNode;
  titulo: string;
  /** El diferencial (Ojo Experto): borde de acento y etiqueta "Solo aquí". */
  destacado?: boolean;
  /** En vez del ícono, tres piezas reales: sin fotos de perlas, la pantalla se lee como un checkout cualquiera. */
  fotos?: boolean;
  children: ReactNode;
}) {
  return (
    <li
      className={`bg-ivory rounded-bloque relative border p-4 ${destacado ? "border-gold sm:col-span-2" : "border-line"} ${
        fotos ? "flex flex-col gap-3 sm:col-span-2" : "flex gap-3"
      }`}
    >
      {destacado && (
        <span className="bg-gold text-ivory absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-xs font-bold">
          Solo aquí
        </span>
      )}
      {fotos ? (
        /* Una fila propia, sin solapar: solapadas parecían avatares de
           usuarias y no piezas de boutique (revisor, 2ª ronda). */
        <span aria-hidden="true" className="grid grid-cols-3 gap-2">
          {PIEZAS.map((src) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={200}
              height={200}
              sizes="(min-width: 1024px) 180px, 33vw"
              className="bg-sand aspect-square w-full rounded-lg object-cover"
            />
          ))}
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="text-gold bg-brand-primary-soft flex size-11 shrink-0 items-center justify-center rounded-xl"
        >
          {icono}
        </span>
      )}
      <span className="min-w-0">
        <span className="text-espresso block text-base font-bold">{titulo}</span>
        <span className="text-ink-body mt-1 block text-sm leading-snug">{children}</span>
      </span>
    </li>
  );
}

/** Una fila corta de lo que también incluye: ícono, lo esencial en negrita y el resto. */
function FilaCompacta({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span aria-hidden="true" className="text-gold mt-0.5 shrink-0">
        {icono}
      </span>
      <span className="text-ink-body min-w-0 text-sm leading-snug text-pretty">
        <strong className="text-espresso font-bold">{titulo}</strong> {children}
      </span>
    </li>
  );
}

/**
 * El plan elegido, otra vez, junto al botón del final (revisor, 3ª ronda):
 * ahí la barra fija ya se escondió y la tarjeta quedó 3 pantallas arriba. Se
 * puede cambiar de ciclo sin subir: el botón de abajo cambia con él.
 */
function ResumenFinal({ frecuencia, alCambiar }: { frecuencia: Frecuencia; alCambiar: (f: Frecuencia) => void }) {
  const pr = usePrecios();
  const otro: Frecuencia = frecuencia === "mensual" ? "anual" : "mensual";
  return (
    <div className="border-line flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-4">
      {/* ⚠️ EN ANUAL, EL COBRO DE VERDAD: "$29.992 al mes" justo encima del
          botón y OnePay cobrando $359.900 de golpe es el "costo que no se
          veía" que esta pantalla existe para evitar (revisor, 4ª ronda). */}
      <p aria-live="polite" className="text-espresso text-sm text-pretty">
        <strong className="font-bold">Plan {frecuencia}</strong> · {pr.porMes(frecuencia)} al mes
        {frecuencia === "anual" && <> · un pago de {pr.cobro("anual")} al año</>}
      </p>
      <button
        type="button"
        onClick={() => alCambiar(otro)}
        className="text-gold min-h-11 text-sm font-bold underline underline-offset-4 [touch-action:manipulation]"
      >
        {otro === "anual" ? `Cambiar a anual (−${pr.ahorro.pct}%)` : "Cambiar a mensual"}
      </button>
    </div>
  );
}

/** Tres piezas reales para "Todos los proyectos": bolso, adorno y vela. */
const PIEZAS = [
  "/images/topo/bolso-perla-tejida.webp",
  "/images/topo/bolas-navidad.webp",
  "/images/topo/vela-girasoles.webp",
] as const;

/** El prefijo de WhatsApp de los países que más nos visitan. */
const PREFIJOS: Record<string, { bandera: string; prefijo: string }> = {
  MX: { bandera: "🇲🇽", prefijo: "+52" },
  PE: { bandera: "🇵🇪", prefijo: "+51" },
  CL: { bandera: "🇨🇱", prefijo: "+56" },
  AR: { bandera: "🇦🇷", prefijo: "+54" },
  EC: { bandera: "🇪🇨", prefijo: "+593" },
  VE: { bandera: "🇻🇪", prefijo: "+58" },
  US: { bandera: "🇺🇸", prefijo: "+1" },
  ES: { bandera: "🇪🇸", prefijo: "+34" },
};

/**
 * "Qué va a pasar ahora": LA pieza de la pantalla.
 *
 * ⚠️ EL CÓDIGO POR WHATSAPP TIENE QUE SER ALGO QUE ELLA YA ESPERABA. OnePay lo
 * pide antes de enseñar la tarjeta, con el +57 de Colombia puesto: para una
 * mexicana es raro y da desconfianza. Dicho aquí, es un paso de seguridad.
 */
function PasosOnePay({ pais, correo }: { pais: string; correo: string | null }) {
  const suyo = PREFIJOS[pais];
  return (
    <div className="hundido-b rounded-bloque p-4 lg:p-6">
      <h2 id="que-pasa" className="font-display text-espresso text-2xl" style={{ fontWeight: 600 }}>
        Qué va a pasar ahora
      </h2>
      <ol className="mt-4 flex flex-col gap-4">
        <Paso n={1} titulo="Te llevamos a OnePay">
          Es nuestro pago seguro: tus datos de tarjeta van directo a OnePay, no pasan por nosotros.
        </Paso>
        <Paso n={2} titulo="Te pide tu WhatsApp">
          Para enviarte un código de seguridad. Es normal: así protege tu pago.{" "}
          {pais !== "CO" && (
            <>
              Viene con 🇨🇴 +57 puesto: tócalo y elige{" "}
              {suyo ? (
                <strong className="text-espresso whitespace-nowrap">
                  {suyo.bandera} {suyo.prefijo}
                </strong>
              ) : (
                "el de tu país"
              )}
              .
            </>
          )}
        </Paso>
        <Paso n={3} titulo="Pagas y entras al instante">
          {correo ? (
            <>
              Con tarjeta de crédito o débito. El acceso llega a{" "}
              <strong className="text-espresso break-all">{correo}</strong>: usa ese mismo correo en el pago.
            </>
          ) : (
            "Con tarjeta de crédito o débito. El acceso llega al correo que escribas en el pago."
          )}
        </Paso>
      </ol>
    </div>
  );
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="bg-espresso text-ivory flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
      >
        {n}
      </span>
      <span className="min-w-0 pt-1">
        <span className="text-espresso block text-base font-bold text-balance">{titulo}</span>
        <span className="text-ink-body mt-1 block text-sm leading-snug text-pretty">{children}</span>
      </span>
    </li>
  );
}

function Garantia() {
  return (
    <div className="border-line flex gap-3 rounded-bloque border p-4">
      <span
        aria-hidden="true"
        className="text-gold bg-brand-primary-soft flex size-11 shrink-0 items-center justify-center rounded-xl"
      >
        <ShieldCheck size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-espresso text-base font-bold">{GARANTIA.titulo} · cancelas cuando quieras</p>
        <p className="text-ink-body mt-1 text-sm leading-snug">
          Si no es para ti, te devolvemos todo dentro de los 7 días de tu primer pago.
        </p>
      </div>
    </div>
  );
}

/**
 * La prueba social, pegada al botón: es donde aparece la objeción "¿y si no
 * tengo experiencia?". Solo la cifra que se puede sostener (sin estrellas).
 */
function PruebaSocial() {
  return (
    <p className="text-espresso flex items-start gap-2 px-1 text-sm">
      <Users size={18} className="text-gold mt-px shrink-0" aria-hidden="true" />
      <span className="text-pretty">
        <strong className="font-bold">+1.200 alumnas</strong> en Latinoamérica empezaron sin experiencia previa.
      </span>
    </p>
  );
}

function Dudas() {
  return (
    <p className="text-ink-body text-center text-sm">
      ¿Dudas?{" "}
      <EnlaceWhatsApp
        href={WHATSAPP_URL}
        origen="pagar_dudas"
        ariaLabel={`Escríbenos por WhatsApp al +${WHATSAPP_NUMERO}`}
        className="text-gold inline-flex min-h-11 items-center font-bold underline underline-offset-4"
      >
        Escríbenos por WhatsApp
      </EnlaceWhatsApp>
    </p>
  );
}

/**
 * Volver a donde estaba (el precio del home, Mi plan…). Si llegó directo, sin
 * historial, al home: `router.back()` no lo sacaría de aquí.
 */
function BotonVolver() {
  return (
    <Link
      href="/"
      onClick={(e) => {
        if (window.history.length > 1) {
          e.preventDefault();
          window.history.back();
        }
      }}
      className="text-espresso -ml-2 flex min-h-11 min-w-11 items-center gap-1 rounded-full px-2 text-sm font-semibold active:scale-[0.97]"
      aria-label="Volver"
    >
      <ArrowLeft size={20} aria-hidden="true" /> <span className="max-sm:sr-only">Volver</span>
    </Link>
  );
}

/* ¿Hay conexión? Se suscribe a online/offline; en el servidor, sí. */
function suscribirConexion(avisar: () => void) {
  window.addEventListener("online", avisar);
  window.addEventListener("offline", avisar);
  return () => {
    window.removeEventListener("online", avisar);
    window.removeEventListener("offline", avisar);
  };
}
function useEnLinea() {
  return useSyncExternalStore(suscribirConexion, () => navigator.onLine, () => true);
}
