/**
 * Fingir un país para probar precios locales (`?pais=MX`), SOLO fuera de
 * producción. Vive aparte de `lib/pais.ts` porque lo importa el middleware,
 * que no puede cargar `next/headers`.
 *
 * ⚠️ `VERCEL_ENV` y no `NODE_ENV`: QA (Preview en Vercel) también corre con
 * NODE_ENV=production, y ahí es justo donde se quiere probar. En local
 * (`next dev`) VERCEL_ENV no existe y también se permite.
 */
export const COOKIE_PAIS_PRUEBA = "mc_pais_prueba";

export const ENTORNO_DE_PRUEBA = process.env.VERCEL_ENV !== "production";
