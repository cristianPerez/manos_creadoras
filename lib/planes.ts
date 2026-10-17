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
 * ════════════════════════════════════════════════════════════════════════════
 * LOS PRECIOS. UNA SOLA FUENTE PARA TODA LA APP.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ HABÍA TRES SITIOS CON PRECIOS Y LOS TRES DECÍAN COSAS DISTINTAS. El
 * 2026-10-17 se encontraron: aquí 25/250, en `lib/landing.ts` un "US$ 9,74 al
 * mes" y en `lib/config.ts` otros 19,99/199 con enlaces de Hotmart. Los dos
 * últimos estaban MUERTOS —nadie los importaba— pero eran una trampa: bastaba
 * que alguien los usara creyéndolos buenos. Se borraron. Si un precio no sale
 * de este archivo, es un precio inventado.
 *
 * ── HAY DOS JUEGOS DE PRECIOS, Y CUÁL SE APLICA DEPENDE DE LA PERSONA ──────
 *
 * Desde el 2026-10-17 la app vende en oferta de lanzamiento: durante sus
 * primeras 24 horas, cada visitante ve el precio rebajado; pasadas, ve el
 * normal. Quién está dentro de esas 24h lo decide `lib/oferta.ts` leyendo una
 * cookie, y el resultado se pasa a estas funciones.
 *
 * ⚠️ EL PRECIO SUBE DE VERDAD AL EXPIRAR, y eso no es un detalle: es lo que
 * separa una oferta de un engaño. Un reloj que llega a cero sin que cambie
 * nada se descubre recargando la página, y a partir de ahí no se cree nada más
 * de lo que diga el sitio.
 */

export type Precios = { mensual: number; anual: number };

/** Lo que cuesta normalmente. Fue el precio real hasta el 2026-10-16. */
export const PRECIO_NORMAL: Precios = { mensual: 35, anual: 350 };

/** Lo que cuesta durante las primeras 24 horas de cada visitante. */
export const PRECIO_OFERTA: Precios = { mensual: 9.99, anual: 80 };

/** El juego de precios que le toca a quien está mirando. */
export function preciosDe(enOferta: boolean): Precios {
  return enOferta ? PRECIO_OFERTA : PRECIO_NORMAL;
}

/**
 * Lo que cuesta cada mes según cómo se pague.
 *
 * ⚠️ EL "AL MES" DEL ANUAL SE CALCULA, nunca se escribe a mano. Si se
 * escribieran los dos, el día que cambie uno el otro se queda mintiendo — y la
 * cifra que miente es siempre la del descuento, que es la que decide la compra.
 */
export function precioPorMesDe(enOferta: boolean): Record<Frecuencia, number> {
  const p = preciosDe(enOferta);
  return { mensual: p.mensual, anual: p.anual / 12 };
}

/** Lo que se ahorra pagando el año de golpe, en dólares y en porcentaje. */
export function ahorroAnualDe(enOferta: boolean): { dolares: number; pct: number } {
  const p = preciosDe(enOferta);
  const dolares = Math.round(p.mensual * 12 - p.anual);
  return { dolares, pct: Math.round((dolares / (p.mensual * 12)) * 100) };
}

/** Lo que se ahorra frente al precio NORMAL. Es el número de la oferta. */
export function descuentoDeLanzamiento(frecuencia: Frecuencia): {
  /** Lo que se cobra de una vez: US$350 → US$80 en el anual. */
  antes: number;
  ahora: number;
  /**
   * Lo mismo repartido AL MES: US$29,17 → US$6,67.
   *
   * ⚠️ ES LO QUE ENSEÑA LA BARRA, no el cobro anual. Toda la app habla "al
   * mes" —el bloque de precio, la ficha del bolso, el "desde US$X"— y la barra
   * decía US$80 mientras la sección de abajo decía US$6,67. Eran el mismo
   * precio dicho de dos maneras, y en una barra de oferta eso se lee como que
   * los números no cuadran. Al mes, además, la cifra asusta menos justo donde
   * se decide seguir leyendo.
   */
  antesPorMes: number;
  ahoraPorMes: number;
  pct: number;
} {
  const antes = PRECIO_NORMAL[frecuencia];
  const ahora = PRECIO_OFERTA[frecuencia];
  const meses = frecuencia === "anual" ? 12 : 1;
  return {
    antes,
    ahora,
    antesPorMes: antes / meses,
    ahoraPorMes: ahora / meses,
    // El porcentaje es el mismo se mire al mes o al año: es una proporción.
    pct: Math.round(((antes - ahora) / antes) * 100),
  };
}

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

/** "US$9,99" — en dólares, con coma decimal porque la audiencia es LATAM:
 *  ahí "9.99" se lee como nueve mil noventa y nueve. */
export function dolares(v: number): string {
  return `US$${Number.isInteger(v) ? v : v.toFixed(2).replace(".", ",")}`;
}

/** "US$6,67" — siempre por mes, que es como se comparan los dos ciclos. */
export function precioPorMes(frecuencia: Frecuencia, enOferta: boolean): string {
  return `US$${precioPorMesDe(enOferta)[frecuencia].toFixed(2).replace(".", ",")}`;
}

/** "US$80" — el cobro de verdad, sin decimales si son redondos. */
export function precioDelCobro(frecuencia: Frecuencia, enOferta: boolean): string {
  return dolares(preciosDe(enOferta)[frecuencia]);
}

/** La línea bajo el precio: qué se cobra y cuándo. */
export function notaDelCobro(frecuencia: Frecuencia, enOferta: boolean): string {
  const ahorro = ahorroAnualDe(enOferta).dolares;
  return frecuencia === "anual"
    ? `Se cobra ${precioDelCobro("anual", enOferta)} una vez al año · ahorras US$${ahorro}`
    : "Se cobra cada mes · cancelas cuando quieras";
}

/**
 * "desde US$6,67 al mes" — el gancho corto que usan varias pantallas.
 *
 * ⚠️ YA NO ES UNA CONSTANTE. Era `PRECIO_DESDE`, calculada una vez al cargar el
 * módulo; con dos juegos de precios eso congelaba uno de los dos para todo el
 * servidor. Ahora es función y cada pantalla pasa lo que le toca a quien mira.
 */
export function precioDesde(enOferta: boolean): string {
  return precioPorMes("anual", enOferta);
}
