"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
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
export function Capsulas({
  capsulas,
  urlsDeVideo,
}: {
  capsulas: Capsula[];
  /*
   * ⚠️ LAS URLS LLEGAN YA FIRMADAS DESDE EL SERVIDOR. `BUNNY_TOKEN_KEY` no
   * puede bajar al navegador: con ella cualquiera generaría enlaces válidos
   * para todos los videos, incluidos los de pago.
   */
  urlsDeVideo: Record<string, string | null>;
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

  if (capsulas.length === 0) return null;

  return (
    /*
      El ancla va en el envoltorio: `id="capsulas"` es a donde lleva el menú.
    */
    <div id="capsulas">
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
                    onClick={() => setAbierta(i)}
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
 * Al fallar se cae a `portada_url`, que es nuestra y siempre está. Mismo
 * patrón que `ReproductorEnSitio`, por el mismo motivo.
 *
 * `unoptimized` en la miniatura: viene de fuera de nuestro dominio y así no
 * hay que declarar el hostname de Bunny en la configuración de Next.
 */
function ImagenDeCapsula({
  miniatura,
  respaldo,
  sizes,
  className,
}: {
  miniatura: string | null;
  respaldo: string | null;
  sizes: string;
  className: string;
}) {
  const [fallo, setFallo] = useState(false);
  const usarMiniatura = Boolean(miniatura) && !fallo;
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
