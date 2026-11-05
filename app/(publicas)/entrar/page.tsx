import { redirect } from "next/navigation";

/**
 * `/entrar` YA NO ES UNA PANTALLA (2026-11-05, pedido de Cristian).
 *
 * "Entrar" es ahora un modal —hoja desde abajo en el celular, centrado en
 * escritorio— que se abre encima de la página donde se esté (ver
 * `components/app/ModalEntrar.tsx`). Esta ruta se queda SOLO para que sigan
 * sirviendo los enlaces que ya existen: el "Pedir otro enlace" de
 * `/auth/completar`, correos viejos, favoritos y la redirección de `/login`.
 *
 * Manda a `/app` —el catálogo, que es a donde va una alumna que entra— con
 * `?entrar=1`, y el proveedor del modal lo abre al ver el parámetro (y lo
 * borra de la dirección). `desde=enlace_entrar` es el origen en la medición.
 */
export default function Entrar() {
  redirect("/app?entrar=1&desde=enlace_entrar");
}
