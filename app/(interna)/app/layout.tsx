import type { ReactNode } from "react";
import { BarraInferior } from "@/components/app/NavegacionApp";

/**
 * El marco de toda la app interna.
 *
 * ⚠️ AQUÍ NO VA LA BARRA LATERAL, Y ES DELIBERADO. Tres de las pantallas no la
 * llevan: la ficha del bolso y la lección usan una barra superior de "volver"
 * —porque ahí estás DENTRO de algo y lo que necesitas es salir, no saltar a
 * otra sección— y el Ojo Experto tiene la suya propia con el historial.
 *
 * Si la pusiera aquí, esas tres tendrían que taparla o deshacerla. Así que el
 * layout solo aporta lo que TODAS comparten: el alto completo y la barra de
 * abajo en móvil. La lateral la pone cada pantalla que la quiere, con
 * `<ConBarraLateral>`.
 */
export default function LayoutApp({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/*
        `pb-24` en móvil: la barra de abajo va fija, así que no empuja nada.
        Sin este hueco, la última tarjeta de cada pantalla queda debajo de ella
        y nadie puede pulsarla.
      */}
      <div className="flex flex-1 pb-24 lg:pb-0">{children}</div>
      <BarraInferior />
    </div>
  );
}
