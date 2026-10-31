import type { ReactNode } from "react";
import { BarraInferior, CabeceraApp } from "@/components/app/NavegacionApp";
import { ProveedorSesion } from "@/components/app/SesionContexto";
import { alumnaActual, iniciales } from "@/lib/alumna";

/**
 * El marco de toda la app interna.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ UNA SOLA NAVEGACIÓN (2026-10-23, `design-ref/app-interna-claude-code`)
 * ════════════════════════════════════════════════════════════════════════════
 * Hasta hoy había dos: la barra lateral arena de casi todas las páginas y la
 * cabecera propia del Ojo, con otro logo y otro menú. Ahora la pone el layout,
 * igual para todas: en escritorio una cabecera arriba (la del home), en móvil
 * la cabecera de marca arriba y las pestañas abajo con el Ojo al centro.
 *
 * Las pantallas que necesitan otra cosa arriba en móvil —la ficha del bolso,
 * la lección y el Ojo— la ponen ellas; `CabeceraApp` no pinta la de marca ahí.
 */
export default async function LayoutApp({ children }: { children: ReactNode }) {
  /* `alumnaActual` está cacheada por petición: la página la vuelve a pedir y
     no cuesta una consulta más. La navegación necesita saberlo para decir
     "Inscribirme" o pintar el avatar desde el primer fotograma. */
  const alumna = await alumnaActual();
  const sesion = {
    conSesion: Boolean(alumna),
    iniciales: alumna ? iniciales(alumna) : null,
    plan:
      alumna?.tieneAcceso && alumna.ciclo
        ? `Plan ${alumna.ciclo}`
        : alumna?.tieneAcceso
          ? "Con plan"
          : null,
  };

  return (
    <ProveedorSesion sesion={sesion}>
      <div className="flex min-h-dvh flex-col">
        <CabeceraApp />
        {/*
          El hueco de abajo en móvil (`.hueco-barra-inferior`): la barra va fija
          y no empuja nada. Sin él, la última tarjeta de cada pantalla queda
          debajo de ella —y del círculo del Ojo, que sobresale— y nadie puede
          pulsarla.
        */}
        <div className="hueco-barra-inferior flex flex-1">{children}</div>
        <BarraInferior />
      </div>
    </ProveedorSesion>
  );
}
