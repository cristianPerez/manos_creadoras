import { notFound } from "next/navigation";

/**
 * Cualquier dirección de /app que no existe. Sin esta ruta, Next pintaba su
 * 404 por defecto —negro, en inglés y sin la navegación de la app—; así cae
 * en `not-found.tsx` de este segmento, dentro del marco de la app.
 */
export default function RutaQueNoExiste() {
  notFound();
}
