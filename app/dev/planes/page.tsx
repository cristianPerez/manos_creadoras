import { Planes } from "@/components/app/sections/Planes";

/**
 * Banco de pruebas de la sección de planes.
 *
 * Existe para poder mirarla aislada mientras se construye, sin tener que
 * recorrer el home entero cada vez. Se borra cuando la sección esté montada.
 */
export default function DevPlanes() {
  return <Planes />;
}
