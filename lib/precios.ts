import { cache } from "react";
import { enlacesDeCobro } from "@/lib/checkout";
import { conPrecios, type CifrasDePrecio } from "@/lib/planes";

/**
 * Las cifras de precio de esta visita, para los componentes de SERVIDOR.
 *
 * Salen de `plan_checkout` (la misma fila que el enlace de pago), así que el
 * precio que se enseña es el que cobra el botón. Los componentes de navegador
 * usan `usePrecios()`, que recibe estos mismos precios desde el layout.
 *
 * `cache`: el layout y la página la piden en la misma visita y la consulta va
 * una sola vez.
 */
export const preciosDeLaPagina = cache(async (): Promise<CifrasDePrecio> => {
  const { precios } = await enlacesDeCobro();
  return conPrecios(precios);
});
