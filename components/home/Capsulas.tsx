"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Entrada } from "@/components/home/Entrada";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";
import { VisorDeHistorias } from "@/components/home/historias/VisorDeHistorias";
import type { Capsula } from "@/lib/capsulas";

/** Dónde se recuerda qué cápsulas vio quien no tiene cuenta. */
const LLAVE = "mc_capsulas_vistas";

/**
 * Las cápsulas: UN componente, dos presentaciones.
 *
 * ⚠️ NO SON DOS COMPONENTES CON UN `hidden` CADA UNO. Los mismos datos, el
 * mismo visor y el mismo estado de "vistas"; lo único que cambia con el ancho
 * es cómo se dibuja la lista. Partirlo en dos habría significado mantener dos
 * veces la lógica de marcar visto — y que un día una mitad se enterara y la
 * otra no.
 *
 * Desde el home a color (2026-10-22) es UNA sola presentación: tarjetas
 * verticales, en rejilla en escritorio y en fila con scroll lateral en móvil.
 * Las historias circulares de móvil se fueron con la referencia nueva.
 */
type ContextoCapsulas = {
  capsulas: Capsula[];
  vistas: string[];
  abrir: (indice: number) => void;
};

const Contexto = createContext<ContextoCapsulas | null>(null);

function useCapsulas(): ContextoCapsulas {
  const c = useContext(Contexto);
  if (!c) throw new Error("Las cápsulas necesitan <ProveedorCapsulas> alrededor");
  return c;
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ UNA PRESENTACIÓN POR PANTALLA, UN SOLO ESTADO
 * ════════════════════════════════════════════════════════════════════════════
 * Hay dos componentes y cada uno manda en su tamaño:
 *
 *   · MÓVIL → `HistoriasCapsulas`: los círculos de arriba, que se leen como
 *     historias de Instagram. Es lo único que sale.
 *   · ESCRITORIO → `Capsulas`: las tarjetas bajo el banner. Los círculos están
 *     ocultos ahí.
 *
 * ⚠️ HASTA EL 2026-10-31 EN MÓVIL SALÍAN LAS DOS, una encima y otra debajo del
 * banner. Era el mismo contenido repetido en la misma pantalla; Cristian pidió
 * quitar las de abajo. Si alguien vuelve a enseñar las dos en móvil, está
 * reponiendo eso.
 *
 * Entre las dos va el banner, así que no pueden ser un solo componente — pero
 * sí comparten el estado: lo que ya vio, y el visor. Eso sigue importando
 * porque en el salto de móvil a escritorio (o al girar el teléfono) la persona
 * pasa de una presentación a la otra y no debe perder lo que llevaba visto.
 */
export function ProveedorCapsulas({
  capsulas,
  urlsDeVideo,
  children,
}: {
  capsulas: Capsula[];
  /*
   * ⚠️ LAS URLS LLEGAN YA FIRMADAS DESDE EL SERVIDOR. `BUNNY_TOKEN_KEY` no
   * puede bajar al navegador: con ella cualquiera generaría enlaces válidos
   * para todos los videos, incluidos los de pago.
   */
  urlsDeVideo: Record<string, string | null>;
  children: ReactNode;
}) {
  const [vistas, setVistas] = useState<string[]>([]);
  const [abierta, setAbierta] = useState<number | null>(null);

  /* En un efecto y no en el primer render: `localStorage` no existe en el
     servidor, y leerlo al pintar haría que el HTML del servidor y el del
     navegador no coincidan. */
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(LLAVE);
      if (guardado) setVistas(JSON.parse(guardado));
    } catch {
      // Modo incógnito o almacenamiento lleno: se vive sin recordar las vistas.
    }
  }, []);

  function marcarVista(id: string) {
    setVistas((previas) => {
      if (previas.includes(id)) return previas;
      const nuevas = [...previas, id];
      try {
        localStorage.setItem(LLAVE, JSON.stringify(nuevas));
      } catch {
        /* ver arriba */
      }
      return nuevas;
    });
  }

  return (
    <Contexto.Provider value={{ capsulas, vistas, abrir: setAbierta }}>
      {children}
      {abierta !== null && (
        <VisorDeHistorias
          capsulas={capsulas}
          indice={abierta}
          irA={setAbierta}
          marcarVista={marcarVista}
          cerrar={() => setAbierta(null)}
          urlsDeVideo={urlsDeVideo}
        />
      )}
    </Contexto.Provider>
  );
}

