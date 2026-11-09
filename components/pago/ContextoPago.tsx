"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { RutaPago } from "@/lib/experimento";

/**
 * Lo que los botones de pago necesitan saber de la visita y que solo sabe el
 * servidor: el país, la variante de precio y la ruta de pago (flag
 * `ruta_pago`). Lo montan el home y `/pagar`; `EnlaceCompra` lo lee para
 * decidir a dónde va el botón dorado y para medir el clic con todo su
 * contexto, sin pasar tres props por cada botón.
 *
 * Fuera de estas dos páginas no existe (vale `null`) y los botones se portan
 * como siempre.
 */
export type ContextoPago = {
  pais: string;
  variantePrecio: string;
  rutaPago: RutaPago;
  /**
   * EL BOTÓN DONDE EMPEZÓ LA COMPRA, cuando ya veníamos de otra página.
   *
   * ⚠️ SIN ESTO NO SE SABE QUÉ BOTÓN VENDE (medido en Mixpanel el 2026-11-08).
   * El botón de `/pagar` manda `origen: "pagar"` —es verdad, es donde se tocó—
   * y como TODO el mundo pasa por la intermedia, los 22 `checkout_abierto` del
   * mes decían lo mismo: "pagar". La pregunta por la que existen los seis
   * botones del home —cuál trae las ventas— no se podía contestar.
   *
   * El home no lo pone (allí el botón donde se empezó ES el que se tocó);
   * `/pagar` lo pone con su `?desde=`.
   */
  desde?: string;
};

const Contexto = createContext<ContextoPago | null>(null);

export function ProveedorPago({ valor, children }: { valor: ContextoPago; children: ReactNode }) {
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useContextoPago(): ContextoPago | null {
  return useContext(Contexto);
}
