"use client";

import { ArrowLeft, Check, Copy, Lock, MessageCircle, WifiOff } from "lucide-react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { usePrecios } from "@/components/app/Precios";
import { PrecioQueCuenta } from "@/components/app/PrecioQueCuenta";
import { EnlaceCompra, EnlaceWhatsApp } from "@/components/home/EnlaceCompra";
import { MedirHome } from "@/components/home/MedirHome";
import { AvisoInstagram } from "@/components/pago/AvisoInstagram";
import { ProveedorPago } from "@/components/pago/ContextoPago";
import {
  GarantiaCorta,
  MediosDePago,
  NotaMoneda,
  SelectorCiclo,
  TestimonioCorto,
} from "@/components/pago/PiezasPago";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import type { RutaPago } from "@/lib/experimento";
import { WHATSAPP_NUMERO, WHATSAPP_URL } from "@/lib/landing";
import type { OrigenCompra } from "@/lib/origen-compra";
import { marcarPagarVisto, mediosDePago, PREFIJOS, type PosicionPago } from "@/lib/pago-textos";
import type { Frecuencia } from "@/lib/planes";

/**
 * La página intermedia entre "quiero comprar" y OnePay. Ver la cabecera de
 * `app/(publicas)/pagar/page.tsx` para el porqué con datos.
 *
 * UNA MISIÓN: que salga hacia OnePay sabiendo qué plan eligió, cuánto paga en
 * su moneda y qué le van a pedir. No pide ningún dato.
 *
 * ── v2 (2026-11-08, `design-ref/pagina-intermedia-pago/v2`) ────────────────
 * Titular de resultado con Elizabeth, precio limpio con su código de moneda,
 * medios de pago por moneda, garantía y UN testimonio real pegados al botón
 * (pedido de Cristian: ya no rige "nada de testimonios"), el paso del WhatsApp
 * con el código del país y el correo con botón Copiar.
 *
 * ── Recortada (2026-11-08, home v3) ───────────────────────────────────────
 * ⚠️ SE FUE "QUÉ RECIBES DESDE HOY". El home v3 ya enseña precio local, medios
 * de pago, garantía, testimonio y lo que incluye; aquí se repetía. Queda lo
 * que el home NO explica: el plan elegido y qué va a pasar en OnePay.
 * Al cargar deja la marca `mc_pagar_visto`: si vuelve al home y toca el botón
 * dorado otra vez, va directo a OnePay (`salto_puente`).
 *
 * ⚠️ SIN NÚMERO DE PROYECTOS (Cristian, 2026-11-01): un número cerrado es un
 * techo. Ver `INCLUYE` en `lib/planes.ts`.
 *
 * El botón de pagar es DORADO (`.cta-pagar`): dorado = pagar en todo el sitio.
 */
