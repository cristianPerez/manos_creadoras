import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  FichaBolso,
  type FilaFicha,
  type VideoFicha,
} from "@/components/app/FichaBolso";
import { BannerPlan } from "@/components/app/BannerPlan";
import { alumnaActual } from "@/lib/alumna";
import { enlacesDeCobro } from "@/lib/checkout";
import {
  esLlavero,
  listarBolsos,
  medidasEnTexto,
  medidasOrdenadas,
  obtenerBolso,
  siguienteVideo,
} from "@/lib/bolsos";
import { precioDesde } from "@/lib/planes";
import { urlDeMiniatura, urlDelReproductor } from "@/lib/video";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bolso = await obtenerBolso(slug);
  return {
    title: bolso ? `${bolso.nombre} — Manos Creadoras` : "Manos Creadoras",
  };
}

export default async function Ficha({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [bolso, alumna, cobro] = await Promise.all([
    obtenerBolso(slug),
    alumnaActual(),
    enlacesDeCobro(),
  ]);

  if (!bolso) notFound();

  /*
   * ⚠️ EL PORTERO SIGUE AQUÍ, EN EL SERVIDOR. Sin acceso no se firma ninguna
   * URL de video: la ficha recibe `url: null` y el reproductor dice que hace
   * falta el plan. Esconderlo en el navegador no protegería nada.
   */
  const bloqueado = !bolso.gratis && !alumna?.tieneAcceso;
  /* Los totales del banner (bolsos, llaveros, el gratis): solo hacen falta si
     hay que enseñar la oferta. */
  const catalogo = bloqueado ? await listarBolsos() : null;
  const siguiente = siguienteVideo(bolso);
  const medidas = medidasEnTexto(bolso.medidas);

  const firmar = (videoId: string) =>
    bloqueado || !videoId
      ? null
      : urlDelReproductor({ proveedor: "bunny", id: videoId });
  const miniatura = (videoId: string) =>
    bloqueado || !videoId ? null : urlDeMiniatura(videoId);

  /* Todos los videos del bolso en orden: materiales (0) y cada parte de cada
     paso. La ficha elige cuál se carga sin salir de la página. */
  const videos: VideoFicha[] = [
    {
      orden: 0,
      videoId: bolso.videoMaterialesId,
      titulo: "Materiales",
      paso: null,
      parte: null,
      visto: bolso.materialesVisto,
      url: firmar(bolso.videoMaterialesId),
      poster: miniatura(bolso.videoMaterialesId),
    },
    ...bolso.pasos.flatMap((p) =>
      p.partes.map((l) => ({
        orden: l.orden,
        videoId: l.videoId,
        titulo: p.titulo,
        paso: p.numero,
        parte: p.partes.length > 1 ? l.parte : null,
        visto: l.vista,
        url: firmar(l.videoId),
        poster: miniatura(l.videoId),
      })),
    ),
  ];

  const filas: FilaFicha[] = [
    {
      numero: null,
      titulo: "Materiales",
      ordenes: [0],
      completado: bolso.materialesVisto,
    },
    ...bolso.pasos.map((p) => ({
      numero: p.numero,
      titulo: p.titulo,
      ordenes: p.partes.map((l) => l.orden),
      completado: p.completado,
    })),
  ];

  /* Un llavero no tiene pasos (es un solo video): "0 pasos" sobra. Y "1
     videos" se lee como un error. */
  const meta = [
    bolso.pasos.length > 0
      ? `${bolso.pasos.length} ${bolso.pasos.length === 1 ? "paso" : "pasos"}`
      : null,
    `${bolso.videos} ${bolso.videos === 1 ? "video" : "videos"}`,
    medidas,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <FichaBolso
      slug={bolso.slug}
      nombre={bolso.nombre}
      gratis={bolso.gratis}
      bloqueado={bloqueado}
      bolsoId={bolso.id}
      portadaUrl={bolso.portadaUrl}
      meta={meta}
      videos={videos}
      filas={filas}
      ordenInicial={siguiente?.orden ?? 0}
      totalPasos={bolso.pasos.length}
      pago={
        /*
          Bloqueado: se enseña TODO el índice —pasos, materiales, medidas— y
          solo se retiene el video. El banner es el MISMO de Mis bolsos
          (`BannerPlan`, pedido de Cristian 2026-10-23): una sola oferta.
        */
        catalogo && (
          <BannerPlan
            gratisNombre={catalogo.find((b) => b.gratis)?.nombre ?? null}
            bolsos={catalogo.filter((b) => !esLlavero(b)).length}
            llaveros={catalogo.filter(esLlavero).length}
            desde={precioDesde()}
            enlaces={cobro.url}
            origen="ficha_bolso"
          />
        )
      }
      materiales={bolso.materiales}
      medidas={medidasOrdenadas(bolso.medidas)}
    />
  );
}
