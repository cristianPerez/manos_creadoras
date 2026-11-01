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

  /*
   * ── El embudo DENTRO del home (2026-11-01) ───────────────────────────
   *
   * ⚠️ POR QUÉ HICIERON FALTA. Hasta hoy entre "abrió la página" y "tocó
   * pagar" no había NADA: se veía que alguien entraba y que alguien pagaba,
   * pero no por dónde se perdían los demás. Cristian preguntó exactamente eso
   * —dónde se atascan antes del pago— y no se podía responder.
   *
   * Con estos tres se puede: qué secciones llegó a ver, hasta dónde bajó y
   * qué botones tocó por el camino.
   */
  /** Una sección del home entró en pantalla. Lleva `seccion`. */
  seccionVista: "seccion_vista",
  /** Hasta dónde bajó: 25, 50, 75 o 100. Un evento por hito, una vez cada uno. */
  scrollProfundidad: "scroll_profundidad",
  /**
   * Cualquier botón o enlace tocado, con su texto y su sección.
   *
   * Es la red de seguridad: un botón que nadie instrumentó igual aparece aquí.
   * Lo copiamos de El Charcu, donde ya evitó más de un punto ciego.
   */
  botonClick: "boton_click",

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

  // ── Home v3: los caminos a la compra (2026-10-20) ─────────────────────
  /**
   * Tocó un "Inscribirme". Lleva `origen` (header · banner_precio ·
   * banda_1de16 · precio · cierre · barra_movil) y `plan`.
   *
   * ⚠️ NO SUSTITUYE A `checkout_abierto`, que sigue siendo el que dice "abrió el
   * pago". Este dice DESDE DÓNDE se decidió: con seis botones de compra en una
   * página, saber cuál convierte es justo lo que permite quitar los que no.
   */
  ctaInscribirmeClick: "cta_inscribirme_click",
  /** Cambió entre anual y mensual. Lleva el `plan` que quedó elegido. */
  planToggle: "plan_toggle",
  /** Abrió WhatsApp. Lleva `origen`: las dudas antes de pagar son objeciones. */
  whatsappClick: "whatsapp_click",
  /** Abrió una pregunta frecuente. Lleva cuál: la más abierta es la objeción nº1. */
  faqOpen: "faq_open",
} as const;

export type Evento = (typeof EVENTOS)[keyof typeof EVENTOS];
