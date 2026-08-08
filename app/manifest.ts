import type { MetadataRoute } from "next";
import { COLOR_FONDO_SISTEMA } from "@/lib/marca";

/**
 * Manifiesto de la app instalable.
 *
 * Es lo que convierte la web en "app": permite que la alumna la agregue a la
 * pantalla de inicio y la abra sin barra del navegador. En iPhone además es
 * REQUISITO para poder recibir notificaciones (ver components/app/ActivarAvisos).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Manos Creadoras — Bolsos de lujo en cuentas",
    short_name: "Manos Creadoras",
    description:
      "Tus cursos de tejido y el Ojo Experto, el asistente que revisa fotos de tu bolso y te dice qué ajustar.",
    // Abre directo en sus cursos: quien instala la app ya compró.
    start_url: "/cursos",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // Mismos valores que FICHA-ARTE: la barra del sistema no debe romper la estética.
    background_color: COLOR_FONDO_SISTEMA,
    theme_color: COLOR_FONDO_SISTEMA,
    lang: "es",
    dir: "ltr",
    categories: ["education", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Android recorta el icono a la forma del sistema; este trae margen de sobra.
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
