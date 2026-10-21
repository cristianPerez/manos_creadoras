import type { ReactNode } from "react";
import { BarraLateral } from "@/components/app/NavegacionApp";

/**
 * El marco con barra lateral: lo comparten TODAS las pantallas de la app menos
 * el Ojo Experto, que tiene la suya propia con el historial.
 *
 * ⚠️ ANTES CADA PANTALLA DECIDÍA SI LA PONÍA, y la ficha y la lección no lo
 * hacían: la idea era que ahí "estás dentro de algo" y solo necesitas salir.
 * En la práctica se sentía como salirse de la app — abrías un bolso y de
 * repente no había menú. Cristian lo dijo claro: en escritorio la barra debe
 * estar siempre.
 *
 * Ponerla en el layout y no en cada página es lo que garantiza que no vuelva a
 * faltar en una pantalla nueva: se hereda, no se recuerda.
 */
export default function LayoutConBarra({ children }: { children: ReactNode }) {
  return (
    <>
      <BarraLateral />
      {children}
    </>
  );
}
