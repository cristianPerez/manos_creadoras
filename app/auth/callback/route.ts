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
  let usuario: { created_at?: string } | null = null;

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    fallo = error?.message ?? null;
    usuario = data.user;
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    fallo = error?.message ?? null;
    usuario = data.user;
  } else {
    return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
  }

  if (fallo) {
    // Enlace vencido o ya usado — son de un solo uso.
    return NextResponse.redirect(`${origin}/login?error=enlace_vencido`);
  }

  return NextResponse.redirect(`${origin}${conEntrada(next, usuario)}`);
}

/**
 * Marca en la URL si esta entrada ESTRENA cuenta o es alguien que vuelve.
 *
 * ⚠️ ESTE ES EL ÚNICO MOMENTO EN QUE SE PUEDE SABER, y es a propósito.
 * Preguntarle al servidor "¿existe este correo?" mientras alguien lo escribe en
 * el login es justo lo que permite enumerar a las alumnas de un sitio, y
 * Supabase se niega a contestarlo. Aquí ya abrió el enlace que le llegó a su
 * buzón: la cuenta es demostrablemente suya y decirlo no le abre la puerta a
 * nadie.
 *
 * CÓMO SE DISTINGUE. `created_at` es cuando se pidió el enlace por primera vez.
 * En una cuenta recién nacida eso fue hace segundos; en alguien que vuelve, hace
 * días o semanas. El enlace caduca en una hora, así que no hay zona gris: para
 * caer del lado equivocado habría que haberse dado de alta hace menos de una
 * hora, que es precisamente ser nueva.
 *
 * El evento lo manda el navegador (`RegistrarEntrada`), porque Mixpanel vive
 * ahí. Aquí solo se deja escrita la respuesta.
 */
function conEntrada(next: string, usuario: { created_at?: string } | null): string {
  if (!usuario?.created_at) return next;

  const nacio = new Date(usuario.created_at).getTime();
  const esNueva = Number.isFinite(nacio) && Date.now() - nacio < 60 * 60 * 1000;

  // Base de mentira: solo se usa para manipular la ruta, nunca se navega a ella.
  const url = new URL(next, "https://x.invalid");
  url.searchParams.set("entrada", esNueva ? "nueva" : "vuelve");
  return `${url.pathname}${url.search}`;
}
