import type { Metadata } from "next";
import { HomeB } from "@/components/home-b/HomeB";
import { cargarDatosHome } from "@/lib/datos-home";

export const metadata: Metadata = {
  title: "Manos Creadoras — Crea bolsos, accesorios y adornos de lujo en cuentas",
  description:
    "Aprende desde cero con Elizabeth Valencia: bolsos, accesorios y adornos de perlas paso a paso, y pronto velas. 5 cápsulas y un bolso completo gratis, sin tarjeta.",
};

/**
 * La página de ventas: el home morado (paleta B v2).
 *
 * Entre el 2026-11-05 y el 2026-11-07 hubo dos homes y la flag `paleta_b` de
 * Flagsmith elegía cuál. Ganó el morado, se quedó al 100% y el home crema
 * (`HomeActual`) se borró. Lo que sí varía por visita ahora es el PRECIO
 * (experimento A/B/C, `lib/flags.ts`), y eso lo resuelve `enlacesDeCobro()`.
 */
export default async function Home() {
  const datos = await cargarDatosHome();
  return <HomeB datos={datos} />;
}
