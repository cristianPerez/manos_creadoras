import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Aquí aterriza la alumna al hacer clic en el enlace de su correo.
 *
 * Hay DOS formas de enlace y hay que entender ambas:
 *  - `?code=…`        el flujo normal (PKCE), cuando ella misma pidió el enlace desde el navegador.
 *  - `?token_hash=…`  enlaces generados del lado del servidor (el script de alumna de prueba,
 *                     y también los correos que enviemos nosotros más adelante con plantilla propia).
 * Soportar solo el primero dejaba los enlaces de prueba sin funcionar.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/cursos";

  const supabase = await supabaseServer();

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  let fallo: string | null = null;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    fallo = error?.message ?? null;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    fallo = error?.message ?? null;
  } else {
    return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
  }

  if (fallo) {
    // Enlace vencido o ya usado — son de un solo uso.
    return NextResponse.redirect(`${origin}/login?error=enlace_vencido`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
