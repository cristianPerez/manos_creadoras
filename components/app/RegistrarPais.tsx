"use client";

import { useEffect, useRef } from "react";
import { registrarPais } from "@/lib/registrar-pais";

/**
 * Deja constancia del país de esta sesión, sin estorbar.
 *
 * ⚠️ NO PINTA NADA Y NO BLOQUEA EL RENDER. Si esto se hiciera en el servidor
 * durante el pintado, cada carga de página esperaría a una escritura en la base
 * para enseñar el titular. Saber de qué país nos visitan es útil; que la página
 * tarde más, no.
 *
 * `useRef` y no `useState`: en desarrollo React monta los efectos dos veces, y
 * sin el guardia se registraría la sesión por duplicado en cada carga.
 */
export function RegistrarPais() {
  const yaFue = useRef(false);

  useEffect(() => {
    if (yaFue.current) return;
    yaFue.current = true;
    // Si falla, no pasa nada: es telemetría, no parte de la compra.
    void registrarPais().catch(() => {});
  }, []);

  return null;
}
