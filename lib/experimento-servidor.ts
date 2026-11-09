import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  COOKIE_PRECIO_FORZADO,
  COOKIE_RUTA_FORZADA,
  COOKIE_VISITANTE,
  esRutaPago,
  esVariantePrecio,
  type RutaPago,
  type VariantePrecio,
} from "@/lib/experimento";
import { obtenerRutaPago, obtenerVariantePrecio } from "@/lib/flags";
import { ENTORNO_DE_PRUEBA } from "@/lib/pais-prueba";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * QUÉ PRECIO (A, B O C) SE ENSEÑA Y SE COBRA EN ESTA VISITA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * En este orden de mando:
 *
 *   1. `mc_precio_forzado` — lo pedido a mano con `?precio=b`. SOLO FUERA DE
 *      PRODUCCIÓN: en producción se ignora aunque la cookie exista, para que
 *      nadie pueda elegirse el precio más bajo.
 *   2. Flagsmith, por identidad (ver `lib/flags.ts`).
 *   3. "a", si nada de lo anterior dice otra cosa.
 *
 * ⚠️ SE RESUELVE EN EL SERVIDOR, UNA VEZ POR PETICIÓN (`cache`): el layout, el
 * home, `/pagar` y Mi plan preguntan lo mismo y tienen que oír lo mismo. Si
 * dos piezas de la misma página resolvieran por su cuenta y una fallara, la
 * página enseñaría un precio y el botón cobraría otro.
 */
export const varianteDePrecio = cache(async (): Promise<VariantePrecio> => {
  const bote = await cookies();

  if (ENTORNO_DE_PRUEBA) {
    const forzada = bote.get(COOKIE_PRECIO_FORZADO)?.value;
    if (esVariantePrecio(forzada)) return forzada;
  }

  return obtenerVariantePrecio(await identidadDelVisitante());
});

/*
 * ⚠️ LA IDENTIDAD ES EL `mc_vid` (LA COOKIE DEL NAVEGADOR), Y SOLO SI NO
 * EXISTE, LA CUENTA. Si fuera al revés, la persona que se sortea sin sesión
 * y luego crea la cuenta podría saltar de precio a mitad del embudo
 * (aprendido en el A/B de paleta, 2026-11-05). El `mc_vid` lo pone el
 * middleware en la primera petición y dura un año. Aceptado: en otro
 * dispositivo puede tocarle otro precio.
 *
 * La comparten las dos flags (`precio` y `ruta_pago`): la misma persona,
 * repartida por el mismo valor en los dos experimentos.
 */
const identidadDelVisitante = cache(async (): Promise<string> => {
  const visitante = (await cookies()).get(COOKIE_VISITANTE)?.value;
  if (visitante) return visitante;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? "";
});

/**
 * Por dónde paga esta visita: "puente" (home → `/pagar` → OnePay) o
 * "directo" (home → OnePay). Mismo orden de mando que el precio:
 *
 *   1. `mc_ruta_forzada` (`?ruta=directo`), SOLO FUERA DE PRODUCCIÓN.
 *   2. Flagsmith, flag `ruta_pago`, por la misma identidad.
 *   3. "puente".
 *
 * Una vez por petición: el layout (analítica) y el home tienen que oír lo
 * mismo, o el evento diría una ruta y el botón haría la otra.
 */
export const rutaDePago = cache(async (): Promise<RutaPago> => {
  if (ENTORNO_DE_PRUEBA) {
    const forzada = (await cookies()).get(COOKIE_RUTA_FORZADA)?.value;
    if (esRutaPago(forzada)) return forzada;
  }
  return obtenerRutaPago(await identidadDelVisitante());
});
