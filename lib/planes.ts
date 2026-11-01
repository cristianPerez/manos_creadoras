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
 * ── UN SOLO PRECIO (2026-10-19) ───────────────────────────────────────────
 *
 * Entre el 17 y el 19 de octubre hubo una oferta de lanzamiento: dos juegos de
 * precios y un reloj de 24h por visitante. SE RETIRÓ ENTERA, y conviene saber
 * por qué para no reponerla sin pensarlo.
 *
 * ⚠️ LA REBAJA NO EXISTÍA. OnePay tiene UN enlace de pago por ciclo
 * (`plan_checkout`), así que cobraba lo mismo a todo el mundo. La página
 * anunciaba "antes US$350" y, pasadas las 24h, seguía anunciando US$350
 * mientras el botón cobraba el precio de oferta. El "antes" era un número que
 * nunca se cobró y el reloj no cambiaba nada al llegar a cero.
 *
 * Decisión de Cristian el 2026-10-19, con sus palabras: «no queremos fingir
 * una rebaja de precio». Si algún día se quiere una oferta de verdad, hace
 * falta primero un SEGUNDO plan en OnePay con el precio normal y que el
 * enlace cambie al expirar — si no, es decoración.
 */

export type Precios = { mensual: number; anual: number };

/**
 * EL precio. Uno solo, el mismo para todo el mundo y a todas horas.
 *
 * ⚠️ SON EXACTAMENTE LOS PLANES DE ONEPAY. Si aquí dice una cifra y el panel
 * de OnePay dice otra, manda OnePay —es quien cobra— y esta constante está
 * mintiendo. Al cambiar un precio se cambian LOS DOS SITIOS, en el mismo rato.
 */
export const PRECIOS: Precios = { mensual: 19.7, anual: 167 };

/**
 * Lo que cuesta cada mes según cómo se pague.
 *
 * ⚠️ EL "AL MES" DEL ANUAL SE CALCULA, nunca se escribe a mano. Si se
 * escribieran los dos, el día que cambie uno el otro se queda mintiendo — y la
 * cifra que miente es siempre la del descuento, que es la que decide la compra.
 */
export function precioPorMesDe(): Record<Frecuencia, number> {
  return { mensual: PRECIOS.mensual, anual: PRECIOS.anual / 12 };
}

/** Lo que se ahorra pagando el año de golpe, en dólares y en porcentaje. */
export function ahorroAnualDe(): { dolares: number; pct: number } {
  const dolares = Math.round(PRECIOS.mensual * 12 - PRECIOS.anual);
  return { dolares, pct: Math.round((dolares / (PRECIOS.mensual * 12)) * 100) };
}

/**
 * Lo que incluye. Es la misma lista para los dos ciclos: cambia el cobro, no el curso.
 *
 * ⚠️ HOME V3 (2026-10-20): la lista pasó a nombrar cosas que existen en la app
 * —ficha de materiales, directorio— en vez de "mini bolsos y llaveros", que no
 * hay. La comparten el home, Mi plan y el selector de pago: cambia en los tres.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ SE QUITÓ EL NÚMERO DE BOLSOS DE TODA LA PÁGINA (2026-11-01)
 * ════════════════════════════════════════════════════════════════════════════
 * Antes decía "20 bolsos" y había una función `incluyeCon` que metía la cifra
 * del catálogo. Cristian la quitó, y la razón es de negocio, no de estilo:
 *
 *   · Una cifra cerrada es un TECHO. "20 bolsos" invita a la pregunta que
 *     mata una suscripción: "¿por qué sigo pagando si ya los vi todos?".
 *   · Manos Creadoras deja de ser un curso y pasa a ser una comunidad donde
 *     entran clases nuevas cada semana, y pronto velas y otros talleres. Un
 *     número fijo contradice eso y además envejece solo.
 *
 * Lo que sustituye a la cifra es la razón de seguir pagando: que cada semana
 * hay algo nuevo. Si esa promesa deja de cumplirse, esta lista miente — es lo
 * primero que hay que cambiar aquí.
 */
export const INCLUYE = [
  "Clases nuevas cada semana",
  "Velas y más talleres en camino, sin pagar de nuevo",
  "La biblioteca completa de bolsos en video, paso a paso",
  "Ficha de materiales de cada proyecto",
  "Directorio de proveedores",
  "Estrategias para vender tus creaciones",
  "El Ojo Experto para tus dudas",
  "Certificado por cada taller que termines",
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

/*
 * ⚠️ MENSUAL, NO ANUAL (2026-11-01, decisión de Cristian). Hasta hoy todo
 * arrancaba en el plan anual —el de US$167 de un pago—, que es el que deja más
 * dinero por venta pero también el que más asusta al primer vistazo. Con la
 * membresía vendiéndose como "clases nuevas cada semana", la puerta de entrada
 * natural es la mensualidad.
 *
 * Esta constante la usan TODOS los botones de compra del home (banner, banda,
 * cabecera, barra móvil, navidad), así que cambiarla aquí los cambia todos.
 */
export const FRECUENCIA_POR_DEFECTO: Frecuencia = "mensual";

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
  texto: "Si no es para ti, pides tu reembolso dentro de los primeros 7 días.",
} as const;

/** "US$19,70" — en dólares, con coma decimal porque la audiencia es LATAM:
 *  ahí "9.99" se lee como nueve mil noventa y nueve. */
export function dolares(v: number): string {
  return `US$${Number.isInteger(v) ? v : v.toFixed(2).replace(".", ",")}`;
}

/** "US$6,67" — siempre por mes, que es como se comparan los dos ciclos. */
export function precioPorMes(frecuencia: Frecuencia): string {
  return `US$${precioPorMesDe()[frecuencia].toFixed(2).replace(".", ",")}`;
}

/** "US$80" — el cobro de verdad, sin decimales si son redondos. */
export function precioDelCobro(frecuencia: Frecuencia): string {
  return dolares(PRECIOS[frecuencia]);
}

/** La línea bajo el precio: qué se cobra y cuándo. */
export function notaDelCobro(frecuencia: Frecuencia): string {
  const ahorro = ahorroAnualDe().dolares;
  /*
   * ⚠️ "UN PAGO AL AÑO", NUNCA "PAGO ÚNICO". El diseño del home v3 decía "pago
   * único de US$89,90", pero el plan anual de OnePay se renueva solo cada 12
   * meses. "Único" promete que no se vuelve a cobrar, y cuando se cobra es un
   * reclamo — o un reembolso. Decisión de Cristian, 2026-10-20.
   */
  return frecuencia === "anual"
    ? `Un pago de ${precioDelCobro("anual")} al año · ahorras US$${ahorro}`
    : `Se cobra ${precioDelCobro("mensual")} cada mes · cancelas cuando quieras`;
}

/**
 * "US$19,70 al mes" — el gancho corto que usan varias pantallas.
 *
 * ⚠️ DABA EL PRECIO DEL ANUAL REPARTIDO POR MESES (US$13,92) y ahora da el
 * mensual de verdad. Enseñar el del anual era correcto mientras el anual era
 * lo que se ofrecía por defecto; con el mensual por delante, decir "desde
 * US$13,92" y cobrar US$19,70 al tocar el botón es la clase de desajuste que
 * se nota justo en la pantalla de pago.
 */
export function precioDesde(): string {
  return precioPorMes(FRECUENCIA_POR_DEFECTO);
}
