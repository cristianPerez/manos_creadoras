import { createHmac, timingSafeEqual } from "node:crypto";
import type { EventoNormalizado, Proveedor, ResultadoVerificacion, TipoDeEvento } from "@/lib/webhooks/tipos";

/**
 * OnePay. El primer proveedor que cumple el contrato.
 *
 * Documentación: https://docs.onepay.la/guides/implementar-webhooks
 */

/** Compara sin filtrar cuánto coincide por el tiempo que tarda. */
function igualSeguro(a: string | null, b: string | null): boolean {
  const ba = Buffer.from(a ?? "");
  const bb = Buffer.from(b ?? "");
  // La longitud se compara antes porque `timingSafeEqual` revienta si difieren.
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Su vocabulario → el nuestro. */
/*
 * ⚠️ EL PANEL OFRECE MÁS EVENTOS DE LOS QUE DOCUMENTAN. Su guía describe tres
 * (created, paid, canceled); el panel lista nueve, entre ellos "Suscripción no
 * pagada" y "Suscripción vencida". Los nombres técnicos de esos no están en la
 * documentación, así que se cubren las variantes razonables: el que no acierte
 * cae en 'desconocido', se guarda igual y se ve en la tabla.
 */
const TIPOS: Record<string, TipoDeEvento> = {
  "subscription.paid": "suscripcion.pagada",
  "subscription.canceled": "suscripcion.cancelada",
  "subscription.unpaid": "suscripcion.impagada",
  "subscription.payment_failed": "suscripcion.impagada",
  "subscription.past_due": "suscripcion.impagada",
  "subscription.expired": "suscripcion.vencida",
  "subscription.ended": "suscripcion.vencida",
  "subscription.finished": "suscripcion.vencida",
  // ⚠️ `subscription.created` NO activa nada: una suscripción creada todavía no
  // se ha cobrado. El acceso lo abre el PAGO. Si se activara al crearla, quien
  // abandone el checkout con la tarjeta rechazada entraría igual.
  "subscription.created": "desconocido",
};

export const onepay: Proveedor = {
  nombre: "onepay",

  verificar(cabeceras, cuerpoCrudo): ResultadoVerificacion {
    const secreto = process.env.ONEPAY_WEBHOOK_SECRET;
    const token = process.env.ONEPAY_WEBHOOK_TOKEN;

    /*
     * ⚠️ FALLAR CERRADO SI FALTAN LAS CLAVES. Sin ellas no se puede comprobar
     * nada, y dejar pasar el evento significaría que cualquiera que conozca la
     * URL puede activar membresías gratis.
     */
    if (!secreto || !token) {
      return { valido: false, motivo: "faltan ONEPAY_WEBHOOK_SECRET y/o ONEPAY_WEBHOOK_TOKEN" };
    }

    // ⚠️ SON DOS PUERTAS, NO UNA. El token identifica el endpoint; la firma
    // demuestra que el cuerpo no se tocó por el camino. Nuestras notas previas
    // solo recogían la firma — el token se descubrió leyendo su guía.
    if (!igualSeguro(cabeceras.get("x-webhook-token"), token)) {
      return { valido: false, motivo: "x-webhook-token no coincide" };
    }

    const esperada = createHmac("sha256", secreto).update(cuerpoCrudo).digest("hex");
    if (!igualSeguro(cabeceras.get("signature"), esperada)) {
      return { valido: false, motivo: "la firma no coincide" };
    }

    return { valido: true };
  },

  leer(cuerpo): EventoNormalizado | null {
    if (typeof cuerpo !== "object" || cuerpo === null) return null;
    const c = cuerpo as Record<string, unknown>;

    /*
     * ⚠️ SU DOCUMENTACIÓN SE CONTRADICE Y HAY QUE AGUANTAR LAS DOS FORMAS.
     *
     *   La guía:    { "payment": {…}, "event": { "type": "…" } }
     *   Ejemplos:   { "event": "subscription.paid", "data": {…} }
     *
     * Los ejemplos de suscripción usan la segunda, así que es la probable; pero
     * escribir solo para una y acertar mal significa perder pagos en silencio.
     * Se aceptan ambas y el cuerpo entero queda guardado para poder mirarlo.
     */
    let evento: string | null = null;
    let datos: Record<string, unknown> | null = null;

    if (typeof c.event === "string") {
      evento = c.event;
      datos = (c.data as Record<string, unknown>) ?? null;
    } else if (typeof c.event === "object" && c.event !== null) {
      const e = c.event as Record<string, unknown>;
      evento = typeof e.type === "string" ? e.type : null;
      // En esa forma el recurso cuelga de la raíz con su propio nombre.
      datos =
        (c.subscription as Record<string, unknown>) ??
        (c.payment as Record<string, unknown>) ??
        (c.charge as Record<string, unknown>) ??
        null;
    }

    if (!evento || !datos) return null;

    /*
     * El correo puede venir de varias formas según el evento. Se buscan todas
     * las razonables: cuando llegue el primer webhook de verdad sabremos cuál
     * usa, pero mientras tanto es mejor encontrarlo que perder el pago.
     */
    const cliente = (datos.customer ?? {}) as Record<string, unknown>;
    const correo =
      [datos.email, datos.customer_email, cliente.email, (c.customer as Record<string, unknown> | undefined)?.email]
        .find((v) => typeof v === "string" && v.includes("@")) as string | undefined;

    const recursoId = typeof datos.id === "string" ? datos.id : null;
    if (!recursoId) return null;

    const tipo = TIPOS[evento] ?? "desconocido";
    const proximaCobranza = typeof datos.next_billing_at === "string" ? datos.next_billing_at : null;
    const canceladaEn = typeof datos.canceled_at === "string" ? datos.canceled_at : null;

    return {
      evento,
      tipo,
      recursoId,
      correo: correo?.toLowerCase().trim() ?? null,
      clienteId: typeof datos.customer_id === "string" ? datos.customer_id : null,
      /*
       * ⚠️ SOLO UN PAGO MUEVE LA FECHA DE VENCIMIENTO. Una cancelación NO la
       * toca: quien cancela conserva el acceso hasta el final del período que ya
       * pagó. Si `canceled_at` acabara aquí, cancelar cortaría el acceso ese
       * mismo día y le estaríamos quitando un mes por el que cobramos.
       */
      venceEl: tipo === "suscripcion.pagada" ? proximaCobranza : null,
      // Ver `marca` en el contrato: distingue ocurrencia de reintento.
      marca: proximaCobranza ?? canceladaEn,
    };
  },
};
