"use client";

import { useEffect, useState } from "react";

/**
 * Anuncia "cargando" a un lector de pantalla desde un esqueleto.
 *
 * ⚠️ La región se monta VACÍA y el texto entra después (revisor visual,
 * 2026-11-06): casi ningún lector anuncia una región `role="status"` que nace
 * ya con contenido. En "Mi plan" y "Cuenta" de la barra de abajo este es el
 * único aviso de que el toque hizo algo.
 */
export function AnuncioCarga({ texto }: { texto: string }) {
  const [dicho, setDicho] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDicho(texto), 50);
    return () => window.clearTimeout(id);
  }, [texto]);
  return (
    <span role="status" className="sr-only">
      {dicho}
    </span>
  );
}
