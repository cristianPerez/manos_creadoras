import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonVisto } from "@/components/app/BotonVisto";
import { PanelLeccion } from "@/components/app/PanelLeccion";
import { Reproductor } from "@/components/app/Reproductor";
import { alumnaActual } from "@/lib/alumna";
import { obtenerBolso } from "@/lib/bolsos";
import { urlDeMiniatura, urlDelReproductor } from "@/lib/video";

type Props = { params: Promise<{ slug: string; orden: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bolso = await obtenerBolso(slug);
  return { title: bolso ? `${bolso.nombre} — Manos Creadoras` : "Manos Creadoras" };
}

export default async function Leccion({ params }: Props) {
  const { slug, orden: ordenTexto } = await params;
  const orden = Number(ordenTexto);
  const [bolso, alumna] = await Promise.all([obtenerBolso(slug), alumnaActual()]);

  if (!bolso || Number.isNaN(orden)) notFound();

  /* El 0 es el video de materiales, que no es una lección. */
  const esMateriales = orden === 0;
  const leccion = esMateriales ? null : bolso.lecciones.find((l) => l.orden === orden);
  if (!esMateriales && !leccion) notFound();

  /*
   * ⚠️ EL PORTERO ESTÁ AQUÍ, NO EN EL MENÚ. Esconder el enlace no protege nada:
   * cualquiera puede escribir la dirección. Esta comprobación es la que impide
   * que se entregue la URL firmada del video.
   */
  const bloqueado = !bolso.gratis && !alumna?.tieneAcceso;
  const videoId = esMateriales ? bolso.videoMaterialesId : leccion!.videoId;
  const urlVideo = bloqueado ? null : urlDelReproductor({ proveedor: "bunny", id: videoId });

  /* El póster que se ve antes de tocar: un fotograma del propio video. Si el
     CDN de imágenes de Bunny no lo sirve —tiene su propia lista de dominios y
     bloquea localhost—, el reproductor cae solo a la portada del bolso. */
  const poster = bloqueado || !videoId ? null : urlDeMiniatura(videoId);

  const visto = esMateriales ? bolso.materialesVisto : leccion!.vista;

  // Qué número de video es, contando el de materiales como el primero.
  const numeroVideo = esMateriales ? 1 : orden + 1;
  const paso = esMateriales ? null : bolso.pasos.find((p) => p.partes.some((x) => x.orden === orden));

  const anterior = numeroVideo > 1 ? orden - 1 : null;
  const siguiente = orden < bolso.lecciones.length ? orden + 1 : null;

  return (
    <main className="min-w-0 flex-1">
      <div className="border-line bg-cream/90 sticky top-0 z-(--z-sticky) border-b backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link
            href={`/app/bolsos/${bolso.slug}`}
            className="text-espresso flex min-w-0 items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft size={18} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{bolso.nombre}</span>
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-ink-muted text-sm whitespace-nowrap">
              Video {numeroVideo} de {bolso.videos}
            </span>
            <span className="bg-line h-1.5 w-32 overflow-hidden rounded-full">
              <span
                className="bg-gold block h-full rounded-full"
                style={{ width: `${Math.round((numeroVideo / bolso.videos) * 100)}%` }}
              />
            </span>
          </div>

          <Link
            href={`/app/ojo?bolso=${bolso.slug}${paso ? `&paso=${paso.numero}` : ""}`}
            className="text-gold flex shrink-0 items-center gap-2 text-sm font-semibold"
          >
            <Sparkles size={16} aria-hidden="true" />
            <span className="hidden md:inline">Ojo Experto</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Reproductor
            url={urlVideo}
            bloqueado={bloqueado}
            titulo={bolso.nombre}
            poster={poster}
            respaldo={bolso.portadaUrl}
          />

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">
                {bolso.nombre}
                {paso ? ` · Paso ${paso.numero} de ${bolso.pasos.length}` : ""}
              </p>
              <h1 className="titulo-seccion mt-2">
                {esMateriales ? "Materiales" : leccion!.titulo}
              </h1>
              {leccion?.parte && (
                <span className="bg-sand text-ink-body mt-3 inline-block rounded-full px-3 py-1.5 text-xs font-semibold">
                  Parte {leccion.parte}
                </span>
              )}
            </div>

            {!bloqueado && (
              <BotonVisto bolsoId={bolso.id} videoId={videoId} visto={visto} />
            )}
          </div>

          <nav className="border-line mt-8 flex flex-wrap justify-between gap-3 border-t pt-6">
            {anterior !== null ? (
              <Link
                href={`/app/bolsos/${bolso.slug}/${anterior}`}
                className="border-line text-espresso flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Anterior
              </Link>
            ) : (
              <span />
            )}

            {siguiente !== null ? (
              <Link
                href={`/app/bolsos/${bolso.slug}/${siguiente}`}
                className="border-line text-espresso flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold"
              >
                Siguiente
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : (
              /* El último video no manda al siguiente: cierra el bolso y vuelve
                 a la ficha, que es donde se ve lo que acaba de terminar. */
              <Link
                href={`/app/bolsos/${bolso.slug}?terminado=1`}
                className="text-espresso flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold"
                style={{ backgroundImage: "var(--boton-dorado)" }}
              >
                Terminar el bolso
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </nav>
        </div>

        <PanelLeccion bolso={bolso} ordenActual={orden} paso={paso?.numero ?? null} />
      </div>
    </main>
  );
}
