"use client";

import { useEffect, useRef } from "react";

/**
 * El video de una historia: a pantalla completa, sin controles y sin adornos.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ LOS CONTROLES SE QUITAN POR DOS SITIOS, Y HACEN FALTA LOS DOS
 * ════════════════════════════════════════════════════════════════════════════
 * 1. `controls=false` en la URL — se lo pedimos a Bunny.
 * 2. `pointer-events: none` sobre el iframe — lo pone quien lo monta.
 *
 * El segundo es el importante: aunque Bunny esconda su barra, el iframe sigue
 * capturando los toques, y en una historia TODA la pantalla tiene que ser zona
 * de avance. Sin eso, tocar el centro no hace nada —o peor, pausa el video— y
 * el gesto que todo el mundo conoce deja de funcionar justo en el medio.
 *
 * ⚠️ Y POR ESO ESTE COMPONENTE NO ESCUCHA TOQUES: las zonas de tap viven en el
 * visor, por encima. Aquí solo se reproduce.
 * ════════════════════════════════════════════════════════════════════════════
 */
export function VideoDeHistoria({
  /** La URL FIRMADA del embed. La firma el servidor: la clave no baja aquí. */
  url,
  titulo,
  /** Avisa de cuánto dura el video en cuanto Bunny lo dice. */
  alSaberDuracion,
  /** Avisa cuando el video termina, para pasar a la siguiente. */
  alTerminar,
}: {
  url: string;
  titulo: string;
  alSaberDuracion: (segundos: number) => void;
  alTerminar: () => void;
}) {
  const marco = useRef<HTMLIFrameElement>(null);

  /*
   * ⚠️ SE HABLA CON EL REPRODUCTOR POR `player.js`, Y LA SUSCRIPCIÓN VA AL
   * RECIBIR `ready` — NO en un temporizador.
   *
   * Ya se intentó con un `setTimeout` en otra pantalla de esta app y no llegaba
   * ningún evento: el reproductor todavía no escuchaba y la petición se perdía.
   * `ready` es justo la señal de "ya puedes hablarme" que define el protocolo.
   *
   * Si Bunny dejara de contestar, no se rompe nada: el visor tiene una duración
   * por defecto y la historia avanza igual.
   */
  useEffect(() => {
    const pedir = (metodo: string, valor?: string) =>
      marco.current?.contentWindow?.postMessage(
        JSON.stringify({ context: "player.js", method: metodo, value: valor }),
        "*",
      );

    const alMensaje = (e: MessageEvent) => {
      // Solo de Bunny: cualquier pestaña puede mandar `postMessage` aquí.
      if (!e.origin.endsWith("mediadelivery.net")) return;

      let d: { event?: string; value?: unknown } | null = null;
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return; // un mensaje que no es JSON no nos incumbe
      }

      if (d?.event === "ready") {
        pedir("addEventListener", "ended");
        pedir("getDuration");
        return;
      }

      if (d?.event === "ended") alTerminar();

      // La duración llega como respuesta a `getDuration`.
      if (typeof d?.value === "number" && d.value > 0) alSaberDuracion(d.value);
    };

    window.addEventListener("message", alMensaje);
    return () => window.removeEventListener("message", alMensaje);
  }, [alSaberDuracion, alTerminar]);

  return (
    <>
      <iframe
      ref={marco}
      /*
       * ⚠️ NO EXISTE UN PARÁMETRO PARA OCULTAR LOS CONTROLES, y se buscó.
       *
       * Se probó `controls=false` y `controls=` (lista vacía); Bunny ignora los
       * dos. Su documentación lo confirma: la tabla de parámetros del embed
       * tiene `showSpeed`, `chromecast`, `compactControls`… pero los controles
       * en bloque solo se configuran en el panel, POR BIBLIOTECA. Y esta
       * biblioteca también sirve las lecciones del curso, donde la alumna SÍ
       * necesita poder pausar y retroceder.
       *
       * De ahí el recorte de abajo: ver el comentario de `className`.
       *
       * `muted=true` es lo que permite el autoplay —los navegadores bloquean el
       * arranque con sonido— y una historia que no arranca sola no es una
       * historia. Verificado: el video reproduce solo al abrir la cápsula.
       */
      src={`${url}${url.includes("?") ? "&" : "?"}autoplay=true&muted=true&preload=true&playsinline=true`}
      title={titulo}
      allow="autoplay; encrypted-media; picture-in-picture"
      /*
       * `pointer-events-none`: los toques son del visor, no del reproductor.
       * Sin esto, el iframe se quedaría con el gesto y tocar el centro no
       * avanzaría la historia.
       */
        className="pointer-events-none absolute inset-0 size-full border-0"
      />

      {/*
        ⚠️ ESTA FRANJA TAPA LA BARRA DE CONTROLES DE BUNNY, y es la única forma
        que queda.

        Se probaron `controls=false` y `controls=` y los ignora; su
        documentación confirma que los controles solo se apagan en el panel,
        POR BIBLIOTECA — y esta misma biblioteca sirve las lecciones del curso,
        donde la alumna SÍ necesita pausar y retroceder.

        También se probó agrandar el iframe para sacar la barra del encuadre,
        pero el video no llena el alto y aparecían bandas a los lados.

        Así que se cubre: 72px de espresso sólido abajo, justo donde Plyr pinta
        su barra. Encaja con el pie del visor, que ya es oscuro, y no deforma el
        video ni recorta nada de la imagen.
      */}
      <span
        aria-hidden="true"
        className="bg-espresso pointer-events-none absolute inset-x-0 bottom-0 h-18"
      />
    </>
  );
}
