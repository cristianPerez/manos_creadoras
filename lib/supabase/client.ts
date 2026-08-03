import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente para el NAVEGADOR. Usa la clave publishable, que es pública por diseño:
 * lo que protege los datos es el RLS de la base, no el secreto de esta clave.
 */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
