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
/**
 * A dónde se le manda después de entrar. SOLO rutas de esta casa.
 *
 * ⚠️ ESTO TAPA UN AGUJERO REAL (2026-09-15). Antes el valor se leía del enlace y
 * se pegaba tal cual detrás del origen. Con `?next=//otro-sitio.co`, el navegador
 * lee `https://manoscreadoras.co//otro-sitio.co` como una dirección de OTRA casa
 * — y la alumna llegaba allí con la sesión recién creada, que es el peor momento
 * posible para mandarla a una página que no controlamos.
 *
 * Es entrada de fuera aunque el enlace lo escribamos nosotros: viaja por correo,
 * y cualquiera puede mandar un correo con un enlace a nuestro propio callback.
 *
 * Las dos condiciones hacen falta: empezar por `/` descarta `https://otro.co`, y
 * descartar `//` cierra la forma de arriba, que sí empieza por `/`.
 */
function destinoSeguro(valor: string | null): string {
  if (valor === null || !valor.startsWith("/") || valor.startsWith("//")) {
    return "/cursos";
  }
  return valor;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = destinoSeguro(searchParams.get("next"));

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
