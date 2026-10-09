/**
 * Los tres planes de la membresía, en un solo sitio.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL COBRO PASA DE HOTMART A ONEPAY (2026-10-09, decisión de Cristian)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * El Charcu ya investigó OnePay a fondo el 2026-08-29 y encontró tres cosas que
 * cambian el diseño de esta pantalla. Se recuperan aquí para no volver a
 * descubrirlas por las malas (`git show 6a644b2:ESTADO.md` en ese repo):
 *
 * 1. **OnePay SOLO cobra en pesos colombianos (COP).** Estos precios están en
 *    dólares porque así los pide el diseño. Alguien tiene que fijar el precio en
 *    COP antes de crear el plan en OnePay, y decidir qué pasa con una alumna de
 *    México o Perú — que es la mayoría de la audiencia.
 *
 * 2. **NO existe checkout alojado para suscripciones.** Hotmart daba un enlace y
 *    se acabó. OnePay exige tokenizar la tarjeta con su SDK dentro de nuestra
 *    app, más 3D Secure. Eso significa construir una pantalla de pago propia —
 *    y cambia la decisión de "no hay paywall propio" que estaba cerrada.
 *
 * 3. **El entorno lo decide la CLAVE, no la URL** (`sk_test_` vs `sk_live_`,
 *    mismo `api.onepay.la/v1`). Una clave `sk_live` copiada a QA **cobra de
 *    verdad**. Va por variable de entorno y nunca se escribe en el código.
 *
 * Y del webhook, para cuando toque: la firma viaja en el header `Signature`
 * (NO en `x-onepay-signature`, que es lo que dicen las versiones viejas del
 * doc), se verifica sobre el cuerpo CRUDO sin parsear, comparación en tiempo
 * constante, hay que responder 2xx en menos de 10 segundos y reintenta 6 veces
 * con el mismo cuerpo — así que tiene que ser idempotente.
 *
 * ✅ LO BUENO: la activación a mano ya está construida. La migración 0008 dejó
 * `accesos` con `npm run acceso:dar`, así que se puede cobrar por fuera y dar
 * acceso hoy mismo. Cuando OnePay funcione, su webhook inserta una concesión
 * más y no se rediseña nada. Era exactamente para esto.
 * ════════════════════════════════════════════════════════════════════════════
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
   * A dónde manda el botón de cobro.
   *
   * ⚠️ VACÍOS, y con OnePay no es cuestión de "pegar un enlace cuando exista".
   * OnePay **no tiene checkout alojado para suscripciones**: el identificador de
   * la tarjeta sale de tokenizar con su SDK en NUESTRO frontend, más 3D Secure.
   * O sea que aquí no va una URL — va una pantalla de pago propia que todavía no
   * existe. Ver el bloque de arriba.
   *
   * Mientras tanto, `PAGO` manda el botón a donde se pueda atender de verdad.
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

/**
 * Qué dice la línea bajo las tarjetas.
 *
 * ⚠️ El diseño dice "Pago seguro en Hotmart" y eso ya NO es cierto. Decirlo
 * sería prometer una pasarela que no se va a usar — y además Hotmart es
 * justamente el nombre que da confianza, así que la frase estaba haciendo un
 * trabajo que ahora no puede hacer nadie: OnePay no lo conoce ninguna alumna.
 *
 * Se deja solo lo que SÍ es verdad y sí tranquiliza: la garantía.
 */
export const NOTA_PAGO = "Garantía de 7 días en los planes de pago.";

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
