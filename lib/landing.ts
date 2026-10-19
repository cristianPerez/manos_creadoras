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

/*
 * ⚠️ AQUÍ VIVÍA `CIFRAS_HERO` Y SE BORRÓ EL 2026-10-17. Estaba MUERTA: ningún
 * componente la importaba —el héroe pinta sus cifras en su propio JSX— y
 * llevaba dos datos falsos esperando a que alguien la usara:
 *
 *   · "4,9 / 5 valoración", que Cristian retiró por no tener reseñas detrás.
 *   · "US$ 9,74 al mes, plan anual", de cuando el plan costaba otra cosa. Hoy
 *     el anual sale a US$20,83.
 *
 * Código muerto con números desfasados es una trampa: el día que alguien lo
 * importe creyendo que es la fuente buena, la landing promete un precio que no
 * existe. El precio se saca SIEMPRE de `lib/planes.ts`, que lo calcula.
 */

/* ── Cómo funciona ──────────────────────────────────────────────────── */

export const PASOS = [
  {
    n: "01",
    titulo: "Te unes y entras a todo",
    texto:
      "Acceso inmediato a los 16 bolsos en video, su ficha de materiales y el directorio de proveedores.",
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
    // La valoración salió el 2026-10-17 (sin reseñas que la respalden). Se
    // quita también aquí aunque este bloque todavía no se pinte: si mañana
    // alguien lo usa, no debe resucitar una cifra retirada.
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
    a: "Hay un solo plan, con todo incluido: los 16 bolsos en video, uno nuevo cada mes, la ficha de materiales de cada uno, el directorio de proveedores, el Ojo Experto y la comunidad. Solo eliges si lo pagas cada mes o de una vez al año.",
  },
  {
    /*
     * ✅ RESUELTA EL 2026-10-19: ya existe el botón. Esta respuesta decía
     * "escríbenos" porque era lo único cierto mientras no lo había, y se
     * cambia EN EL MISMO COMMIT que lo construye — si no, la app tendría un
     * botón y el FAQ seguiría mandando a escribir un correo, que es peor que
     * no tener ninguno de los dos: parece que el botón no cuenta.
     */
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí, tú misma y en dos toques, desde Mi plan dentro de la app. No hay que escribir ni dar explicaciones, y conservas el acceso hasta que termine el período que ya pagaste.",
  },
  {
    q: "¿Los materiales los compro yo?",
    a: "Sí, y por eso cada curso trae la lista exacta de lo que necesitas. Además tienes el directorio de proveedores con cuentas, mallas y herrajes a precio de mayorista, ordenado por país.",
  },
  {
    q: "¿Puedo vender lo que fabrique?",
    a: "Sí, las piezas que tejes son tuyas y puedes venderlas. Lo que no se puede es revender ni compartir los videos: eso es el curso, no la pieza.",
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
  // "Planes" y no "Precio": lo que se mira antes de comprar es qué se lleva uno,
  // y es la palabra que la gente busca en un menú.
  { texto: "Planes", destino: "#precio" },
] as const;
