import { unstable_cache } from "next/cache";
import { cache } from "react";
import { ETIQUETA_CAPSULAS, VIDA_CAPSULAS_S } from "@/lib/cache-datos";
import { supabasePublico } from "@/lib/supabase/publico";
import { urlDeMiniatura } from "@/lib/video";

/**
 * Las cápsulas del home: cinco videos cortos que se ven sin crear cuenta.
 *
 * Son el anzuelo. Enseñan una técnica suelta en menos de un minuto y no piden
 * nada a cambio — ni correo. Lo que se gana no es el dato, es que quien llega
 * compruebe que sabemos explicar antes de que le pidamos dinero.
 */

export type Capsula = {
  id: string;
  orden: number;
  titulo: string;
  /** Lo que va bajo el círculo en móvil: "Cuentas", "El hilo"… */
  etiquetaCorta: string;
  subtitulo: string;
  /** ⚠️ Nulo mientras no estén grabadas. El visor lo tiene en cuenta. */
  videoId: string | null;
  /**
   * La imagen del círculo.
   *
   * ⚠️ ES UN FOTOGRAMA DE SU PROPIO VIDEO desde el 2026-10-19, no la foto de
   * un bolso. Antes las cinco cápsulas tomaban prestada la portada de un
   * bolso cualquiera —"El hilo correcto" enseñaba Brillo Lunar— porque
   * todavía no tenían video grabado; el `seed-capsulas.mjs` lo llamaba
   * "provisional" en su propio comentario. Con los videos de la 0030 ya hay
   * algo mejor que enseñar: lo que de verdad va a ver al tocar.
   */
  miniaturaUrl: string | null;
  /** El respaldo si Bunny no sirve la miniatura. Ver `Capsulas.tsx`. */
  portadaUrl: string | null;
};

/**
 * `cache` de React: el home pide las cápsulas en la sección y otra vez en el
 * visor, y así la consulta se hace UNA vez por render.
 */
type FilaCapsula = {
  id: string;
  orden: number;
  titulo: string;
  etiqueta_corta: string;
  subtitulo: string;
  video_id: string | null;
  portada_url: string | null;
};

/**
 * Las cápsulas son IGUALES PARA TODO EL MUNDO: se guardan en la caché de datos
 * de Next (2026-11-05, ver `lib/cache-datos.ts`) en vez de leerse en cada
 * visita del home. Si la base falla, lanza: no se cachea una lista vacía.
 */
const capsulasCacheadas = unstable_cache(
  async (): Promise<FilaCapsula[]> => {
    const { data, error } = await supabasePublico()
      .from("capsulas")
      .select("id, orden, titulo, etiqueta_corta, subtitulo, video_id, portada_url")
      .order("orden");
    if (error || !data) throw new Error(`capsulas: ${error?.message ?? "sin datos"}`);
    return data as FilaCapsula[];
  },
  ["capsulas-v1"],
  { revalidate: VIDA_CAPSULAS_S, tags: [ETIQUETA_CAPSULAS] },
);

export const listarCapsulas = cache(async (): Promise<Capsula[]> => {
  const data = await capsulasCacheadas().catch((): FilaCapsula[] => []);

  return data.map((c) => ({
    id: c.id,
    orden: c.orden,
    titulo: c.titulo,
    etiquetaCorta: c.etiqueta_corta,
    subtitulo: c.subtitulo,
    videoId: c.video_id,
    miniaturaUrl: c.video_id ? urlDeMiniatura(c.video_id) : null,
    portadaUrl: c.portada_url,
  }));
});
