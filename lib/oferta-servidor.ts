import { cookies } from "next/headers";
import { COOKIE_OFERTA, calcularOferta, type EstadoOferta } from "@/lib/oferta";

/**
 * El estado de la oferta para quien está pidiendo esta página.
 *
 * ⚠️ SEPARADO DE `lib/oferta.ts` PORQUE AQUÍ ENTRA `next/headers`, y ese
 * módulo no existe en el Edge — donde corre el middleware, que también
 * necesita la constante de la cookie. Juntarlos reventaría el middleware con
 * un error que no se entiende leyendo el código.
 *
 * Mismo reparto que `bolsos.ts` / `bolsos-logica.ts`.
 */
export async function estadoDeLaOferta(): Promise<EstadoOferta> {
  const bote = await cookies();
  return calcularOferta(bote.get(COOKIE_OFERTA)?.value);
}
