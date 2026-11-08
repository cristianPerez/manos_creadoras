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
  /**
   * Llegó a la página intermedia `/pagar` (2026-11-06), el paso entre tocar
   * "comprar" y abrir OnePay. Lleva `plan`, `moneda` y `desde` (qué botón).
   * Embudo: cta_inscribirme_click → pago_puente_visto → checkout_abierto.
   */
  pagoPuenteVisto: "pago_puente_visto",
  /**
   * En `/pagar` cambió de mensual a anual o al revés (2026-11-07). Lleva `de`,
   * `a`, `desde` (selector de la tarjeta o el enlace del resumen final),
   * `moneda` y `precio` del ciclo elegido. Dice si el anual convence una vez
   * que se ve el precio.
   */
  cicloCambiado: "ciclo_cambiado",

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
   *
   * Desde el 2026-11-04 se mide en TODA la app, no solo en el home: lleva
   * `texto`, `pagina` y `destino`.
   */
  botonClick: "boton_click",

  /**
   * EL PAGO ENTRÓ. Lo manda el SERVIDOR desde el webhook, no el navegador.
   *
   * ⚠️ ES EL ÚLTIMO PASO DEL EMBUDO Y EL ÚNICO QUE EL NAVEGADOR NO PUEDE VER:
   * la alumna paga en OnePay, en otro dominio, y muchas veces cierra la
   * pestaña al terminar. Sin esto el embudo moría en "abrió el pago", y el
   * salto más caro del negocio —de abrir la pasarela a pagar de verdad— era
   * invisible. Ver `lib/analitica/mixpanel-servidor.ts`.
   */
  pagoConfirmado: "pago_confirmado",
  /**
   * Un pago que llegó ANTES de que existiera la cuenta se reclamó al pedir el
   * código (`lib/pagos-huerfanos.ts`). Lleva `minutos_sin_acceso`.
   */
  pagoReconciliado: "pago_reconciliado",
  /** La pasarela avisó de una baja (conserva acceso hasta vencer). Servidor. */
  suscripcionCancelada: "suscripcion_cancelada",
  /** Rebotó un cobro o venció la suscripción. Servidor. */
  cobroFallido: "cobro_fallido",

  /*
   * ── DENTRO DE LA APP: qué hacen las alumnas (2026-11-04) ─────────────
   *
   * ⚠️ POR QUÉ. Con la primera venta real se vio que estábamos ciegos: se
   * sabía qué páginas abrió, pero no qué video vio, cuánto, ni si lo terminó.
   * "Visto" solo existía si tocaba el botón, y casi nadie lo toca.
   * Todos llevan `bolso` (slug) y, los de video, `video_orden` y `paso`.
   */
  /** Abrió la ficha de un bolso. Lleva si es gratis y si lo tiene bloqueado. */
  bolsoAbierto: "bolso_abierto",
  /** Eligió un video de la ficha (materiales o un paso). Aún no le dio play. */
  videoAbierto: "video_abierto",
  /** El video empezó a correr de verdad (Bunny avisó). Una vez por video y visita. */
  videoReproducido: "video_reproducido",
  /** Llegó al 25, 50 o 75% del video. Lleva `porcentaje`. Una vez por hito. */
  videoProgreso: "video_progreso",
  /**
   * Vio el 80% del video. AQUÍ SE MARCA COMO VISTO SOLO, sin tocar el botón:
   * los últimos segundos suelen ser el cierre, y exigir el 100% dejaría sin
   * marcar a quien cierra en cuanto ve el resultado.
   */
  videoCompletado: "video_completado",
  /** Tocó "Marcar como visto" / lo desmarcó a mano. Lleva `visto`. */
  videoMarcadoManual: "video_marcado_manual",
  /** Marcó o desmarcó un material de la lista ("ya lo tengo"). */
  materialMarcado: "material_marcado",
  /** Tocó un proveedor del directorio. Lleva cuál y de qué categoría. */
  directorioClic: "directorio_clic",
  /** Pidió darse de baja desde Mi plan. Lleva si salió bien. */
  bajaPedida: "baja_pedida",

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
   * Se abrió el modal de entrar (2026-11-05: "Entrar" dejó de ser la página
   * `/entrar`). Lleva `origen`: "header", "app", "bienvenida", "enlace_entrar"…
   *
   * Es el denominador de `correoEnviado` con `lugar = "modal_…"`: cuántos
   * abrieron la puerta frente a cuántos dejaron el correo.
   */
  entrarAbierto: "entrar_abierto",
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
