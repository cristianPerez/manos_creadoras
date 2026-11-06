"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Las escrituras de la app: el avance de los videos y la lista de la compra.
 *
 * ⚠️ POR QUÉ NO SE COMPRUEBA AQUÍ QUIÉN ES. Las dos escriben con el cliente que
 * lleva la sesión de la alumna, así que el RLS de la base aplica: una fila con
 * el `user_id` de otra persona la rechaza Postgres, no este código. Añadir aquí
 * un `if (user.id !== …)` sería una segunda copia de la regla, y el día que las
 * dos discrepen gana la que está mal.
 */

/**
 * ⚠️ LOS FALLOS SE DICEN EN VOZ ALTA (2026-11-06).
 *
 * Esto nació de una auditoría de la base: `progreso` estaba VACÍA en producción
 * y no había forma de distinguir "nadie ha visto un video" de "las escrituras
 * están fallando". La causa de esa ceguera era que estas funciones ignoraban el
 * error que devuelve Supabase — y además faltaba el permiso de ACTUALIZAR en la
 * tabla (migración 0047), así que un `upsert` sobre una fila existente se
 * rechazaba en silencio.
 *
 * El marcado es AUTOMÁTICO (al 80% del video): si falla, nadie va a reportarlo.
 * Un registro en el servidor es lo único que lo deja ver en Vercel.
 *
 * No se le enseña nada a la alumna: el avance es un apunte, no la tarea que
 * vino a hacer. Interrumpirle el video con "no se pudo guardar" sería peor que
 * perder el apunte.
 */
function avisarDelFallo(que: string, error: { message: string; code?: string } | null): void {
  if (!error) return;
  console.error(`[avance] ${que} falló: ${error.message}${error.code ? ` (${error.code})` : ""}`);
}

/**
 * Marca (o desmarca) un video como terminado.
 *
 * Desde la migración 0047 "terminado" es `visto_at` con fecha, no "existe la
 * fila": la fila puede existir solo porque lo empezó. Por eso se escribe la
 * fecha a mano —la columna ya no tiene valor por defecto— y al desmarcar NO se
 * borra la fila, se le quita la fecha: el minuto por donde iba se conserva.
 */
export async function marcarVideo(bolsoId: string, videoId: string, visto: boolean) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  /*
   * `upsert` y no `insert`: marcar dos veces el mismo video —doble clic, o la
   * pestaña abierta en dos sitios— no puede reventar con un error de clave
   * duplicada. El resultado de marcar algo ya marcado es que sigue marcado.
   */
  const { error } = await supabase.from("progreso").upsert({
    user_id: user.id,
    bolso_id: bolsoId,
    video_id: videoId,
    visto_at: visto ? new Date().toISOString() : null,
    actualizado_el: new Date().toISOString(),
  });
  avisarDelFallo(visto ? "marcar visto" : "desmarcar", error);

  // La ficha y el catálogo enseñan avance: los dos tienen que enterarse.
  revalidatePath("/app", "layout");
}

/**
 * Apunta por dónde va en un video, para poder devolverla ahí.
 *
 * ⚠️ NO LLAMA A `revalidatePath`, y es a propósito. Esto entra cada ~15 s
 * mientras el video corre; invalidar la ruta en cada apunte haría que la app se
 * recompusiera por debajo a mitad de video. El segundo se lee en la SIGUIENTE
 * visita, que es para lo que sirve.
 *
 * Tampoco toca `visto_at`: de eso se encarga `marcarVideo`. Si ya lo había
 * terminado, sigue terminado aunque lo esté repasando.
 */
export async function guardarSegundo(bolsoId: string, videoId: string, segundo: number) {
  /* Un segundo negativo o sin forma de número no se escribe: la base lo
     rechazaría por el `check`, y es mejor no gastar el viaje. */
  if (!Number.isFinite(segundo) || segundo < 0) return;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("progreso").upsert({
    user_id: user.id,
    bolso_id: bolsoId,
    video_id: videoId,
    segundo: Math.floor(segundo),
    actualizado_el: new Date().toISOString(),
  });
  avisarDelFallo("guardar el minuto", error);
}

/**
 * Guarda cómo se llama y qué debe recordar el Ojo Experto de su tejido.
 *
 * ⚠️ POR QUÉ ESTO NO EXISTÍA Y HACÍA FALTA (2026-11-06). La auditoría de la
 * base encontró `profiles.nombre` y `profiles.notas_tejido` al 100% NULAS en
 * producción — no porque nadie quisiera llenarlas, sino porque NO HABÍA DÓNDE:
 * ninguna pantalla las escribía. Y las dos se LEEN: `/app` saluda con el
 * nombre (y acababa diciendo "Hola de nuevo" a todo el mundo) y el Ojo Experto
 * las mete en su contexto para personalizar la respuesta, así que respondía
 * sin saber ni cómo se llama ni qué le cuesta.
 *
 * Los límites (60 y 300) son los que lee el Ojo: `app/api/ojo-experto` recorta
 * las notas a 300 caracteres, así que aceptar más sería aceptar texto que
 * nunca llega a ninguna parte.
 */
export async function guardarPerfil(
  _previo: { ok: boolean; mensaje: string } | null,
  formulario: FormData,
): Promise<{ ok: boolean; mensaje: string }> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, mensaje: "Hay que entrar otra vez para guardar esto." };

  const texto = (clave: string, tope: number): string | null => {
    const valor = String(formulario.get(clave) ?? "").trim();
    return valor === "" ? null : valor.slice(0, tope);
  };

  const { error } = await supabase
    .from("profiles")
    .update({ nombre: texto("nombre", 60), notas_tejido: texto("notas_tejido", 300) })
    .eq("id", user.id);

  if (error) {
    avisarDelFallo("guardar el perfil", error);
    return { ok: false, mensaje: "No se pudo guardar. Inténtalo otra vez en un momento." };
  }

  /* El saludo de `/app` y la cabecera salen del perfil: toda la app interna
     tiene que enterarse, no solo esta pantalla. */
  revalidatePath("/app", "layout");
  return { ok: true, mensaje: "Guardado." };
}

/** Marca (o desmarca) un material de la lista de la compra. */
export async function marcarMaterial(materialId: string, tengo: boolean) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("checklist_materiales")
    .upsert({ user_id: user.id, material_id: materialId, tengo });
  avisarDelFallo("marcar material", error);

  revalidatePath("/app", "layout");
}
