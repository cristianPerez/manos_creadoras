"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * ¿Hay alguien con la sesión iniciada? Lo dice el SERVIDOR (el layout de
 * `/app`), no el navegador (2026-10-21).
 *
 * ⚠️ POR QUÉ NO SE PREGUNTA A SUPABASE DESDE EL CLIENTE: la respuesta llega
 * después del primer pintado, y la última pestaña parpadearía de "Mi cuenta" a
 * "Entrar" (o al revés) en cada visita. El layout ya sabe quién mira cuando
 * renderiza, así que la barra sale bien desde el primer fotograma. Al cerrar
 * sesión, `router.refresh()` vuelve a renderizar el layout y esto se actualiza.
 */
const ConSesion = createContext(false);

export function ProveedorSesion({
  conSesion,
  children,
}: {
  conSesion: boolean;
  children: ReactNode;
}) {
  return <ConSesion.Provider value={conSesion}>{children}</ConSesion.Provider>;
}

export function useConSesion(): boolean {
  return useContext(ConSesion);
}
