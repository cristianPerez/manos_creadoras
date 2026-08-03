"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export type Resultado = { ok: boolean; error?: string };

/**
 * Marca (o desmarca) una lección como vista.
 *
 * Corre en el SERVIDOR con la sesión de la alumna: el RLS de `user_progress` solo
 * deja escribir filas con su propio `user_id`, así que nadie puede tocar el avance
 * de otra aunque manipule la petición.
 */
export async function marcarLeccion(leccionId: string, completada: boolean): Promise<Resultado> {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión se cerró. Vuelve a entrar para guardar." };

  if (completada) {
    const { error } = await supabase
      .from("user_progress")
      .insert({ user_id: user.id, leccion_id: leccionId });

    // 23505 = ya estaba marcada (doble tap). No es un fallo para la alumna.
    if (error && error.code !== "23505") {
      return { ok: false, error: "No pudimos guardar tu avance. Vuelve a intentar." };
    }
  } else {
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("leccion_id", leccionId);

    if (error) return { ok: false, error: "No pudimos guardar tu avance. Vuelve a intentar." };
  }

  revalidatePath("/cursos");
  revalidatePath(`/cursos/${leccionId}`);
  revalidatePath("/cuenta");
  return { ok: true };
}
