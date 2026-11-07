import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { COOKIE_PRECIO_FORZADO, COOKIE_VISITANTE, esVariantePrecio, type VariantePrecio } from "@/lib/experimento";
import { obtenerVariantePrecio } from "@/lib/flags";
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

  /*
   * ⚠️ LA IDENTIDAD ES EL `mc_vid` (LA COOKIE DEL NAVEGADOR), Y SOLO SI NO
   * EXISTE, LA CUENTA. Si fuera al revés, la persona que se sortea sin sesión
   * y luego crea la cuenta podría saltar de precio a mitad del embudo
   * (aprendido en el A/B de paleta, 2026-11-05). El `mc_vid` lo pone el
   * middleware en la primera petición y dura un año. Aceptado: en otro
   * dispositivo puede tocarle otro precio.
   */
  const visitante = bote.get(COOKIE_VISITANTE)?.value;
  if (visitante) return obtenerVariantePrecio(visitante);

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return obtenerVariantePrecio(user?.id ?? "");
});
