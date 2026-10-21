"use client";

import type { ReactNode } from "react";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import type { Frecuencia } from "@/lib/planes";

/** Desde dónde se tocó un botón de compra. Son los seis del home v3. */
export type OrigenCompra =
  | "header"
  | "banner_precio"
  | "banda_1de16"
  | "precio"
  | "cierre"
  | "barra_movil"
  // Dentro de la app (2026-10-21): los que antes decían "Crear mi cuenta gratis".
  | "catalogo"
  | "ficha_bolso"
  | "ojo_agotado";

/**
 * Un enlace de compra que deja dicho desde dónde se tocó.
 *
 * ⚠️ ES UN `<a>` Y NO UN `<Link>`, por dos motivos. Casi todos apuntan a
 * `#precio` —un ancla de esta misma página, donde `<Link>` intercepta el clic y
 * rompe el scroll suave— y los que no, abren OnePay: un dominio de fuera, que
 * tampoco es navegación de la app.
 *
 * Si va directo al pago (`abrePago`), se mide también `checkout_abierto`, que es
 * el evento que ya usa el embudo para "abrió el pago". Así el panel viejo sigue
 * contando bien y el nuevo dice además desde qué botón.
 */
export function EnlaceCompra({
  href,
  origen,
  plan,
  abrePago = false,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  origen: OrigenCompra;
  plan: Frecuencia;
  abrePago?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={className}
      onClick={() => {
        medir(EVENTOS.ctaInscribirmeClick, { origen, plan });
        if (abrePago) medir(EVENTOS.checkoutAbierto, { plan });
      }}
    >
      {children}
    </a>
  );
}

/**
 * El botón de WhatsApp, medido. Abre en otra pestaña: en el móvil salta a la
 * app de WhatsApp, y en escritorio no se pierde la página que estaba leyendo.
 */
export function EnlaceWhatsApp({
  href,
  origen,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  origen: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => medir(EVENTOS.whatsappClick, { origen })}
    >
      {children}
    </a>
  );
}
