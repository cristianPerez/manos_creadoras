/**
 * ════════════════════════════════════════════════════════════════════════════
 * LOS NOMBRES DEL EXPERIMENTO DE PRECIO — y nada más
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ ESTE ARCHIVO NO IMPORTA NADA, Y ES A PROPÓSITO. Lo lee el `middleware.ts`,
 * que corre en el runtime Edge: ahí `next/headers`, `server-only` y el cliente
 * de Supabase de servidor no existen, y bastaría UN import de esos para que el
 * build reventara con un error que no señala a este archivo. Quien resuelve la
 * variante de verdad es `lib/experimento-servidor.ts`.
 *
 * Sustituye a `lib/paleta.ts` (2026-11-07): el home morado ganó y quedó como
 * el único; el experimento vigente es el de PRECIO, con tres variantes.
 */

/**
 * Las tres variantes de precio. "a" es el control: el precio de siempre
 * (59.900 COP / 269 MXN / US$14,60 al mes). "b" y "c" son más baratas.
 * Cada una tiene sus propias filas en `plan_checkout` (migración 0050).
 */
export type VariantePrecio = "a" | "b" | "c";

export const VARIANTE_CONTROL: VariantePrecio = "a";

export function esVariantePrecio(v: string | undefined | null): v is VariantePrecio {
  return v === "a" || v === "b" || v === "c";
}

/**
 * La cookie que fija la variante A MANO, para revisar: la pone `?precio=b`, y
 * `?precio=auto` la borra. Gana sobre Flagsmith.
 *
 * ⚠️ SOLO FUERA DE PRODUCCIÓN (lo decide el middleware con
 * `ENTORNO_DE_PRUEBA`). En producción, cualquiera podría compartir
 * `?precio=c` y pagar el precio más bajo a propósito: el experimento dejaría
 * de ser un sorteo.
 */
export const COOKIE_PRECIO_FORZADO = "mc_precio_forzado";

/**
 * La identidad del visitante anónimo para el reparto del A/B.
 *
 * ⚠️ NO ES UN DATO PERSONAL NI SIRVE PARA IDENTIFICAR A NADIE: es un número al
 * azar que solo existe para que la misma persona vea siempre el mismo precio.
 * Sin él, el reparto se echaría a suertes en cada carga y el precio cambiaría
 * al recargar — con eso el experimento no mediría nada y la persona
 * desconfiaría.
 */
export const COOKIE_VISITANTE = "mc_vid";

/** 7 días: lo que dura una revisión, no una campaña. */
export const DIAS_FORZADA = 7;

/** 1 año: la identidad del A/B tiene que durar más que el experimento. */
export const DIAS_VISITANTE = 365;
