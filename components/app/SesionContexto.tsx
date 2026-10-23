"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * ¿Hay alguien con la sesión iniciada? Lo dice el SERVIDOR (el layout de
 * `/app`), no el navegador (2026-10-21).
 *
 * ⚠️ POR QUÉ NO SE PREGUNTA A SUPABASE DESDE EL CLIENTE: la respuesta llega
 * después del primer pintado, y la cabecera parpadearía de "Inscribirme" al
 * avatar (o al revés) en cada visita. El layout ya sabe quién mira cuando
 * renderiza, así que la navegación sale bien desde el primer fotograma. Al
 * cerrar sesión, `router.refresh()` vuelve a renderizar el layout y esto se
 * actualiza.
 *
 * Desde la navegación unificada (2026-10-23) también lleva las iniciales del
 * avatar y el plan del chip de la cabecera ("Plan anual").
 */
export type Sesion = {
  conSesion: boolean;
  /** "CP". Solo con sesión. */
  iniciales: string | null;
  /** "Plan anual" / "Plan mensual". Solo si tiene acceso de pago. */
  plan: string | null;
};

const SIN_SESION: Sesion = { conSesion: false, iniciales: null, plan: null };

const ContextoSesion = createContext<Sesion>(SIN_SESION);

export function ProveedorSesion({ sesion, children }: { sesion: Sesion; children: ReactNode }) {
  return <ContextoSesion.Provider value={sesion}>{children}</ContextoSesion.Provider>;
}

export function useSesion(): Sesion {
  return useContext(ContextoSesion);
}

export function useConSesion(): boolean {
  return useContext(ContextoSesion).conSesion;
}
