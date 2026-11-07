import type { Metadata } from "next";
import { HomeActual } from "@/components/home/HomeActual";
import { HomeB } from "@/components/home-b/HomeB";
import { cargarDatosHome } from "@/lib/datos-home";
import { paletaDeLaVisita } from "@/lib/paleta-servidor";

export const metadata: Metadata = {
  title: "Manos Creadoras — Crea bolsos, accesorios y adornos de lujo en cuentas",
  description:
    "Aprende desde cero con Elizabeth Valencia: bolsos, accesorios y adornos de perlas paso a paso, y pronto velas. 5 cápsulas y un bolso completo gratis, sin tarjeta.",
};

/**
 * La página de ventas.
 *
 * ⚠️ DESDE EL 2026-11-05 SON DOS, Y ESTA PÁGINA SOLO ELIGE CUÁL. La flag
 * `paleta_b` de Flagsmith decide si se ve el home de siempre (`HomeActual`) o
 * el de la paleta B (`HomeB`). Los datos se cargan UNA vez, aquí, y se le pasan
 * al que toque: las dos versiones enseñan exactamente el mismo contenido y
 * solo se diferencian en el diseño. Ver `lib/flags.ts` y `lib/datos-home.ts`.
 *
 * Con la flag apagada, o si Flagsmith no contesta, sale `HomeActual`: el sitio
 * que ya está aprobado y vendiendo.
 */
export default async function Home() {
  const [datos, paleta] = await Promise.all([cargarDatosHome(), paletaDeLaVisita()]);

  return paleta === "b" ? <HomeB datos={datos} /> : <HomeActual datos={datos} />;
}
