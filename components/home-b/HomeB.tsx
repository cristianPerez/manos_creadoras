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
import { NavidadB } from "@/components/home-b/NavidadB";
import { PortadaB } from "@/components/home-b/PortadaB";
import { PrecioB } from "@/components/home-b/PrecioB";
import { PreguntasB } from "@/components/home-b/PreguntasB";
import { ProfesoraB } from "@/components/home-b/ProfesoraB";
import { PruebaloGratisB } from "@/components/home-b/PruebaloGratisB";
import { SoloUnoB } from "@/components/home-b/SoloUnoB";
import { faqJsonLd } from "@/lib/landing";
import type { DatosHome } from "@/lib/datos-home";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * EL HOME B — la rama nueva del experimento de paleta (2026-11-05)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Lo enciende la flag `paleta_b` de Flagsmith; con la flag apagada no se monta
 * nada de esta carpeta. Ver `lib/flags.ts` y `app/page.tsx`.
 *
 * ⚠️ MISMO CONTENIDO QUE EL CONTROL, OTRO DISEÑO. Precios, fotos, preguntas,
 * bolso gratis y cifras salen de `lib/datos-home.ts`, que carga una vez para
 * las dos ramas. Si una enseñara otra oferta, el experimento no mediría el
 * diseño y el resultado no diría nada.
 *
 * ── Qué cambia respecto del home de siempre, y por qué ───────────────────
 *
 *   · **Es más corto.** De 12 secciones a 10, y dos de las que se van son las
 *     más pesadas: el reproductor del bolso gratis y el chat del Ojo Experto.
 *     En su lugar, una sección de dos tarjetas que manda a la plataforma, que
 *     es donde esas dos cosas viven de verdad (ver `PruebaloGratisB`).
 *   · **Es menos redondo.** Fotos a 8px donde el control pone 20–28. Los
 *     botones siguen en píldora: es lo que mantiene la marca reconocible entre
 *     las dos versiones.
 *   · **Tiene DOS colores de marca** en vez de uno: morado para la acción y
 *     frambuesa para la palabra en cursiva de los titulares y los enlaces.
 *
 * ── El orden, que no es el mismo en los dos anchos ───────────────────────
 *
 *   MÓVIL:      cabecera → cápsulas → portada → navidad → …
 *   ESCRITORIO: cabecera → portada  → cápsulas → navidad → …
 *
 * ⚠️ Y ES DELIBERADO. En un teléfono las cápsulas arriba se leen como las
 * historias de Instagram —el gesto que la visitante ya conoce— y dicen "hay
 * algo gratis" antes que cualquier titular. En un monitor esa fila se convierte
 * en una rejilla de cinco tarjetas que, puesta antes de la portada, empujaría
 * el titular y el botón fuera de la primera pantalla. Se resuelve con `order`,
 * no con dos árboles de componentes.
 */
export function HomeB({ datos }: { datos: DatosHome }) {
  const { pr, capsulas, cobro, totalProyectos, totalVideos, fotos, gratis, urlsDeCapsulas, pasos } =
    datos;

  /* Los pasos SIN contar el de materiales: es lo que dice la tarjeta del curso
     gratuito ("materiales + 5 pasos"). */
  const pasosDelBolso = Math.max(0, pasos.length - 1);

  /*
   * Las dos cifras del cierre, construidas con los precios de la base: nunca
   * escritas a mano. `cobro()` ya devuelve el cobro real de cada ciclo.
   */
  const resumenPrecios = `${pr.cobro("mensual")} al mes o ${pr.cobro("anual")} al año`;

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

          {/*
            El `order` invierte portada y cápsulas en escritorio (ver la nota
            de arriba). Van como hijos DIRECTOS del `main`, que es el contenedor
            flex: si se envolvieran en un `display: contents` el `order`
            funcionaría igual, pero esos envoltorios dejarían de tener caja y el
            `IntersectionObserver` de `MedirHome` no podría verlos — `banner` y
            `capsulas` desaparecerían del embudo sin que nadie lo notara.

            ⚠️ LOS ÓRDENES SON NEGATIVOS A PROPÓSITO. El resto de secciones no
            lleva `order`, así que vale 0; si a estas dos se les pusiera 1 y 2
            se irían DETRÁS de todo lo demás — la portada acabaría después del
            precio. Con −2 y −1 se quedan delante sin tener que numerar las
            otras ocho.
          */}
          <div className="-order-2 lg:-order-1" data-seccion="capsulas">
            <CapsulasB />
          </div>
          <div className="-order-1 lg:-order-2" data-seccion="banner">
            <PortadaB fotos={fotos} gratis={gratis} />
          </div>

          <NavidadB />

          <PruebaloGratisB
            slugGratis={gratis?.slug ?? null}
            nombreGratis={gratis?.nombre ?? null}
            pasos={pasosDelBolso}
          />

          <SoloUnoB proyectos={totalProyectos} desde={pr.desde} />

          <ProfesoraB videos={totalVideos} />

          <ComunidadB />

          <PrecioB enlaces={cobro.url} />

          <PreguntasB />

          <CierreB enlaces={cobro.url} desde={pr.desde} resumen={resumenPrecios} />
        </main>
      </ProveedorCapsulas>

      <BarraCompraB />
    </>
  );
}
