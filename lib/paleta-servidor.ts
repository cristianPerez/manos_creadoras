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
   * ⚠️ LA IDENTIDAD ES LA CUENTA SI LA HAY, Y SI NO EL `mc_vid`. Con la cuenta,
   * una alumna ve la misma paleta en el celular y en el computador; con la
   * cookie, el reparto al menos es estable por navegador. `getUser()` está
   * cacheada por petición y el layout ya la pide, así que esto no cuesta una
   * consulta de más.
   */
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const identidad = user?.id ?? bote.get(COOKIE_VISITANTE)?.value ?? "";
  return obtenerVariantePaleta(identidad);
}
