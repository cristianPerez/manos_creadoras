/**
 * ════════════════════════════════════════════════════════════════════════════
 * LAS FOTOS "TOPO" — solo para la rama B del experimento de paleta
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Los bolsos están fotografiados sobre fondos café y madera. Con la paleta de
 * siempre (crema y dorado) eso pega; con la B (lavanda) el café se lee como
 * "durazno" y pelea con el morado — que es exactamente lo que no puede pasar en
 * una página donde lo único que importa es que el bolso luzca.
 *
 * Las fotos topo son LAS MISMAS, mismo encuadre, con el fondo pasado a un gris
 * cálido neutro. Las genera `scripts/fotos-topo.mjs` en `public/images/topo/`.
 *
 * ⚠️ POR QUÉ UNA LISTA Y NO "PROBAR SI EL ARCHIVO EXISTE". Comprobar el disco
 * en cada render costaría una llamada al sistema por foto y por visita; y
 * comprobarlo en el navegador significa pedir una imagen que a lo mejor da 404,
 * ver el error y pedir otra — un parpadeo a la vista de todas. La lista es
 * explícita, se lee de un vistazo y falla hacia la foto normal.
 *
 * ⚠️ SI UNA FOTO NO ESTÁ EN LA LISTA, SE USA LA NORMAL. Nunca un hueco: el
 * catálogo crece y nadie va a acordarse de generar el topo de cada bolso nuevo.
 * Lo peor que pasa es que esa foto se vea un punto más cálida que sus vecinas.
 */

/**
 * Los nombres de archivo que tienen gemelo en `public/images/topo/`.
 * Salen de `design-ref/paleta-b-claude-code/fotos-topo/`.
 */
const CON_TOPO = new Set([
  "bolso-anillos-de-seda.webp",
  "bolso-boho.webp",
  "bolso-brillo-lunar.webp",
  "bolso-coquett-clasico.webp",
  "bolso-cristal-brillante.webp",
  "bolso-gota-de-rocio.webp",
  "bolso-icono.webp",
  "bolso-llavero-mora.webp",
  "bolso-marfil-elegante.webp",
  "bolso-perla-tejida.webp",
]);

/**
 * Devuelve la versión topo de una foto nuestra, o la misma URL si no la hay.
 *
 * Solo toca rutas propias de `/images/`: una foto que venga de Supabase o de
 * Bunny se devuelve tal cual, porque de esas no tenemos gemelo.
 */
export function fotoTopo(url: string | null): string | null {
  if (!url) return null;
  if (!url.startsWith("/images/")) return url;

  const archivo = url.slice("/images/".length);
  return CON_TOPO.has(archivo) ? `/images/topo/${archivo}` : url;
}
