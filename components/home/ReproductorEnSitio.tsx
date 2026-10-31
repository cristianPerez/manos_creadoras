"use client";

import { Play, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Un video que se reproduce DONDE ESTÁ, sin llevarse a nadie a otra pantalla.
 *
 * ⚠️ HASTA EL CLIC NO HAY IFRAME, y es lo que hace posible todo lo demás.
 *
 * Montar el reproductor de Bunny de entrada costaría ~500 KB y un documento
 * entero por cada video de la página; con el temario del bolso gratis serían
 * seis. Además el iframe trae SU diseño —su botón, su barra, su tipografía— y
 * ahí se pierde la identidad: la pantalla deja de parecer nuestra.
 *
 * Así que hasta que alguien pulsa, lo que se ve es una imagen nuestra con
 * nuestro botón dorado. Al pulsar se monta el iframe ya reproduciendo
 * (`autoplay=true`, que es legítimo porque el gesto lo hizo ella).
 *
 * El póster sale de Bunny (`thumbnail.jpg`, el fotograma del video) y si no
 * está, de la portada del bolso. Nunca queda un hueco negro.
 */
export function ReproductorEnSitio({
  url,
  poster,
  respaldo,
  titulo,
  className,
  onReproduciendo,
  arrancarAlMontar,
}: {
  /** La URL FIRMADA del embed. La firma el servidor: la clave nunca baja aquí. */
  url: string | null;
  /** La miniatura de Bunny. */
  poster: string | null;
  /** La portada del bolso, por si no hay miniatura. */
  respaldo: string | null;
  titulo: string;
  className?: string;
  /** Avisa a quien lo monta de si hay video corriendo, para que tape o destape. */
  onReproduciendo?: (activo: boolean) => void;
  /**
   * Arranca sin esperar a que toquen el póster.
   *
   * ⚠️ SOLO VALE SI VIENE DE UN TOQUE SUYO (el botón "Ver este paso"). Quien lo
   * use tiene que remontar el componente —cambiando su `key`— porque esto se
   * lee UNA vez, al montar: un video no puede empezar a sonar porque sí en
   * mitad de la página.
   */
  arrancarAlMontar?: boolean;
}) {
  const [reproduciendo, setReproduciendo] = useState(Boolean(arrancarAlMontar) && Boolean(url));

  /*
   * ════════════════════════════════════════════════════════════════════════
   * ⚠️ CON SONIDO, Y RED DEBAJO POR SI EL NAVEGADOR NO DEJA
   * ════════════════════════════════════════════════════════════════════════
   * Mismo problema y misma solución que en el visor de cápsulas: el autoplay
   * CON sonido no lo permiten todos los navegadores, y cuando no lo permiten
   * no silencian el video — se niegan a reproducirlo. Probado el 2026-10-19:
   * `muted=false` dejaba la pantalla negra y mandar `unmute` tras `ready`
   * PAUSABA el video y sacaba el play gigante en medio.
   *
   * Se intenta con sonido; si a los 1,5 s el reproductor no ha dicho que está
   * reproduciendo, se vuelve a montar MUDO, que siempre arranca. El peor caso
   * es un video mudo, nunca uno parado.
   */
  const [mudo, setMudo] = useState(false);
  /*
   * ⚠️ "SONÓ", NO "SE LO PEDÍ" (2026-10-31). Antes el botón se escondía en
   * cuanto lo tocabas (`sonidoPedido`). Pero `unmute` viaja a un iframe de
   * OTRO dominio y Safari de iPhone lo ignora EN SILENCIO: el botón se iba, el
   * video seguía mudo y no quedaba forma de insistir. Ahora se le pregunta a
   * Bunny (`getMuted`) y el botón solo se va con la confirmación. Sin
   * respuesta se queda, que es el lado seguro.
   */
  const [vecesPedido, setVecesPedido] = useState(0);
  const [sonidoConfirmado, setSonidoConfirmado] = useState(false);
  const arranco = useRef(false);
  const relojPlanB = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * ⚠️ EL PLAN B ESPERA A `ready`, NO A UN RELOJ CIEGO — Y ESE ERA EL BUG.
   *
   * La primera versión silenciaba a los 1,5 s de montar el iframe si no había
   * señal de reproducción. Cristian lo reportó el 2026-10-20: las cápsulas
   * sonaban y el curso gratis NO. La causa no era el sonido, era el reloj:
   * el reproductor del curso tarda varios segundos en cargar (se midieron 8-10
   * hasta ver imagen), así que el temporizador vencía ANTES de que Bunny
   * tuviera ocasión de reproducir y lo mutaba sin que el navegador hubiera
   * dicho que no. Las cápsulas se libraban por pedir `preload=true`.
   *
   * Ahora la cuenta atrás NO empieza al montar: empieza cuando el reproductor
   * dice `ready` —"ya estoy listo"—. A partir de ahí, si en 2 s no ha mandado
   * `play` ni `timeupdate`, es que el navegador le negó el sonido y entonces
   * sí toca el plan B. Cargar lento deja de confundirse con "no me dejan".
   *
   * La cuenta atrás la arranca el manejador de `ready`, dentro del efecto de
   * los mensajes: un ref no se puede escribir durante el render.
   */
  useEffect(() => {
    arranco.current = false;
    if (relojPlanB.current) clearTimeout(relojPlanB.current);
    relojPlanB.current = null;
    return () => {
      if (relojPlanB.current) clearTimeout(relojPlanB.current);
      relojPlanB.current = null;
    };
  }, [reproduciendo, mudo, url]);

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
    if (!reproduciendo || mudo) return;
    const tope = setTimeout(() => {
      if (!arranco.current) setMudo(true);
    }, 6000);
    return () => clearTimeout(tope);
  }, [reproduciendo, mudo, url]);
  const marco = useRef<HTMLIFrameElement>(null);

  /*
   * ⚠️ AL ARRANCAR SOLO HAY QUE AVISAR A MANO, y se descubrió probándolo.
   *
   * Cuando se pulsa el póster, el `onClick` ya avisa de que hay video. Con
   * `arrancarAlMontar` ese clic no existe —el iframe aparece ya reproduciendo—
   * y el aviso quedaba pendiente del evento `play` de Bunny, que puede tardar
   * o perderse si manda `ready` antes de que escuchemos.
   *
   * Resultado visible: el video corría y la franja de "Materiales" seguía
   * encima, tapando justo las manos de Elizabeth. Avisar aquí lo arregla sin
   * depender de nadie; el `pause` posterior vuelve a destaparla.
   */
  useEffect(() => {
    if (arrancarAlMontar && url) onReproduciendo?.(true);
    // Solo al montar: `arrancarAlMontar` se lee una vez, como dice su contrato.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * ⚠️ ESCUCHA SI EL VIDEO SE PAUSA, no solo si se pulsó play.
   *
   * El reproductor de Bunny habla `player.js`: manda eventos por `postMessage`.
   * Así "está quieto" significa de verdad quieto —pausado o terminado— y no
   * solo "todavía no le han dado al play".
   *
   * Comprobado: Bunny manda `ready` y, una vez suscritos, `play` y `pause`.
   *
   * Si Bunny dejara de mandarlos, no se rompe nada: se queda con lo que sabemos
   * por el clic, que es el comportamiento mínimo correcto.
   */
  useEffect(() => {
    if (!reproduciendo) return;

    /* `valor` no es siempre texto: `setVolume` espera un número y `setMuted`
       un booleano. Mandarlos como cadena los deja sin efecto silenciosamente. */
    const pedir = (metodo: string, valor?: string | number | boolean) =>
      marco.current?.contentWindow?.postMessage(
        JSON.stringify({ context: "player.js", method: metodo, value: valor }),
        "*",
      );

    const alMensaje = (e: MessageEvent) => {
      // Solo de Bunny: cualquier pestaña puede mandar `postMessage` a esta página.
      if (!e.origin.endsWith("mediadelivery.net")) return;
      let d: { event?: string; method?: string; value?: unknown } | null = null;
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return; // un mensaje que no es JSON no nos incumbe
      }

      /*
       * La respuesta a `getMuted`, que pide el botón "Activar sonido". Se
       * aceptan las dos formas en que player.js contesta según la versión
       * (`event` o `method`): no controlamos cuál sirve Bunny, y fallar aquí
       * dejaría el botón puesto para siempre.
       *
       * ⚠️ NO se toca `mudo`: ese estado es la `key` del iframe y cambiarlo
       * REMONTARÍA el video desde el segundo cero, justo cuando acaba de
       * conseguir sonido.
       */
      if (d?.event === "getMuted" || d?.method === "getMuted") {
        if (d?.value === false) setSonidoConfirmado(true);
        return;
      }

      /*
       * ⚠️ LA SUSCRIPCIÓN VA AL RECIBIR `ready`, NO EN UN TEMPORIZADOR.
       *
       * El primer intento la mandaba 800ms después de montar el iframe y no
       * llegaba ningún evento: el reproductor todavía no escuchaba y la petición
       * se perdía. `ready` es justo la señal de "ya puedes hablarme" que define
       * el protocolo — adivinar el momento con un reloj era el error.
       */
      if (d?.event === "ready") {
        pedir("addEventListener", "play");
        pedir("addEventListener", "pause");
        pedir("addEventListener", "ended");
        /* La prueba de que el video SÍ avanza. Sin esto, el temporizador que
           decide si hace falta reintentar mudo no sabría si arrancó. */
        pedir("addEventListener", "timeupdate");
        /* Ya está cargado: a partir de AQUÍ tiene sentido medir si reproduce. */
        if (!mudo && !relojPlanB.current) {
          relojPlanB.current = setTimeout(() => {
            if (!arranco.current) setMudo(true);
          }, 2000);
        }
        return;
      }

      /* ⚠️ `timeupdate` TAMBIÉN CUENTA COMO "está corriendo", no solo `play`.
         Bunny no siempre manda `play` —con autoplay a veces solo manda
         `timeupdate`— y entonces la franja de "Materiales" se quedaba encima
         del video tapando las manos de Elizabeth, que es justo lo que se
         arregló hace dos días por otro camino. */
      if (d?.event === "play" || d?.event === "timeupdate") {
        arranco.current = true;
        onReproduciendo?.(true);
      }
      if (d?.event === "pause" || d?.event === "ended") onReproduciendo?.(false);
    };

    window.addEventListener("message", alMensaje);
    return () => window.removeEventListener("message", alMensaje);
  }, [reproduciendo, onReproduciendo, mudo]);

  /*
   * ⚠️ LA MINIATURA DE BUNNY PUEDE NO CARGAR, Y HAY QUE PREVERLO. Su CDN de
   * imágenes tiene SU PROPIA lista de dominios permitidos, distinta de la del
   * reproductor: en desarrollo devuelve 403 y en producción 200. Sin respaldo,
   * el curso gratis se vería como un rectángulo negro en local — y el día que
   * alguien toque esa lista, también en producción.
   *
   * Al fallar se cae a la portada del bolso, que es nuestra y siempre está.
   */
  const [posterFallo, setPosterFallo] = useState(false);
  const usarPoster = Boolean(poster) && !posterFallo;
  const imagen = usarPoster ? poster : respaldo;

  if (reproduciendo && url) {
    return (
      <div className={`bg-espresso relative overflow-hidden ${className ?? ""}`}>
        <iframe
          ref={marco}
/*
           * ⚠️ NI `muted=true` NI `muted=false`: SE DEJA QUE BUNNY DECIDA, y
           * es lo único que reproduce de verdad. Probado el 2026-10-19 con
           * las tres variantes:
           *   · `autoplay=true` a secas → reproduce. (Esta.)
           *   · `autoplay=true&muted=false` → pantalla negra, no arranca.
           *   · arrancar mudo y mandar `unmute` al recibir `ready` → el
           *     navegador lo PAUSA y aparece el play gigante en medio.
           *
           * Pedir sonido explícitamente hace que el navegador prefiera no
           * reproducir nada, que es el peor de los tres resultados. Sin el
           * parámetro, el reproductor arranca con su volumen normal.
           */
          key={mudo ? "mudo" : "con-sonido"}
          /* `preload=true&playsinline=true` como en las cápsulas: el
             reproductor se adelanta a cargar y confirma antes que avanza, en
             vez de hacernos esperar. `playsinline` evita que iOS lo abra a
             pantalla completa él solo. */
          src={`${url}${url.includes("?") ? "&" : "?"}autoplay=true&preload=true&playsinline=true${mudo ? "&muted=true" : ""}`}
          title={titulo}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
        {/*
          ⚠️ SI EL NAVEGADOR OBLIGÓ A ARRANCAR MUDO, SE DICE (2026-10-23).
          Antes el video sonaba mudo y nada lo explicaba. El botón le pide a
          Bunny que active el sonido; si ese navegador tampoco lo deja, tocar
          el video lo pausa y enseña los controles de Bunny, con su volumen.
        */}
        {mudo && !sonidoConfirmado && (
          <button
            type="button"
            onClick={() => {
              const pedir = (metodo: string, valor?: number) =>
                marco.current?.contentWindow?.postMessage(
                  JSON.stringify({ context: "player.js", method: metodo, value: valor }),
                  "*",
                );
              pedir("unmute");
              pedir("setVolume", 100);
              /* 400ms: lo justo para que Bunny procese el `unmute` antes de
                 que le preguntemos. En el mismo tic devuelve el estado viejo.
                 La respuesta la recoge el efecto de mensajes de arriba. */
              setTimeout(() => pedir("getMuted"), 400);
              setVecesPedido((n) => n + 1);
            }}
            className="bg-espresso text-cream absolute top-4 right-4 flex h-11 max-w-[70%] items-center gap-2 rounded-full px-4 text-sm font-semibold [touch-action:manipulation]"
          >
            <VolumeX size={16} aria-hidden="true" className="shrink-0" />
            <span className="truncate">
              {vecesPedido === 0 ? "Activar sonido" : "Toca el video para el volumen"}
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setReproduciendo(true);
        onReproduciendo?.(true);
      }}
      disabled={!url}
      aria-label={url ? `Reproducir: ${titulo}` : `${titulo} — video no disponible todavía`}
      className={`bg-espresso group relative block w-full overflow-hidden ${className ?? ""}`}
    >
      {imagen && (
        <Image
          src={imagen}
          alt=""
          fill
          sizes="(min-width: 768px) 620px, 100vw"
          className="object-cover"
          /* La miniatura viene de Bunny, fuera de nuestro dominio: `unoptimized`
             evita tener que declarar su hostname en la configuración de Next. */
          unoptimized={usarPoster}
          onError={() => setPosterFallo(true)}
        />
      )}

      <span
        aria-hidden="true"
        className="absolute inset-0 transition-colors group-hover:bg-espresso/10"
      />

      {url ? (
        <span
          aria-hidden="true"
          className="bg-cream text-espresso absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
        >
          <Play size={28} fill="currentColor" className="ml-1" />
        </span>
      ) : (
        /* Sin video todavía: se dice, no se pinta un play que no reproduce. */
        <span className="bg-espresso/70 absolute top-1/2 left-1/2 w-max max-w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full px-5 py-2.5 text-sm text-white backdrop-blur-sm">
          Estamos subiendo este video
        </span>
      )}
    </button>
  );
}
