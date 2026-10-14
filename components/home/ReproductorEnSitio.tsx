"use client";

import { Play } from "lucide-react";
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
}) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const marco = useRef<HTMLIFrameElement>(null);

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

    const pedir = (metodo: string, valor?: string) =>
      marco.current?.contentWindow?.postMessage(
        JSON.stringify({ context: "player.js", method: metodo, value: valor }),
        "*",
      );

    const alMensaje = (e: MessageEvent) => {
      // Solo de Bunny: cualquier pestaña puede mandar `postMessage` a esta página.
      if (!e.origin.endsWith("mediadelivery.net")) return;
      let d: { event?: string } | null = null;
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return; // un mensaje que no es JSON no nos incumbe
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
        return;
      }

      if (d?.event === "play") onReproduciendo?.(true);
      if (d?.event === "pause" || d?.event === "ended") onReproduciendo?.(false);
    };

    window.addEventListener("message", alMensaje);
    return () => window.removeEventListener("message", alMensaje);
  }, [reproduciendo, onReproduciendo]);

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
          src={`${url}${url.includes("?") ? "&" : "?"}autoplay=true`}
          title={titulo}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
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