export function PuentePago({
  enlaces,
  frecuenciaInicial,
  pais,
  correo,
  desde,
  enInstagram,
  variantePrecio,
  rutaPago,
}: {
  enlaces: Record<Frecuencia, string | null>;
  frecuenciaInicial: Frecuencia;
  /** ISO-2 del país detectado en el servidor ("CO", "MX"…). */
  pais: string;
  /** El correo de la sesión, si la hay: el acceso llega ahí. */
  correo: string | null;
  /** Qué botón la trajo, para el embudo. */
  desde: OrigenCompra | null;
  /** Navegador interno de Instagram/Facebook (user-agent, en el servidor). */
  enInstagram: boolean;
  /** La variante de precio cuyos planes se enseñan (`enlacesDeCobro().variante`). */
  variantePrecio: string;
  rutaPago: RutaPago;
}) {
  const pr = usePrecios();
  const quieto = Boolean(useReducedMotion());
  const enLinea = useEnLinea();
  const [frecuencia, setFrecuencia] = useState<Frecuencia>(frecuenciaInicial);
  /* Cambiar de ciclo, midiéndolo: ¿el anual convence cuando ya se ve el
     precio? `desde` dice si fue el selector de la tarjeta o el enlace del
     resumen final. Elegir el que ya estaba elegido no cuenta. */
  const cambiarCiclo = (a: Frecuencia, desde: "tarjeta" | "resumen") => {
    if (a === frecuencia) return;
    medir(EVENTOS.cicloCambiado, { de: frecuencia, a, desde, moneda: pr.moneda, precio: pr.precios[a] });
    setFrecuencia(a);
  };
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

  /* Una vez por visita: llegó a la intermedia. Y queda marcado que la vio: el
     botón dorado del home ya no la vuelve a pasar por aquí. */
  const medido = useRef(false);
  useEffect(() => {
    if (medido.current) return;
    medido.current = true;
    marcarPagarVisto();
    medir(EVENTOS.pagoPuenteVisto, {
      plan: frecuenciaInicial,
      ciclo: frecuenciaInicial,
      moneda: pr.moneda,
      precio: pr.precios[frecuenciaInicial],
      desde: desde ?? "directo",
      /* El mismo dato con el nombre que usan los demás pasos del embudo, para
         poder partirlo entero por un solo "Breakdown" (ver `ContextoPago`). */
      origen_inicial: desde ?? "directo",
      pais,
      variante_precio: variantePrecio,
      in_app_browser: enInstagram,
    });
  }, [frecuenciaInicial, pr.moneda, pr.precios, desde, pais, variantePrecio, enInstagram]);

  /*
   * Entrada escalonada por CSS (`.reveal`, 70 ms entre bloques) y NO con
   * Motion: con Motion el contenido llega oculto en el HTML y no aparece hasta
   * que el JavaScript termina de cargar — en un Android con datos eso es
   * mirar una página vacía justo antes de pagar. El CSS corre en cuanto pinta.
   * `prefers-reduced-motion` lo apaga el bloque global de `globals.css`.
   */
  const entra = (i: number) => ({ className: "reveal", style: { "--reveal-delay": `${i * 70}ms` } as CSSProperties });

  const boton = (posicion: PosicionPago, compacto = false, inerte = false) => (
    <BotonPagar url={url} frecuencia={frecuencia} enLinea={enLinea} posicion={posicion} compacto={compacto} inerte={inerte} />
  );

  return (
    <ProveedorPago valor={{ pais, variantePrecio, rutaPago, desde: desde ?? undefined }}>
      <div className="bg-surface-base grano-fondo min-h-dvh pb-28 lg:pb-16">
        {/* Secciones vistas, scroll y clics de esta página (con `pagina`). */}
        <MedirHome />
        {/* Dentro de Instagram/Facebook: "ábrelo en tu navegador". No bloquea. */}
        <AvisoInstagram visible={enInstagram} />
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
          {/* ── Columna de lectura (en móvil: titular, plan, pasos, cierre) ── */}
          <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
            <div {...entra(0)} data-seccion="pagar_titular" className="reveal pt-2 lg:pt-6">
              <h1
                className="font-display text-espresso text-balance"
                style={{ fontWeight: 500, fontSize: "clamp(32px, 4.4vw, 52px)", lineHeight: 1.08 }}
              >
                Estás a un paso de tejer tu primer bolso con <em className="clave">acabado de boutique</em>
              </h1>
              <p className="text-ink-body mt-3 flex items-center gap-2 text-base">
                <Image
                  src="/images/mentora-elizabeth.webp"
                  alt=""
                  width={72}
                  height={72}
                  sizes="36px"
                  className="border-ivory size-9 shrink-0 rounded-full border-2 object-cover object-[50%_20%]"
                />
                <span>
                  Te acompaña <strong className="text-espresso font-bold">Elizabeth Valencia</strong>
                </span>
              </p>
            </div>

            {/* En móvil el plan va aquí, arriba: el botón se ve sin bajar. */}
            <div {...entra(1)} data-seccion="pagar_plan" className="reveal lg:hidden">
              <TarjetaPlan
                frecuencia={frecuencia}
                alCambiar={(f) => cambiarCiclo(f, "tarjeta")}
                quieto={quieto}
                pais={pais}
                boton={<div ref={botonRef}>{boton("pagar_tarjeta")}</div>}
              />
            </div>

            <section {...entra(2)} data-seccion="pagar_pasos" aria-labelledby="que-pasa">
              <PasosOnePay pais={pais} correo={correo} />
            </section>

            {/* Cierre del móvil: el plan y el botón otra vez, al final de leer. */}
            <div {...entra(3)} data-seccion="pagar_cierre" className="reveal flex flex-col gap-4 lg:hidden">
              <ResumenFinal frecuencia={frecuencia} alCambiar={(f) => cambiarCiclo(f, "resumen")} />
              <div ref={botonFinRef}>
                {boton("pagar_cierre")}
                {url && enLinea && <p className="text-ink-body mt-3 text-center text-sm">{mediosDePago(pr.moneda)}</p>}
              </div>
              <Dudas />
            </div>
          </div>

          {/* ── Escritorio: la tarjeta del plan fija a la derecha ── */}
          <aside {...entra(1)} data-seccion="pagar_plan" className="reveal hidden lg:block">
            <div className="sticky top-6 flex flex-col gap-4 pt-6">
              <TarjetaPlan
                frecuencia={frecuencia}
                alCambiar={(f) => cambiarCiclo(f, "tarjeta")}
                quieto={quieto}
                pais={pais}
                boton={boton("pagar_tarjeta")}
              />
              <Dudas />
            </div>
          </aside>
        </main>

        {/* ── Móvil: barra fija cuando ningún botón se ve ── */}
        <div
          data-seccion="pagar_barra"
          aria-hidden={botonVisible}
          className={`bg-ivory border-line fixed inset-x-0 bottom-0 z-30 border-t px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgba(42,31,25,0.35)] transition-transform duration-300 ease-out lg:hidden ${
            botonVisible ? "pointer-events-none translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="mx-auto flex max-w-140 items-center gap-3">
            {/* El precio cede y se parte en renglones; el botón mide SIEMPRE lo
                mismo, sea mensual o anual. */}
            <div className="min-w-0 flex-1">
              <p className="text-espresso text-base leading-tight font-bold">{pr.porMes(frecuencia)} al mes</p>
              <p className="text-ink-muted text-sm leading-tight">
                {frecuencia === "anual" ? `${pr.cobro("anual")} al año` : "plan mensual"}
              </p>
            </div>
            <div className="w-48 shrink-0">{boton("pagar_barra", true, botonVisible)}</div>
          </div>
        </div>
      </div>
    </ProveedorPago>
  );
}

/* ═══════════════════════════════ Piezas ═══════════════════════════════ */

/**
 * El plan elegido: selector, precio en su moneda, el botón y, pegados a él,
 * con qué se paga, la garantía y un testimonio real.
 */
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

      <p className="mt-6 flex items-baseline gap-2">
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

      <div className="mt-6">{boton}</div>
      <MediosDePago moneda={pr.moneda} />

      <div className="mt-4 flex flex-col gap-4 border-t border-(--tp-borde) pt-4">
        <GarantiaCorta />
        <TestimonioCorto />
      </div>
    </section>
  );
}

/** El botón que abre OnePay, con todos sus estados. */
function BotonPagar({
  url,
  frecuencia,
  enLinea,
  posicion,
  compacto = false,
  inerte = false,
}: {
  url: string | null;
  frecuencia: Frecuencia;
  enLinea: boolean;
  /** Dónde está el botón, para `checkout_abierto`. */
  posicion: PosicionPago;
  compacto?: boolean;
  /** La barra fija escondida: fuera del tabulador y de los lectores. */
  inerte?: boolean;
}) {
  const clase = `cta-pagar flex w-full items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
    compacto ? "h-13" : "h-14"
  }`;

  /* Sin conexión: no se finge que se puede pagar. */
  if (!enLinea) {
    return (
      <div className={compacto ? "" : "flex flex-col gap-2"}>
        <button type="button" disabled className={`${clase} cursor-not-allowed opacity-50`} tabIndex={inerte ? -1 : undefined}>
          <WifiOff size={18} aria-hidden="true" /> Sin conexión
        </button>
        {!compacto && (
          <p role="status" className="text-ink-body text-center text-sm">
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
      <div inert={inerte || undefined} className="flex flex-col gap-2">
        <EnlaceWhatsApp href={WHATSAPP_URL} origen="pagar_sin_enlace" className={clase}>
          <MessageCircle size={18} aria-hidden="true" /> Pedir mi enlace
        </EnlaceWhatsApp>
        {!compacto && (
          <p className="text-ink-body text-center text-sm">
            El plan {frecuencia} se paga por un enlace que te mandamos por WhatsApp.
          </p>
        )}
      </div>
    );
  }

  return (
    <div inert={inerte || undefined} className="flex flex-col">
      <EnlaceCompra href={url} origen="pagar" plan={frecuencia} abrePago directo posicion={posicion} className={clase}>
        <Lock size={18} strokeWidth={2.4} aria-hidden="true" />
        {compacto ? "Ir a pagar" : "Ir a mi pago seguro"}
      </EnlaceCompra>
    </div>
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
        data-cta={`resumen_a_${otro}`}
        onClick={() => alCambiar(otro)}
        className="text-apoyo min-h-11 text-sm font-bold underline underline-offset-4 [touch-action:manipulation]"
      >
        {otro === "anual" ? `Cambiar a anual (−${pr.ahorro.pct}%)` : "Cambiar a mensual"}
      </button>
    </div>
  );
}

/**
 * "Qué va a pasar ahora": LA pieza de la pantalla.
 *
 * ⚠️ EL CÓDIGO POR WHATSAPP TIENE QUE SER ALGO QUE ELLA YA ESPERABA. OnePay lo
 * pide antes de enseñar la tarjeta, con el +57 de Colombia puesto: para una
 * mexicana es raro y da desconfianza. Dicho aquí, es un paso de seguridad.
 */
function PasosOnePay({ pais, correo }: { pais: string; correo: string | null }) {
  const pr = usePrecios();
  const suyo = PREFIJOS[pais];
  return (
    <div className="hundido-b rounded-bloque p-4 lg:p-6">
      <h2 id="que-pasa" className="font-display text-espresso text-2xl" style={{ fontWeight: 600 }}>
        Qué va a pasar ahora
      </h2>
      <ol className="mt-4 flex flex-col gap-4">
        <Paso n={1} titulo="Te llevamos a OnePay">
          Es nuestro pago seguro: tus datos van directo a OnePay, no pasan por nosotros.
        </Paso>
        <Paso n={2} titulo="Te pide tu WhatsApp">
          {pais === "CO" ? (
            "Te pedirá tu WhatsApp para un código de seguridad."
          ) : (
            <>
              Para un código de seguridad. Viene con +57 puesto: tócalo y elige el código de tu país
              {suyo && (
                <>
                  {" "}
                  (
                  <strong className="text-espresso whitespace-nowrap">
                    {suyo.bandera} {suyo.prefijo}
                  </strong>
                  )
                </>
              )}
              .
            </>
          )}
        </Paso>
        <Paso n={3} titulo="Pagas y entras al instante">
          {mediosDePago(pr.moneda)}
          {correo ? (
            <CorreoParaCopiar correo={correo} />
          ) : (
            <span className="text-espresso mt-2 block">Usa el mismo correo con el que creaste tu cuenta gratis.</span>
          )}
        </Paso>
      </ol>
    </div>
  );
}

/**
 * El correo de la sesión con un botón Copiar: el acceso llega al correo que se
 * escriba en OnePay, y si no es el de la cuenta, el pago queda huérfano.
 *
 * ⚠️ EN EL NAVEGADOR DE INSTAGRAM EL PORTAPAPELES SUELE FALLAR. Si falla, se
 * selecciona el texto del correo para que lo copie a mano y se dice cómo.
 */
function CorreoParaCopiar({ correo }: { correo: string }) {
  const [estado, setEstado] = useState<"quieto" | "copiado" | "manual">("quieto");
  const textoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (estado !== "copiado") return;
    const reloj = window.setTimeout(() => setEstado("quieto"), 2000);
    return () => window.clearTimeout(reloj);
  }, [estado]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(correo);
      setEstado("copiado");
    } catch {
      const el = textoRef.current;
      const sel = window.getSelection();
      if (el && sel) {
        const rango = document.createRange();
        rango.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(rango);
      }
      setEstado("manual");
    }
  };

  return (
    <span className="bg-ivory border-line mt-3 block rounded-xl border p-3">
      <span className="text-ink-body block text-sm">Usa este mismo correo en el pago:</span>
      <span className="mt-1 flex items-center gap-3">
        <strong ref={textoRef} className="text-espresso min-w-0 flex-1 text-base font-bold break-all select-all">
          {correo}
        </strong>
        <button
          type="button"
          onClick={copiar}
          data-cta="copiar_correo"
          className="border-line-strong text-espresso flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-bold [touch-action:manipulation] active:scale-[0.97]"
        >
          {estado === "copiado" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {estado === "copiado" ? "Copiado" : "Copiar"}
        </button>
      </span>
      <span role="status" className="text-ink-body mt-1 block text-sm empty:hidden">
        {estado === "manual" ? "Mantén presionado para copiar." : ""}
      </span>
    </span>
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

function Dudas() {
  return (
    <p className="text-ink-body text-center text-sm">
      ¿Dudas?{" "}
      <EnlaceWhatsApp
        href={WHATSAPP_URL}
        origen="pagar_dudas"
        ariaLabel={`Escríbenos por WhatsApp al +${WHATSAPP_NUMERO}`}
        className="text-apoyo inline-flex min-h-11 items-center font-bold underline underline-offset-4"
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
