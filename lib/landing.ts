/**
 * El contenido del home, separado de cómo se ve.
 *
 * Está aquí y no repartido por los componentes porque Elizabeth va a querer
 * cambiar textos —una pregunta frecuente, un testimonio, el WhatsApp— sin que
 * nadie toque una sola línea de maquetación. Un archivo, una lista por sección.
 *
 * Los PRECIOS no viven aquí: salen de `lib/planes.ts`, que los calcula. Si un
 * precio aparece escrito en este archivo, es un precio inventado.
 *
 * ⚠️ HOME V3 (2026-10-20). Se borraron cinco bloques que nadie importaba —
 * `ANUNCIO`, `PASOS`, `MENTORA`, `CIERRE` y las siete `PREGUNTAS` del home v1—
 * y que seguían prometiendo cosas que ya no son verdad: "3 meses gratis", un
 * "US$9,74 al mes", "un curso nuevo cada mes" y una "comunidad". Código muerto
 * con datos falsos es una trampa: basta con que alguien lo importe creyéndolo
 * bueno.
 */

/* ── Contacto ───────────────────────────────────────────────────────── */

/**
 * El WhatsApp de dudas antes de comprar. Número de Cristian, 2026-10-20.
 *
 * Solo dígitos, con el código de país y sin "+": es el formato que pide
 * `wa.me`. Si cambia, se cambia aquí y nada más.
 */
export const WHATSAPP_NUMERO = "573154940311";

/** El mensaje con el que se abre la conversación, para que no empiece en blanco. */
const WHATSAPP_SALUDO = "Hola, tengo una duda sobre el curso de Manos Creadoras.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_SALUDO)}`;

/* ── La profesora ───────────────────────────────────────────────────── */

export const PROFESORA = {
  nombre: "Elizabeth Valencia",
  foto: "/images/mentora-elizabeth.webp",
  alt: "Elizabeth Valencia, profesora de Manos Creadoras",
  texto:
    "Te enseño a tejer bolsos de perlas paso a paso, con las mismas fichas y el mismo método que uso en cada bolso. Y si algo no te sale, el Ojo Experto te responde con mis fichas.",
} as const;

/* ── Testimonios ─────────────────────────────────────────────────────── */

export type Testimonio = {
  /** La foto del bolso que tejió ella, no su cara. */
  foto: string;
  /** Lo que escribió, TAL CUAL. Nulo si la foto llegó sin mensaje suyo. */
  frase: string | null;
  /** Como firma en la comunidad. Sin apellido completo: ver abajo. */
  nombre: string;
  /** Una etiqueta corta de contexto ("En proceso"), opcional. */
  detalle?: string;
};

/**
 * Lo que tejen sus alumnas — fotos REALES de la comunidad de Telegram
 * "Manos creadoras" (91 miembros), entregadas por Cristian el 2026-10-20.
 *
 * ⚠️ LAS FRASES SON LITERALES, NO SE PULEN. Copiadas de las capturas, con su
 * gramática. Un testimonio retocado ya no es un testimonio, y es justo lo que
 * hace que el "4,9/5" sin respaldo saliera de esta página el 17-oct.
 *
 * ⚠️ Las fotos se recortaron de las capturas para quedarse SOLO con el bolso:
 * sin burbujas de chat, horas ni mensajes de otras personas.
 *
 * ⚠️ PERMISO PENDIENTE: son personas reales con su nombre en la comunidad.
 * Antes de publicar en producción, pedirles el OK (basta un "sí" en el grupo).
 * Por eso solo va el nombre de pila o el de su marca, nunca el apellido.
 *
 * Se descartó una sexta captura (bolso negro "no me queda cuadradito"): es un
 * fotograma borroso de video y el mensaje es una queja; en una página de venta
 * se lee como "no sale bien".
 */
