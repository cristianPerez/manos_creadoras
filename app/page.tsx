import { AppPorDentro } from "@/components/app/sections/AppPorDentro";
import { Agitacion } from "@/components/app/sections/Agitacion";
import { CtaFinal } from "@/components/app/sections/CtaFinal";
import { Faq } from "@/components/app/sections/Faq";
import { FooterLegal } from "@/components/app/sections/FooterLegal";
import { Garantia } from "@/components/app/sections/Garantia";
import { Header } from "@/components/app/sections/Header";
import { Hero } from "@/components/app/sections/Hero";
import { Oferta } from "@/components/app/sections/Oferta";
import { Problema } from "@/components/app/sections/Problema";
import { Solucion } from "@/components/app/sections/Solucion";
import { StickyBuyBar } from "@/components/app/StickyBuyBar";
import { Medir } from "@/components/app/Medir";
import { EVENTOS } from "@/lib/analitica/eventos";

export default function Home() {
  return (
    <>
      {/* Denominador de TODO el negocio: cuánta gente llega a la puerta. */}
      <Medir evento={EVENTOS.paginaVentasVista} />
    <div className="flex flex-1 flex-col min-h-dvh">
      <Header />
      <main className="flex-1">
        <Hero />
        <Problema />
        <Agitacion />
        <Solucion />
        <AppPorDentro />
        <Oferta />
        <Garantia />
        <Faq />
        <CtaFinal />
      </main>
      <FooterLegal />
      <StickyBuyBar />
    </div>
    </>
  );
}
