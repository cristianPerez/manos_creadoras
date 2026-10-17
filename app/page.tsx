import type { Metadata } from "next";
import { Medir } from "@/components/app/Medir";
import { EVENTOS } from "@/lib/analitica/eventos";
import { FooterLegal } from "@/components/app/sections/FooterLegal";
import { Header } from "@/components/app/sections/Header";
import { BarraDeOferta } from "@/components/home/BarraDeOferta";
import { BarraInferiorHome } from "@/components/home/BarraInferiorHome";
import { Capsulas } from "@/components/home/Capsulas";
import { CursoGratis, type PasoGratis } from "@/components/home/CursoGratis";
import { HeroSlider, type FotoHero } from "@/components/home/HeroSlider";
import { LlamadaAPlanes } from "@/components/home/LlamadaAPlanes";
import { OjoDemo } from "@/components/home/OjoDemo";
import { PrecioHome } from "@/components/home/PrecioHome";
import { listarCapsulas } from "@/lib/capsulas";
import { agruparEnPasos, listarBolsos, obtenerBolso, ordenCatalogo } from "@/lib/bolsos";
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
      {/* Antes del Header a propósito: el Header es `sticky top-0` y la barra
          NO lo es. Así se ve al llegar y desaparece al bajar, en vez de robarle
          sitio a la navegación durante todo el scroll. */}
      <BarraDeOferta />
      <Header />

      {/*
        ⚠️ EL ORDEN CAMBIA CON EL ANCHO, y por eso `main` es un flex con `order`.

        En MÓVIL las cápsulas van arriba del todo, como historias: es lo primero
        que se toca y así lo pide el diseño. En ESCRITORIO van DEBAJO del banner,
        porque ahí el banner es la pieza que vende y mandarlo al segundo lugar
        sería enterrar el titular.

        Se hace con `order` y no duplicando componentes: un solo bloque de
        cápsulas, un solo estado de "vistas", un solo visor.

        `pb-20` en móvil: la barra fija mide 64px y sin este respiro taparía el pie.
      */}
      <main className="flex flex-col pb-20 md:pb-0">
        {/*
          ⚠️ LAS CÁPSULAS VAN ANTES DEL BANNER, y no es un capricho de orden.
          El diseño móvil las pone justo bajo el header, y además arregla un
          fallo real: con el banner primero, el botón dorado "Empezar mi bolso
          gratis" caía en y=781 de una pantalla de 844 — justo DEBAJO de la
          barra fija, que se quedaba con el clic. El botón más importante del
          home no se podía pulsar.

          En escritorio el orden visual no cambia: la sección de cápsulas de
          escritorio se dibuja después del banner igualmente.
        */}
        <div className="order-1 md:order-2">
          <Capsulas capsulas={capsulas} />
        </div>
        <div className="order-2 md:order-1">
          <HeroSlider fotos={fotos} totalBolsos={bolsos.length} />
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
        {/*
          ⚠️ EL CTA VA AQUÍ, JUSTO DESPUÉS DEL BOLSO GRATIS. Es el punto de más
          deseo de todo el home: acaba de ver un bolso entero, gratis y completo,
          y la pregunta que se hace sola es "¿y los demás?". Ponerlo antes sería
          pedir dinero por algo que todavía no ha visto.
        */}
        <LlamadaAPlanes
          tono="dorado"
          /* El cierre de escritorio (abajo del todo) ya usa "¿Te gustó? Hay N
             bolsos esperándote": este dice lo mismo con otras palabras a
             propósito, para que quien baje entero no lea dos veces la frase. */
          titulo={`Acabas de hacer uno. Te faltan ${bolsos.length - 1}.`}
          texto={`${bolsos.reduce((s, b) => s + b.videos, 0)} videos paso a paso, la ficha de materiales de cada bolso y el Ojo Experto sin límite.`}
        />

        <OjoDemo bolsoGratis={gratis?.slug ?? null} />

        {/* El segundo momento: ya probó el Ojo Experto y se topó con el límite
            de 2 preguntas. Aquí el plan deja de ser un precio y es la salida. */}
        <LlamadaAPlanes titulo="¿Sin preguntas? Con el plan no se acaban." />

        <PrecioHome enlaces={cobro.url} />
        </div>

        {/* El cierre, solo en escritorio: en móvil el precio ya queda pegado a la
            barra de abajo y una tarjeta más entre medias solo alarga el scroll. */}
        <section className="order-4 max-md:hidden px-5 pb-16">
          <div
            className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6 rounded-[var(--radius-xl)] p-9 text-white"
            style={{ backgroundImage: "var(--card-destacada)" }}
          >
            <div>
              <h2 className="font-display text-2xl text-balance" style={{ fontWeight: 500 }}>
                ¿Te gustó? Hay{" "}
                <em className="text-gold-light italic" style={{ fontWeight: 400 }}>
                  {bolsos.length} bolsos
                </em>{" "}
                esperándote.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/70">
                {bolsos.reduce((s, b) => s + b.videos, 0)} videos paso a paso, la ficha de
                materiales de cada bolso y el Ojo Experto sin límite de 2 preguntas.
              </p>
            </div>
            <a
              href="#precio"
              className="flex h-13 shrink-0 items-center rounded-full border border-white/25 px-7 font-semibold text-white"
            >
              Ver los planes
            </a>
          </div>
        </section>
      </main>

      <FooterLegal />
      <BarraInferiorHome />
    </>
  );
}
