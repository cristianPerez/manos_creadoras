import "server-only";
import { cookies } from "next/headers";
import { obtenerVariantePaleta } from "@/lib/flags";
import { COOKIE_FORZADA, COOKIE_VISITANTE, esVariante, type VariantePaleta } from "@/lib/paleta";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * QUÉ PALETA SE PINTA EN ESTA VISITA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Tres piezas, en este orden de mando:
 *
 *   1. `mc_paleta_forzada` — lo que se pidió a mano con `?paleta=b` o
 *      `?paleta=actual`. GANA SIEMPRE sobre el panel, porque su razón de ser es
 *      poder comparar las dos sin tocar Flagsmith ni esperar su refresco de 60
 *      segundos. `?paleta=auto` la borra y devuelve el mando al panel.
 *   2. Flagsmith, por identidad (ver `lib/flags.ts`).
 *   3. "actual", si nada de lo anterior dice otra cosa.
 *
 * ⚠️ ESTO SE RESUELVE EN EL SERVIDOR Y NO EN EL NAVEGADOR, Y ES LA DIFERENCIA
 * ENTRE QUE SE VEA BIEN O QUE PARPADEE. Si la paleta la decidiera un script del
 * navegador, la página se pintaría primero en crema y saltaría a lavanda medio
 * segundo después, a la vista de todas. Como el atributo `data-paleta` sale ya
 * en el HTML que manda el servidor, el primer fotograma ya es el correcto.
 */
export async function paletaDeLaVisita(): Promise<VariantePaleta> {
  const bote = await cookies();

  const forzada = bote.get(COOKIE_FORZADA)?.value;
  if (esVariante(forzada)) return forzada;

  /*
   * ⚠️ LA IDENTIDAD ES EL `mc_vid` (LA COOKIE DEL NAVEGADOR), Y SOLO SI NO
   * EXISTE, LA CUENTA. Cambiado el 2026-11-05, antes del primer día de tráfico.
   *
   * Antes era al revés —la cuenta si la había— y eso partía el experimento:
   * la visitante llegaba sin sesión, Flagsmith la sorteaba con su `mc_vid`
   * (digamos, B), creaba la cuenta, y desde ese momento se sorteaba con su
   * `user_id`, que podía caer en A. La misma persona veía las dos versiones en
   * el mismo embudo y sus eventos quedaban repartidos entre los dos grupos.
   *
   * El `mc_vid` lo pone el middleware en la PRIMERA petición (antes de que
   * nada se pinte) y dura un año, así que es estable de punta a punta en el
   * mismo navegador, con sesión o sin ella. El precio, aceptado: en otro
   * dispositivo puede tocarle la otra versión. La cuenta queda de respaldo
   * por si alguna petición llegara sin la cookie.
   */
  const visitante = bote.get(COOKIE_VISITANTE)?.value;
  if (visitante) return obtenerVariantePaleta(visitante);

  /* Solo sin cookie se pregunta por la sesión: es una llamada de red menos
     en casi todas las visitas. */
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return obtenerVariantePaleta(user?.id ?? "");
}
