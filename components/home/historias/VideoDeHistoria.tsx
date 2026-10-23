"use client";

import { useEffect, useRef, useState } from "react";

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
  detenido = false,
  alReanudar,
  alCambiarMudo,
  pedirSonido = 0,
}: {
  url: string;
  titulo: string;
  alSaberDuracion: (segundos: number) => void;
  alTerminar: () => void;
  /**
   * ⚠️ TOCAR EL VIDEO LO DETIENE Y ENSEÑA LOS CONTROLES (2026-10-23, pedido
   * de Cristian). Detenido, el iframe recibe los toques y se destapa la barra
   * de Bunny: así, si el navegador lo arrancó mudo, ella misma sube el volumen
   * desde el reproductor — el único camino que funciona en todos, iPhone
   * incluido, porque el toque es SUYO dentro del reproductor.
   */
  detenido?: boolean;
  /** Le dio a reproducir en los controles de Bunny: la historia sigue. */
  alReanudar?: () => void;
  /** Avisa si tuvo que arrancar mudo, para ofrecer "Activar sonido". */
  alCambiarMudo?: (mudo: boolean) => void;
  /** Sube en cada toque a "Activar sonido": se le pide a Bunny el volumen. */
  pedirSonido?: number;
}) {
  const marco = useRef<HTMLIFrameElement>(null);

  const pedirAlReproductor = (metodo: string, valor?: string | number | boolean) =>
    marco.current?.contentWindow?.postMessage(
      JSON.stringify({ context: "player.js", method: metodo, value: valor }),
      "*",
    );

  /* Detener desde fuera (el toque en el centro del visor). */
  const detenidoRef = useRef(detenido);
  const ultimaPausa = useRef(0);
  useEffect(() => {
    detenidoRef.current = detenido;
    if (detenido) pedirAlReproductor("pause");
  }, [detenido]);

  useEffect(() => {
    if (pedirSonido === 0) return;
    pedirAlReproductor("unmute");
    pedirAlReproductor("setVolume", 100);
  }, [pedirSonido]);

  /*
   * ════════════════════════════════════════════════════════════════════════
   * ⚠️ SE INTENTA CON SONIDO, Y SI EL NAVEGADOR NO DEJA, SE REINTENTA MUDO
   * ════════════════════════════════════════════════════════════════════════
   * Cristian pidió dos veces que las cápsulas suenen al arrancar. El problema
   * es real y no se arregla insistiendo: el autoplay CON sonido lo permiten
   * unos navegadores y otros no, y cuando no lo permiten NO lo silencian —
   * se niegan a reproducir. Probado el 2026-10-19: `muted=false` dejaba la
   * pantalla negra y mandar `unmute` tras `ready` PAUSABA el video.
   *
   * Así que no se elige entre "con sonido" y "que arranque": se intenta con
   * sonido y hay una red debajo. Si a los 1,5 s el reproductor no ha dicho
   * que está reproduciendo, se vuelve a montar MUDO, que siempre arranca.
   *
   * El peor caso deja de ser una cápsula congelada y pasa a ser una cápsula
   * muda — lo mismo que había antes, pero solo donde no queda más remedio.
   */
  const [mudo, setMudo] = useState(false);
  const arranco = useRef(false);
  const relojPlanB = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * ⚠️ LA CUENTA ATRÁS EMPIEZA EN `ready`, NO AL MONTAR.
   *
   * Aquí funcionaba por suerte: las cápsulas piden `preload=true` y cargan
   * rápido, así que confirmaban que avanzaban antes de que venciera el reloj.
   * El mismo código en el curso gratis —sin `preload`— silenciaba videos que
   * el navegador SÍ habría dejado sonar (reportado por Cristian el
   * 2026-10-20). Con una conexión lenta le habría pasado igual a una cápsula.
   *
   * Medir desde `ready` separa las dos cosas que antes se confundían: "tarda
   * en cargar" y "no me dejan sonar". Solo la segunda merece el plan B.
   *
   * La arranca el manejador de `ready`, dentro del efecto de los mensajes: un
   * ref no se puede escribir durante el render.
   */
  useEffect(() => {
    arranco.current = false;
    if (relojPlanB.current) clearTimeout(relojPlanB.current);
    relojPlanB.current = null;
    return () => {
      if (relojPlanB.current) clearTimeout(relojPlanB.current);
      relojPlanB.current = null;
    };
  }, [mudo, url]);

  /*
   * ⚠️ Y UN TOPE ABSOLUTO, ADEMÁS DEL DE `ready`.
   *
   * Medir desde `ready` arregla el falso positivo (silenciar a quien solo
   * tardaba en cargar), pero abre otro agujero: si `ready` NO llega —Bunny no
   * contesta, la red se corta, el reproductor cambia de protocolo— la cuenta
   * atrás no empieza nunca y el video se queda con sonido Y PARADO. Que es
   * exactamente lo que se vino a evitar. Comprobado el 2026-10-20: sin este
   * tope, el curso gratis quedaba con el play en medio de la pantalla.
   *
   * 6 s desde que se monta: de sobra para cargar en una conexión normal (las
   * cápsulas confirman en 1-2) y lo bastante corto para que nadie se quede
   * mirando un video parado.
   */
  useEffect(() => {
    if (mudo) return;
    const tope = setTimeout(() => {
      if (!arranco.current) setMudo(true);
    }, 6000);
    return () => clearTimeout(tope);
  }, [mudo, url]);

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
    /* `valor` no es siempre texto: `setVolume` espera un número y `setMuted`
       un booleano. Mandarlos como cadena los deja sin efecto silenciosamente. */
    const pedir = (metodo: string, valor?: string | number | boolean) =>
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
        /* `play` y `timeupdate` son la prueba de que SÍ está sonando: sin
           ellos el temporizador de arriba no sabría si hace falta el plan B. */
        pedir("addEventListener", "play");
        pedir("addEventListener", "timeupdate");
        pedir("getDuration");
        /* Ya cargó: desde aquí sí tiene sentido medir si reproduce. */
        if (!mudo && !relojPlanB.current) {
          relojPlanB.current = setTimeout(() => {
            if (!arranco.current) setMudo(true);
          }, 2000);
        }
        return;
      }

      if (d?.event === "play" || d?.event === "timeupdate") arranco.current = true;
      /* Detenido por un toque y ella le dio a reproducir en Bunny: sigue. El
         ref se suelta YA, sin esperar al render, para que el `timeupdate` que
         llega justo detrás no lo vuelva a pausar. */
      if (d?.event === "play" && detenidoRef.current) {
        detenidoRef.current = false;
        alReanudar?.();
        return;
      }
      /*
       * ⚠️ SI SIGUE AVANZANDO DETENIDO, SE INSISTE. Bunny ignora la pausa
       * mientras arranca (probado: tocar al segundo de abrir no lo paraba) y
       * después sigue como si nada. Mientras esté detenido y llegue tiempo,
       * se le vuelve a pedir — como mucho una vez cada medio segundo.
       */
      if (d?.event === "timeupdate" && detenidoRef.current) {
        const ahora = Date.now();
        if (ahora - ultimaPausa.current > 500) {
          ultimaPausa.current = ahora;
          pedir("pause");
        }
      }

      if (d?.event === "ended") alTerminar();

      // La duración llega como respuesta a `getDuration`.
      if (typeof d?.value === "number" && d.value > 0) alSaberDuracion(d.value);
    };

    window.addEventListener("message", alMensaje);
    return () => window.removeEventListener("message", alMensaje);
  }, [alSaberDuracion, alTerminar, alReanudar, mudo]);

  useEffect(() => {
    alCambiarMudo?.(mudo);
  }, [mudo, alCambiarMudo]);

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
       * ⚠️ AQUÍ IBA `muted=true` Y SE QUITÓ EL 2026-10-19 (pedido de
       * Cristian: las cápsulas deben sonar en cuanto empieza el video). Era
       * un cinturón de seguridad contra el bloqueo de autoplay, pero las
       * dejaba mudas SIEMPRE, incluso donde el navegador habría permitido el
       * sonido.
       *
       * Sin el parámetro, el reproductor arranca con su volumen normal. La
       * cápsula se abre de un TOQUE suyo, y esa activación es justo la que
       * los navegadores exigen para dejar sonar.
       *
       * ⚠️ NO PONER `muted=false` EN SU LUGAR: se probó en el reproductor del
       * curso gratis el mismo día y el video NO ARRANCA —pantalla negra—.
       * Pedir sonido explícitamente hace que el navegador prefiera no
       * reproducir. Lo mismo con mandar `unmute` tras `ready`: lo PAUSA.
       *
       * ⚠️ SI ALGUNA VEZ UNA CÁPSULA SE QUEDA CONGELADA en el primer
       * fotograma, el culpable es esto: el navegador bloqueó el autoplay con
       * sonido. La vuelta atrás es una línea —reponer `muted=true`— y la
       * decisión sería mudas pero fluidas.
       */
      key={mudo ? "mudo" : "con-sonido"}
      src={`${url}${url.includes("?") ? "&" : "?"}autoplay=true&preload=true&playsinline=true${mudo ? "&muted=true" : ""}`}
      title={titulo}
      allow="autoplay; encrypted-media; picture-in-picture"
      /*
       * `pointer-events-none`: los toques son del visor, no del reproductor.
       * Sin esto, el iframe se quedaría con el gesto y tocar el centro no
       * avanzaría la historia.
       */
        className={`absolute inset-0 size-full border-0 ${detenido ? "" : "pointer-events-none"}`}
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
      {!detenido && (
        <span
          aria-hidden="true"
          className="bg-espresso pointer-events-none absolute inset-x-0 bottom-0 h-18"
        />
      )}
    </>
  );
}
