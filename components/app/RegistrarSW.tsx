"use client";

import { useEffect } from "react";

/**
 * Registra el service worker. Sin esto la app no se puede instalar ni recibir avisos.
 *
 * Va en el layout raíz (no solo en la zona privada) porque quien llega a la página
 * de ventas también debería poder instalarla.
 */
export function RegistrarSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Tras la carga, para no competir por ancho de banda con lo que se ve en pantalla.
    const registrar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Que falle el registro no puede romper la app: sin service worker
        // simplemente no hay instalación ni avisos, todo lo demás sigue igual.
      });
    };

    if (document.readyState === "complete") {
      registrar();
      return;
    }
    window.addEventListener("load", registrar);
    return () => window.removeEventListener("load", registrar);
  }, []);

  return null;
}
