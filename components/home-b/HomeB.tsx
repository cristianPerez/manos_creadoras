import { Medir } from "@/components/app/Medir";
import { RegistrarPais } from "@/components/app/RegistrarPais";
import { EVENTOS } from "@/lib/analitica/eventos";
import { ProveedorCapsulas } from "@/components/home/Capsulas";
import { MedirHome } from "@/components/home/MedirHome";
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
 * EL HOME B — la rama nueva del experimento de paleta (2026-11-05)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Lo enciende la flag `paleta_b` de Flagsmith; con la flag apagada no se monta
 * nada de esta carpeta. Ver `lib/flags.ts` y `app/(home)/page.tsx`.
 *
 * ⚠️ MISMO CONTENIDO QUE EL CONTROL, OTRO DISEÑO. Precios, fotos, preguntas,
 * bolso gratis y cifras salen de `lib/datos-home.ts`, que carga una vez para
 * las dos ramas. Si una enseñara otra oferta, el experimento no mediría el
 * diseño y el resultado no diría nada.
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
  const { pr, capsulas, cobro, totalProyectos, totalVideos, fotosB, gratis, urlsDeCapsulas, pasos } =
    datos;

  /* Los pasos SIN contar el de materiales: es lo que dice la tarjeta del curso
     gratuito ("materiales + 5 pasos"). */
  const pasosDelBolso = Math.max(0, pasos.length - 1);

  return (
    <>
      <Medir evento={EVENTOS.paginaVentasVista} />
      <RegistrarPais />
      {/* Lo que Google lee de las preguntas frecuentes: la misma lista que el
          acordeón, así que no pueden decir cosas distintas. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd() }} />

      <CabeceraB />

      {/* El proveedor de cápsulas guarda qué vio y monta el visor. Es el MISMO
          que usa el control: así lo que se vea en una rama queda marcado en la
          otra, que importa porque con `?paleta=` se salta de una a otra. */}
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

          <CierreB slugGratis={gratis?.slug ?? null} desde={pr.desde} />
        </main>
      </ProveedorCapsulas>

      <BarraCompraB />
    </>
  );
}
