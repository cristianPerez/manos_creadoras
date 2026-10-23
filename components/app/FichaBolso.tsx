"use client";

import { ArrowLeft, Check, ChevronRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { AccesoMateriales } from "@/components/app/AccesoMateriales";
import { MaterialesDelBolso } from "@/components/app/MaterialesDelBolso";
import type { Material } from "@/lib/bolsos-logica";
import { BotonVisto } from "@/components/app/BotonVisto";
import { Reproductor } from "@/components/app/Reproductor";
import { ReproductorEnSitio } from "@/components/home/ReproductorEnSitio";

/**
 * Un video de la ficha, ya resuelto en el servidor.
 *
 * `url` llega FIRMADA desde la página y SOLO si la alumna puede verlo: el
 * portero sigue en el servidor (`bloqueado`), aquí nunca se decide quién mira.
 */
export type VideoFicha = {
  orden: number;
  videoId: string;
  titulo: string;
  /** null = el video de materiales, que no es un paso. */
  paso: number | null;
  /** "1 de 2" cuando el paso se partió en varios videos. */
  parte: string | null;
  visto: boolean;
  url: string | null;
  poster: string | null;
};

/** Una fila del "Paso a paso": materiales o un paso, con sus videos. */
export type FilaFicha = {
  /** null = materiales. */
  numero: number | null;
  titulo: string;
  ordenes: number[];
  completado: boolean;
};

/**
 * ════════════════════════════════════════════════════════════════════════════
 * LA FICHA DEL BOLSO CON EL VIDEO DENTRO (app interna, 2026-10-23)
 * ════════════════════════════════════════════════════════════════════════════
 * Pedido de Cristian con la referencia `design-ref/app-interna-claude-code/
 * 02-ficha-bolso.png`: el video se ve AQUÍ, y el "Paso a paso" de al lado
 * cambia qué video está cargado — como el curso gratis del home. Antes cada
 * paso abría su propia página y había que ir y volver para seguir el bolso.
 *
 * ⚠️ LO QUE NO CAMBIÓ: quién puede ver (el servidor firma la URL solo si hay
 * acceso), cómo se guarda el avance (el mismo `BotonVisto`, que refresca la
 * página al marcar) y las páginas de cada paso, que siguen existiendo para
 * los enlaces que ya apuntan a ellas.
 */
export function FichaBolso({
  slug,
  nombre,
  gratis,
  bloqueado,
  bolsoId,
  portadaUrl,
  meta,
  videos,
  filas,
  ordenInicial,
  totalPasos,
  pago,
  materiales,
  medidas,
}: {
  slug: string;
  nombre: string;
  gratis: boolean;
  bloqueado: boolean;
  bolsoId: string;
  portadaUrl: string | null;
  /** "5 pasos · 6 videos · 19 × 12 × 5 cm" */
  meta: string;
  videos: VideoFicha[];
  filas: FilaFicha[];
  ordenInicial: number;
  totalPasos: number;
  /** El banner café de pago (`BannerPlan`) cuando el bolso viene con el plan. */
  pago: ReactNode;
  materiales: Material[];
  /** `[clave, valor]` en cm, ya ordenadas. */
  medidas: [string, number][];
}) {
  const [orden, setOrden] = useState(ordenInicial);
  /* Sube en cada elección: al elegir otro video, el reproductor se monta de
     nuevo y arranca solo (ella acaba de tocar, así que puede sonar). Al
     abrir la ficha NO arranca: nadie ha pedido todavía que suene nada. */
  const [arranque, setArranque] = useState(0);
  const [viendo, setViendo] = useState(false);

  const actual = videos.find((v) => v.orden === orden) ?? videos[0];
  const indice = videos.indexOf(actual);
  const siguiente = videos[indice + 1] ?? null;
  const vistos = videos.filter((v) => v.visto).length;
  const pct = videos.length > 0 ? Math.round((vistos / videos.length) * 100) : 0;

  /*
   * ⚠️ ELEGIR UN PASO = VERLO (2026-10-23, pedido de Cristian). El video
   * arranca solo —con sonido; el reproductor cae a mudo si el navegador no
   * deja— y la pantalla sube hasta él. En móvil el paso a paso queda DEBAJO
   * del video, así que sin el scroll se tocaba un paso y no pasaba nada a la
   * vista. `scroll-mt` deja el video justo bajo la barra fija de arriba.
   */
  const cajaVideo = useRef<HTMLDivElement>(null);
  function ver(o: number) {
    setOrden(o);
    setViendo(false);
    setArranque((n) => n + 1);
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cajaVideo.current?.scrollIntoView({ behavior: quieto ? "auto" : "smooth", block: "start" });
  }

  const etiquetaPaso =
    actual.paso === null
      ? `Paso 0 de ${totalPasos} · Materiales`
      : `Paso ${actual.paso} de ${totalPasos} · ${actual.titulo}${actual.parte ? ` · parte ${actual.parte}` : ""}`;

  /* "Siguiente paso" cuando el próximo video es de otro paso; "Siguiente
     parte" cuando sigue dentro del mismo. */
  const textoSiguiente =
    siguiente && siguiente.paso !== null && siguiente.paso === actual.paso
      ? "Siguiente parte"
      : "Siguiente paso";

  const enlaceOjo = `/app/ojo?bolso=${slug}${actual.paso ? `&paso=${actual.paso}` : ""}`;

  const palabras = nombre.trim().split(/\s+/);
  const titulo =
    palabras.length === 2 ? (
      <>
        {palabras[0]} <em className="clave">{palabras[1]}</em>
      </>
    ) : (
      nombre
    );

  const chip = gratis ? (
    <span className="bg-gold-pale text-espresso shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold">
      Gratis
    </span>
  ) : (
    <span className="bg-espresso text-gold-pale shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold">
      Con plan
    </span>
  );

  const barra = (
    <span className="bg-sand-hover block h-1.5 flex-1 overflow-hidden rounded-full">
      <span className="bg-cacao block h-full rounded-full" style={{ width: `${pct}%` }} />
    </span>
  );

  return (
    <main className="min-w-0 flex-1">
      {/* ── Móvil: volver y preguntar al Ojo ── */}
      <div className="border-line bg-cream sticky top-0 z-(--z-sticky) flex h-15 items-center justify-between gap-3 border-b px-3 lg:hidden">
        <Link href="/app" className="text-espresso flex h-11 items-center gap-1.5 px-1 font-medium">
          <ArrowLeft size={20} aria-hidden="true" />
          Mis bolsos
        </Link>
        <Link
          href={enlaceOjo}
          className="bg-sand text-espresso flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold"
        >
          <Sparkles size={16} className="text-gold" aria-hidden="true" />
          Preguntar al Ojo
        </Link>
      </div>

      <div className="mx-auto max-w-310 lg:px-8 lg:py-8">
        {/* ── Escritorio: volver, título y datos en una fila ── */}
        <header className="mb-6 hidden items-center gap-4 lg:flex">
          <Link
            href="/app"
            aria-label="Volver a mis bolsos"
            className="border-line-strong text-espresso flex size-11 shrink-0 items-center justify-center rounded-full border"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </Link>
          <h1
            className="font-display text-espresso min-w-0 truncate"
            style={{ fontWeight: 500, fontSize: "clamp(40px, 3.6vw, 52px)", lineHeight: 1.05 }}
          >
            {titulo}
          </h1>
          {chip}
          <p className="text-ink-body ml-auto shrink-0 text-sm">{meta}</p>
        </header>

        {/* Dos columnas desde 1280 y no desde 1024: con la barra lateral de la
            app (260px), a 1024 el video quedaba de 300px al lado del paso a
            paso. Entre medias se apila, como en móvil. */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
          {/* ── El video y lo que va con él ── */}
          <div className="min-w-0">
            <div
              ref={cajaVideo}
              className="relative scroll-mt-15 overflow-hidden lg:scroll-mt-21 lg:rounded-(--radius-foto)"
            >
              {actual.url ? (
                <div className="bg-espresso aspect-video">
                  <ReproductorEnSitio
                    key={`${actual.orden}-${arranque}`}
                    url={actual.url}
                    poster={actual.poster}
                    respaldo={portadaUrl}
                    titulo={`${nombre} · ${actual.titulo}`}
                    arrancarAlMontar={arranque > 0}
                    onReproduciendo={setViendo}
                    className="size-full"
                  />
                </div>
              ) : (
                <Reproductor url={null} bloqueado={bloqueado} titulo={nombre} />
              )}

              <span
                className={`bg-espresso text-cream pointer-events-none absolute top-4 left-4 max-w-[80%] truncate rounded-full px-3.5 py-1.5 text-sm font-medium transition-opacity duration-300 ${
                  viendo ? "opacity-0" : "opacity-100"
                }`}
              >
                {etiquetaPaso}
              </span>
            </div>

            <div className="px-5 lg:px-0">
              {/* ── Móvil: título, datos y avance ── */}
              <div className="mt-5 lg:hidden">
                <div className="flex flex-wrap items-center gap-3">
                  <h1
                    className="font-display text-espresso"
                    style={{ fontWeight: 500, fontSize: 38, lineHeight: 1.05 }}
                  >
                    {titulo}
                  </h1>
                  {chip}
                </div>
                <p className="text-ink-body mt-2">{meta}</p>
                <div className="mt-4 flex items-center gap-4">
                  {barra}
                  <span className="text-ink-body cifra shrink-0 text-sm">
                    {vistos} de {videos.length}
                  </span>
                </div>
              </div>

              {/* ── El paso que se está viendo ── */}
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0 max-lg:hidden">
                  <p className="eyebrow">
                    {actual.paso === null
                      ? "Antes de empezar"
                      : `Paso ${actual.paso} de ${totalPasos}${actual.parte ? ` · parte ${actual.parte}` : ""}`}
                  </p>
                  <h2
                    className="font-display text-espresso mt-1"
                    style={{ fontWeight: 500, fontSize: 32, lineHeight: 1.1 }}
                  >
                    {actual.titulo}
                  </h2>
                </div>

                {bloqueado ? null : (
                  <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
                    <BotonVisto
                      key={actual.videoId}
                      bolsoId={bolsoId}
                      videoId={actual.videoId}
                      visto={actual.visto}
                    />
                    <Link
                      href={enlaceOjo}
                      className="border-line-strong text-espresso hidden h-13 items-center justify-center gap-2 rounded-full border px-6 font-semibold lg:flex"
                    >
                      <Sparkles size={16} className="text-gold" aria-hidden="true" />
                      Preguntar al Ojo
                    </Link>
                    {siguiente && (
                      <button
                        type="button"
                        onClick={() => ver(siguiente.orden)}
                        className="bg-cacao text-ivory flex h-14 items-center justify-center gap-2 rounded-full px-6 font-semibold transition-transform active:scale-[0.98] lg:h-13"
                      >
                        <span className="lg:hidden">
                          {textoSiguiente}: {siguiente.titulo}
                        </span>
                        <span className="max-lg:hidden">{textoSiguiente}</span>
                        <ChevronRight size={18} className="max-lg:hidden" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {bloqueado && <div className="mt-5">{pago}</div>}

              {/* Hasta 1280 el paso a paso va antes que los materiales: es lo
                  que se viene a hacer. Desde 1280 está en la columna derecha. */}
              <div className="mt-6 xl:hidden">
                <PasoAPasoFicha filas={filas} videos={videos} orden={orden} ver={ver} />
              </div>

              {/*
                ⚠️ LOS MATERIALES, SOLO EN SU PASO (2026-10-23). En el de
                Materiales va la lista completa; en los demás, una fila que la
                abre en un panel sin salir del paso — repetir el bloque entero
                debajo de cada video le quitaba protagonismo al video.
              */}
              <div className="mt-6 pb-8 lg:pb-0">
                {actual.paso === null ? (
                  <MaterialesDelBolso materiales={materiales} medidas={medidas} variante="completa" />
                ) : (
                  <AccesoMateriales
                    materiales={materiales}
                    medidas={medidas}
                    irAMateriales={() => ver(0)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Escritorio: el paso a paso, a la derecha ── */}
          <aside className="bg-sand self-start rounded-(--radius-foto) p-6 max-xl:hidden">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-espresso text-3xl" style={{ fontWeight: 500 }}>
                Paso a paso
              </h2>
              <span className="text-ink-body cifra text-sm">
                {vistos} de {videos.length}
              </span>
            </div>
            <div className="mt-4 flex">{barra}</div>
            <div className="mt-5">
              <PasoAPasoFicha filas={filas} videos={videos} orden={orden} ver={ver} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/**
 * Las filas del paso a paso. Botones, no enlaces: cambian el video de arriba
 * sin salir de la ficha. "Materiales" va primero y sin número (ver la nota en
 * `PasoAPaso.tsx`: no es el paso 0, es lo de antes de empezar).
 */
function PasoAPasoFicha({
  filas,
  videos,
  orden,
  ver,
}: {
  filas: FilaFicha[];
  videos: VideoFicha[];
  orden: number;
  ver: (o: number) => void;
}) {
  return (
    <ol className="flex flex-col gap-2.5">
      {filas.map((f) => {
        const activa = f.ordenes.includes(orden);
        const partes = f.ordenes.length;
        const pie = activa
          ? `Viendo ahora · ${partes} ${partes === 1 ? "video" : "videos"}`
          : `${f.completado ? "Visto · " : ""}${partes} ${partes === 1 ? "video" : "videos"}`;
        return (
          <li key={f.numero ?? "materiales"}>
            <div
              className={`rounded-md transition-colors ${
                activa ? "bg-espresso" : "bg-ivory border-line border"
              }`}
            >
              <button
                type="button"
                onClick={() => ver(f.ordenes[0])}
                aria-current={activa ? "step" : undefined}
                className="flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left [touch-action:manipulation]"
              >
                <span
                  aria-hidden="true"
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    activa
                      ? "bg-gold-pale text-espresso"
                      : f.completado
                        ? "bg-cacao text-gold-pale"
                        : "bg-sand text-cacao"
                  }`}
                >
                  {activa ? (
                    <Play size={13} fill="currentColor" />
                  ) : f.completado ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    (f.numero ?? <Play size={13} fill="currentColor" />)
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block font-medium ${activa ? "text-cream" : "text-espresso"}`}>
                    {f.titulo}
                  </span>
                  <span className={`block text-sm ${activa ? "text-on-dark-muted" : "text-ink-muted"}`}>
                    {pie}
                  </span>
                </span>
              </button>

              {/* Un paso partido en varios videos: sus partes, dentro de la
                  misma fila. Para quien teje, la base es UNA cosa aunque el
                  video se cortara por la mitad. */}
              {activa && partes > 1 && (
                <ul className="flex flex-wrap gap-2 px-4 pb-4 pl-18">
                  {f.ordenes.map((o, i) => {
                    const v = videos.find((x) => x.orden === o);
                    return (
                      <li key={o}>
                        <button
                          type="button"
                          onClick={() => ver(o)}
                          className={`flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ${
                            o === orden ? "bg-gold-pale text-espresso" : "text-on-dark-muted border-espresso-line border"
                          }`}
                        >
                          Parte {i + 1}
                          {v?.visto && <Check size={13} strokeWidth={3} aria-label="vista" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
