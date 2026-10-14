/**
 * El contenido del home, separado de cómo se ve.
 *
 * Está aquí y no repartido por los componentes porque Elizabeth va a querer
 * cambiar textos —el bolso del mes, una pregunta frecuente, un número— sin que
 * nadie toque una sola línea de maquetación. Un archivo, una lista por sección.
 */

/* ── La barra de arriba ─────────────────────────────────────────────── */

export const ANUNCIO = {
  texto: "Nuevo curso cada mes · Con el plan anual pagas",
  destacado: "3 meses gratis",
} as const;

/* ── Héroe ──────────────────────────────────────────────────────────── */

/**
 * Las tres cifras bajo el héroe.
 *
 * ⚠️ `+1.200 creadoras` y `4,9/5` vienen del diseño y son los números que ya
 * usaba la landing anterior. Si alguna vez dejan de ser ciertos hay que
 * cambiarlos aquí: prometer una comunidad que no existe es la clase de detalle
 * que una alumna verifica y que destruye la confianza de golpe.
 */
export const CIFRAS_HERO = [
  /*
   * `animar` es el número que cuenta de 0 hasta su valor al entrar.
   *
   * ⚠️ SOLO LO LLEVA LA PRIMERA. Una valoración de 4,9 y un precio no son
   * cantidades que crezcan: ver "US$ 9,74" subiendo desde cero se lee como que
   * el precio está aumentando mientras miras, que es justo la sensación
   * contraria a la que queremos en la primera pantalla.
   */
  { valor: "+1.200", pie: "creadoras dentro", animar: 1200, prefijo: "+" },
  { valor: "4,9 / 5", pie: "valoración de alumnas" },
  { valor: "US$ 9,74", pie: "al mes, plan anual" },
] as const;

/* ── Cómo funciona ──────────────────────────────────────────────────── */

export const PASOS = [
  {
    n: "01",
    titulo: "Te unes y entras a todo",
    texto:
      "Acceso inmediato a +50 lecciones en video, los 50 patrones y el directorio de proveedores.",
  },
  {
    n: "02",
    titulo: "Cada mes, un curso nuevo",
    texto: "Un bolso nuevo con su video completo, patrón con medidas exactas y lista de materiales.",
  },
  {
    n: "03",
    titulo: "Creas, muestras y vendes",
    texto:
      "Mentoría mensual, retos en comunidad y guías de precios y fotografía para vender tus piezas.",
  },
] as const;

/* ── La colección ───────────────────────────────────────────────────── */

/*
 * ⚠️ AQUÍ VIVÍA UNA LISTA DE OCHO BOLSOS ESCRITA A MANO, y se borró.
 *
 * Era una segunda fuente de verdad: el home decía que "Cristal Brillante" era
 * una foto y la app decía que era otra. Cinco de los ocho habían divergido ya.
 *
 * La sección `Coleccion` lee ahora el catálogo de la base, igual que `/app`.
 * El bolso del héroe también sale de ahí.
 */


/* ── La mentora ─────────────────────────────────────────────────────── */

export const MENTORA = {
  nombre: "Elizabeth Valencia",
  parrafos: [
    "Especialista en bolsos artesanales de lujo. Desde hace más de 5 años acompaña a mujeres de diferentes países a aprender técnicas claras para crear bolsos en cuentas con acabados elegantes y estilo boutique.",
    "Su método va paso a paso, para que desarrolles piezas sofisticadas y conviertas tu creatividad en una colección con identidad propia.",
  ],
  cifras: [
    { valor: "+5", pie: "años de oficio" },
    { valor: "+1.200", pie: "alumnas" },
    { valor: "4,9", pie: "valoración" },
  ],
} as const;

/* ── Preguntas frecuentes ───────────────────────────────────────────── */

