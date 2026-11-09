import type { Moneda } from "@/lib/planes";

/**
 * Lo que se le dice a la alumna sobre el pago, compartido entre la tarjeta de
 * precio del home (`PrecioB`) y la página intermedia (`/pagar`). Antes vivía
 * dentro de `PuentePago`; con el home v3 (2026-11-08) el home también lo dice,
 * y dos copias acabarían diciendo cosas distintas.
 *
 * ⚠️ SIN IMPORTS DE SERVIDOR NI DE NAVEGADOR: lo usan las dos partes.
 */

/** El prefijo de WhatsApp de los países que más nos visitan. */
export const PREFIJOS: Record<string, { bandera: string; prefijo: string }> = {
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
 * Con qué se puede pagar, según la MONEDA del plan (no el país crudo: una
 * colombiana que cae a la región internacional paga en USD y con tarjeta).
 *
 * ⚠️ COLOMBIA: NEQUI Y PSE CONFIRMADOS POR CRISTIAN EL 2026-11-08. El diseño
 * decía también Daviplata; no se nombra hasta que se confirme que el plan en
 * COP de OnePay lo acepta. Prometer un medio que en OnePay no aparece es
 * perder la venta justo en el último paso.
 *
 * México: solo tarjeta (no hay otro medio confirmado; si OXXO se activa, va aquí).
 */
export function mediosDePago(moneda: Moneda): string {
  if (moneda === "COP") return "Paga con Nequi, PSE o tarjeta.";
  if (moneda === "MXN") return "Paga en pesos mexicanos con tarjeta de crédito o débito.";
  return "Paga con tarjeta de crédito o débito, en dólares (USD).";
}

/**
 * ¿Es el navegador interno de Instagram o Facebook? Ahí OnePay falla más
 * (ventanas que no abren, el portapapeles bloqueado), y el 70% del tráfico
 * llega por Instagram. Se decide en el servidor con el user-agent.
 */
export function esNavegadorInterno(userAgent: string | null | undefined): boolean {
  return /Instagram|FBAN|FBAV/i.test(userAgent ?? "");
}

/**
 * Marca de "ya pasó por `/pagar` en esta visita" (`sessionStorage`). Si existe,
 * el botón dorado del home abre OnePay directo: ya leyó lo que la intermedia
 * explica y no se le hace pasar dos veces.
 */
export const MARCA_PAGAR_VISTO = "mc_pagar_visto";

export function marcarPagarVisto() {
  try {
    sessionStorage.setItem(MARCA_PAGAR_VISTO, "1");
  } catch {
    /* Navegador sin almacenamiento (modo privado estricto): se queda en puente. */
  }
}

export function yaVioPagar(): boolean {
  try {
    return sessionStorage.getItem(MARCA_PAGAR_VISTO) === "1";
  } catch {
    return false;
  }
}

/**
 * Dónde está el botón que se tocó, para el embudo (`posicion` en
 * `cta_inscribirme_click` y `checkout_abierto`).
 */
export type PosicionPago = "precio" | "barra_fija" | "pagar_tarjeta" | "pagar_cierre" | "pagar_barra";
