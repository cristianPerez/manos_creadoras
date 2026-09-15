import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Pantallas que exigen haber iniciado sesión.
 *
 * ⚠️ `/cursos` y `/ojo-experto` SALIERON de esta lista (2026-09-15). Antes la
 * app entera estaba detrás del login, así que quien no había comprado no podía
 * ver absolutamente nada — ni siquiera los tres tutoriales que se le regalan
 * justamente para que se anime a comprar. El producto era su propio argumento de
 * venta y estaba bajo llave.
 *
 * Que la puerta se abra NO significa que se entregue el contenido: lo que cada
 * visitante recibe lo sigue decidiendo el RLS de la base (migración 0009), que
 * desde el navegador no se puede burlar. Aquí solo se deja pasar al vestíbulo.
 *
 * `/cuenta` se queda: es la pantalla de "tu membresía, tu correo, tus avisos".
 * Sin cuenta no hay nada que enseñar ahí, y mandar al login es la respuesta
 * correcta y no un muro.
 */
const PRIVADAS = ["/cuenta"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refresca el token si venció. Va SIEMPRE, no solo en rutas privadas.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const esPrivada = PRIVADAS.some((p) => path === p || path.startsWith(`${p}/`));

  if (esPrivada && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    // Para devolverla a donde quería ir después de entrar.
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  // Ya tiene sesión y va al login: mándala directo a sus cursos.
  if (path === "/login" && user) {
    const cursos = request.nextUrl.clone();
    cursos.pathname = "/cursos";
    cursos.search = "";
    return NextResponse.redirect(cursos);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Todo menos archivos estáticos e imágenes — no tiene sentido gastar
     * una consulta de sesión por cada icono.
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
