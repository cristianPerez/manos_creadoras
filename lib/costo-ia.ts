/**
 * Cuánto costó una consulta al Ojo Experto, en dólares.
 *
 * ⚠️ POR QUÉ ESTE ARCHIVO EXISTE. Antes el costo se estimaba con dos constantes
 * escritas dentro de la ruta: 0,00025 por pregunta y 0,0005 por foto, pasara lo
 * que pasara. Una estimación así no se puede auditar — el día que la factura de
 * Google no cuadre, no hay forma de saber si el error está en el precio, en el
 * número de consultas o en que las respuestas se alargaron. Ahora se cobra sobre
 * los TOKENS que devuelve Google, que son el mismo dato que él factura.
 *
 * ⚠️ AVISO HONESTO SOBRE LOS PRECIOS DE ABAJO. Los tokens son exactos; el precio
 * por token NO lo pude verificar contra la lista de precios de Google al
 * escribir esto. Son el orden de magnitud correcto para un modelo Flash, y están
 * AQUÍ, en dos constantes con nombre, precisamente para que corregirlos sea
 * cambiar dos números en un archivo en vez de buscarlos por todo el código.
 *
 * Qué hacer con esto: comparar el total de un mes real (`select sum(usd) from
 * ai_spend`) contra la factura de Google AI Studio. Si no cuadra, se ajustan
 * estos dos números y cuadra el mes siguiente.
 *
 * Que el precio sea aproximado NO rompe el freno de gasto: lo que el freno
 * necesita es una cifra que crezca con el uso real, y los tokens lo hacen. Si el
 * precio quedara corto, el tope salta más tarde de lo ideal; por eso el tope
 * diario se pone con holgura y no al céntimo.
 */

/** USD por cada millón de tokens que ENTRAN (la pregunta, el contexto, la foto). */
const USD_POR_MILLON_ENTRADA = 0.3;

/** USD por cada millón de tokens que SALEN (la respuesta). Siempre más caro. */
const USD_POR_MILLON_SALIDA = 2.5;

export type ConsumoIA = {
  tokensEntrada: number;
  tokensSalida: number;
};

/**
 * Lee el consumo que informa Gemini.
 *
 * Los nombres de los campos son los de `usageMetadata`. Si Google cambiara la
 * forma de la respuesta, esto devuelve ceros en vez de reventar: perder la
 * contabilidad de una consulta es malo, pero tumbar la respuesta que la alumna
 * está esperando por un campo que se renombró es peor.
 *
 * ⚠️ Los tokens de "pensamiento" se cobran como salida, que es como los factura
 * Google. Sumarlos a la entrada abarataría el cálculo a la mitad.
 */
export function leerConsumo(uso: unknown): ConsumoIA {
  if (typeof uso !== "object" || uso === null) {
    return { tokensEntrada: 0, tokensSalida: 0 };
  }

  const m = uso as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

  const entrada = num(m.promptTokenCount);

  /*
    ⚠️ LA SALIDA SE CALCULA DE DOS MANERAS Y GANA LA MAYOR. Comprobado con una
    llamada real a Gemini el 2026-09-15: la respuesta trajo `promptTokenCount`,
    `thoughtsTokenCount` y `totalTokenCount`, pero **`candidatesTokenCount` no
    venía**. Sumando solo los campos con nombre se habría contado de menos, y
    contar de menos en un freno de gasto significa que el freno salta tarde —
    que es lo mismo que no tenerlo.

    `total − entrada` no depende de cómo Google reparta la salida entre campos
    ni de que mañana renombre uno, así que sirve de red. Se toma el mayor de los
    dos: ante la duda, el gasto se cuenta de más, nunca de menos.
  */
  const porCampos = num(m.candidatesTokenCount) + num(m.thoughtsTokenCount);
  const porDiferencia = num(m.totalTokenCount) - entrada;

  return {
    tokensEntrada: entrada,
    tokensSalida: Math.max(porCampos, porDiferencia, 0),
  };
}

/** El costo en dólares de ese consumo. */
export function costoEnUsd({ tokensEntrada, tokensSalida }: ConsumoIA): number {
  const usd =
    (tokensEntrada / 1_000_000) * USD_POR_MILLON_ENTRADA +
    (tokensSalida / 1_000_000) * USD_POR_MILLON_SALIDA;

  // 6 decimales: una consulta suelta cuesta millonésimas y redondear a 4 la
  // dejaría en cero. Cien consultas de cero siguen siendo cero, y el freno de
  // gasto no saltaría nunca.
  return Number(usd.toFixed(6));
}
