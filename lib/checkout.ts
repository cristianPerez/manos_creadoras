import { cache } from "react";
import { detectarPais, regionDe, type Region } from "@/lib/pais";
import { supabaseServer } from "@/lib/supabase/server";
import type { Frecuencia } from "@/lib/planes";

/**
 * A dónde manda el botón de pagar.
 *
 * Los enlaces viven en la base (`plan_checkout`), no en el código ni en
 * variables de entorno: Elizabeth o Cristian pueden cambiar una URL de OnePay
 * sin desplegar, y abrir un país nuevo es insertar una fila.
 */

export type EnlacesDeCobro = {
  region: Region;
  pais: string;
  /** La URL de cada ciclo, o `null` si ese ciclo todavía no tiene plan creado. */
  url: Record<Frecuencia, string | null>;
};

export const enlacesDeCobro = cache(async (): Promise<EnlacesDeCobro> => {
  const { pais } = await detectarPais();
  const region = regionDe(pais);

  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("plan_checkout")
    .select("ciclo, url")
    .eq("plan", "completo")
    .eq("region", region);

  const porCiclo = new Map((data ?? []).map((f) => [f.ciclo, f.url]));

  return {
    region,
    pais,
    /*
     * ⚠️ `null` CUANDO NO HAY FILA, y quien lo use debe tenerlo en cuenta. Hoy
     * el plan ANUAL no existe todavía en OnePay. Inventar una URL llevaría a
     * una página de pago que no carga, justo en el momento de más intención de
     * compra; sin ella, la pantalla manda a contacto y lo explica.
     */
    url: {
      mensual: porCiclo.get("mensual") ?? null,
      anual: porCiclo.get("anual") ?? null,
    },
  };
});
