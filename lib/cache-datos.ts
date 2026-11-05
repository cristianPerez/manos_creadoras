/**
 * ════════════════════════════════════════════════════════════════════════════
 * LA CACHÉ DE DATOS (2026-11-05) — qué se guarda, cuánto y cómo se refresca
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Mismo patrón que El Charcu (`entities/recipe/api/recipeApi.ts`):
 * `unstable_cache` de Next guarda la respuesta de la base en la caché de datos
 * y la comparten TODAS las visitas. En vez de una consulta por visita y por
 * página, una cada pocos minutos para todo el sitio.
 *
 * ⚠️ SOLO LO PÚBLICO. Lo que es de cada persona —su avance, su checklist, su
 * plan, sus conversaciones con el Ojo— NO pasa por aquí: se sigue leyendo en
 * cada visita, con su sesión. Ver `lib/supabase/publico.ts`.
 *
 * Cómo se refresca: solo, al vencer el tiempo; o al momento con
 * `revalidateTag(ETIQUETA)` desde una acción del servidor. Los scripts de la
 * terminal (`npm run plan:onepay`, el seed) NO pueden invalidar: por eso los
 * precios llevan el tiempo más corto.
 */

/** El catálogo: bolsos con sus lecciones. Cambia al publicar un proyecto. */
export const ETIQUETA_CATALOGO = "catalogo";
/** Materiales de cada ficha y el directorio de compras. */
export const ETIQUETA_MATERIALES = "materiales";
/** Las cápsulas gratis del home. */
export const ETIQUETA_CAPSULAS = "capsulas";
/** Precios y enlaces de OnePay (`plan_checkout`). */
export const ETIQUETA_COBRO = "cobro";

/**
 * Cuánto vive cada cosa, en segundos.
 *
 * ⚠️ EL PRECIO, 60 s Y NO MÁS. Se cambia con un script desde la terminal, que
 * no puede invalidar la caché: con 60 s, un precio nuevo tarda como mucho un
 * minuto en verse. Más tiempo sería anunciar un precio y cobrar otro.
 * El catálogo y las cápsulas cambian cuando se graba algo nuevo (días): 10
 * minutos es invisible para quien publica y ahorra casi todas las consultas.
 */
export const VIDA_CATALOGO_S = 10 * 60;
export const VIDA_MATERIALES_S = 10 * 60;
export const VIDA_CAPSULAS_S = 10 * 60;
export const VIDA_COBRO_S = 60;
