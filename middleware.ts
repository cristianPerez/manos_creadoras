import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_PRECIO_FORZADO,
  COOKIE_VISITANTE,
  DIAS_FORZADA,
  DIAS_VISITANTE,
  esVariantePrecio,
} from "@/lib/experimento";
import { COOKIE_PAIS_PRUEBA, ENTORNO_DE_PRUEBA } from "@/lib/pais-prueba";

const DIA = 24 * 60 * 60;

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
  /*
   * ── EL EXPERIMENTO DE PRECIO (2026-11-07) ────────────────────────────────
   *
   * Aquí solo se preparan las cookies; qué precio ve cada quien lo decide
   * Flagsmith en `lib/experimento-servidor.ts`, que corre después.
   *
   * ⚠️ LAS COOKIES SE ESCRIBEN TAMBIÉN EN `request.cookies`, NO SOLO EN LA
   * RESPUESTA. Es lo que hace que el servidor las vea YA en esta misma visita.
   * Si solo fueran a la respuesta, la primera carga de cada visitante nueva
   * —la que decide si compra— se resolvería sin identidad y caería al
   * control, y los números saldrían sesgados hacia la A.
   *
   * `?precio=b` (fijar a mano) y `?precio=auto` (devolver el mando al panel)
   * SOLO FUERA DE PRODUCCIÓN, como `?pais=`: en producción nadie puede
   * elegirse el precio más barato tocando la dirección.
   */
  const precioPedido = ENTORNO_DE_PRUEBA ? request.nextUrl.searchParams.get("precio")?.toLowerCase() : undefined;
  const borrarForzada = precioPedido === "auto";
  const fijarForzada = esVariantePrecio(precioPedido) ? precioPedido : null;

  if (fijarForzada) request.cookies.set(COOKIE_PRECIO_FORZADO, fijarForzada);
  if (borrarForzada) request.cookies.delete(COOKIE_PRECIO_FORZADO);

  /*
   * `?pais=MX` — FINGIR UN PAÍS, SOLO FUERA DE PRODUCCIÓN (2026-11-06). Para
   * probar precios y enlaces de Colombia y México sin viajar. En producción
   * se ignora: ahí el país lo da siempre la conexión (`lib/pais.ts`), y nadie
   * puede pedir el precio de otro país tocando la dirección.
   * `?pais=auto` lo quita.
   */
  const paisPedido = ENTORNO_DE_PRUEBA ? request.nextUrl.searchParams.get("pais")?.toUpperCase() : undefined;
  const fijarPais = paisPedido && /^[A-Z]{2}$/.test(paisPedido) ? paisPedido : null;
  const borrarPais = paisPedido === "AUTO";
  if (fijarPais) request.cookies.set(COOKIE_PAIS_PRUEBA, fijarPais);
  if (borrarPais) request.cookies.delete(COOKIE_PAIS_PRUEBA);

  /*
   * La identidad del visitante anónimo. `crypto.randomUUID` existe en el
   * runtime Edge sin importar nada.
   */
  const visitante = request.cookies.get(COOKIE_VISITANTE)?.value;
  const nuevoVisitante = visitante ? null : crypto.randomUUID();
  if (nuevoVisitante) request.cookies.set(COOKIE_VISITANTE, nuevoVisitante);

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

  /*
   * Las cookies del experimento viajan en TODAS las respuestas que salen de
   * aquí, también las redirecciones. Si solo fueran en la normal, quien entra
   * por un enlace que redirige saldría sin `mc_vid` y volvería a generar uno en
   * la siguiente página: la misma persona repartida en las dos ramas.
   *
   * `httpOnly` en `mc_vid` porque no hay ninguna razón para que el navegador lo
   * lea; la forzada sí se deja visible, que es parte de poder comprobar desde
   * la consola qué precio se está viendo al revisar QA.
   */
  const conCookies = <T extends NextResponse>(r: T): T => {
    if (nuevoVisitante) {
      r.cookies.set(COOKIE_VISITANTE, nuevoVisitante, {
        path: "/",
        maxAge: DIAS_VISITANTE * DIA,
        sameSite: "lax",
        httpOnly: true,
      });
    }
    if (fijarForzada) {
      r.cookies.set(COOKIE_PRECIO_FORZADO, fijarForzada, {
        path: "/",
        maxAge: DIAS_FORZADA * DIA,
        sameSite: "lax",
        httpOnly: false,
      });
    }
    if (borrarForzada) r.cookies.delete(COOKIE_PRECIO_FORZADO);
    if (fijarPais) r.cookies.set(COOKIE_PAIS_PRUEBA, fijarPais, { path: "/", sameSite: "lax", httpOnly: true });
    if (borrarPais) r.cookies.delete(COOKIE_PAIS_PRUEBA);
    return r;
  };

  const path = request.nextUrl.pathname;
  const esPrivada = PRIVADAS.some((p) => path === p || path.startsWith(`${p}/`));

  if (esPrivada && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    // Para devolverla a donde quería ir después de entrar.
    login.searchParams.set("next", path);
    return conCookies(NextResponse.redirect(login));
  }

  // Ya tiene sesión y va al login: mándala directo a sus cursos.
  if (path === "/login" && user) {
    const cursos = request.nextUrl.clone();
    cursos.pathname = "/cursos";
    cursos.search = "";
    return conCookies(NextResponse.redirect(cursos));
  }

  return conCookies(response);
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
