/**
 * Desde dónde se tocó un botón de compra. Vive aquí, fuera de
 * `EnlaceCompra.tsx`, porque la página `/pagar` (servidor) valida `?desde=`
 * con esta lista, y una constante importada de un archivo "use client" llega
 * al servidor como referencia vacía, no como el arreglo.
 */
export const ORIGENES_COMPRA = [
  "header",
  "banner_precio",
  "banda_1de16",
  // El panel navideño (2026-10-31): su botón del pie.
  "navidad",
  /* La FOTO del panel navideño, enlazada a `#precio`. Entre el 2026-11-02 y
     el 2026-11-06 no tuvo enlace y acumuló 40 toques en vacío. */
  "navidad_pieza",
  "precio",
  "cierre",
  "barra_movil",
  // Dentro de la app (2026-10-21): los que antes decían "Crear mi cuenta gratis".
  "catalogo",
  "ficha_bolso",
  "ojo_agotado",
  // Cabecera de escritorio del Ojo v5, para quien entra sin cuenta.
  "ojo_cabecera",
  /* La pantalla Mi plan (`SelectorDePago`). Hasta el 2026-11-06 su botón era un
     `<Link>` suelto: abría OnePay SIN medir `checkout_abierto`. */
  "pagina_plan",
  /* El botón de la página intermedia `/pagar` (2026-11-06): el único que abre
     OnePay. El botón donde empezó viaja aparte, en `desde`. */
  "pagar",
] as const;

export type OrigenCompra = (typeof ORIGENES_COMPRA)[number];

export function esOrigenCompra(v: unknown): v is OrigenCompra {
  return typeof v === "string" && (ORIGENES_COMPRA as readonly string[]).includes(v);
}
