import type { Metadata } from "next";
import { Medir } from "@/components/app/Medir";
import { EVENTOS } from "@/lib/analitica/eventos";
import { FooterLegal } from "@/components/app/sections/FooterLegal";
import { Header } from "@/components/app/sections/Header";
import { BandaUnoDe16 } from "@/components/home/BandaUnoDe16";
import { BarraCompraMovil } from "@/components/home/BarraCompraMovil";
import { Capsulas } from "@/components/home/Capsulas";
import { CursoGratis, type PasoGratis } from "@/components/home/CursoGratis";
import { Elizabeth } from "@/components/home/Elizabeth";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { HeroSlider, type FotoHero } from "@/components/home/HeroSlider";
import { OjoDemo } from "@/components/home/OjoDemo";
import { PrecioHome } from "@/components/home/PrecioHome";
import { PreguntasFrecuentes } from "@/components/home/PreguntasFrecuentes";
import { faqJsonLd } from "@/lib/landing";
import { precioDelCobro, precioDesde } from "@/lib/planes";
import { listarCapsulas } from "@/lib/capsulas";
import { agruparEnPasos, listarBolsos, obtenerBolso, ordenCatalogo } from "@/lib/bolsos";
import { esLlavero } from "@/lib/bolsos-logica";
import { urlDeMiniatura, urlDelReproductor } from "@/lib/video";
import { enlacesDeCobro } from "@/lib/checkout";
import { RegistrarPais } from "@/components/app/RegistrarPais";

export const metadata: Metadata = {
  title: "Manos Creadoras — Crea bolsos de lujo en cuentas desde casa",
  description:
    "Aprende a tejer bolsos de perlas desde cero con Elizabeth Valencia. 5 cápsulas y un bolso completo gratis, sin tarjeta.",
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

export default async function Home() {
  const [bolsos, capsulas, cobro] = await Promise.all([
    listarBolsos(),
    listarCapsulas(),
    enlacesDeCobro(),
  ]);

  /* Las dos cifras del curso, calculadas UNA vez y pasadas a todas las
     secciones que las dicen (banda, Elizabeth, precio, cierre). Antes cada
     una sumaba por su cuenta, y así es como una dice 14 y otra 16. */
  // Solo bolsos: los llaveros están en el catálogo pero no son "bolsos".
  const totalBolsos = bolsos.filter((b) => !esLlavero(b)).length;
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

  return (
    <>
      <Medir evento={EVENTOS.paginaVentasVista} />
      <RegistrarPais />
      {/* Lo que Google lee de las preguntas frecuentes: la misma lista que el
          acordeón, así que no pueden decir cosas distintas. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd() }} />
      <Header />

      {/*
        ⚠️ EL ORDEN CAMBIA CON EL ANCHO, y por eso `main` es un flex con `order`.

        En MÓVIL las cápsulas van arriba del todo, como historias: es lo primero
        que se toca y así lo pide el diseño. En ESCRITORIO van DEBAJO del banner,
        porque ahí el banner es la pieza que vende y mandarlo al segundo lugar
        sería enterrar el titular.

        Se hace con `order` y no duplicando componentes: un solo bloque de
        cápsulas, un solo estado de "vistas", un solo visor.

        ── HOME V3 (2026-10-20): el orden de venta ──────────────────────────
        banner (con precio) → cápsulas → curso gratis → banda "1 de 16" → Ojo →
        Elizabeth → precio → preguntas → cierre. Un botón de compra visible o a
        un toque en todo el recorrido: header, banner, banda, precio, cierre y,
        en móvil, la barra fija.
      */}
      <main className="flex flex-col">
        <div className="order-1 md:order-2">
          <Capsulas capsulas={capsulas} urlsDeVideo={urlsDeCapsulas} />
        </div>
        {/* `id="banner"`: la barra fija de compra lo observa para no aparecer
            mientras el banner —que ya trae su botón— está a la vista. */}
        <div id="banner" className="order-2 md:order-1">
          <HeroSlider fotos={fotos} totalBolsos={totalBolsos} />
        </div>
        <div className="order-3">
          {gratis && (
            <CursoGratis
              slug={gratis.slug}
              nombre={gratis.nombre}
              pasos={pasos}
              portadaUrl={gratis.portadaUrl}
            />
          )}

          <BandaUnoDe16 bolsos={totalBolsos} videos={totalVideos} />

          <OjoDemo bolsoGratis={gratis?.slug ?? null} enlaces={cobro.url} />

          <Elizabeth bolsos={totalBolsos} videos={totalVideos} />

          <PrecioHome enlaces={cobro.url} bolsos={totalBolsos} videos={totalVideos} />

          <PreguntasFrecuentes />

          {/*
            El cierre. ⚠️ ABRE EL PAGO ANUAL DIRECTAMENTE: quien llega hasta
            aquí ya leyó el precio, las preguntas y la garantía. Mandarla otra
            vez a `#precio` sería hacerle subir a pulsar lo mismo.
          */}
          <section className="px-5 pb-12 md:pb-16">
            <div className="bg-espresso sobre-oscuro grain-oscuro rounded-bloque mx-auto flex max-w-6xl flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:px-12 md:py-10">
              <div>
                <h2
                  className="font-display text-cream text-balance"
                  style={{ fontWeight: 500, fontSize: "clamp(28px, 3vw, 38px)", lineHeight: 1.1 }}
                >
                  ¿Te gustó? Hay{" "}
                  <em className="text-gold-pale italic" style={{ fontWeight: 400 }}>
                    {totalBolsos} bolsos
                  </em>{" "}
                  esperándote.
                </h2>
                <p className="text-on-dark-muted mt-2">
                  Plan anual: un pago de {precioDelCobro("anual")} al año · garantía de 7 días.
                </p>
              </div>
              <EnlaceCompra
                href={cobro.url.anual ?? "/pagar?ciclo=anual"}
                origen="cierre"
                plan="anual"
                abrePago={Boolean(cobro.url.anual)}
                className="bg-gold-pale text-espresso rounded-boton flex h-14 shrink-0 items-center justify-center px-8 font-extrabold transition-transform active:scale-[0.98]"
              >
                Inscribirme por {precioDesde()}/mes
              </EnlaceCompra>
            </div>
          </section>
        </div>
      </main>

      <FooterLegal />
      <BarraCompraMovil />
    </>
  );
}
