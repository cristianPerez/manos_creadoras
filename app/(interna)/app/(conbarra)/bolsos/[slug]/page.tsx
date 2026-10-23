import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FichaBolso,
  type FilaFicha,
  type VideoFicha,
} from "@/components/app/FichaBolso";
import { ListaMateriales } from "@/components/app/ListaMateriales";
import { PagoConPlan } from "@/components/app/PagoConPlan";
import { alumnaActual } from "@/lib/alumna";
import { enlacesDeCobro } from "@/lib/checkout";
import {
  esLlavero,
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
        bloqueado && (
          /*
          Bloqueado: se enseña TODO el índice —cuántos pasos, qué materiales,
          las medidas— y solo se retiene el video. Es lo que hace que valga la
          pena pagar: ya sabes exactamente qué recibes. Desde el 2026-10-21
          lleva a PAGAR, anual por defecto con el selector a mensual.
        */
          <div className="bg-sand rounded-(--radius-lg) p-5">
            <p className="text-espresso font-semibold">
              Este {esLlavero(bolso) ? "llavero" : "bolso"} viene con el plan
            </p>
            <p className="text-ink-body mt-1 text-sm">
              Puedes ver sus pasos y sus materiales. Para los videos necesitas
              el plan, desde {precioDesde()} al mes.
            </p>
            <div className="mt-4">
              <PagoConPlan enlaces={cobro.url} origen="ficha_bolso" />
            </div>
          </div>
        )
      }
      materiales={
        <ListaMateriales
          materiales={bolso.materiales}
          aparte={
            <>
              {medidas && (
                <dl className="flex justify-between gap-4">
                  {medidasOrdenadas(bolso.medidas).map(([clave, valor]) => (
                    <div key={clave} className="text-center">
                      <dd
                        className="font-display text-gold-pale"
                        style={{ fontWeight: 500, fontSize: 30, lineHeight: 1 }}
                      >
                        {String(valor).replace(".", ",")}
                      </dd>
                      <dt className="text-on-dark-muted mt-1 text-xs">
                        {etiquetaMedida(clave)}
                      </dt>
                    </div>
                  ))}
                </dl>
              )}
              <Link
                href="/app/directorio"
                className="bg-gold-pale text-espresso mt-auto flex h-13 items-center justify-center rounded-full px-6 font-semibold transition-transform active:scale-[0.98]"
              >
                Ver en el directorio
              </Link>
            </>
          }
        />
      }
    />
  );
}

/** `alto_con_asa` → "alto con asa". Las claves vienen del JSON y varían por bolso. */
function etiquetaMedida(clave: string): string {
  return clave.replace(/_/g, " ");
}
