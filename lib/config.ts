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
 * Base del reproductor embebido de Hotmart.
 * Cada lección trae su propio `hotmart_id` en la base (tabla `lecciones`).
 * PENDIENTE: confirmar con la dueña si tiene Hotmart Player contratado. Mientras los IDs
 * estén vacíos, la app muestra el marcador de video en vez de un iframe roto.
 */
export const HOTMART_EMBED_BASE = "https://cf-embed.play.hotmart.com/embed";

// ── Uso justo del Ojo Experto (fuente única: la usan la API y la pantalla) ──
export const LIMITE_PREGUNTAS = 40;
export const LIMITE_FOTOS = 8;
