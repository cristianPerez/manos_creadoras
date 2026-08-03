import { z } from "zod";

/**
 * Fail-closed: si falta un secreto REQUERIDO, la parte que lo necesita crashea en vez
 * de correr con un valor de juguete (09-SEGURIDAD). Nunca defaults inseguros.
 *
 * ⚠️ Se valida POR USO, no todo de golpe. Antes una sola función exigía las claves de
 * Supabase + Hotmart + IA juntas: con el hottok de Hotmart todavía vacío (el webhook se
 * crea al final), El Ojo Experto devolvía error 500 aunque su propia clave estuviera
 * perfecta. Cada parte pide solo lo suyo.
 */

const baseSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
});

const aiSchema = baseSchema.extend({
  GEMINI_API_KEY: z.string().min(1),
  AI_MODEL: z.string().default("gemini-3.6-flash"),
  AI_DAILY_BUDGET_USD: z.coerce.number().positive().default(5),
});

const hotmartSchema = baseSchema.extend({
  HOTMART_HOTTOK: z.string().min(1),
});

export type BaseEnv = z.infer<typeof baseSchema>;
export type AiEnv = z.infer<typeof aiSchema>;
export type HotmartEnv = z.infer<typeof hotmartSchema>;

const cache = new Map<string, unknown>();

function leer<T>(nombre: string, schema: z.ZodType<T>): T {
  const guardado = cache.get(nombre);
  if (guardado) return guardado as T;

  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const faltan = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(
      `Faltan variables de entorno del servidor: ${faltan}. Revisa tu archivo .env.local (ver .env.example).`,
    );
  }
  cache.set(nombre, parsed.data);
  return parsed.data;
}

/** Solo lo indispensable para hablar con la base como servidor. */
export function serverEnv(): BaseEnv {
  return leer("base", baseSchema);
}

/** Lo que necesita El Ojo Experto. No exige nada de Hotmart. */
export function aiEnv(): AiEnv {
  return leer("ai", aiSchema);
}

/** Lo que necesita el webhook de Hotmart. No exige nada de la IA. */
export function hotmartEnv(): HotmartEnv {
  return leer("hotmart", hotmartSchema);
}
