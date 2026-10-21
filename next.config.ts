import type { NextConfig } from "next";

/**
 * ¿Es el sitio de verdad? Solo producción se deja indexar (2026-10-18). Va al
 * revés de lo intuitivo a propósito: QA, una vista previa o un entorno sin
 * configurar quedan FUERA de Google. Si esto se equivoca, esconde algo que
 * debía verse —se nota y se arregla en minutos—, no publica el sitio de
 * pruebas, que tarda semanas en limpiarse.
 */
const esProduccion = process.env.VERCEL_ENV === "production";

const nextConfig: NextConfig = {
  /**
   * Fuera de producción, `noindex` en TODA respuesta.
   *
   * ⚠️ QA ESTUVO ABIERTA SIN ESTO desde el 2026-09-15, solo con `Disallow: /`
   * en robots.txt. Eso impide RASTREAR, pero no indexar: si alguien enlazó una
   * página de QA, Google pudo listar la URL sin contenido. Este encabezado es
   * el que la saca del índice (ver `app/robots.ts`, que por eso ahora deja
   * rastrear QA por un tiempo).
   */
  async headers() {
    return esProduccion
      ? []
      : [
          {
            source: "/:path*",
            headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
          },
        ];
  },

  /**
   * Las direcciones viejas siguen funcionando.
   *
   * ⚠️ ESTO NO ES COSMÉTICO. `/cursos` y `/login` están en correos ya enviados a
   * alumnas y en las páginas legales que firmamos. Cambiar la estructura sin
   * esto convierte cada uno de esos enlaces en un 404 — y quien se lo encuentra
   * no piensa "cambiaron las rutas", piensa que el programa ya no existe.
   *
   * `permanent: true` para que los buscadores trasladen lo que tuvieran
   * indexado en vez de mantener dos direcciones compitiendo.
   */
  async redirects() {
    return [
      { source: "/cursos", destination: "/app", permanent: true },
      // Las lecciones viejas apuntaban a un temario que ya no existe: no hay a
      // qué bolso mandarlas, así que van al catálogo, que es donde se elige.
      { source: "/cursos/:leccion", destination: "/app", permanent: true },
      { source: "/ojo-experto", destination: "/app/ojo", permanent: true },
      { source: "/cuenta", destination: "/app/cuenta", permanent: true },
      { source: "/login", destination: "/entrar", permanent: true },
      { source: "/terminos", destination: "/legal/terminos", permanent: true },
      { source: "/privacidad", destination: "/legal/privacidad", permanent: true },
      { source: "/reembolso", destination: "/legal/reembolso", permanent: true },
      { source: "/cancelar", destination: "/legal/cancelar", permanent: true },
    ];
  },

  // El badge flotante de Next tapaba el primer ícono de la barra inferior y ensuciaba
  // las capturas de verificación. Solo afecta a desarrollo; en producción no existe.
  devIndicators: false,
};

export default nextConfig;
