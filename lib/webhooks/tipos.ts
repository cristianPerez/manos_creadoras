/**
 * El contrato que cumple CUALQUIER pasarela de pago.
 *
 * ⚠️ ESTA CAPA EXISTE PORQUE LA PASARELA YA CAMBIÓ UNA VEZ. El proyecto nació
 * con Hotmart, se pasó a OnePay, y hubo que borrar un `app/api/webhooks/hotmart`
 * entero con su lógica dentro. Lo que cambió de verdad era poco: cómo se firma
 * la petición y cómo se llaman los campos. Todo lo demás —guardar el evento, no
 * procesarlo dos veces, mover la fecha de vencimiento— era igual.
 *
 * Así que eso vive aquí, una sola vez, y cada pasarela solo aporta sus dos
 * diferencias: VERIFICAR que el mensaje es suyo, y TRADUCIR su vocabulario al
 * nuestro.
 *
 * Añadir una pasarela nueva = un archivo que cumpla `Proveedor` y una línea en
 * el registro. Ni la ruta ni la base se tocan.
 */

/** Lo que la app entiende, sin saber de quién vino. */
export type TipoDeEvento =
  | "suscripcion.pagada"
  | "suscripcion.cancelada"
  /**
   * ⚠️ LE REBOTÓ LA TARJETA EN LA RENOVACIÓN. El panel de OnePay ofrece este
   * evento aunque su documentación no lo mencione, y es el que faltaba: sin él,
   * una alumna deja de pagar y CONSERVA el acceso hasta que alguien lo note a
   * mano.
   */
  | "suscripcion.impagada"
  | "suscripcion.vencida"
  | "desconocido";

export type EventoNormalizado = {
  /** El nombre del evento tal cual lo manda la pasarela: "subscription.paid". */
  evento: string;
  tipo: TipoDeEvento;
  /** El id del recurso en la pasarela (la suscripción, el pago…). */
  recursoId: string;
  /**
   * El correo de quien paga, si la pasarela lo manda.
   *
   * ⚠️ ES LO QUE PERMITE SABER DE QUIÉN ES EL PAGO. El enlace de cobro es
   * genérico y no lleva ninguna referencia nuestra, así que cuando llega un
   * pago de una suscripción que no conocíamos, el correo es el único puente
   * hasta la alumna. Si la pasarela no lo manda, el evento queda huérfano y hay
   * que activarlo a mano.
   */
  correo: string | null;
  /**
   * El id del cliente EN LA PASARELA.
   *
   * ⚠️ NO ES NUESTRO `user_id`. El webhook no sabe quién es la alumna; traer
   * esto es lo que permite ir a buscarla.
   */
  clienteId: string | null;
  /**
   * Hasta cuándo está pagado. En un pago viene de la próxima cobranza.
   * Es lo que termina en `membresias.vence_el`.
   */
  venceEl: string | null;
  /**
   * ⚠️ EL DATO QUE DISTINGUE UNA OCURRENCIA DE UN REINTENTO, y es la parte más
   * fácil de equivocar.
   *
   * Tiene que cambiar entre dos eventos distintos del mismo tipo —el pago de
   * enero y el de febrero de la MISMA suscripción— pero NO entre los reintentos
   * de uno solo. La fecha de la próxima cobranza cumple las dos cosas; el
   * instante en que llegó el mensaje, no.
   */
  marca: string | null;
};

export type ResultadoVerificacion =
  | { valido: true }
  | { valido: false; motivo: string };

export type Proveedor = {
  /** Su nombre en la URL y en la base: "onepay". */
  nombre: string;

  /**
   * ¿Este mensaje es de verdad suyo?
   *
   * ⚠️ Recibe el cuerpo CRUDO, sin parsear, porque las firmas se calculan sobre
   * esos bytes exactos. `JSON.parse` seguido de `JSON.stringify` reordena claves
   * y cambia espacios: la firma deja de coincidir y no es obvio por qué.
   */
  verificar(cabeceras: Headers, cuerpoCrudo: string): ResultadoVerificacion;

  /**
   * Traduce su vocabulario al nuestro. Devuelve `null` si el cuerpo no tiene la
   * forma esperada — eso es un problema de integración, no un evento.
   */
  leer(cuerpo: unknown): EventoNormalizado | null;
};