export const TESTIMONIOS: Testimonio[] = [
  {
    foto: "/images/alumnas/alumna-jenatelier-bolso-flor.webp",
    frase:
      "Hoy traigo mi corazón en la mano y este diseño que me ha sacado lágrimas, pero de alegría.",
    nombre: "Jenifer · Jenatelier",
  },
  {
    foto: "/images/alumnas/alumna-jenifer-bolso-perlas.webp",
    frase: "—¿En cuánto tiempo lo hiciste? —1 día.",
    nombre: "Jenifer · Jenatelier",
  },
  {
    foto: "/images/alumnas/alumna-andrea-bolso-negro.webp",
    frase: "Y ahorita estoy haciendo unos más juvenil",
    nombre: "Andrea",
  },
  {
    foto: "/images/alumnas/alumna-bolso-cristal-en-proceso.webp",
    frase: "Aún no le he puesto forro también, me encantaría que quedara perfecto…",
    nombre: "Alumna de la comunidad",
    detalle: "En proceso",
  },
  {
    foto: "/images/alumnas/alumna-bolso-cristal-blanco.webp",
    frase: null,
    nombre: "Alumna de la comunidad",
  },
];

/* ── Preguntas frecuentes ───────────────────────────────────────────── */

/**
 * Las cinco preguntas del home v3.
 *
 * ⚠️ VALIDADAS CONTRA LA APP, NO COPIADAS DEL DISEÑO. Dos respuestas del diseño
 * no eran verdad y se corrigieron:
 *
 *   · "el anual dura un año desde tu pago": el plan anual de OnePay SE RENUEVA
 *     solo cada 12 meses. Prometer que dura un año y volver a cobrar es el
 *     reclamo más fácil de prever.
 *   · "te llega un correo con tu enlace de acceso": solo si paga con el correo
 *     de una cuenta que ya existe. El webhook busca a la alumna por ese correo;
 *     si no la encuentra, el pago queda huérfano y se activa a mano. Mientras
 *     eso no cambie, la respuesta lo dice.
 *
 * También alimentan el JSON-LD `FAQPage` del home: lo que lee Google es lo
 * mismo que lee ella.
 */
export const PREGUNTAS_FRECUENTES = [
  {
    q: "¿Necesito experiencia?",
    a: "No. El curso empieza desde cero: las cápsulas te enseñan las técnicas base y cada bolso va paso a paso.",
  },
  {
    q: "¿Cuánto cuestan los materiales?",
    a: "Depende del bolso. Cada ficha trae la lista exacta de materiales y el directorio te lleva a los proveedores. Puedes ver la ficha de cada bolso gratis antes de pagar.",
  },
  {
    q: "¿Por cuánto tiempo tengo acceso?",
    a: "Mientras tu plan esté activo. El mensual se renueva cada mes y el anual cada año. Si cancelas, conservas el acceso hasta el final del período que ya pagaste.",
  },
  {
    q: "¿Cómo pido el reembolso?",
    a: "Dentro de los primeros 7 días desde tu primer pago, escríbenos desde Contacto o por WhatsApp y te devolvemos el pago.",
  },
  {
    q: "¿Cómo entro después de pagar?",
    a: "Paga con el mismo correo de tu cuenta gratis: en cuanto se confirma el pago te llega un correo con tu acceso, sin contraseña. Si aún no tienes cuenta o no te llega en unos minutos, escríbenos por WhatsApp y te activamos al momento.",
  },
] as const;

/**
 * El JSON-LD `FAQPage`: lo mismo que lee ella, dicho para Google.
 *
 * Sale de la misma lista que el acordeón, así que no pueden decir cosas
 * distintas. El `<` se escapa para que una respuesta nunca pueda cerrar la
 * etiqueta `<script>` donde se incrusta.
 */
export function faqJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PREGUNTAS_FRECUENTES.map((p) => ({
      "@type": "Question",
      name: p.q,
      acceptedAnswer: { "@type": "Answer", text: p.a },
    })),
  }).replace(/</g, "\\u003c");
}

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
  { texto: "Elizabeth", destino: "#elizabeth" },
  // "Planes" y no "Precio": lo que se mira antes de comprar es qué se lleva uno,
  // y es la palabra que la gente busca en un menú.
  { texto: "Planes", destino: "#precio" },
] as const;
