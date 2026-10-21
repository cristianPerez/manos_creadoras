import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Quién mira la pantalla y qué plan tiene.
 *
 * Sustituye a la parte de `lib/curso.ts` que leía `profiles.status` y
 * `profiles.plan`. Desde la migración 0014 eso lo decide `membresias`, y quien
 * responde "¿puede ver los videos?" es la función `tiene_acceso()` de la base —
 * no una copia de la regla escrita aquí.
 *
 * ⚠️ POR QUÉ SE LE PREGUNTA A LA BASE Y NO SE CALCULA AQUÍ. La regla tiene
 * matices (una membresía cancelada sigue dando acceso hasta `vence_el`), y una
 * segunda copia de esa lógica en TypeScript es una copia que un día discrepa.
 * La base es la única que decide; esto solo la consulta.
 */

/*
 * ⚠️ ESTE TIPO MENTÍA DESDE EL 2026-10-13. Decía
 * `"aprendiz" | "creadora" | "maestra"` cuando la migración 0016 dejó solo dos
 * planes. Como el valor llega de la base con un `as Plan`, TypeScript no podía
 * avisar: el tipo describía unos nombres y la base devolvía otros.
 *
 * Es la misma familia de fallos que las migraciones 0023 y 0024 — renombrar los
 * planes dejó cabos sueltos en varios sitios a la vez.
 */
export type Plan = "gratis" | "completo";

export type Alumna = {
  id: string;
  email: string;
  nombre: string | null;
  plan: Plan;
  ciclo: "mensual" | "anual" | null;
  estado: "activa" | "vencida" | "cancelada";
  venceEl: string | null;
  /** Lo que de verdad abre la puerta al catálogo completo. */
  tieneAcceso: boolean;
  miembroDesde: string | null;
};

/** `null` cuando nadie ha iniciado sesión. */
export const alumnaActual = cache(async (): Promise<Alumna | null> => {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: perfil }, { data: membresia }, { data: tieneAcceso }] = await Promise.all([
    supabase.from("profiles").select("email, nombre").eq("id", user.id).maybeSingle(),
    supabase
      .from("membresias")
      .select("plan, ciclo, estado, vence_el, creada_el")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.rpc("tiene_acceso"),
  ]);

  return {
    id: user.id,
    email: perfil?.email ?? user.email ?? "",
    nombre: perfil?.nombre ?? null,
    // Sin fila de membresía el suelo es Aprendiz, igual que en la base. Pasa
    // solo en cuentas creadas antes de la 0014; no es un error que mostrar.
    plan: (membresia?.plan as Plan) ?? "gratis",
    ciclo: membresia?.ciclo ?? null,
    estado: membresia?.estado ?? "activa",
    venceEl: membresia?.vence_el ?? null,
    tieneAcceso: tieneAcceso === true,
    miembroDesde: membresia?.creada_el ?? null,
  };
});

/**
 * El nombre con el que se la saluda.
 *
 * Si no lo dio, se usa lo que va antes de la arroba de su correo. Es mejor que
 * un "Hola, creadora" genérico —que delata que no sabemos quién eres— y mejor
 * que dejar el hueco vacío.
 */
export function nombreCorto(alumna: Alumna | null): string {
  if (!alumna) return "";
  if (alumna.nombre) return alumna.nombre.split(" ")[0];
  return alumna.email.split("@")[0];
}

/** Cuántas preguntas y fotos le quedan este mes al Ojo Experto. */
export type Cupo = {
  plan: Plan;
  preguntasUsadas: number;
  fotosUsadas: number;
  preguntasLimite: number;
  fotosLimite: number;
};

export const cupoActual = cache(async (alumnaId: string | null): Promise<Cupo | null> => {
  if (!alumnaId) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("estado_cupo", { p_user_id: alumnaId });
  const fila = Array.isArray(data) ? data[0] : data;
  if (!fila) return null;
  return {
    plan: fila.plan,
    preguntasUsadas: fila.preguntas_usadas,
    fotosUsadas: fila.fotos_usadas,
    preguntasLimite: fila.preguntas_limite,
    fotosLimite: fila.fotos_limite,
  };
});
