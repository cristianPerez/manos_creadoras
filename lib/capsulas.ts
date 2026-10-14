import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";

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
  portadaUrl: string | null;
};

/**
 * `cache` de React: el home pide las cápsulas en la sección y otra vez en el
 * visor, y así la consulta se hace UNA vez por render.
 */
export const listarCapsulas = cache(async (): Promise<Capsula[]> => {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("capsulas")
    .select("id, orden, titulo, etiqueta_corta, subtitulo, video_id, portada_url")
    .order("orden");

  return (data ?? []).map((c) => ({
    id: c.id,
    orden: c.orden,
    titulo: c.titulo,
    etiquetaCorta: c.etiqueta_corta,
    subtitulo: c.subtitulo,
    videoId: c.video_id,
    portadaUrl: c.portada_url,
  }));
});
