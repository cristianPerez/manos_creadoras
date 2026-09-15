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
 * ⚠️ `/cuenta` TAMBIÉN SALIÓ (2026-09-15). Ahora esa pantalla es la pestaña
 * "Entrar" para quien no tiene sesión: enseña el formulario de acceso dentro de
 * la app, con la barra de navegación visible. Rebotarla al login la sacaría de
 * la app justo al tocar una pestaña.
 *
 * No queda ninguna ruta privada, y no es un descuido: **ninguna pantalla decide
 * ya quién ve qué**. Eso lo decide el RLS de la base (migraciones 0009 y 0012),
 * que desde el navegador no se puede burlar. El middleware solo refresca la
 * sesión, que es lo que sigue haciendo abajo.
 */
const PRIVADAS: string[] = [];

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
