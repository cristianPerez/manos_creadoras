import { Medir } from "@/components/app/Medir";
import { BarraAnuncio } from "@/components/app/sections/BarraAnuncio";
import { Coleccion } from "@/components/app/sections/Coleccion";
import { ComoFunciona } from "@/components/app/sections/ComoFunciona";
import { CtaFinal } from "@/components/app/sections/CtaFinal";
import { Faq } from "@/components/app/sections/Faq";
import { FooterLegal } from "@/components/app/sections/FooterLegal";
import { Header } from "@/components/app/sections/Header";
import { Hero } from "@/components/app/sections/Hero";
import { LoQueIncluye } from "@/components/app/sections/LoQueIncluye";
import { Mentora } from "@/components/app/sections/Mentora";
import { Planes } from "@/components/app/sections/Planes";
import { EVENTOS } from "@/lib/analitica/eventos";

/**
 * El home.
 *
 * ⚠️ LA ESTRUCTURA CAMBIÓ Y NO ES UN RETOQUE. La landing anterior seguía el
 * guion clásico de respuesta directa: problema → agitación → solución → oferta
 * → garantía. El diseño que mandó Cristian propone otro recorrido: enseñar el
 * producto y dejar que convenza (héroe → cómo funciona → qué incluye → la
 * colección → planes → quién enseña → dudas → cierre).
 *
 * Se sigue el diseño porque la referencia del dueño manda. Pero conviene saber
 * qué se dejó atrás: ya NO hay una sección que nombre el dolor de la alumna
 * antes de ofrecerle la cura, y la garantía pasó de sección entera a una línea
 * bajo los planes. Para una audiencia fría eso suele costar conversión; para
 * quien ya teje y llega buscando, enseñar los bolsos funciona mejor. Si algún
 * día se quiere recuperar, las secciones viejas están en el historial de git.
 */
export default function Home() {
  return (
    <>
      {/* Denominador de TODO el negocio: cuánta gente llega a la puerta. */}
      <Medir evento={EVENTOS.paginaVentasVista} />

      <div className="flex min-h-dvh flex-1 flex-col">
        <BarraAnuncio />
        <Header />
        <main className="flex-1">
          <Hero />
          <ComoFunciona />
          <LoQueIncluye />
          <Coleccion />
          <Planes />
          <Mentora />
          <Faq />
          <CtaFinal />
        </main>
        <FooterLegal />
      </div>
    </>
  );
}
