import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El badge flotante de Next tapaba el primer ícono de la barra inferior y ensuciaba
  // las capturas de verificación. Solo afecta a desarrollo; en producción no existe.
  devIndicators: false,
};

export default nextConfig;
