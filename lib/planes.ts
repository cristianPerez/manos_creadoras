/**
 * EL PLAN. Uno solo, con dos formas de pagarlo.
 *
 * ⚠️ DESDE EL 2026-10-13 YA NO HAY TRES NIVELES. Hubo un intento de vender en
 * Aprendiz / Creadora / Maestra que duró cuatro días. Cristian lo cerró: un solo
 * plan, "todo incluido", y se elige nada más entre pagarlo cada mes o de una vez
 * al año. Lo gratis sigue existiendo —5 cápsulas, un bolso completo y 2
 * preguntas al Ojo Experto— pero NO es un plan: es lo que ve quien todavía no
 * compró.
 *
 * El cambio no se quedó aquí. La migración 0016 lo bajó a la base: `plan_cupos`
 * pasó de tres filas a dos (`gratis` y `completo`) y las membresías de
 * 'creadora'/'maestra' se migraron a 'completo' conservando su fecha de
 * vencimiento — nadie perdió días pagados.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ LO QUE YA SE SABE DE ONEPAY, que no se vuelva a descubrir por las malas
 * ════════════════════════════════════════════════════════════════════════════
 * (investigado por El Charcu el 2026-08-29; `git show 6a644b2:ESTADO.md` allí)
 *
 * 1. **OnePay SOLO cobra en pesos colombianos.** Estos precios están en dólares
 *    porque así lo pide el diseño. Alguien tiene que fijar el precio en COP y
 *    decidir qué pasa con una alumna de México o Perú — que son la mayoría.
 *
 * 2. **NO existe checkout alojado para suscripciones.** Hotmart daba un enlace y
 *    se acabó; OnePay exige tokenizar la tarjeta con su SDK dentro de nuestra
 *    app, más 3D Secure. Por eso `/pagar` es una pantalla nuestra y no un
 *    redirect.
 *
 * 3. **El entorno lo decide la CLAVE, no la URL** (`sk_test_` vs `sk_live_`,
 *    mismo `api.onepay.la/v1`). Una clave `sk_live` copiada a QA **cobra de
 *    verdad**. Va por variable de entorno y jamás en el código.
 *
 * Del webhook, para cuando toque: la firma viaja en el header `Signature` (NO en
 * `x-onepay-signature`, que es lo que dicen las versiones viejas del doc), se
 * verifica sobre el cuerpo CRUDO sin parsear, comparación en tiempo constante,
 * hay que responder 2xx en menos de 10 segundos, y reintenta 6 veces con el
 * mismo cuerpo — así que tiene que ser idempotente.
 *
 * ✅ Mientras tanto se cobra a mano: `npm run membresia` da el acceso. Cuando
 *    OnePay funcione, su webhook escribe la misma fila y no se rediseña nada.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type Frecuencia = "anual" | "mensual";

/**
 * Lo que se cobra, en dólares.
 *
 * ⚠️ EL MENSUAL ES EL PRECIO REAL; el "al mes" del plan anual se CALCULA. Si se
 * escribieran los dos a mano, el día que cambie uno el otro se queda mintiendo —
 * y la cifra que miente es siempre la del descuento, que es justo la que decide
 * la compra.
 */
/*
 * ⚠️ 2026-10-16: BAJARON DE 35/350 A 25/250 PARA CUADRAR CON ONEPAY. El plan
 * creado en la pasarela cobra $25 y la app decía US$35: el precio que se promete
 * y el que se cobra TIENEN que ser el mismo número, o la alumna ve una cifra en
 * la página y otra distinta al pagar — que es donde se abandona la compra.
 * El anual se puso en 250 para conservar el mismo descuento de siempre (~17%).
 */
export const PRECIO_MENSUAL = 25;
export const PRECIO_ANUAL = 250;

