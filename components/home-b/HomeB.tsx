import { Medir } from "@/components/app/Medir";
import { RegistrarPais } from "@/components/app/RegistrarPais";
import { EVENTOS } from "@/lib/analitica/eventos";
import { ProveedorCapsulas } from "@/components/home/Capsulas";
import { MedirHome } from "@/components/home/MedirHome";
import { AvisoInstagram } from "@/components/pago/AvisoInstagram";
import { ProveedorPago } from "@/components/pago/ContextoPago";
import { BarraCompraB } from "@/components/home-b/BarraCompraB";
import { CabeceraB } from "@/components/home-b/CabeceraB";
import { CapsulasB } from "@/components/home-b/CapsulasB";
import { CierreB } from "@/components/home-b/CierreB";
import { ComunidadB } from "@/components/home-b/ComunidadB";
import { DoloresB } from "@/components/home-b/DoloresB";
import { NavidadB } from "@/components/home-b/NavidadB";
import { PortadaB } from "@/components/home-b/PortadaB";
import { PrecioB } from "@/components/home-b/PrecioB";
import { PreguntasB } from "@/components/home-b/PreguntasB";
import { ProfesoraB } from "@/components/home-b/ProfesoraB";
import { PruebaloGratisB } from "@/components/home-b/PruebaloGratisB";
import { faqJsonLd } from "@/lib/landing";
import type { DatosHome } from "@/lib/datos-home";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * EL HOME — el morado (paleta B v2), el ÚNICO desde el 2026-11-07
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Nació como la rama B del A/B de paleta (flag `paleta_b`, 2026-11-05). Ganó
 * contra el home crema, se quedó al 100% y el control se borró del código.
 * Los datos salen de `lib/datos-home.ts`.
 *
 * ── v2 "vendedor" (2026-11-05, canvas "Home B v2 · vendedor") ─────────────
 *
 * ⚠️ ESTA RAMA YA NO ES SOLO OTRA PALETA. Cristian autorizó reordenar para que
 * el home venda y atienda el dolor, así que el A/B compara **el home B v2
 * completo contra el home de siempre**: paleta, orden y copy de las secciones.
 * Si gana la B no se sabrá qué parte ganó; se sabrá que el conjunto vende más.
 * Está escrito en ESTADO.md (y debe estarlo en la descripción de la flag).
 *
 * Lo que sigue siendo IGUAL en las dos ramas: precios, fotos del catálogo,
 * bolso gratis y preguntas frecuentes (salen de `lib/datos-home.ts`).
 *
 * ── El orden, el mismo en los dos anchos ──────────────────────────────────
 *
 *   cabecera → héroe → dolores → pruébalo gratis → comunidad → cápsulas →
 *   profesora → navidad → precio → preguntas → cierre → barra fija
 *
 * Las cápsulas BAJARON de arriba (pesaban más que el héroe y sacaban el botón
 * de la primera pantalla) y "Este es solo uno" se fundió con el precio.
 */
export function HomeB({ datos }: { datos: DatosHome }) {
  const {
    pr,
    capsulas,
    cobro,
    rutaPago,
    enInstagram,
    totalProyectos,
    totalVideos,
    fotosB,
    gratis,
    urlsDeCapsulas,
    pasos,
  } = datos;

  /* Los pasos SIN contar el de materiales: es lo que dice la tarjeta del curso
     gratuito ("materiales + 5 pasos"). */
  const pasosDelBolso = Math.max(0, pasos.length - 1);

  /* "Plan desde …": el precio por mes MÁS BAJO, el del anual, en su moneda
     (home v3). Lo de la portada, la barra fija y el cierre. */
  const desde = pr.porMes("anual");

  return (
    /* País, variante y ruta de pago para los botones dorados (`EnlaceCompra`). */
    <ProveedorPago valor={{ pais: cobro.pais, variantePrecio: cobro.variante, rutaPago }}>
      <Medir evento={EVENTOS.paginaVentasVista} />
      <RegistrarPais />
      {/* Lo que Google lee de las preguntas frecuentes: la misma lista que el
          acordeón, así que no pueden decir cosas distintas. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd() }} />

      {/* Dentro de Instagram/Facebook: "ábrelo en tu navegador". No bloquea. */}
      <AvisoInstagram visible={enInstagram} />

      <CabeceraB />

      {/* El proveedor de cápsulas guarda qué vio y monta el visor. */}
      <ProveedorCapsulas capsulas={capsulas} urlsDeVideo={urlsDeCapsulas}>
        <main className="flex flex-col">
          <MedirHome />

          <div data-seccion="banner">
            <PortadaB fotos={fotosB} gratis={gratis} />
          </div>

          <DoloresB />

          <PruebaloGratisB
            slugGratis={gratis?.slug ?? null}
            nombreGratis={gratis?.nombre ?? null}
            pasos={pasosDelBolso}
          />

          <ComunidadB />

          <CapsulasB />

          <ProfesoraB videos={totalVideos} />

          <NavidadB />

          <PrecioB enlaces={cobro.url} proyectos={totalProyectos} />

          <PreguntasB />

          <CierreB slugGratis={gratis?.slug ?? null} desde={desde} />
        </main>
      </ProveedorCapsulas>

      <BarraCompraB enlaces={cobro.url} desde={desde} />
    </ProveedorPago>
  );
}
