"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Entrada } from "@/components/home/Entrada";
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
 * En escritorio son tarjetas verticales porque hay sitio para que se vean las
 * cinco a la vez. En móvil son historias circulares: el gesto ya lo conoce
 * cualquiera que use Instagram, y no hay que explicarlo.
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
      ⚠️ EL ANCLA VA EN EL ENVOLTORIO, NO EN CADA PRESENTACIÓN. Son dos bloques
      —el de móvil y el de escritorio— y poner `id="capsulas"` en los dos daría
      HTML inválido con el ancla duplicada: el navegador saltaría al primero, que
      en escritorio está oculto, y el enlace del menú no llevaría a ningún sitio.
    */
    <div id="capsulas">
      {/* ── Móvil: historias circulares, pegadas al borde ── */}
      <section aria-label="Cápsulas gratis" className="md:hidden">
        <ul className="flex gap-4 overflow-x-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {capsulas.map((c, i) => {
            const vista = vistas.includes(c.id);
            return (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setAbierta(i)}
                  className="flex w-19 flex-col items-center gap-2 [touch-action:manipulation]"
                >
                  {/*
                    El anillo: 72px y CÍRCULO DE VERDAD. `aspect-square` +
                    `shrink-0` porque dentro de un flex con texto debajo, una
                    altura heredada lo convierte en óvalo — que es exactamente
                    lo que delata una historia mal hecha.
                  */}
                  <span
                    aria-hidden="true"
                    className="block size-18 shrink-0 rounded-full p-[2.5px]"
                    style={{
                      aspectRatio: "1",
                      backgroundImage: vista ? "none" : "var(--anillo-historia)",
                      backgroundColor: vista ? "var(--punto-inactivo)" : undefined,
                    }}
                  >
                    <span className="border-cream bg-espresso relative block size-full overflow-hidden rounded-full border-[2.5px]">
                      {c.portadaUrl && (
                        <Image
                          src={c.portadaUrl}
                          alt=""
                          fill
                          sizes="72px"
                          className={`object-cover ${vista ? "opacity-70" : ""}`}
                        />
                      )}
                    </span>
                  </span>

                  {/* ⚠️ DORADO, NUNCA NEGRO: bajo un anillo dorado, una etiqueta
                      negra rompe la unidad y se lee como texto de sistema. */}
                  <span className="text-gold w-full truncate text-center text-xs font-bold">
                    {c.etiquetaCorta}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Escritorio: tarjetas verticales ── */}
      <section aria-label="Cápsulas gratis" className="max-md:hidden px-5 py-10 md:py-12">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Cápsulas gratis</p>
              <h2
                className="font-display text-espresso mt-2"
                style={{ fontWeight: 500, fontSize: "clamp(32px, 3.6vw, 46px)", lineHeight: 1.08 }}
              >
                5 videos cortos para empezar hoy
              </h2>
              <p className="text-ink-body mt-2">
                Sin crear cuenta. Tócalos en orden o salta al que necesites.
              </p>
            </div>
            <p className="text-ink-muted text-sm">
              <strong className="text-espresso font-semibold">{vistas.length}</strong> de{" "}
              {capsulas.length} vistas
            </p>
          </header>

          <ul className="mt-8 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {capsulas.map((c, i) => {
              const vista = vistas.includes(c.id);
              return (
                <li key={c.id}>
                  {/* 60ms entre tarjetas: lo justo para que se lea como una fila
                      que entra, sin que la última se haga esperar. */}
                  <Entrada retraso={Math.min(i, 4) * 0.06}>
                  <button
                    type="button"
                    onClick={() => setAbierta(i)}
                    className={`group bg-espresso relative block w-full overflow-hidden rounded-(--radius-capsula) text-left transition-transform duration-200 hover:-translate-y-1 ${
                      vista ? "border-sand border-2 opacity-82" : "border-gold border-2 shadow-lg"
                    }`}
                    style={{ aspectRatio: "3 / 4.4" }}
                  >
                    {c.portadaUrl && (
                      <Image
                        src={c.portadaUrl}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 240px, 50vw"
                        className="object-cover"
                      />
                    )}

                    {/* Degradado arriba Y abajo: sin él, el número y el título
                        quedan sobre la foto y con una portada clara desaparecen. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(to bottom, rgba(42,31,25,.55) 0%, rgba(42,31,25,0) 32%, rgba(42,31,25,0) 45%, rgba(42,31,25,.82) 100%)",
                      }}
                    />

                    {/* El número con fondo: sobre una portada clara, el dorado
                        solo no se lee. */}
                    <span className="bg-espresso/60 absolute top-3 left-3 rounded-full px-2.5 py-1">
                      <span
                        className="font-display text-gold-light block text-sm italic"
                        style={{ fontWeight: 500, lineHeight: 1 }}
                      >
                        {String(c.orden).padStart(2, "0")}
                      </span>
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
                        className="font-display text-cream block text-xl text-balance"
                        style={{ fontWeight: 500, lineHeight: 1.12 }}
                      >
                        {c.titulo}
                      </span>
                      <span className="mt-1 block text-sm text-white/70">{c.subtitulo}</span>
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
