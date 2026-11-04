"use client";

import { createContext, useContext, type ReactNode } from "react";
import { conPrecios, PRECIOS_RESPALDO, type Precios } from "@/lib/planes";

/**
 * Los precios de la base, repartidos a los componentes de NAVEGADOR.
 *
 * El layout raíz los lee en el servidor (`lib/precios.ts`, misma fila que el
 * enlace de pago) y los pone aquí; cualquier componente de cliente los saca
 * con `usePrecios()`. Sin proveedor —un componente montado fuera del layout—
 * se usa el respaldo del código, nunca un precio en blanco.
 */
const ContextoPrecios = createContext<Precios>(PRECIOS_RESPALDO);

export function PreciosProvider({ precios, children }: { precios: Precios; children: ReactNode }) {
  return <ContextoPrecios.Provider value={precios}>{children}</ContextoPrecios.Provider>;
}

export function usePrecios() {
  return conPrecios(useContext(ContextoPrecios));
}