/** Lo que cuesta cada mes según cómo se pague. El anual sale de dividir. */
export const PRECIO_POR_MES: Record<Frecuencia, number> = {
  mensual: PRECIO_MENSUAL,
  anual: PRECIO_ANUAL / 12,
};

/** Lo que se ahorra pagando el año de golpe, en dólares y en porcentaje. */
export const AHORRO_ANUAL = PRECIO_MENSUAL * 12 - PRECIO_ANUAL;
export const AHORRO_ANUAL_PCT = Math.round((AHORRO_ANUAL / (PRECIO_MENSUAL * 12)) * 100);

/** Lo que incluye. Es la misma lista para los dos ciclos: cambia el cobro, no el curso. */
export const INCLUYE = [
  "Técnicas desde cero",
  "Bolsos, mini bolsos y llaveros",
  "Guía de materiales y proveedores",
  "Estrategias de venta",
  "Certificado al terminar",
  "El Ojo Experto para tus dudas",
] as const;

/**
 * El enlace de pago de OnePay, por ciclo.
 *
 * ⚠️ VACÍO A PROPÓSITO. Mientras no haya integración, `/pagar` lo detecta y
 * manda a contacto diciendo que el enlace de pago llega por correo. El día que
 * exista, se rellenan estas dos líneas y los botones apuntan solos: no hay que
 * tocar ninguna pantalla.
 */
export const CHECKOUT: Record<Frecuencia, string> = {
  anual: process.env.NEXT_PUBLIC_ONEPAY_URL_ANUAL ?? "",
  mensual: process.env.NEXT_PUBLIC_ONEPAY_URL_MENSUAL ?? "",
};

export const FRECUENCIA_POR_DEFECTO: Frecuencia = "anual";

/*
 * ⚠️ ANTES DECÍA "Compra con OnePay · Garantía de 7 días" y tenía dos fallos
 * que señaló el revisor:
 *
 *   · "OnePay" es jerga nuestra. A la alumna no le dice nada el nombre de la
 *     pasarela; le dice que algo raro pasa justo cuando va a dar su tarjeta.
 *   · La garantía salía DOS veces en la misma pantalla —aquí y en la tarjeta
 *     del escudo— con dos tamaños distintos. Repetir una promesa no la hace
 *     más creíble: la hace sonar a letra pequeña.
 *
 * Ahora dice lo único que aquí importa: que el pago es seguro y que no hay
 * permanencia. La garantía vive UNA vez, en su tarjeta.
 */
export const NOTA_PAGO = "Pago seguro · Cancelas cuando quieras";

export const GARANTIA = {
  titulo: "Garantía de 7 días",
  texto: "Si el curso no es para ti, pides tu reembolso dentro de los primeros 7 días.",
} as const;

/**
 * "US$29,17" — siempre por mes, que es como se compara.
 *
 * Coma decimal: la audiencia es LATAM (MX/CO/PE/CL) y ahí "29.17" se lee como
 * veintinueve mil ciento setenta.
 */
export function precioPorMes(frecuencia: Frecuencia): string {
  return `US$${PRECIO_POR_MES[frecuencia].toFixed(2).replace(".", ",")}`;
}

/** "US$250" — el cobro de verdad, sin decimales si son redondos. */
export function precioDelCobro(frecuencia: Frecuencia): string {
  const v = frecuencia === "anual" ? PRECIO_ANUAL : PRECIO_MENSUAL;
  return `US$${Number.isInteger(v) ? v : v.toFixed(2).replace(".", ",")}`;
}

/** La línea bajo el precio: qué se cobra y cuándo. */
export function notaDelCobro(frecuencia: Frecuencia): string {
  return frecuencia === "anual"
    ? `Se cobra ${precioDelCobro("anual")} una vez al año · ahorras US$${AHORRO_ANUAL}`
    : "Se cobra cada mes · cancelas cuando quieras";
}

/** El precio más bajo al mes, ya formateado. Es el del plan anual. */
export const PRECIO_DESDE = precioPorMes("anual");
