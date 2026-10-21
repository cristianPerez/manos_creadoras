/**
 * Barrera contra promesas de ingresos en la respuesta del Ojo Experto.
 *
 * ES LA ADAPTACIÓN DE `cure-safety` DE EL CHARCU. Allí la barrera revisa dosis
 * de sal de cura porque una cifra mal dada envenena a una familia. Aquí tejer no
 * le hace daño a nadie — el riesgo es otro y es real:
 *
 *   · **Legal.** Prometer ganancias es publicidad engañosa en casi toda LATAM.
 *   · **Hotmart.** Su moderación tumba productos que prometen ingresos. Sería
 *     perder el canal de cobro entero.
 *   · **Humano.** Marcela (FICHA-AVATAR) teje de noche después de trabajar. Que
 *     una IA le prometa "vas a ganar 500 al mes" y no pase es exactamente cómo
 *     se pierde a una clienta para siempre.
 *
 * ⚠️ Y LA RAZÓN DE QUE ESTO EXISTA EN CÓDIGO: hasta hoy "NUNCA prometas
 * ingresos" solo estaba PEDIDO en el prompt del sistema. Un prompt es una
 * instrucción, no una barrera — se dobla con una pregunta insistente, y el
 * modelo que la obedece el 99% de las veces la incumple el 1% restante, que con
 * volumen es todos los días.
 *
 * ⚠️ LO QUE ESTA BARRERA NO BLOQUEA, A PROPÓSITO: **poner precio a un bolso**.
 * Está explícitamente permitido en las instrucciones del Ojo Experto y es de lo
 * más útil que puede hacer ("cobra entre X y Y por uno así, mira los materiales
 * y las horas"). Bloquear eso sería romper una función buena por miedo. La
 * diferencia es tiempo y sujeto: aconsejar un precio habla del BOLSO; prometer
 * ingresos habla del FUTURO DE ELLA.
 */

/**
 * Cada patrón busca una promesa sobre lo que ELLA va a obtener, no un consejo
 * sobre cuánto vale un bolso.
 *
 * Se escriben sin tildes obligatorias donde puede faltar (`ganaras?`) porque el
 * modelo a veces las come, y una barrera que se salta por una tilde no es una
 * barrera.
 */
const PROMESAS: readonly RegExp[] = [
  // "vas a ganar", "podrás ganar", "puedes ganar", "ganarás", "llegarás a ganar"
  /\b(vas?\s+a|podr[aá]s|puedes|lograr[aá]s|llegar[aá]s\s+a)\s+(ganar|facturar|vender)\b/i,
  /\bganar[aá]s\b|\bfacturar[aá]s\b|\bvender[aá]s\b/i,
  // "ingresos de", "ganancias de", "una ganancia de" + cifra o mes
  /\b(ingresos?|ganancias?|utilidad(es)?)\s+(de|mensuales?|al\s+mes|extra)\b/i,
  // "vivir de esto", "vivir del tejido"
  /\bvivir\s+(de|del)\b/i,
  /*
    "recuperar la inversión" y TODAS sus conjugaciones.

    ⚠️ Escrito así tras un fallo real de la propia prueba: el patrón pedía el
    infinitivo `recuperar` y la frase "con tres bolsos **recuperas** la
    inversión del curso" se coló entera. Es el recordatorio de por qué esta
    barrera se prueba con frases escritas a mano en vez de darla por buena: una
    expresión que parece cubrir el caso puede estar mirando solo una forma del
    verbo.
  */
  /\brecuper(a|as|ar|ar[aá]s|ar[ií]as|an)\s+(la\s+|tu\s+|lo\s+)?(inversi[oó]n|invertido|que\s+pagaste|del\s+curso)\b/i,
  /\bduplicar\s+(tu|tus)\b/i,
  // "clientas aseguradas", "se venden solos", "se van a vender solos"
  /\bse\s+(venden|van\s+a\s+vender)\s+sol[oa]s\b/i,
  /\b(clientas?|pedidos?|ventas?)\s+(asegurad[oa]s|garantizad[oa]s)\b/i,
  // "negocio rentable", "rentabilidad" como promesa
  /\bnegocio\s+rentable\b/i,
];

export type VeredictoPromesas = {
  /** `true` cuando la respuesta se puede mostrar tal cual. */
  limpia: boolean;
  /**
   * CUÁNTAS coincidencias hubo, nunca cuáles.
   *
   * ⚠️ El fragmento es texto que el modelo escribió sobre lo que esa alumna
   * está tejiendo y vendiendo. Los registros salen del edificio en cuanto haya
   * un recolector de logs, así que ahí no puede ir nada personal. El número
   * basta para lo único que hay que vigilar: si sube, el prompt se rompió.
   */
  coincidencias: number;
};

export function auditarPromesas(texto: string): VeredictoPromesas {
  const coincidencias = PROMESAS.filter((p) => p.test(texto)).length;
  return { limpia: coincidencias === 0, coincidencias };
}

/**
 * Lo que se muestra cuando la respuesta traía una promesa.
 *
 * NO se le enseña a la alumna la frase que bloqueamos: se corrige y se explica
 * por qué, en el tono de la mentora. Y no se queda en "no puedo responder" —
 * le devuelve la pregunta útil, que es lo que de verdad la ayuda.
 */
export const RESPUESTA_CORREGIDA =
  "Paré mi respuesta a propósito: me salió una promesa sobre lo que podrías ganar, y eso no te lo puedo prometer — depende de tu ciudad, de tus materiales y de a quién le vendas, y yo no puedo saberlo.\n\nLo que sí puedo es ayudarte a que el bolso quede tan bien que se venda solo por cómo se ve. Cuéntame en qué paso estás o mándame una foto y lo miramos.";
