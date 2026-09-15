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
  /**
   * DOS topes diarios, uno por público (migración 0011).
   *
   * Con un solo tope, el día que se agotara se agotaba para TODAS — incluida la
   * alumna que paga. Alguien con acceso de regalo podía dejar mudo el Ojo
   * Experto de quien puso el dinero.
   *
   * Viven en el entorno y no en la base porque son una decisión de negocio: se
   * suben o se bajan sin desplegar nada.
   *
   * ⚠️ `AI_DAILY_BUDGET_USD` (el nombre viejo, uno solo) sigue aceptándose como
   * valor por defecto de los dos. Así un despliegue que todavía no tenga las
   * variables nuevas no se queda sin presupuesto ninguno — que sería apagar el
   * Ojo Experto entero por una variable que falta.
   */
  AI_DAILY_BUDGET_USD: z.coerce.number().positive().default(5),
  AI_DAILY_BUDGET_REGALO_USD: z.coerce.number().positive().optional(),
  AI_DAILY_BUDGET_MIEMBRO_USD: z.coerce.number().positive().optional(),
});

const hotmartSchema = baseSchema.extend({
  HOTMART_HOTTOK: z.string().min(1),
});

const pushSchema = baseSchema.extend({
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().min(1),
  VAPID_SUBJECT: z.string().min(1),
  // Quien tenga esto puede mandarle una notificación a TODAS las alumnas.
  // Se exige larga a propósito: es la única puerta del envío.
  PUSH_ADMIN_SECRET: z.string().min(24),
});

export type BaseEnv = z.infer<typeof baseSchema>;
export type AiEnv = z.infer<typeof aiSchema>;
export type HotmartEnv = z.infer<typeof hotmartSchema>;
export type PushEnv = z.infer<typeof pushSchema>;

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

/** Lo que necesitan los avisos push. Si falta, solo se caen los avisos. */
export function pushEnv(): PushEnv {
  return leer("push", pushSchema);
}
