import "server-only";
import { DefaultFlag, Flagsmith } from "flagsmith-nodejs";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * LAS FLAGS — hoy solo una: `paleta_b`
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Una "flag" es un interruptor que vive FUERA del código, en el panel de
 * Flagsmith: se enciende o se apaga desde una página web, sin tocar el
 * proyecto ni volver a publicar. Aquí sirve para enseñar la paleta nueva
 * (lavanda) a unas visitantes y la de siempre (crema y dorado) a otras, y poder
 * comparar cuál vende más.
 *
 * ⚠️ `server-only`: este archivo NO puede acabar en el navegador. Usa la llave
 * de servidor (`ser.…`), que permite leer la configuración entera del entorno —
 * incluidos los segmentos y los repartos del A/B. El import de arriba hace que
 * el build FALLE si alguien lo importa desde un componente de cliente, en vez
 * de enterarnos el día que la llave aparezca en el bundle.
 *
 * ⚠️ TODO AQUÍ FALLA HACIA "ACTUAL", NUNCA HACIA LA PALETA NUEVA. Sin llave,
 * con Flagsmith caído, con un error de red o con una respuesta rara: se ve el
 * sitio de hoy, que es el que está aprobado y vendiendo. Es la misma regla que
 * `robots.ts`: equivocarse escondiendo algo nuevo se arregla en cinco minutos;
 * equivocarse enseñándole a todo el mundo un diseño que nadie aprobó son días
 * de ventas a ciegas.
 */

/** Las dos ramas del experimento. "actual" es el control: el sitio de hoy. */
export type VariantePaleta = "b" | "actual";

/** El nombre de la flag en el panel de Flagsmith. Escrito una sola vez. */
export const FLAG_PALETA = "paleta_b";

/** El ÚNICO valor de la flag que enseña la página nueva (ver la regla abajo). */
export const VALOR_B = "b";

/**
 * El cliente, creado UNA vez por proceso.
 *
 * ⚠️ `enableLocalEvaluation` ES LO QUE EVITA UNA LLAMADA DE RED POR VISITA.
 * Sin esto, cada carga del home esperaría a que Flagsmith contestara desde
 * Europa antes de pintar nada: en un Android de gama media en Colombia eso son
 * cientos de milisegundos añadidos al momento más caro de la página. Con la
 * evaluación local, el proceso se baja la configuración del entorno entera y
 * decide aquí mismo; la refresca sola cada 60 segundos.
 *
 * ⚠️ EL PRECIO, DICHO: apagar la flag tarda hasta 60 segundos en notarse. Es el
 * compromiso aceptado, y está escrito en ESTADO.md para que nadie crea que el
 * panel no funcionó y vuelva a tocarlo.
 */
let cliente: Flagsmith | null = null;

function obtenerCliente(): Flagsmith | null {
  const llave = process.env.FLAGSMITH_SERVER_KEY;
  // Sin llave no hay experimento y no hay error: el sitio de hoy, y ya.
  if (!llave) return null;
  if (cliente) return cliente;

  cliente = new Flagsmith({
    environmentKey: llave,
    enableLocalEvaluation: true,
    environmentRefreshIntervalSeconds: 60,
    /*
     * La red de seguridad de la librería: si no puede resolver una flag
     * —entorno sin cargar todavía, API caída— devuelve esto en vez de lanzar.
     * Apagada = "actual".
     */
    defaultFlagHandler: () => new DefaultFlag(null, false),
  });
  return cliente;
}

/**
 * Qué paleta le toca a esta persona.
 *
 * `identidad` es quién es para el experimento: el id de Supabase si tiene
 * sesión, o el `mc_vid` de la cookie si no (ver `middleware.ts`). Flagsmith
 * reparte el A/B por ese valor, así que la misma persona cae SIEMPRE en la
 * misma rama — y si tiene cuenta, también desde otro teléfono.
 *
 * La regla (cambiada el 2026-11-05 para el A/B 50/50 del home B v2):
 *   · flag apagada                        → "actual"
 *   · flag encendida con valor "b"        → "b"       (la página nueva)
 *   · flag encendida con cualquier otro   → "actual"  (vacío, "actual", errata…)
 *
 * ⚠️ ANTES ERA AL REVÉS ("vacío = B") Y CON ESO EL A/B NO EXISTÍA. En el panel,
 * un A/B se monta con un valor de control y una variación; si se deja vacío
 * cualquiera de los dos —que es lo que Flagsmith ofrece por defecto—, con la
 * regla vieja ese grupo también veía la B y el reparto real era 100% nueva.
 * Ahora la página nueva solo sale si alguien escribió `b` a propósito. Es la
 * misma regla de todo el archivo: equivocarse tiene que caer en "actual".
 *
 * Cómo se configura (detalle en ESTADO.md):
 *   · A/B 50/50  → valor de control `actual`, una variación `b` al 50%.
 *   · Todas en B → valor `b`, sin variaciones.
 *   · Volver     → apagar la flag.
 */
export async function obtenerVariantePaleta(identidad: string): Promise<VariantePaleta> {
  const fs = obtenerCliente();
  if (!fs || identidad === "") return "actual";

  try {
    const flags = await fs.getIdentityFlags(identidad);
    if (!flags.isFeatureEnabled(FLAG_PALETA)) return "actual";

    /*
     * El valor que le tocó a esta identidad: el de control o el de la
     * variación, según el reparto del panel. Sin distinguir mayúsculas ni
     * espacios, que es la errata típica al escribirlo a mano en el panel.
     */
    const valor = flags.getFeatureValue(FLAG_PALETA);
    return String(valor ?? "").trim().toLowerCase() === VALOR_B ? "b" : "actual";
  } catch {
    /*
     * Un fallo de la analítica o de una flag JAMÁS tumba la página de ventas.
     * Misma regla que `lib/analitica/mixpanel.ts`.
     */
    return "actual";
  }
}
