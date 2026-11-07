import { unstable_cache } from "next/cache";
import { cache } from "react";
import { ETIQUETA_COBRO, VIDA_COBRO_S } from "@/lib/cache-datos";
import { VARIANTE_CONTROL, type VariantePrecio } from "@/lib/experimento";
import { varianteDePrecio } from "@/lib/experimento-servidor";
import { detectarPais, regionDe, type Region } from "@/lib/pais";
import { supabasePublico } from "@/lib/supabase/publico";
import { PRECIOS_RESPALDO, type Frecuencia, type Moneda, type Precios } from "@/lib/planes";

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
  /** La variante del experimento de precio cuyas filas se usaron (ver abajo). */
  variante: VariantePrecio;
  pais: string;
  /** La URL de cada ciclo, o `null` si ese ciclo todavía no tiene plan creado. */
  url: Record<Frecuencia, string | null>;
  /** Lo que cobra cada ciclo. Si la fila no tiene precio, el respaldo del código. */
  precios: Precios;
};

type FilaCobro = {
  ciclo: string;
  url: string | null;
  precio_usd: number | string | null;
  /* Desde la 0049: en qué moneda cobra el plan de `url` y cuánto, en esa moneda. */
  moneda: string | null;
  precio: number | string | null;
};

const MONEDAS: readonly Moneda[] = ["USD", "COP", "MXN"];

/**
 * Las filas de cobro de UNA región, en la caché de datos de Next (2026-11-05).
 *
 * ⚠️ 60 SEGUNDOS, EL TIEMPO MÁS CORTO DE TODA LA CACHÉ. El precio se cambia
 * con `npm run plan:onepay` desde la terminal, que no puede invalidar la caché
 * de Next: con 60 s, un precio nuevo tarda como mucho un minuto en verse en
 * la web. Ver `lib/cache-datos.ts`.
 *
 * La región y la variante entran en la clave (son los argumentos): cada
 * combinación se guarda por separado. El país se sigue detectando en cada visita, fuera de
 * la caché, porque sale de la conexión de quien mira.
 */
const cobroCacheado = unstable_cache(
  async (region: Region, variante: VariantePrecio): Promise<FilaCobro[]> => {
    const { data, error } = await supabasePublico()
      .from("plan_checkout")
      .select("ciclo, url, precio_usd, moneda, precio")
      .eq("plan", "completo")
      .eq("region", region)
      .eq("variante", variante);
    if (error || !data) throw new Error(`cobro: ${error?.message ?? "sin datos"}`);
    return data as FilaCobro[];
  },
  ["cobro-v3"],
  { revalidate: VIDA_COBRO_S, tags: [ETIQUETA_COBRO] },
);

export const enlacesDeCobro = cache(async (): Promise<EnlacesDeCobro> => {
  const { pais } = await detectarPais();
  const region = regionDe(pais);

  /*
   * ── EL EXPERIMENTO DE PRECIO (2026-11-07, migración 0050) ───────────────
   * La flag `precio` dice qué variante le toca (a/b/c) y se leen SUS filas.
   * ⚠️ SI ESA VARIANTE NO TIENE LOS DOS CICLOS EN ESTA REGIÓN, SE USA LA "a"
   * ENTERA, nunca medio y medio: un plan a medio crear no puede dejar a nadie
   * sin botón de pago, ni comparar el mensual de una variante con el anual de
   * otra. `variante` devuelve la que de verdad se usó.
   */
  let variante = await varianteDePrecio();

  /* Si la base falla, sin filas: el precio cae al respaldo del código y el
     botón a contacto, igual que antes. Lo fallido no se guarda en caché. */
  const filas = (r: Region, v: VariantePrecio) => cobroCacheado(r, v).catch((): FilaCobro[] => []);
  let data = await filas(region, variante);
  if (variante !== VARIANTE_CONTROL && new Set(data.map((f) => f.ciclo)).size < 2) {
    variante = VARIANTE_CONTROL;
    data = await filas(region, variante);
  }

  /*
   * ⚠️ LOS DOS CICLOS TIENEN QUE IR EN LA MISMA MONEDA. Si Colombia tuviera
   * el mensual en COP y el anual aún en USD (un plan a medio crear), la página
   * compararía pesos con dólares: "ahorras -$59.813". En ese caso se enseña
   * el país como internacional, en dólares, hasta que estén los dos.
   */
  const monedaDe = (f: FilaCobro): Moneda =>
    MONEDAS.includes(f.moneda as Moneda) ? (f.moneda as Moneda) : "USD";
  const enPesosSinPrecio = data.some((f) => monedaDe(f) !== "USD" && !(Number(f.precio) > 0));
  if (region !== "internacional" && (new Set(data.map(monedaDe)).size > 1 || enPesosSinPrecio)) {
    data = await filas("internacional", variante);
    if (variante !== VARIANTE_CONTROL && new Set(data.map((f) => f.ciclo)).size < 2) {
      variante = VARIANTE_CONTROL;
      data = await filas("internacional", variante);
    }
  }
  const moneda: Moneda = data.length ? monedaDe(data[0]) : "USD";

  const porCiclo = new Map((data ?? []).map((f) => [f.ciclo, f.url]));
  /* `numeric` llega como texto o número según el cliente: se normaliza, y
     cualquier cosa que no sea un precio positivo cae al respaldo. */
  const precioDe = (ciclo: Frecuencia) => {
    const fila = (data ?? []).find((f) => f.ciclo === ciclo);
    /* `precio` (en su moneda) manda; `precio_usd` solo para filas en USD de
       antes de la 0049. En pesos NUNCA se cae a `precio_usd`: enseñaría
       dólares con el signo de pesos. */
    const v = Number(fila?.precio ?? (moneda === "USD" ? fila?.precio_usd : null));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  const mensual = precioDe("mensual");
  const anual = precioDe("anual");
  /* Sin los dos precios en su moneda, el respaldo entero (en USD), nunca medio y medio. */
  const precios: Precios =
    mensual != null && anual != null ? { mensual, anual, moneda } : PRECIOS_RESPALDO;

  return {
    region,
    variante,
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
    precios,
  };
});
