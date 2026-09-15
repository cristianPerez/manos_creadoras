"use client";

import { useEffect } from "react";
import { COLOR_FONDO_SISTEMA, COLORES_SIN_CSS } from "@/lib/marca";

/**
 * La última red de seguridad: se pinta cuando revienta el layout RAÍZ.
 *
 * ⚠️ POR QUÉ NO USA NINGÚN COMPONENTE NI TOKEN DE LA APP. Si esta pantalla se
 * está mostrando, lo que falló pudo ser el propio layout — así que todo lo que
 * cuelgue de él (fuentes, `globals.css`, los tokens de color, los iconos) puede
 * no estar disponible. Un error boundary que depende de lo que se rompió no se
 * pinta: deja la pantalla en blanco, que es exactamente lo que vino a evitar.
 *
 * Por eso reemplaza `<html>` y `<body>` enteros, los estilos van escritos a mano
 * y no importa nada más que el color de marca, que es una constante suelta.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /*
      Sale por `console.error` directo y NO por `reportarFallo`.

      Mismo motivo que arriba: si el fallo fue de carga, el módulo de fallos
      podría no estar. Aquí lo único seguro es lo que ya trae el navegador.

      ⚠️ Se manda el `digest` —el código que Next genera para cruzar este fallo
      con el registro del servidor— y NO el mensaje del error, que puede llevar
      dentro datos de la persona.
    */
    try {
      console.error(
        JSON.stringify({ nivel: "error", area: "navegador", mensaje: "fallo raíz", digest: error.digest ?? "sin-digest" }),
      );
    } catch {
      // Ni eso: se calla antes que reventar dos veces.
    }
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLOR_FONDO_SISTEMA,
          color: COLORES_SIN_CSS.texto,
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "340px" }}>
          <h1 style={{ fontWeight: 400, fontSize: "26px", lineHeight: 1.25, margin: 0 }}>
            Algo se nos trabó
          </h1>
          <p
            style={{
              color: COLORES_SIN_CSS.textoSecundario,
              fontSize: "15px",
              lineHeight: 1.6,
              marginTop: "12px",
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            No perdiste nada de tu avance. Vuelve a intentar y normalmente entra a la primera.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              height: "48px",
              padding: "0 28px",
              border: "none",
              borderRadius: "9999px",
              backgroundImage: `linear-gradient(to right, ${COLORES_SIN_CSS.acenteDesde}, ${COLORES_SIN_CSS.acenteHasta})`,
              color: COLORES_SIN_CSS.sobreAcento,
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "Helvetica, Arial, sans-serif",
              cursor: "pointer",
            }}
          >
            Volver a intentar
          </button>
        </div>
      </body>
    </html>
  );
}
