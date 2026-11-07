import "server-only";
import { DefaultFlag, Flagsmith } from "flagsmith-nodejs";
import { esVariantePrecio, VARIANTE_CONTROL, type VariantePrecio } from "@/lib/experimento";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * LAS FLAGS — hoy solo una: `precio`
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Una "flag" es un interruptor que vive FUERA del código, en el panel de
 * Flagsmith: se cambia desde una página web, sin tocar el proyecto ni volver a
 * publicar. Aquí reparte a las visitantes entre tres precios (A, B y C) para
 * saber cuál vende más.
 *
 * Historia: hasta el 2026-11-07 la única flag era `paleta_b` (home crema vs.
 * home morado). Ganó el morado, se quedó al 100% y la flag y el home viejo se
 * borraron del código.
 *
 * ⚠️ `server-only`: este archivo NO puede acabar en el navegador. Usa la llave
 * de servidor (`ser.…`), que permite leer la configuración entera del entorno —
 * incluidos los segmentos y los repartos del A/B.
 *
 * ⚠️ TODO AQUÍ FALLA HACIA "a", EL PRECIO DE SIEMPRE. Sin llave, con Flagsmith
 * caído, con un error de red o con un valor raro: se cobra lo de hoy. Equivocarse
 * hacia el control solo retrasa el experimento; equivocarse hacia un precio más
 * bajo regala dinero sin medir nada.
 */

/** El nombre de la flag en el panel de Flagsmith. Escrito una sola vez. */
export const FLAG_PRECIO = "precio";

/**
 * El cliente, creado UNA vez por proceso.
 *
 * ⚠️ `enableLocalEvaluation` ES LO QUE EVITA UNA LLAMADA DE RED POR VISITA. El
 * proceso se baja la configuración del entorno entera y decide aquí mismo; la
 * refresca sola cada 60 segundos. El precio, dicho: un cambio en el panel
 * tarda hasta 60 s en notarse.
 */
let cliente: Flagsmith | null = null;

function obtenerCliente(): Flagsmith | null {
  const llave = process.env.FLAGSMITH_SERVER_KEY;
  if (!llave) return null;
  if (cliente) return cliente;

  cliente = new Flagsmith({
    environmentKey: llave,
    enableLocalEvaluation: true,
    environmentRefreshIntervalSeconds: 60,
    /* Si no puede resolver una flag, apagada = precio de siempre. */
    defaultFlagHandler: () => new DefaultFlag(null, false),
  });
  return cliente;
}

/**
 * Qué variante de precio le toca a esta persona.
 *
 * `identidad` es el `mc_vid` de la cookie (o el id de la cuenta si no hubiera
 * cookie, ver `lib/experimento-servidor.ts`). Flagsmith reparte por ese valor,
 * así que la misma persona cae SIEMPRE en la misma variante.
 *
 * La regla:
 *   · flag apagada                          → "a"
 *   · flag encendida con valor a, b o c     → esa
 *   · flag encendida con cualquier otro     → "a"  (vacío, errata…)
 *
 * Cómo se configura en el panel (detalle en ESTADO.md):
 *   · A/B/C → Enabled · Control Value `a` · Variant_1 `b` 33% · Variant_2 `c` 33%
 *     (el control se queda con el 34% que sobra).
 *   · Todos a un precio → valor `a`, `b` o `c`, sin variantes.
 *   · Volver al precio de siempre → apagarla.
 */
export async function obtenerVariantePrecio(identidad: string): Promise<VariantePrecio> {
  const fs = obtenerCliente();
  if (!fs || identidad === "") return VARIANTE_CONTROL;

  try {
    const flags = await fs.getIdentityFlags(identidad);
    if (!flags.isFeatureEnabled(FLAG_PRECIO)) return VARIANTE_CONTROL;

    /* Sin distinguir mayúsculas ni espacios: la errata típica en el panel. */
    const valor = String(flags.getFeatureValue(FLAG_PRECIO) ?? "").trim().toLowerCase();
    return esVariantePrecio(valor) ? valor : VARIANTE_CONTROL;
  } catch {
    /* Un fallo de una flag JAMÁS tumba la página ni cambia el precio. */
    return VARIANTE_CONTROL;
  }
}
