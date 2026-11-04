import { cache } from "react";
import { detectarPais, regionDe, type Region } from "@/lib/pais";
import { supabaseServer } from "@/lib/supabase/server";
import { PRECIOS_RESPALDO, type Frecuencia, type Precios } from "@/lib/planes";

/**
 * A dónde manda el botón de pagar.
 *
 * Los enlaces viven en la base (`plan_checkout`), no en el código ni en
 * variables de entorno: Elizabeth o Cristian pueden cambiar una URL de OnePay
 * sin desplegar, y abrir un país nuevo es insertar una fila.
 *
 * ⚠️ Y EL PRECIO SALE DE LA MISMA FILA (2026-11-03, migración 0044): lo que se
 * enseña y a dónde lleva el botón se leen juntos, en la misma consulta, así
 * que no pueden contar dos cosas distintas. Se cambian con
 * `npm run precio:cambiar`.
 */

export type EnlacesDeCobro = {
  region: Region;
  pais: string;
  /** La URL de cada ciclo, o `null` si ese ciclo todavía no tiene plan creado. */
  url: Record<Frecuencia, string | null>;
  /** Lo que cobra cada ciclo. Si la fila no tiene precio, el respaldo del código. */
  precios: Precios;
};

export const enlacesDeCobro = cache(async (): Promise<EnlacesDeCobro> => {
  const { pais } = await detectarPais();
  const region = regionDe(pais);

  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("plan_checkout")
    .select("ciclo, url, precio_usd")
    .eq("plan", "completo")
    .eq("region", region);

  const porCiclo = new Map((data ?? []).map((f) => [f.ciclo, f.url]));
  /* `numeric` llega como texto o número según el cliente: se normaliza, y
     cualquier cosa que no sea un precio positivo cae al respaldo. */
  const precioDe = (ciclo: Frecuencia) => {
    const v = Number((data ?? []).find((f) => f.ciclo === ciclo)?.precio_usd);
    return Number.isFinite(v) && v > 0 ? v : PRECIOS_RESPALDO[ciclo];
  };

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
    precios: { mensual: precioDe("mensual"), anual: precioDe("anual") },
  };
});
