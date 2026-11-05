import { Medir } from "@/components/app/Medir";
import { EVENTOS } from "@/lib/analitica/eventos";
import { FooterLegal } from "@/components/app/sections/FooterLegal";
import { Header } from "@/components/app/sections/Header";
import { BandaUnoDe16 } from "@/components/home/BandaUnoDe16";
import { BarraCompraMovil } from "@/components/home/BarraCompraMovil";
import { Capsulas, HistoriasCapsulas, ProveedorCapsulas } from "@/components/home/Capsulas";
import { CursoGratis } from "@/components/home/CursoGratis";
import { Elizabeth } from "@/components/home/Elizabeth";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { HeroSlider } from "@/components/home/HeroSlider";
import { MedirHome } from "@/components/home/MedirHome";
import { Navidad } from "@/components/home/Navidad";
import { OjoDemo } from "@/components/home/OjoDemo";
import { PrecioHome } from "@/components/home/PrecioHome";
import { PreguntasFrecuentes } from "@/components/home/PreguntasFrecuentes";
import { faqJsonLd } from "@/lib/landing";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";
import { RegistrarPais } from "@/components/app/RegistrarPais";
import type { DatosHome } from "@/lib/datos-home";

/**
 * EL HOME DE SIEMPRE — la rama de control del experimento de paleta.
 *
 * ⚠️ ES EL JSX QUE VIVÍA EN `app/page.tsx` HASTA EL 2026-11-05, MOVIDO SIN UN
 * SOLO CAMBIO. Lo único que cambia es de dónde salen los datos: antes los
 * cargaba la propia página y ahora llegan por props desde `lib/datos-home.ts`,
 * que los carga una vez para las dos ramas.
 *
 * ⚠️ NO SE "MEJORA" NADA AQUÍ MIENTRAS EL EXPERIMENTO ESTÉ VIVO. Este es el
 * control: si se le toca el diseño, deja de ser la referencia contra la que se
 * compara la paleta B y el experimento no mide nada. Los arreglos de verdad
 * (un bug, un texto equivocado) sí van, pero se aplican TAMBIÉN a la rama B.
 */
export function HomeActual({ datos }: { datos: DatosHome }) {
  const { pr, capsulas, cobro, totalProyectos, totalVideos, fotos, gratis, urlsDeCapsulas, pasos } =
    datos;

  return (
    <>
      <Medir evento={EVENTOS.paginaVentasVista} />
      <RegistrarPais />
      {/* Lo que Google lee de las preguntas frecuentes: la misma lista que el
          acordeón, así que no pueden decir cosas distintas. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd() }} />
      <Header />

      {/*
        ⚠️ EL MISMO ORDEN EN MÓVIL Y EN ESCRITORIO (2026-10-23, pedido de
        Cristian). Hasta hoy, en móvil las cápsulas iban arriba del todo, "como
        historias", y el banner quedaba segundo. Desde que las cápsulas son una
        fila de tarjetas sobre espresso (home a color), arriba solo enterraban
        el titular — y además dejaban el banner (crema) pegado al curso gratis
        (crema). Ahora: banner → cápsulas → curso gratis, en todos los anchos.

        ── HOME V3 (2026-10-20): el orden de venta ──────────────────────────
        banner (con precio) → cápsulas → curso gratis → banda "1 de 16" → Ojo →
        Elizabeth → precio → preguntas → cierre. Un botón de compra visible o a
        un toque en todo el recorrido: header, banner, banda, precio, cierre y,
        en móvil, la barra fija.
      */}
      {/* Las cápsulas se presentan distinto según la pantalla —círculos en
          móvil, tarjetas en escritorio— y comparten estado: lo que ya vio y el
          visor. Cada una se oculta sola en el tamaño que no le toca. */}
      <ProveedorCapsulas capsulas={capsulas} urlsDeVideo={urlsDeCapsulas}>
        <main className="flex flex-col">
          <MedirHome />
          <div data-seccion="historias">
            <HistoriasCapsulas />
          </div>
          {/* `id="banner"`: la barra fija de compra lo observa para no aparecer
              mientras el banner —que ya trae su botón— está a la vista. */}
          <div id="banner" data-seccion="banner">
            <HeroSlider fotos={fotos} />
          </div>
          {/* Entre el banner y las cápsulas (2026-10-31, pedido de Cristian).
              Va en tarjeta café sobre crema para no pegar dos bloques oscuros:
              ver la cabecera de `Navidad.tsx`. */}
          <div data-seccion="navidad">
            <Navidad />
          </div>
          <div data-seccion="capsulas">
            <Capsulas />
          </div>
          <div>
            {gratis && (
              <div data-seccion="gratis">
                <CursoGratis
                  slug={gratis.slug}
                  nombre={gratis.nombre}
                  pasos={pasos}
                  portadaUrl={gratis.portadaUrl}
                />
              </div>
            )}

            <div data-seccion="banda">
              <BandaUnoDe16 proyectos={totalProyectos} desde={pr.desde} />
            </div>

            <div data-seccion="ojo">
              <OjoDemo bolsoGratis={gratis?.slug ?? null} enlaces={cobro.url} />
            </div>

            <div data-seccion="elizabeth">
              <Elizabeth videos={totalVideos} />
            </div>

            <div data-seccion="precio">
              <PrecioHome enlaces={cobro.url} />
            </div>

            <div data-seccion="faq">
              <PreguntasFrecuentes />
            </div>

            {/*
              El cierre. ⚠️ ABRE EL PAGO ANUAL DIRECTAMENTE: quien llega hasta
              aquí ya leyó el precio, las preguntas y la garantía. Mandarla otra
              vez a `#precio` sería hacerle subir a pulsar lo mismo.
            */}
            {/* Home a color (2026-10-22): franja café a todo el ancho y
                centrada, no una tarjeta espresso dentro de la crema. */}
            <section
              data-seccion="cierre"
              className="bg-cacao sobre-oscuro grain-oscuro px-5 py-12 text-center md:py-18"
            >
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
                <div>
                  <h2
                    className="font-display text-cream text-balance"
                    style={{ fontWeight: 500, fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.08 }}
                  >
                    ¿Te gustó? Esto <em className="clave">apenas empieza</em>.
                  </h2>
                  {/* El cierre sigue al plan por defecto como el resto de la
                      página: si aquí dijera "anual" mientras los demás botones
                      abren el mensual, serían dos ofertas distintas en la misma
                      pantalla. */}
                  <p className="text-sand mt-3">
                    Plan mensual: {pr.cobro(FRECUENCIA_POR_DEFECTO)} al mes · cancelas cuando
                    quieras · garantía de 7 días.
                  </p>
                </div>
                <EnlaceCompra
                  href={cobro.url[FRECUENCIA_POR_DEFECTO] ?? `/pagar?ciclo=${FRECUENCIA_POR_DEFECTO}`}
                  origen="cierre"
                  plan={FRECUENCIA_POR_DEFECTO}
                  abrePago={Boolean(cobro.url[FRECUENCIA_POR_DEFECTO])}
                  className="bg-cream text-espresso flex h-13.5 shrink-0 items-center justify-center rounded-full px-10 font-semibold transition-transform active:scale-[0.98] max-md:w-full"
                >
                  Inscribirme por {pr.desde}/mes
                </EnlaceCompra>
              </div>
            </section>
          </div>
        </main>
      </ProveedorCapsulas>

      <FooterLegal />
      <BarraCompraMovil />
    </>
  );
}
