"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Las escrituras de la app: marcar un video como visto y marcar un material.
 *
 * ⚠️ POR QUÉ NO SE COMPRUEBA AQUÍ QUIÉN ES. Las dos escriben con el cliente que
 * lleva la sesión de la alumna, así que el RLS de la base aplica: una fila con
 * el `user_id` de otra persona la rechaza Postgres, no este código. Añadir aquí
 * un `if (user.id !== …)` sería una segunda copia de la regla, y el día que las
 * dos discrepen gana la que está mal.
 */

/** Marca (o desmarca) un video como visto. */
export async function marcarVideo(bolsoId: string, videoId: string, visto: boolean) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (visto) {
    /*
     * `upsert` y no `insert`: marcar dos veces el mismo video —doble clic, o la
     * pestaña abierta en dos sitios— no puede reventar con un error de clave
     * duplicada. El resultado de marcar algo ya marcado es que sigue marcado.
     */
    await supabase
      .from("progreso")
      .upsert({ user_id: user.id, bolso_id: bolsoId, video_id: videoId });
  } else {
    await supabase.from("progreso").delete().eq("user_id", user.id).eq("video_id", videoId);
  }

  // La ficha y el catálogo enseñan avance: los dos tienen que enterarse.
  revalidatePath("/app", "layout");
}

/** Marca (o desmarca) un material de la lista de la compra. */
export async function marcarMaterial(materialId: string, tengo: boolean) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("checklist_materiales")
    .upsert({ user_id: user.id, material_id: materialId, tengo });

  revalidatePath("/app", "layout");
}
