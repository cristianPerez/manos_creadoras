/**
 * La oferta de lanzamiento: 24 horas por persona.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ LAS 24 HORAS SON DE VERDAD, Y ESO ES TODO EL DISEÑO
 * ════════════════════════════════════════════════════════════════════════════
 * El reloj empieza la PRIMERA vez que alguien entra y, cuando llega a cero,
 * **el precio sube de verdad** a US$35 / US$350 para esa persona.
 *
 * Es la diferencia entre una oferta y un engaño. Un contador que se reinicia
 * en cada visita —o que llega a cero sin que cambie nada— se descubre
 * recargando la página, y a partir de ese momento no se cree ni el precio, ni
 * los testimonios, ni la garantía. La urgencia falsa no es que sea fea: es que
 * se nota.
 *
 * ⚠️ ESTE ARCHIVO NO IMPORTA `next/headers` A PROPÓSITO. Lo carga también el
 * middleware, que corre en el Edge y no puede usarlo. Aquí vive el cálculo
 * puro; quien tiene las cookies delante se las pasa. Es el mismo reparto que
 * `bolsos-logica.ts` frente a `bolsos.ts`, y por la misma razón.
 *
 * ── POR QUÉ UNA COOKIE Y NO LA CUENTA ─────────────────────────────────────
 * La oferta tiene que funcionar ANTES de que exista cuenta: es lo que se ve en
 * la landing, sin registro. Por eso va en cookie, puesta por el middleware en
 * la primera visita.
 *
 * ⚠️ Y SE PUEDE BURLAR BORRANDO COOKIES. Se sabe y se acepta. Quien borra sus
 * cookies para recuperar un descuento es un caso raro y barato; cerrarlo
 * obligaría a registrarse antes de ver el precio, que cuesta muchas más
 * ventas de las que salva.
 * ════════════════════════════════════════════════════════════════════════════
 */

/** La pone el middleware con el instante de la primera visita, en ms. */
export const COOKIE_OFERTA = "oferta_inicio";

/** Cuánto dura. En un solo sitio: lo lee el middleware y lo lee la pantalla. */
export const HORAS_DE_OFERTA = 24;
export const DURACION_MS = HORAS_DE_OFERTA * 60 * 60 * 1000;

export type EstadoOferta = {
  activa: boolean;
  /** Lo que queda, en milisegundos. 0 si ya terminó. */
  restanteMs: number;
  /** Cuándo termina, en ms desde la época. El cliente cuenta desde aquí. */
  terminaEn: number | null;
};

/**
 * Cálculo puro: dado el instante en que empezó la ventana, ¿sigue viva?
 *
 * @param inicio lo que guarda la cookie, en ms. `undefined` si no hay.
 */
export function calcularOferta(inicio: string | number | undefined): EstadoOferta {
  const t = Number(inicio);

  /*
   * Sin cookie válida no hay oferta. Pasa en la primerísima petición —el
   * middleware la pone en esa misma respuesta, así que la siguiente ya la
   * tiene— y con bots que no guardan cookies.
   *
   * ⚠️ SE FALLA HACIA EL PRECIO NORMAL, no hacia el de oferta: si algo va mal,
   * es preferible cobrar de más y corregirlo que prometer un descuento que la
   * pasarela no va a aplicar.
   */
  if (!Number.isFinite(t) || t <= 0) {
    return { activa: false, restanteMs: 0, terminaEn: null };
  }

  const terminaEn = t + DURACION_MS;
  const restanteMs = Math.max(0, terminaEn - Date.now());

  return { activa: restanteMs > 0, restanteMs, terminaEn };
}
