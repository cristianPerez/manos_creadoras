"use client";

import { VolumeX, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Capsula } from "@/lib/capsulas";
import { BarraDeAvance } from "@/components/home/historias/BarraDeAvance";
import { VideoDeHistoria } from "@/components/home/historias/VideoDeHistoria";

/**
 * El visor de cápsulas, con el comportamiento de las historias de Instagram.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * SUSTITUYE A `StoryViewer.tsx`, QUE SE DEJA INTACTO
 * ════════════════════════════════════════════════════════════════════════════
 * Cristian pidió componentes nuevos "que no afecten lo actual". El viejo sigue
 * en el repo sin que nadie lo importe: si esto se tuerce, volver es cambiar una
 * línea en `Capsulas.tsx`.
 *
 * Lo que cambia respecto al anterior:
 *   · El video ocupa la pantalla y NO enseña controles.
 *   · Las rayitas de arriba se llenan solas, al ritmo del video.
 *   · Toda la pantalla es zona de gesto: derecha avanza, izquierda retrocede.
 *   · Mantener pulsado pausa, como en Instagram.
 *   · Deslizar hacia la izquierda retrocede (lo pidió Cristian así).
 *   · Retroceder desde la PRIMERA cierra el visor.
 *
 * ⚠️ LO QUE NO SE COPIA DE INSTAGRAM: ahí la zona de retroceso es un tercio y
 * la de avance dos tercios. Aquí es mitad y mitad porque nuestras cápsulas son
 * cinco y se repasan hacia atrás tanto como hacia delante; con un tercio, el
 * pulgar de una mano derecha casi nunca acierta a volver.
 * ════════════════════════════════════════════════════════════════════════════
 */

/**
 * Lo que dura una cápsula si el video no dice cuánto.
 *
 * ⚠️ NO ES UN NÚMERO CUALQUIERA: si Bunny no contesta, esto es lo único que
 * hace avanzar la historia. Demasiado corto, corta el video a media frase;
 * demasiado largo, parece colgado. 15s es lo que dura una historia de
 * Instagram y lo que la gente ya espera.
 */
const DURACION_POR_DEFECTO_MS = 15_000;

/** A partir de cuántos píxeles un arrastre cuenta como deslizar y no como toque. */
const MINIMO_PARA_DESLIZAR = 45;

/** Cuánto hay que mantener pulsado antes de que se considere "pausa". */
const MS_PARA_PAUSAR = 220;

