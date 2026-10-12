import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
