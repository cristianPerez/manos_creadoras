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
};

const Contexto = createContext<ContextoPago | null>(null);

export function ProveedorPago({ valor, children }: { valor: ContextoPago; children: ReactNode }) {
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useContextoPago(): ContextoPago | null {
  return useContext(Contexto);
}
