import { onepayEnv } from "@/lib/env";
import { reportarAviso, reportarFallo } from "@/lib/fallos";

/**
 * La API de OnePay. Una sola puerta, y hoy con un solo trabajo: dar de baja una
 * suscripción cuando la alumna pulsa el botón de cancelar.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ ESTO SOLO CORRE EN EL SERVIDOR
 * ════════════════════════════════════════════════════════════════════════════
 * `ONEPAY_API_KEY` manda sobre los cobros de todas las alumnas: con ella se
 * pueden listar, crear y eliminar suscripciones. Si alguna vez acaba en el
 * navegador —un `NEXT_PUBLIC_`, un import desde un componente de cliente— queda
 * incrustada en el bundle y es pública para siempre. Este archivo no se importa
 * nunca desde un `"use client"`, y `onepayEnv()` lee de `process.env`, que en el
 * navegador no existe: el día que alguien lo intente, falla al compilar.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ CANCELAR AQUÍ NO ES CORTAR EL ACCESO
 * ════════════════════════════════════════════════════════════════════════════
 * Eliminar la suscripción en OnePay detiene los COBROS FUTUROS. El período que
 * la alumna ya pagó es suyo, y quien lo conserva es nuestra base (`vence_el`,
 * que esta función no toca). Decisión de Cristian del 2026-10-19, y es también
 * lo que ya hacía el webhook con `subscription.canceled`.
 * ════════════════════════════════════════════════════════════════════════════
 */

const BASE = "https://api.onepay.la/v1";

/** 10s de techo: es el mismo que OnePay se da a sí mismo para nuestros webhooks. */
const TIMEOUT_MS = 10_000;

export type ResultadoBaja =
  | { ok: true }
  /**
   * `yaNoEstaba` no es un fallo: la suscripción no existe en OnePay (404). Pasa
   * si Elizabeth ya la canceló a mano en el panel, o si la alumna pulsa el botón
   * dos veces. El resultado deseado —que no se vuelva a cobrar— ya se cumple,
   * así que para quien llama cuenta como éxito y se distingue solo para el log.
   */
  | { ok: true; yaNoEstaba: true }
  | { ok: false; motivo: string };

/**
 * Da de baja una suscripción en OnePay.
 *
 * NUNCA LANZA. Quien llama necesita seguir adelante igual: si esto falla, la
 * membresía se marca como cancelada en nuestra base de todos modos y sale un
 * aviso para cancelarla a mano. Dejar que la excepción subiera significaría
 * enseñarle un error a la alumna y dejarla sin cancelar **y** sin saberlo.
 */
export async function eliminarSuscripcion(suscripcionId: string): Promise<ResultadoBaja> {
  let clave: string;
  try {
    clave = onepayEnv().ONEPAY_API_KEY;
  } catch (e) {
    // Falta la variable (o es una sk_live fuera de producción). No es culpa de
    // la alumna y no se puede arreglar reintentando: se avisa y se sigue.
    reportarFallo("pago", "sin ONEPAY_API_KEY usable para cancelar", {
      error: e instanceof Error ? e.message : String(e),
    });
    return { ok: false, motivo: "falta la clave de OnePay en el servidor" };
  }

  try {
    const r = await fetch(`${BASE}/subscriptions/${encodeURIComponent(suscripcionId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${clave}`, Accept: "application/json" },
      // Sin caché: es una escritura, y Next cachea `fetch` por defecto en el
      // servidor. Una baja servida desde caché sería una baja que no ocurrió.
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (r.status === 404) {
      reportarAviso("pago", "la suscripción ya no estaba en OnePay", { suscripcion: suscripcionId });
      return { ok: true, yaNoEstaba: true };
    }

    if (!r.ok) {
      const detalle = await r.text().catch(() => "");
      reportarFallo("pago", "OnePay rechazó la baja de la suscripción", {
        suscripcion: suscripcionId,
        estado: String(r.status),
        // Recortado: la respuesta de una pasarela puede traer el cuerpo entero
        // de la suscripción, y ahí dentro va el correo de la alumna.
        detalle: detalle.slice(0, 200),
      });
      return { ok: false, motivo: `OnePay respondió ${r.status}` };
    }

    return { ok: true };
  } catch (e) {
    // Incluye el timeout de los 10s: `AbortSignal.timeout` lanza aquí.
    reportarFallo("pago", "no se pudo contactar con OnePay para cancelar", {
      suscripcion: suscripcionId,
      error: e instanceof Error ? e.message : String(e),
    });
    return { ok: false, motivo: "OnePay no respondió" };
  }
}
