import "server-only";
import { agruparEnPasos, listarBolsos, obtenerBolso, ordenCatalogo } from "@/lib/bolsos";
import { listarCapsulas } from "@/lib/capsulas";
import { enlacesDeCobro } from "@/lib/checkout";
import { preciosDeLaPagina } from "@/lib/precios";
import { urlDeMiniatura, urlDelReproductor } from "@/lib/video";
import type { PasoGratis } from "@/components/home/CursoGratis";
import type { FotoHero } from "@/components/home/HeroSlider";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * LOS DATOS DEL HOME, CARGADOS UNA SOLA VEZ
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ NACE CON EL EXPERIMENTO DE PALETA (2026-11-05). Desde que hay dos homes
 * —el de siempre y el de la paleta B—, esto vivía en `app/page.tsx` y la
 * tentación era copiarlo en los dos componentes. Dos copias de las mismas
 * consultas es el camino directo a que un día una diga 20 proyectos y la otra
 * 21, o a que una firme los videos y la otra no. Se carga aquí, una vez, y cada
 * home recibe lo mismo.
 *
 * Las dos versiones comparten TODO el contenido: precios, fotos, preguntas, el
 * bolso gratis. Lo único que cambia entre ellas es el diseño. Si cambiara el
 * contenido, el experimento no mediría el diseño: mediría dos ofertas
 * distintas, y no se podría saber cuál de las dos cosas movió el número.
 */

/**
 * Los subtítulos del carrusel. Describen la TÉCNICA, no el bolso.
 *
 * ⚠️ VIVEN AQUÍ Y NO EN LA BASE a propósito: son copy de la página de ventas,
 * no un dato del producto. "Bandolera de perlas" es cómo se vende Gota de Rocío
 * en el banner; dentro de la app el mismo bolso se describe por sus medidas y
 * sus pasos. Mezclarlos obligaría a que un cambio de copy pasara por una
 * migración.
 */
const SUBTITULOS: Record<string, string> = {
  /* ⚠️ PRIMERO EN EL CARRUSEL por pedido de Cristian (2026-10-17): es el que
     abre la galería en la referencia de sparkle-bag-studio. El orden de este
     objeto ES el orden del banner — ver `ORDEN_CARRUSEL` abajo. */
  "anillos-de-seda": "Asa de perlas y anillos",
  "gota-de-rocio": "Bandolera de perlas",
  "cristal-brillante": "Cristal facetado",
  "marfil-elegante": "Perla marfil",
  "encantado-dorado": "Perla y marco dorado",
  "brillo-lunar": "Boquilla metálica",
  "tornado-de-aurora": "Cristal tornasol",
  "perla-tejida": "Perlas de 10 y 30 mm",
  "coquett-clasico": "Shamballa de 14 mm",
  "silueta-nacar": "Cuentas de 10 mm",
};

/** El orden del carrusel: lo manda el diseño, no el catálogo. */
const ORDEN_CARRUSEL = Object.keys(SUBTITULOS);

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
  const fotos: FotoHero[] = ORDEN_CARRUSEL.flatMap((slug) => {
    const b = porSlug.get(slug);
    if (!b?.portadaUrl) return [];
    return [{ slug, nombre: b.nombre, subtitulo: SUBTITULOS[slug], url: b.portadaUrl }];
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
    fotos,
    gratis,
    urlsDeCapsulas,
    pasos,
  };
}
