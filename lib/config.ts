/**
 * ⚠️ PENDIENTE: este es el link del producto ANTIGUO (pago único de $25).
 * El modelo cambió a SUSCRIPCIÓN — hay que crear el producto de suscripción en Hotmart
 * y reemplazar estos dos links antes de vender. Mientras tanto ambos apuntan al viejo,
 * así que un botón de "anual" cobraría el producto equivocado.
 */
const CHECKOUT_PENDIENTE = "https://pay.hotmart.com/S100198743F?off=f3k6k34t";

export const CHECKOUT_MENSUAL = CHECKOUT_PENDIENTE;
export const CHECKOUT_ANUAL = CHECKOUT_PENDIENTE;

/** Compat: pantallas que aún no eligen plan mandan al recomendado (anual). */
export const CHECKOUT_URL = CHECKOUT_ANUAL;

// ── Precios (fuente única — si cambian, se cambian AQUÍ) ────────────────
export const PRECIO_MENSUAL = 19.99;
export const PRECIO_ANUAL = 199;
/** $199 / 12 = $16.58 al mes */
export const PRECIO_ANUAL_POR_MES = 16.58;
/** 12 − (199 / 19.99) ≈ 2 meses gratis */
export const MESES_GRATIS_ANUAL = 2;

/**
 * ⚠️ LOS VIDEOS YA NO SALEN DE HOTMART.
 * El soporte de Hotmart confirmó (2026-08-03) que el Hotmart Player funciona SOLO dentro
 * de Hotmart Club y que no existe código de inserción para sitios externos. El alojamiento
 * y el reproductor viven ahora en `lib/video.ts`, y cada lección guarda su proveedor e ID
 * en la base (`lecciones.video_proveedor` / `video_id`).
 */

/*
  ── Uso justo del Ojo Experto ──────────────────────────────────────────────
  ⚠️ `LIMITE_PREGUNTAS` y `LIMITE_FOTOS` VIVÍAN AQUÍ y se borraron el 2026-09-15.
  Se movieron a la tabla `cupos` de la base (migración 0012) por dos motivos:

    · Ya no hay UN límite. Una cuenta gratuita tiene 3 preguntas y una alumna
      40, así que una constante no podía ser correcta para las dos.
    · Estas dos las importaban la API y la pantalla por separado. Eran dos
      copias del mismo número esperando a que alguien cambiara solo una, y que
      la pantalla prometiera una cifra y el servidor cortara en otra.

  Ahora los lee `cupo_de(uid)` y bajan hasta la pantalla como props. Cambiar el
  regalo de 3 a 5 es un `update` de una fila, sin desplegar nada.
*/