/**
 * Las historias en círculo, arriba del todo. Solo en móvil: el gesto ya lo
 * conoce cualquiera que use Instagram, y no hay que explicarlo. Vuelven el
 * 2026-10-23 (pedido de Cristian), además de las tarjetas de abajo.
 *
 * ⚠️ ANILLO DORADO LISO, SIN DEGRADADO: el home a color es plano. Sin ver,
 * anillo `--gold`; vista, `--line-strong` y la foto atenuada.
 */
export function HistoriasCapsulas() {
  const { capsulas, vistas, abrir } = useCapsulas();
  if (capsulas.length === 0) return null;

  return (
    <section aria-label="Cápsulas gratis, en historias" className="md:hidden">
      <ul className="sin-barra flex gap-4 overflow-x-auto px-5 pt-4 pb-2">
        {capsulas.map((c, i) => {
          const vista = vistas.includes(c.id);
          return (
            <li key={c.id} className="shrink-0">
              <button
                type="button"
                onClick={() => abrir(i)}
                aria-label={`Ver cápsula ${i + 1}: ${c.titulo}${vista ? " (vista)" : ""}`}
                className="flex w-19 flex-col items-center gap-2 [touch-action:manipulation]"
              >
                {/* 72px y CÍRCULO DE VERDAD: `aspect-square` + `shrink-0`,
                    porque con texto debajo una altura heredada lo vuelve óvalo. */}
                <span
                  aria-hidden="true"
                  className={`block aspect-square size-18 shrink-0 rounded-full border-[2.5px] p-[2.5px] ${
                    vista ? "border-line-strong" : "border-gold"
                  }`}
                >
                  <span className="bg-espresso relative block size-full overflow-hidden rounded-full">
                    <ImagenDeCapsula
                      miniatura={c.miniaturaUrl}
                      respaldo={c.portadaUrl}
                      sizes="72px"
                      className={`object-cover ${vista ? "opacity-70" : ""}`}
                    />
                  </span>
                </span>
                {/* Una palabra, en dorado: bajo un anillo dorado una etiqueta
                    negra rompe la unidad y se lee como texto de sistema. */}
                <span className="text-gold w-full truncate text-center text-xs font-semibold">
                  {c.etiquetaCorta}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Las tarjetas, debajo del banner. **Solo de escritorio.**
 *
 * ⚠️ EN MÓVIL NO SALEN (2026-10-31, decisión de Cristian). Hasta hoy las
 * cápsulas aparecían DOS veces en un móvil: los círculos de arriba, que se
 * leen como historias de Instagram, y otra vez estas tarjetas bajo el banner.
 * Era el mismo contenido dos veces en la misma pantalla: la segunda no añade
 * nada y alarga el camino al precio. En escritorio sí se quedan, porque allí
 * los círculos no existen (`HistoriasCapsulas` es `md:hidden`) y sin ellas el
 * home no enseñaría las cápsulas en ningún sitio.
 */
export function Capsulas() {
  const { capsulas, vistas, abrir } = useCapsulas();
  if (capsulas.length === 0) return null;

  return (
    /*
      El ancla `id="capsulas"` vive aquí. Hoy no la enlaza nadie; si algún día
      el menú la usa, ojo: en móvil este bloque está oculto y el ancla llevaría
      a algo que no se ve — ahí tendría que apuntar a las historias.
    */
    <div id="capsulas" className="hidden md:block">
      {/*
        ── Home a color (2026-10-22): UNA sola presentación, sobre espresso ──
        Hasta hoy en móvil eran historias circulares; la referencia nueva pide
        la misma tarjeta que en escritorio, en una fila con scroll lateral de
        tarjetas de 200px. Mismo visor y mismo estado de vistas.
      */}
      <section
        aria-label="Cápsulas gratis"
        className="bg-espresso sobre-oscuro grain-oscuro px-5 py-14 md:py-22"
      >
        <div className="mx-auto max-w-[1240px]">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <EyebrowLinea>Cápsulas gratis</EyebrowLinea>
              <h2 className="titulo-seccion mt-3">
                5 videos cortos para empezar <em className="clave">hoy</em>
              </h2>
              <p className="text-on-dark-muted mt-2">
                Sin crear cuenta. Tócalos en orden o salta al que necesites.
              </p>
            </div>
            <p className="bg-espresso-2 text-gold-pale cifra rounded-full px-4 py-2 text-sm font-semibold">
              {vistas.length} de {capsulas.length} vistas
            </p>
          </header>

          <ul className="sin-barra -mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:mx-0 md:mt-8 md:grid md:gap-4 md:overflow-visible md:px-0 md:[grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            {capsulas.map((c, i) => {
              const vista = vistas.includes(c.id);
              return (
                <li key={c.id} className="w-50 shrink-0 snap-start md:w-auto">
                  {/* 60ms entre tarjetas: lo justo para que se lea como una fila
                      que entra, sin que la última se haga esperar. */}
                  <Entrada retraso={Math.min(i, 4) * 0.06}>
                  <button
                    type="button"
                    onClick={() => abrir(i)}
                    /* Sin el borde dorado ni la sombra de antes: `--gold`
                       sobre espresso no pasa el contraste, y en la versión a
                       color la profundidad no viene de sombras. La vista se
                       marca con la etiqueta y la opacidad. */
                    className={`group bg-espresso-2 relative block w-full overflow-hidden rounded-(--radius-capsula) text-left transition-transform duration-200 hover:-translate-y-1 ${
                      vista ? "opacity-82" : ""
                    }`}
                    style={{ aspectRatio: "3 / 4.4" }}
                  >
                    <ImagenDeCapsula
                      miniatura={c.miniaturaUrl}
                      respaldo={c.portadaUrl}
                      sizes="(min-width: 768px) 240px, 200px"
                      className="object-cover"
                    />

                    {/* Degradado arriba Y abajo: sin él, el número y el título
                        quedan sobre la foto y con una portada clara desaparecen.
                        Es el único degradado que se queda en el home. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{ backgroundImage: "var(--capsula-degradado)" }}
                    />

                    <span
                      className="cifra text-gold-pale absolute top-3 left-4 text-sm font-semibold"
                    >
                      {String(c.orden).padStart(2, "0")}
                    </span>

                    {vista && (
                      <span className="bg-cream/90 text-espresso absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
                        Vista
                      </span>
                    )}

                    <span
                      aria-hidden="true"
                      className="bg-cream text-espresso absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                    >
                      <Play size={18} fill="currentColor" />
                    </span>

                    <span className="absolute inset-x-0 bottom-0 p-4">
                      <span
                        className="font-display text-cream block text-balance"
                        style={{ fontWeight: 500, fontSize: 22, lineHeight: 1.12 }}
                      >
                        {c.titulo}
                      </span>
                      <span className="text-on-dark-muted mt-1 block text-sm">{c.subtitulo}</span>
                    </span>
                  </button>
                  </Entrada>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

    </div>
  );
}

/**
 * La imagen de una cápsula: su propio fotograma, con red debajo.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ LA MINIATURA DE BUNNY FALLA EN DESARROLLO, Y HAY QUE PREVERLO
 * ════════════════════════════════════════════════════════════════════════════
 * Su CDN de IMÁGENES tiene SU PROPIA lista de dominios permitidos, distinta de
 * la del reproductor: en local devuelve 403 y en QA 200. Sin respaldo, los
 * cinco círculos se verían negros mientras se desarrolla — y el día que
 * alguien toque esa lista, también en producción.
 *
 * ⚠️ MANDA LA FOTO DEL BOLSO, NO EL FOTOGRAMA DEL VIDEO (2026-10-31, decisión
 * de Cristian). Hasta hoy era al revés: se pedía a Bunny un fotograma del
 * propio video y la foto quedaba de respaldo. Dos razones para darle la vuelta:
 *
 *   · Se veía peor. Un fotograma es un instante cualquiera de una grabación de
 *     manos trabajando —encuadre partido, mano borrosa, luz a medias—, y las
 *     fotos de los bolsos están hechas para enseñarse.
 *   · Se veía DISTINTO en cada sitio. El fotograma depende de una variable que
 *     QA no tenía, así que producción enseñaba una cosa y QA otra. Con la foto
 *     primero, las dos enseñan lo mismo siempre: es un archivo nuestro.
 *
 * El fotograma se conserva como alternativa por si algún día una cápsula se
 * queda sin foto; mientras haya foto, no se pide.
 *
 * `unoptimized` en el fotograma: viene de fuera de nuestro dominio y así no
 * hay que declarar el hostname de Bunny en la configuración de Next.
 */
function ImagenDeCapsula({
  miniatura,
  respaldo,
  sizes,
  className,
}: {
  /** El fotograma del video (Bunny). Solo se usa si no hay foto. */
  miniatura: string | null;
  /** La foto del bolso. Es la que manda. */
  respaldo: string | null;
  sizes: string;
  className: string;
}) {
  const [fallo, setFallo] = useState(false);
  /*
   * Se usa el fotograma SOLO si no hay foto, o si la foto no cargó. `fallo`
   * cubre las dos direcciones: sea cual sea la que esté puesta, si da error se
   * intenta la otra antes de dejar un hueco.
   */
  const usarMiniatura = (!respaldo || fallo) && Boolean(miniatura);
  const src = usarMiniatura ? miniatura : respaldo;

  if (!src) return null;

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      className={className}
      unoptimized={usarMiniatura}
      onError={() => setFallo(true)}
    />
  );
}
