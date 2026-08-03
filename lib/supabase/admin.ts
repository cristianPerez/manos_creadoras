import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

/**
 * Cliente con la SECRET key: SALTA RLS. Solo para código de servidor (webhooks, jobs).
 * JAMÁS importar esto desde un componente de cliente.
 */
export function supabaseAdmin() {
  const env = serverEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
