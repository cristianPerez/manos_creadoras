/**
 * Los tres planes de la membresía, en un solo sitio.
 *
 * ⚠️ ESTO CAMBIA EL MODELO DE NEGOCIO, no solo la pantalla. Hasta el 2026-10-09
 * había UN plan (USD 19,99/mes o 199/año) y ahora hay tres niveles con precios
 * nuevos. Lo que sigue a continuación tiene consecuencias fuera de la landing y
 * está anotado en ESTADO.md para que no se descubran por sorpresa:
 *
 *   · `lib/config.ts` todavía exporta `PRECIO_MENSUAL` y `PRECIO_ANUAL` del
 *     modelo viejo, y los leen "Mi cuenta" y la línea de oferta de la app.
 *   · La tabla `cupos` de la base tiene DOS públicos (`regalo` y `miembro`).
 *     Con tres planes, Maestra y Creadora tendrían el mismo cupo de IA, que
 *     probablemente no es lo que se quiere.
 *   · El webhook de Hotmart hoy distingue "mensual" vs "anual", pero NO qué
 *     plan se compró. Con tres niveles necesita saberlo para dar el acceso
 *     correcto.
 *
 * Nada de eso bloquea la landing — por eso los precios viven aquí y no en la
 * base: la página se puede construir y ajustar sin tocar el backend.
 */

export type Frecuencia = "anual" | "mensual";
export type PlanId = "aprendiz" | "creadora" | "maestra";

export type Plan = {
  id: PlanId;
  nombre: string;
  /** Lo que se MUESTRA, siempre por mes, en las dos frecuencias. */
  precioMes: Record<Frecuencia, number | null>; // null = gratis
  /** La letra chica que explica cómo se cobra de verdad. */
  nota: Record<Frecuencia, string>;
  beneficios: string[];
  cta: string;
  /** La tarjeta oscura del centro. Solo uno puede llevarlo. */
  destacado?: boolean;
  insignia?: string;
  /**
   * A dónde manda el botón.
   *
   * ⚠️ VACÍOS A PROPÓSITO. El producto de SUSCRIPCIÓN de Hotmart todavía no
   * existe (es el bloqueo nº1 de ESTADO.md), así que no hay enlaces que poner.
   * Inventar uno o reusar el del producto viejo de pago único sería cobrarle a
   * una alumna un producto que no es el que eligió.
   *
   * Mientras estén vacíos, la pantalla manda a `#planes` en vez de a un cobro
   * roto. Cuando existan, se pegan aquí y nada más cambia.
   */
  checkout: Record<Frecuencia, string>;
};

/** Lo que se cobra de verdad al año, para la letra chica. */
export const COBRO_ANUAL: Record<PlanId, number | null> = {
  aprendiz: null,
  creadora: 116.91,
  maestra: 224.91,
};

/** Cuánto se ahorra pagando al año. Sale de los precios, no escrito a mano. */
export const AHORRO_ANUAL_PCT = 25;

export const PLANES: Plan[] = [
  {
    id: "aprendiz",
    nombre: "Aprendiz",
    precioMes: { anual: null, mensual: null },
    nota: { anual: "Para siempre", mensual: "Para siempre" },
    beneficios: [
      // ⚠️ El nombre del curso gratis quedó sin definir en el encargo.
      // Se usa una descripción honesta en vez de un hueco visible.
      "Un curso completo, de principio a fin",
      "Su patrón descargable y lista de materiales",
      "Sin tarjeta, a tu ritmo",
    ],
    cta: "Tomar el curso gratis",
    checkout: { anual: "", mensual: "" },
  },
  {
    id: "creadora",
    nombre: "Creadora",
    destacado: true,
    insignia: "La más elegida",
    precioMes: { anual: 9.74, mensual: 12.99 },
    nota: {
      anual: "Se cobra US$116,91 una vez al año",
      mensual: "Se cobra cada mes",
    },
    beneficios: [
      "Un curso nuevo cada mes",
      "+50 tutoriales en video HD",
      "50 patrones y plantillas descargables",
      "Directorio de proveedores",
      "Comunidad privada",
    ],
    cta: "Suscribirme",
    checkout: { anual: "", mensual: "" },
  },
  {
    id: "maestra",
    nombre: "Maestra",
    precioMes: { anual: 18.74, mensual: 24.99 },
    nota: {
      anual: "Se cobra US$224,91 una vez al año",
      mensual: "Se cobra cada mes",
    },
    beneficios: [
      "Todo lo de Creadora",
      "Mentoría mensual con Elizabeth",
      "Feedback personal de tus piezas",
      "Bonos: guía de precios y fotografía para vender",
    ],
    cta: "Suscribirme",
    checkout: { anual: "", mensual: "" },
  },
];

/** El plan preseleccionado en móvil y el destacado en escritorio. */
export const PLAN_POR_DEFECTO: PlanId = "creadora";

/** La facturación preseleccionada. */
export const FRECUENCIA_POR_DEFECTO: Frecuencia = "anual";

/**
 * Formatea un precio por mes tal como se enseña.
 *
 * Coma decimal: la audiencia es LATAM (MX/CO/PE/CL) y ahí "9.74" se lee como
 * nueve mil setecientos cuarenta.
 */
export function precioPorMes(valor: number | null): string {
  if (valor === null) return "Gratis";
  return `US$${valor.toFixed(2).replace(".", ",")}`;
}
