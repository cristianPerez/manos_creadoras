"use client";

import { BadgeCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { usePrecios } from "@/components/app/Precios";
import { TESTIMONIOS } from "@/lib/landing";
import { mediosDePago, PREFIJOS } from "@/lib/pago-textos";
import { formatoPrecio, type Frecuencia, type Moneda } from "@/lib/planes";

/**
 * Las piezas de la tarjeta del plan que comparten el home (`PrecioB`) y la
 * página intermedia (`/pagar`) desde el home v3 (2026-11-08). Viven juntas
 * porque son el MISMO argumento en los dos sitios: si una dijera "Nequi" y la
 * otra no, o una garantía distinta, la alumna lo notaría justo al pagar.
 *
 * Todas van dentro de `.tarjeta-pago` y toman sus colores (`--tp-*`).
 */

/** Mensual o anual, con el precio por mes dentro de cada opción. */
export function SelectorCiclo({
  valor,
  alCambiar,
}: {
  valor: Frecuencia;
  alCambiar: (f: Frecuencia) => void;
}) {
  const pr = usePrecios();
  const opcion = (ciclo: Frecuencia, titulo: string) => {
    const activa = valor === ciclo;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={activa}
        data-cta={`ciclo_${ciclo}`}
        onClick={() => alCambiar(ciclo)}
        className={`relative flex min-h-16 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl px-3 py-2 transition-[background-color,box-shadow,transform] duration-200 [touch-action:manipulation] active:scale-[0.98] ${
          activa ? "bg-(--tp-opcion) text-(--tp-opcion-texto) shadow-(--sombra-elevada)" : "text-(--tp-texto-2)"
        }`}
      >
        <span className={`text-sm ${activa ? "font-bold" : "font-medium"}`}>{titulo}</span>
        {/* Sin el código de moneda: ya va junto al precio grande, y con él
            "$29.992 COP/mes" se partía en dos renglones a 375px. */}
        <span className={`mt-0.5 text-base whitespace-nowrap ${activa ? "font-bold" : "font-medium"}`}>
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
          className="pointer-events-none absolute -top-3 -right-1 rounded-lg bg-(--tp-badge) px-2 py-1 text-xs font-bold text-(--tp-badge-texto)"
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
export function NotaMoneda({ moneda, cobro, pais }: { moneda: Moneda; cobro: number; pais: string }) {
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
      <BadgeCheck size={18} className="mt-px shrink-0 text-(--tp-texto-2)" aria-hidden="true" />
      <span className="text-pretty">{texto}</span>
    </p>
  );
}

/** "Paga con Nequi, PSE o tarjeta." — bajo el botón, según la moneda del plan. */
export function MediosDePago({ moneda }: { moneda: Moneda }) {
  return <p className="mt-3 text-center text-sm leading-snug text-pretty text-(--tp-texto-2)">{mediosDePago(moneda)}</p>;
}

/** La garantía en una línea, pegada al botón: donde aparece "¿y si no es para mí?". */
export function GarantiaCorta() {
  return (
    <p className="flex items-start gap-2.5 text-sm leading-snug text-(--tp-texto-2)">
      <ShieldCheck size={20} className="mt-px shrink-0 text-(--tp-texto)" aria-hidden="true" />
      <span className="text-pretty">
        <strong className="font-bold text-(--tp-texto)">Garantía de 7 días.</strong> Si no es para ti, te devolvemos todo.
        Cancelas cuando quieras.
      </span>
    </p>
  );
}

/**
 * Un testimonio real y corto junto al botón: "—¿En cuánto tiempo lo hiciste?
 * —1 día." (`TESTIMONIOS[1]`, de `lib/landing.ts`; no se copia a mano).
 */
const CORTO = TESTIMONIOS[1];

export function TestimonioCorto() {
  if (!CORTO?.foto || !CORTO.frase) return null;
  return (
    <figure className="flex items-center gap-3 rounded-xl bg-(--tp-hundido-suave) p-2.5">
      <Image
        src={CORTO.foto}
        alt={`Bolso de perlas tejido por ${CORTO.nombre}`}
        width={112}
        height={112}
        sizes="56px"
        loading="lazy"
        className="size-14 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0">
        <blockquote className="font-display text-lg leading-tight text-(--tp-texto) italic">“{CORTO.frase}”</blockquote>
        <figcaption className="mt-1 text-xs font-bold text-(--tp-texto-2)">{CORTO.nombre}, alumna</figcaption>
      </div>
    </figure>
  );
}

/**
 * Lo que va a pasar en OnePay, en corto, cuando el botón del home salta
 * `/pagar` (flag `ruta_pago = directo`): es lo único de la intermedia que
 * el home no dice, y sin ello el WhatsApp con +57 llega sin aviso.
 */
export function AsiSigue({ pais }: { pais: string }) {
  const suyo = PREFIJOS[pais];
  return (
    <p className="bg-cream mt-4 rounded-xl p-3.5 text-sm leading-snug text-pretty text-(--tp-texto-2)">
      <strong className="font-bold text-(--tp-texto)">Así sigue:</strong> te llevamos al pago seguro de OnePay. Te pedirá
      tu WhatsApp para un código de seguridad
      {pais !== "CO" && (
        <>
          : cambia el +57 que viene puesto por{" "}
          {suyo ? (
            <strong className="font-bold whitespace-nowrap text-(--tp-texto)">
              {suyo.bandera} {suyo.prefijo}
            </strong>
          ) : (
            "el código de tu país"
          )}
        </>
      )}
      . Usa el mismo correo de tu cuenta gratis.
    </p>
  );
}
