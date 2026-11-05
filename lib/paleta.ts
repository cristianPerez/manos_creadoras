/**
 * ════════════════════════════════════════════════════════════════════════════
 * LOS NOMBRES DEL EXPERIMENTO DE PALETA — y nada más
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ ESTE ARCHIVO NO IMPORTA NADA, Y ES A PROPÓSITO. Lo lee el `middleware.ts`,
 * que corre en el runtime Edge: ahí `next/headers`, `server-only` y el cliente
 * de Supabase de servidor no existen, y bastaría UN import de esos para que el
 * build reventara con un error que no señala a este archivo. Quien resuelve la
 * variante de verdad es `lib/paleta-servidor.ts`, que sí puede usarlos porque
 * solo lo llama el layout.
 */

/** Las dos ramas del experimento. "actual" es el control: el sitio de hoy. */
export type VariantePaleta = "b" | "actual";

/**
 * La cookie que fija la rama A MANO, para revisar: la ponen `?paleta=b` y
 * `?paleta=actual`, y `?paleta=auto` la borra. Gana sobre Flagsmith.
 */
export const COOKIE_FORZADA = "mc_paleta_forzada";

/**
 * La identidad del visitante anónimo para el reparto del A/B.
 *
 * ⚠️ NO ES UN DATO PERSONAL NI SIRVE PARA IDENTIFICAR A NADIE: es un número al
 * azar que solo existe para que la misma persona vea siempre la misma versión.
 * Sin él, el reparto se echaría a suertes en cada carga y una visitante vería
 * la paleta cambiar al recargar — con eso el experimento no mediría nada.
 */
export const COOKIE_VISITANTE = "mc_vid";

/** 7 días: lo que dura una revisión, no una campaña. */
export const DIAS_FORZADA = 7;

/** 1 año: la identidad del A/B tiene que durar más que el experimento. */
export const DIAS_VISITANTE = 365;

export function esVariante(v: string | undefined | null): v is VariantePaleta {
  return v === "b" || v === "actual";
}
