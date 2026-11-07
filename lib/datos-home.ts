import "server-only";
import { agruparEnPasos, listarBolsos, obtenerBolso, ordenCatalogo } from "@/lib/bolsos";
import { listarCapsulas } from "@/lib/capsulas";
import { enlacesDeCobro } from "@/lib/checkout";
import { preciosDeLaPagina } from "@/lib/precios";
import { urlDeMiniatura, urlDelReproductor } from "@/lib/video";

/**
 * Los datos del home, cargados una sola vez en el servidor.
 *
 * Nació con el A/B de paleta (2026-11-05), cuando había dos homes que tenían
 * que enseñar exactamente lo mismo. Desde el 2026-11-07 hay uno solo (el
 * morado), pero las consultas siguen aquí y no en la página.
 */

/** Una foto del carrusel del héroe. */
export type FotoHero = { slug: string; nombre: string; subtitulo: string; url: string };

/** Un paso del bolso gratis (0 = materiales). */
export type PasoGratis = {
  orden: number;
  numero: number | null;
  titulo: string;
  descripcion: string;
  /** La URL FIRMADA del embed. La firma el servidor; la clave nunca baja aquí. */
  urlVideo: string | null;
  /** La miniatura que genera Bunny del propio video. */
  poster: string | null;
};

/**
 * Los subtítulos del carrusel. Describen la TÉCNICA, no el bolso.
 *
 * ⚠️ VIVEN AQUÍ Y NO EN LA BASE a propósito: son copy de la página de ventas,
 * no un dato del producto. "Bandolera de perlas" es cómo se vende Gota de Rocío
 * en el banner; dentro de la app el mismo bolso se describe por sus medidas y
 * sus pasos. Mezclarlos obligaría a que un cambio de copy pasara por una
 * migración.
 */
/* El orden de este objeto ES el orden del carrusel (detrás del bolso gratis
   y de la vela, que pone `PortadaB` delante). */
const SUBTITULOS_B: Record<string, string> = {
  "anillos-de-seda": "Asa de perlas y anillos",
  boho: "Cuentas de 10 mm",
  "gota-de-rocio": "Bandolera de perlas",
  "marfil-elegante": "Perla marfil",
};
const ORDEN_CARRUSEL_B = Object.keys(SUBTITULOS_B);

export type DatosHome = Awaited<ReturnType<typeof cargarDatosHome>>;

export async function cargarDatosHome() {
  const pr = await preciosDeLaPagina();
  const [bolsos, capsulas, cobro] = await Promise.all([
    listarBolsos(),
    listarCapsulas(),
    enlacesDeCobro(),
  ]);

  /* Las dos cifras del curso, calculadas UNA vez y pasadas a todas las
     secciones que las dicen (banda, Elizabeth, precio, cierre). Antes cada
     una sumaba por su cuenta, y así es como una dice 14 y otra 16. */
  // Todo el catálogo cuenta: la membresía son proyectos, no solo bolsos.
  const totalProyectos = bolsos.length;
  const totalVideos = bolsos.reduce((s, b) => s + b.videos, 0);

  const porSlug = new Map(bolsos.map((b) => [b.slug, b]));
  /* El carrusel del héroe: el bolso gratis y la vela los pone `PortadaB` delante. */
  const fotosB: FotoHero[] = ORDEN_CARRUSEL_B.flatMap((slug) => {
    const b = porSlug.get(slug);
    if (!b?.portadaUrl) return [];
    return [{ slug, nombre: b.nombre, subtitulo: SUBTITULOS_B[slug], url: b.portadaUrl }];
  });

  /* El bolso gratis sale de la BASE (`gratis = true`), no de un slug escrito
     aquí: el día que el regalo sea otro bolso, esta sección lo sigue sola. */
  const gratisBreve = ordenCatalogo(bolsos).find((b) => b.gratis) ?? null;
  const gratis = gratisBreve ? await obtenerBolso(gratisBreve.slug) : null;

  /*
   * ⚠️ LAS URLS SE FIRMAN AQUÍ, EN EL SERVIDOR. `BUNNY_TOKEN_KEY` no puede bajar
   * al navegador: con ella cualquiera generaría enlaces válidos para los 87
   * videos, incluidos los de pago. Lo que viaja al cliente es la URL ya firmada
   * y caducable, nunca la clave.
   *
   * Esta página es dinámica (ƒ), así que cada visita genera firmas nuevas. Si
   * algún día se cacheara, habría que recordar que caducan a las 6 horas.
   */
  const videoFirmado = (id: string) => urlDelReproductor({ proveedor: "bunny", id });

  /*
   * Las cápsulas, firmadas por id. Se hace aquí por el mismo motivo que los
   * pasos del bolso gratis: la clave de Bunny vive en el servidor y lo único
   * que viaja al navegador es el enlace ya firmado, que además caduca.
   */
  const urlsDeCapsulas = Object.fromEntries(
    capsulas.map((c) => [c.id, c.videoId ? videoFirmado(c.videoId) : null]),
  );

  const pasos: PasoGratis[] = gratis
    ? [
        {
          orden: 0,
          numero: null,
          titulo: "Materiales",
          descripcion:
            gratis.materiales.length > 0
              ? `${gratis.materiales.map((m) => m.texto).join(", ")}. Te mostramos cómo elegirlos.`
              : "Lo que necesitas antes de empezar.",
          urlVideo: videoFirmado(gratis.videoMaterialesId),
          poster: urlDeMiniatura(gratis.videoMaterialesId),
        },
        ...agruparEnPasos(gratis.lecciones).map((p) => ({
          orden: p.partes[0].orden,
          numero: p.numero,
          titulo: p.titulo,
          descripcion: `${p.partes.length} video${p.partes.length > 1 ? "s" : ""} paso a paso.`,
          urlVideo: videoFirmado(p.partes[0].videoId),
          poster: urlDeMiniatura(p.partes[0].videoId),
        })),
      ]
    : [];

  return {
    pr,
    capsulas,
    cobro,
    totalProyectos,
    totalVideos,
    fotosB,
    gratis,
    urlsDeCapsulas,
    pasos,
  };
}