/**
 * Las siete preguntas del diseño, con sus respuestas.
 *
 * ⚠️ El diseño solo trae escrita la respuesta de la primera; las otras seis
 * venían en blanco. Se redactaron a partir de lo que el propio sitio ya promete
 * (los planes, la garantía, cómo se entrega el acceso) para que ninguna quede
 * vacía — un acordeón que se abre y no dice nada es peor que no tener la
 * pregunta. Dos llevan aviso porque dependen de decisiones aún abiertas.
 */
export const PREGUNTAS = [
  {
    q: "Nunca he hecho un bolso. ¿Es para mí?",
    a: "Sí. La membresía empieza desde cero: técnica base, materiales y primeros puntos, antes de pasar a modelos más elaborados.",
  },
  {
    q: "¿Qué recibo cada mes?",
    a: "Un curso completo con un modelo nuevo: el video paso a paso, el patrón con medidas exactas y la lista de materiales. Todo queda en tu biblioteca para siempre, aunque el mes termine.",
  },
  {
    q: "¿Qué incluye cada plan?",
    a: "Aprendiz es gratis e incluye un curso completo con su patrón. Creadora suma el curso nuevo de cada mes, los +50 tutoriales, los 50 patrones, el directorio de proveedores y la comunidad. Maestra añade mentoría mensual con Elizabeth, feedback personal de tus piezas y las guías de precios y fotografía.",
  },
  {
    /*
     * ⚠️ RESPUESTA PENDIENTE DE CONFIRMAR. El encargo marcó esta pregunta como
     * abierta, y con OnePay todavía sin integrar nadie puede prometer cómo se
     * cancela. Se responde lo único que sí es verdad hoy (se cancela
     * escribiendo, y el acceso dura hasta el final del período pagado) sin
     * inventar un botón de "cancelar suscripción" que no existe.
     */
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Escríbenos y cancelamos la renovación; conservas el acceso hasta que termine el período que ya pagaste, y los cursos que descargaste siguen siendo tuyos.",
  },
  {
    q: "¿Los materiales los compro yo?",
    a: "Sí, y por eso cada curso trae la lista exacta de lo que necesitas. Además tienes el directorio de proveedores con cuentas, mallas y herrajes a precio de mayorista, ordenado por país.",
  },
  {
    q: "¿Puedo vender lo que fabrique?",
    a: "Sí, las piezas que tejes son tuyas y puedes venderlas. Lo que no se puede es revender o compartir los videos y patrones: eso es el curso, no la pieza.",
  },
  {
    q: "¿Cómo recibo el acceso después de pagar?",
    a: "Te llega un correo con tu acceso en cuanto se confirma el pago. Si no lo ves en unos minutos, revisa el correo no deseado o escríbenos y lo activamos a mano.",
  },
] as const;

/* ── Cierre ─────────────────────────────────────────────────────────── */

export const CIERRE = {
  titulo: "Tu primer bolso empieza",
  clave: "este mes",
  texto: "Empieza con un curso gratis, o desde US$9,74 al mes en el plan anual.",
  cta: "Unirme ahora",
} as const;

/* ── Navegación ─────────────────────────────────────────────────────── */

/**
 * El menú del home.
 *
 * ⚠️ ESTAS ANCLAS TIENEN QUE EXISTIR EN LA PÁGINA. Hasta el home v2 apuntaban a
 * cinco secciones que ya se habían borrado (#como-funciona, #coleccion,
 * #planes, #mentora, #preguntas): el menú estaba entero y ninguno de sus cinco
 * enlaces llevaba a ningún sitio. Un menú que no hace nada es peor que no tener
 * menú, porque se prueba una vez y se deja de confiar en toda la página.
 *
 * Si se borra o renombra una sección del home, esta lista se toca EN EL MISMO
 * commit.
 */
export const NAVEGACION = [
  { texto: "Cápsulas gratis", destino: "#capsulas" },
  { texto: "Curso gratis", destino: "#gratis" },
  { texto: "Ojo Experto", destino: "#ojo" },
  { texto: "Precio", destino: "#precio" },
] as const;
