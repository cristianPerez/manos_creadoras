import { redirect } from "next/navigation";

/**
 * La dirección vieja de cada paso.
 *
 * ⚠️ YA NO ES UNA PÁGINA (auditoría 2026-10-23). Era la única pantalla con el
 * diseño anterior: pestañas Pasos/Materiales, numeración doble ("1" y "1.
 * Tejido…"), "Video 2 de 5" junto a "Paso 1 de 4" y, bloqueada, sin forma de
 * pagar. La ficha del bolso ya trae el video dentro, el paso a paso y el
 * banner del plan, así que esta dirección solo lleva ahí, al mismo video y
 * arrancado. Se mantiene para los enlaces que ya circulan (correos, favoritos).
 */
export default async function Leccion({
  params,
}: {
  params: Promise<{ slug: string; orden: string }>;
}) {
  const { slug, orden } = await params;
  const n = Number(orden);
  redirect(
    Number.isInteger(n) && n >= 0
      ? `/app/bolsos/${encodeURIComponent(slug)}?video=${n}&ver=1`
      : `/app/bolsos/${encodeURIComponent(slug)}`,
  );
}
