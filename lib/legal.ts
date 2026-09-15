/**
 * Los datos legales del negocio, en un solo sitio.
 *
 * Están aquí y no escritos dentro de cada página porque los cita la política de
 * privacidad Y los términos: dos copias de un dato legal son dos versiones que
 * el día que cambie una dejarán de coincidir, y en un documento legal eso no es
 * un detalle.
 */

/** Quién responde por el programa y por los datos de las alumnas. */
export const RESPONSABLE = "Manos Creadoras — Elizabeth Valencia";

/**
 * La identificación legal del responsable (cédula o NIT) y su domicilio.
 *
 * ⚠️ PENDIENTE — Cristian lo dejó en espera el 2026-09-15.
 *
 * POR QUÉ IMPORTA Y NO ES UN ADORNO: la Ley 1581 de 2012 de Colombia exige que
 * el titular de los datos —la alumna— sepa QUIÉN los tiene y cómo ejercer sus
 * derechos. Un documento que dice "somos Manos Creadoras" sin identificación ni
 * domicilio no le permite a nadie reclamar, que es justamente el punto.
 *
 * ⚠️ CÓMO ESTÁ RESUELTO MIENTRAS TANTO: las páginas legales NO inventan nada ni
 * enseñan un "[PENDIENTE]" a las alumnas. Simplemente omiten la línea de
 * identificación y dejan la vía de contacto, que sí existe y funciona. Es
 * incompleto, no falso — pero sigue siendo INCOMPLETO, y por eso está en la
 * lista de bloqueos de ESTADO.md.
 *
 * Cuando llegue el dato: se escribe aquí y las dos páginas lo recogen solas.
 */
export const IDENTIFICACION: string | null = null;

/** Domicilio para notificaciones. Mismo caso que arriba. */
export const DOMICILIO: string | null = null;

/**
 * El país cuya ley aplica. Confirmado por Cristian el 2026-09-15.
 *
 * Decide qué norma se cita y ante quién puede reclamar una alumna. No es una
 * elección libre: es donde opera el negocio.
 */
export const PAIS = "Colombia";

/** La norma de protección de datos que aplica en ese país. */
export const LEY_DATOS = "Ley 1581 de 2012";

/** La autoridad ante la que una alumna puede reclamar si no le respondemos. */
export const AUTORIDAD_DATOS = "Superintendencia de Industria y Comercio (SIC)";
