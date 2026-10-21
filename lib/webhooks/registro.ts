import { onepay } from "@/lib/webhooks/onepay";
import type { Proveedor } from "@/lib/webhooks/tipos";

/**
 * Las pasarelas que sabemos atender.
 *
 * Para añadir otra: un archivo que cumpla `Proveedor` y una línea aquí. Ni la
 * ruta ni la base cambian.
 */
const PROVEEDORES: Record<string, Proveedor> = {
  [onepay.nombre]: onepay,
};

export function proveedorPorNombre(nombre: string): Proveedor | null {
  return PROVEEDORES[nombre.toLowerCase()] ?? null;
}

export const nombresDeProveedores = Object.keys(PROVEEDORES);
