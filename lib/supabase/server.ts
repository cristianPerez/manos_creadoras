import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente para componentes de SERVIDOR y route handlers.
 * Lee la sesión de la alumna desde las cookies, así que las consultas viajan
 * con su identidad y el RLS de la base aplica: cada quien ve solo lo suyo.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Llamado desde un Server Component: el middleware ya refresca la sesión.
          }
        },
      },
    },
  );
}
