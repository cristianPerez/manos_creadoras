import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase SIN SESIÓN, para leer lo que es IGUAL PARA TODO EL MUNDO
 * (catálogo, materiales, directorio, cápsulas, precios) y guardarlo en la
 * caché de datos de Next (2026-11-05).
 *
 * ⚠️ POR QUÉ NO `supabaseServer()`. Aquel lee las cookies de la visita, y una
 * función que lee cookies no se puede cachear: su respuesta podría depender de
 * quién mira. Para datos públicos eso sobra —RLS las deja leer a `anon` y
 * `authenticated` por igual (migración 0013)— y obligaba a ir a la base en
 * CADA visita, también la de alguien sin cuenta.
 *
 * Usa la clave PÚBLICA, no la de servicio: lo cacheado es exactamente lo que
 * cualquiera podría leer, y nada más. Si mañana una tabla deja de ser pública,
 * esta lectura lo respeta (RLS sigue mandando).
 *
 * `server-only`: se usa dentro de `unstable_cache`, en el servidor.
 */
export function supabasePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
