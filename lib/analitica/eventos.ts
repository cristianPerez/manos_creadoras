/**
 * Catálogo de eventos del embudo. Fuente única de los nombres.
 *
 * ⚠️ POR QUÉ UN CATÁLOGO Y NO ESCRIBIR EL NOMBRE EN CADA SITIO. Es el error que
 * El Charcu cometió y corrigió: tenía `recipe_detail_view` escrito a mano dentro
 * de un componente, y el día que alguien escribiera `recipe_detail_viewed` en
 * otro sitio el panel tendría dos eventos que son el mismo — y ninguno de los
 * dos con el número real. Un embudo con el denominador partido en dos no se
 * nota: sigue pareciendo razonable.
 *
 * ⚠️ NOMBRES EN ESPAÑOL, a diferencia del resto del código. El convenio del
 * repo es código en inglés, pero estos nombres NO son código: son lo que
 * Elizabeth y Cristian van a leer en el panel de Mixpanel para decidir dónde
 * está el cuello de botella. Un panel que hay que traducir mentalmente no se
 * mira, y una analítica que no se mira es dinero tirado.
 */
export const EVENTOS = {
  // ── Antes de la app: la página de ventas ──────────────────────────────
  /** Alguien abrió la página de ventas. Denominador de todo el negocio. */
  paginaVentasVista: "pagina_ventas_vista",
  /** Tocó un botón de compra. Lleva qué plan (mensual/anual). */
  checkoutAbierto: "checkout_abierto",

  // ── El regalo: los 3 tutoriales ───────────────────────────────────────
  /**
   * Entró a la app SIN cuenta y vio los tutoriales de cortesía.
   *
   * Es el denominador del embudo nuevo: de cada 100 que llegan aquí, ¿cuántos
   * ven un video, cuántos dejan el correo y cuántos compran?
   */
  cortesiaVista: "cortesia_vista",
  /** Abrió uno de los tutoriales. Lleva CUÁL y si tenía cuenta. */
  leccionAbierta: "leccion_abierta",
  /**
   * Intentó abrir una lección del programa de pago sin tenerlo.
   *
   * Vale mucho: es alguien que buscó activamente más contenido. Si sube,
   * conviene mirar POR CUÁL lección preguntan.
   */
  leccionBloqueadaVista: "leccion_bloqueada_vista",

  // ── El muro del correo ────────────────────────────────────────────────
  /**
   * Se le enseñó el muro que pide crear cuenta. Lleva `lugar`.
   *
   * ⚠️ Es EL DENOMINADOR de `correoEnviado`: sin este solo se sabe cuántos lo
   * dejaron, nunca a cuántos se les pidió. Un 40% de conversión sobre un
   * denominador que no existe no significa nada.
   */
  muroCorreoVisto: "muro_correo_visto",
  /**
   * Mandó su correo desde el login o el muro.
   *
   * ⚠️ ESTO NO ES "CONTACTO NUEVO", y confundirlo infla la cifra. El muro le
   * sale a cualquiera sin sesión, así que una alumna de siempre que volvió
   * después de cerrar sesión pasa por aquí igual y queda contada. Lo vio
   * Cristian probando en El Charcu.
   *
   * Sigue valiendo, y mucho: es el paso "se le pidió el correo → lo dio".
   */
  correoEnviado: "correo_enviado",

  // ── El único momento en que se sabe quién es nuevo ────────────────────
  /**
   * Entró por el enlace del correo y la cuenta ACABA de nacer.
   *
   * ⚠️ No se puede saber al pedir el correo: preguntarle al servidor "¿existe
   * este correo?" es exactamente lo que permite enumerar a las usuarias de un
   * sitio, y Supabase se niega a contestarlo a propósito. Al abrir el enlace ya
   * demostró que el buzón es suyo, así que ahí sí se puede decir sin abrirle la
   * puerta a nadie.
   *
   * ESTE, y no `correo_enviado`, es el contador de contactos nuevos.
   */
  cuentaCreada: "cuenta_creada",
  /** Entró por el enlace y la cuenta ya existía. */
  cuentaIniciada: "cuenta_iniciada",

  // ── El Ojo Experto ────────────────────────────────────────────────────
  /** Mandó una consulta. Lleva si iba con foto y de qué público es. */
  consultaEnviada: "consulta_enviada",
  /** Llegó respuesta. Lleva cuánto tardó. */
  consultaRespondida: "consulta_respondida",
  /** Se le acabó el cupo del mes. Para una cuenta gratis es la señal de compra. */
  sinCupo: "sin_cupo",
  /**
   * Se agotó el presupuesto diario de IA y el Ojo Experto dejó de responder.
   *
   * ⚠️ Si este evento aparece, hay que MIRARLO el mismo día: o hay mucho uso
   * real (buena noticia, sube el tope) o alguien está abusando.
   */
  sinPresupuesto: "sin_presupuesto",
  /**
   * La barrera de `lib/promesas.ts` corrigió una respuesta que prometía
   * ingresos. Si sube, el prompt del sistema se rompió.
   */
  promesaBloqueada: "promesa_bloqueada",
} as const;

export type Evento = (typeof EVENTOS)[keyof typeof EVENTOS];