export function VisorDeHistorias({
  capsulas,
  indice,
  irA,
  marcarVista,
  cerrar,
  urlsDeVideo,
}: {
  capsulas: Capsula[];
  indice: number;
  /*
   * ⚠️ AQUÍ NO ENTRA `vistas`, Y EL VIEJO SÍ LA USABA. En una historia las
   * rayitas marcan POR DÓNDE VAS en este pase —las de antes llenas, las de
   * después vacías—, no cuáles viste otro día. Mezclar las dos cosas haría que
   * al abrir la tercera salieran llenas las cinco.
   *
   * `marcarVista` sigue llegando porque los círculos del home SÍ recuerdan
   * cuáles se vieron ya.
   */
  irA: (i: number) => void;
  marcarVista: (id: string) => void;
  cerrar: () => void;
  /** Las URLs firmadas por cápsula. Se firman en el servidor. */
  urlsDeVideo: Record<string, string | null>;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const abridor = useRef<Element | null>(null);
  const capsula = capsulas[indice];

  const [duracionMs, setDuracionMs] = useState(DURACION_POR_DEFECTO_MS);
  const [enPausa, setEnPausa] = useState(false);
  /* Detenida por un toque en el centro: video pausado y controles de Bunny a
     la vista (ver `VideoDeHistoria`). Distinto de `enPausa`, que es mantener
     pulsado y se suelta solo. */
  const [detenido, setDetenido] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [pedirSonido, setPedirSonido] = useState(0);
  const reanudar = useCallback(() => setDetenido(false), []);

  /*
   * ⚠️ EL REINICIO AL CAMBIAR DE CÁPSULA SE HACE EN EL RENDER, NO EN UN EFECTO.
   *
   * El primer intento era un `useEffect([indice])` que llamaba a tres
   * `setState`. El linter lo rechazó con razón: eso pinta la cápsula nueva con
   * la duración de la ANTERIOR y la corrige en un segundo render — un
   * parpadeo de la rayita justo al pasar de historia.
   *
   * Comparar con el valor previo durante el render es el patrón que React
   * documenta para ajustar estado cuando cambia una prop: se descarta el
   * render a medias y se vuelve a empezar, sin llegar a pintar lo viejo.
   */
  const [indicePintado, setIndicePintado] = useState(indice);
  if (indice !== indicePintado) {
    setIndicePintado(indice);
    setDuracionMs(DURACION_POR_DEFECTO_MS);
    setEnPausa(false);
    setDetenido(false);
    setMudo(false);
    setPedirSonido(0);
  }

  const avanzar = useCallback(() => {
    // Después de la última se cierra: dar vueltas en bucle no deja salir.
    if (indice >= capsulas.length - 1) cerrar();
    else irA(indice + 1);
  }, [indice, capsulas.length, irA, cerrar]);

  /*
   * ⚠️ RETROCEDER DESDE LA PRIMERA CIERRA EL VISOR. Lo pidió Cristian y
   * coincide con lo que hace Instagram: en la primera historia, el gesto de
   * "atrás" ya no tiene a dónde ir, así que sale. Quedarse quieto se siente
   * como que la app se trabó.
   */
  const retroceder = useCallback(() => {
    if (indice <= 0) cerrar();
    else irA(indice - 1);
  }, [indice, irA, cerrar]);

  /* Se marca vista al ABRIRLA, no al terminar: son cápsulas de menos de un
     minuto y lo que se recuerda es "esa ya la vi". */
  useEffect(() => {
    if (capsula) marcarVista(capsula.id);
  }, [capsula, marcarVista]);

  useEffect(() => {
    abridor.current = document.activeElement;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    caja.current?.focus();
    return () => {
      document.body.style.overflow = previo;
      (abridor.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  /*
   * ⚠️ EL TEMPORIZADOR ES EL QUE PASA DE CÁPSULA, no la animación de la rayita.
   *
   * Podría parecer más simple engancharse al `animationend` de la raya, pero
   * entonces la historia dependería de que la animación CSS exista: con
   * `prefers-reduced-motion`, o si alguien tiene las animaciones desactivadas,
   * nunca pasaría de la primera. El reloj va aparte y la raya solo lo dibuja.
   */
  useEffect(() => {
    if (enPausa || detenido) return;
    const id = setTimeout(avanzar, duracionMs);
    return () => clearTimeout(id);
  }, [duracionMs, enPausa, detenido, avanzar]);

  /* La duración real que manda Bunny sustituye a la de por defecto. */
  const alSaberDuracion = useCallback((segundos: number) => {
    setDuracionMs(Math.round(segundos * 1000));
  }, []);

  // ── Gestos ──────────────────────────────────────────────────────────────
  const inicio = useRef<{ x: number; y: number; t: number } | null>(null);
  const temporizadorPausa = useRef<ReturnType<typeof setTimeout> | null>(null);

  function alTocar(e: React.PointerEvent) {
    inicio.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    /* Mantener pulsado pausa, como en Instagram — pero solo si de verdad se
       mantiene: con una pausa inmediata, cada toque haría parpadear el video. */
    temporizadorPausa.current = setTimeout(() => setEnPausa(true), MS_PARA_PAUSAR);
  }

  function alSoltar(e: React.PointerEvent) {
    if (temporizadorPausa.current) clearTimeout(temporizadorPausa.current);
    const estabaEnPausa = enPausa;
    setEnPausa(false);

    const desde = inicio.current;
    inicio.current = null;
    if (!desde) return;

    const dx = e.clientX - desde.x;
    const dy = e.clientY - desde.y;

    /*
     * ⚠️ EL DESLIZAR SE MIRA ANTES QUE EL TOQUE, y el horizontal antes que el
     * vertical. Si no, un arrastre lateral largo se interpretaría como un toque
     * en el punto donde se soltó el dedo — y avanzaría cuando se quería volver.
     */
    if (Math.abs(dx) > MINIMO_PARA_DESLIZAR && Math.abs(dx) > Math.abs(dy)) {
      // Deslizar a la IZQUIERDA vuelve atrás: lo pidió Cristian así.
      if (dx < 0) retroceder();
      else avanzar();
      return;
    }

    // Deslizar hacia abajo cierra, como en Instagram.
    if (dy > MINIMO_PARA_DESLIZAR * 2 && Math.abs(dy) > Math.abs(dx)) {
      cerrar();
      return;
    }

    // Si estaba pausado, soltar solo reanuda: no cuenta como toque.
    if (estabaEnPausa) return;

    /*
     * Un toque: la mitad derecha avanza, la izquierda retrocede. Se mide contra
     * el ancho del VISOR y no de la ventana, porque en escritorio el visor es
     * una columna estrecha en el centro.
     */
    /*
     * ⚠️ UN TOQUE EN EL CENTRO DETIENE Y ENSEÑA LOS CONTROLES (2026-10-23,
     * pedido de Cristian); los bordes siguen pasando de cápsula. Antes toda la
     * pantalla avanzaba o retrocedía, y si el navegador arrancaba el video
     * mudo no había forma de activar el sonido.
     */
    const caja2 = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - caja2.left) / caja2.width;
    if (x > 0.7) avanzar();
    else if (x < 0.3) retroceder();
    else if (urlsDeVideo[capsulas[indice].id]) setDetenido(true);
  }

  function alTeclado(e: React.KeyboardEvent) {
    if (e.key === "Escape") return cerrar();
    if (e.key === "ArrowRight") return avanzar();
    if (e.key === "ArrowLeft") return retroceder();

    // Trampa de foco: Tab en el último vuelve al primero, y al revés.
    if (e.key === "Tab") {
      const focos = caja.current?.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focos?.length) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
  }

  if (!capsula) return null;
  const urlVideo = urlsDeVideo[capsula.id] ?? null;

  return (
    <div
      className="bg-espresso/90 fixed inset-0 z-(--z-modal) flex items-center justify-center backdrop-blur-sm"
      onKeyDown={alTeclado}
    >
      <div
        ref={caja}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Cápsula ${indice + 1} de ${capsulas.length}: ${capsula.titulo}`}
        className="bg-espresso relative flex w-full flex-col overflow-hidden outline-none select-none max-md:h-dvh md:h-[88vh] md:max-h-(--visor-alto) md:w-(--visor-ancho) md:rounded-(--radius-foto)"
      >
        {/* ── El fondo ─────────────────────────────────────────────────── */}
        <div className="bg-espresso absolute inset-0">
          {/*
            ⚠️ LA PORTADA SOLO SE PINTA SI NO HAY VIDEO. Antes iba siempre
            debajo, y se veía mal de dos formas a la vez:
              · Al abrir la cápsula aparecía la foto del bolso y un segundo
                después saltaba al video — dos imágenes distintas seguidas, con
                un corte muy visible justo al entrar.
              · Como el video no llena todo el alto, por los bordes asomaba la
                foto y quedaba marcada una línea donde acababa uno y empezaba
                la otra.

            Ahora el fondo es espresso liso: lo que sobra del encuadre se funde
            con el visor en vez de enseñar otra imagen. La portada sigue
            estando en los círculos del home, que es donde hace falta.
          */}
          {!urlVideo && capsula.portadaUrl && (
            <Image src={capsula.portadaUrl} alt="" fill sizes="380px" priority className="object-cover" />
          )}

          {urlVideo && (
            <VideoDeHistoria
              /* `key`: al cambiar de cápsula se monta un iframe NUEVO. Sin esto
                 Bunny reutilizaría el reproductor y seguiría el video anterior. */
              key={capsula.id}
              url={urlVideo}
              titulo={capsula.titulo}
              alSaberDuracion={alSaberDuracion}
              alTerminar={avanzar}
              detenido={detenido}
              alReanudar={reanudar}
              alCambiarMudo={setMudo}
              pedirSonido={pedirSonido}
            />
          )}

          {/* El texto blanco nunca va directo sobre la imagen. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(42,31,25,.60) 0%, rgba(42,31,25,0) 22%, rgba(42,31,25,0) 55%, rgba(42,31,25,.88) 100%)",
            }}
          />
        </div>

        {/*
          ⚠️ LA CAPA DE GESTOS VA SOBRE TODO Y OCUPA TODO, pero por DEBAJO de la
          cabecera y el pie (`z-10`), que llevan botones de verdad. Así el aspa
          de cerrar y el enlace del final siguen siendo pulsables y el resto de
          la pantalla avanza la historia.
        */}
        <div
          className={`absolute inset-0 z-[5] [touch-action:pan-y] ${detenido ? "pointer-events-none" : ""}`}
          onPointerDown={alTocar}
          onPointerUp={alSoltar}
          onPointerCancel={() => {
            if (temporizadorPausa.current) clearTimeout(temporizadorPausa.current);
            setEnPausa(false);
            inicio.current = null;
          }}
        />

        <header className="relative z-10 p-4">
          <BarraDeAvance
            total={capsulas.length}
            indice={indice}
            duracionMs={duracionMs}
            enPausa={enPausa || detenido}
          />

          <div className="mt-4 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="bg-cream flex size-9 shrink-0 items-center justify-center rounded-full"
            >
              <span className="font-display text-espresso text-base italic" style={{ fontWeight: 500, lineHeight: 1 }}>
                M
              </span>
            </span>
            <span className="flex-1 text-sm font-semibold text-white">
              Cápsula {indice + 1} de {capsulas.length}
            </span>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="flex size-11 items-center justify-center text-white [touch-action:manipulation]"
            >
              <X size={22} />
            </button>
          </div>
        </header>

        {/* El hueco del medio: lo ocupa el video. Solo se escribe si no lo hay. */}
        <div className="pointer-events-none relative z-10 flex flex-1 items-center justify-center">
          {!urlVideo && (
            <p className="bg-espresso/55 mx-6 rounded-[var(--radius-lg)] px-5 py-4 text-center text-sm text-white/80 backdrop-blur-sm">
              Estamos grabando este video. Mientras tanto, el bolso gratis ya está completo.
            </p>
          )}
        </div>

        {/* Arrancó mudo porque el navegador no dejó con sonido: se ofrece. Si
            ni así suena, tocar el video lo detiene y enseña el volumen de Bunny. */}
        {mudo && !detenido && pedirSonido === 0 && (
          <button
            type="button"
            onClick={() => setPedirSonido((n) => n + 1)}
            className="bg-cream text-espresso absolute top-24 right-4 z-10 flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold [touch-action:manipulation]"
          >
            <VolumeX size={16} aria-hidden="true" />
            Activar sonido
          </button>
        )}

        {/* Detenida: el pie se aparta para que se vean y se puedan tocar los
            controles de Bunny (play, barra, volumen), que quedan debajo. */}
        <footer
          className={`relative z-10 p-5 transition-opacity duration-200 ${
            detenido ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <h3
            className="font-display text-cream text-balance"
            style={{ fontWeight: 500, fontSize: "30px", lineHeight: 1.1 }}
          >
            {capsula.titulo}
          </h3>
          <p className="mt-1.5 text-sm text-white/75">{capsula.subtitulo}</p>

          <a
            href="#gratis"
            onClick={cerrar}
            className="bg-cream text-espresso mt-5 flex h-13 items-center justify-center rounded-full font-semibold"
          >
            Seguir con el bolso gratis
          </a>
        </footer>
      </div>
    </div>
  );
}
