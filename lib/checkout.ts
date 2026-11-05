import { unstable_cache } from "next/cache";
import { cache } from "react";
import { ETIQUETA_COBRO, VIDA_COBRO_S } from "@/lib/cache-datos";
import { detectarPais, regionDe, type Region } from "@/lib/pais";
import { supabasePublico } from "@/lib/supabase/publico";
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

type FilaCobro = { ciclo: string; url: string | null; precio_usd: number | string | null };

/**
 * Las filas de cobro de UNA región, en la caché de datos de Next (2026-11-05).
 *
 * ⚠️ 60 SEGUNDOS, EL TIEMPO MÁS CORTO DE TODA LA CACHÉ. El precio se cambia
 * con `npm run plan:onepay` desde la terminal, que no puede invalidar la caché
 * de Next: con 60 s, un precio nuevo tarda como mucho un minuto en verse en
 * la web. Ver `lib/cache-datos.ts`.
 *
 * La región entra en la clave (es el argumento): Colombia e internacional se
 * guardan por separado. El país se sigue detectando en cada visita, fuera de
 * la caché, porque sale de la conexión de quien mira.
 */
const cobroCacheado = unstable_cache(
  async (region: Region): Promise<FilaCobro[]> => {
    const { data, error } = await supabasePublico()
      .from("plan_checkout")
      .select("ciclo, url, precio_usd")
      .eq("plan", "completo")
      .eq("region", region);
    if (error || !data) throw new Error(`cobro: ${error?.message ?? "sin datos"}`);
    return data as FilaCobro[];
  },
  ["cobro-v1"],
  { revalidate: VIDA_COBRO_S, tags: [ETIQUETA_COBRO] },
);

export const enlacesDeCobro = cache(async (): Promise<EnlacesDeCobro> => {
  const { pais } = await detectarPais();
  const region = regionDe(pais);

  /* Si la base falla, sin filas: el precio cae al respaldo del código y el
     botón a contacto, igual que antes. Lo fallido no se guarda en caché. */
  const data = await cobroCacheado(region).catch((): FilaCobro[] => []);

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
