import type { Metadata } from "next";
import { Catalogo } from "@/components/app/Catalogo";
import { Cortesia } from "@/components/app/Cortesia";
import { BarraLateral } from "@/components/app/NavegacionApp";
import { alumnaActual, nombreCorto } from "@/lib/alumna";
import { continuarDonde, listarBolsos, obtenerBolso } from "@/lib/bolsos";

export const metadata: Metadata = {
  title: "Mis bolsos — Manos Creadoras",
};

export default async function MisBolsos() {
  const alumna = await alumnaActual();

  /*
   * ⚠️ SIN SESIÓN NO SE REBOTA AL LOGIN: se enseña la Cortesía.
   *
   * Es la decisión que ya estaba tomada en septiembre y que el diseño nuevo
   * mantiene: el producto es su propio argumento de venta. Quien llega sin
   * cuenta ve el bolso gratis ENTERO y puede tejerlo. Mandarla a un formulario
   * antes de enseñarle nada es perder a quien venía con ganas.
   */
  if (!alumna) {
    const gratis = await obtenerBolso("cristal-brillante");
    return <Cortesia bolso={gratis} />;
  }

  const bolsos = await listarBolsos();
  const totalVideos = bolsos.reduce((suma, b) => suma + b.videos, 0);

  return (
    <>
      <BarraLateral />

      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-5xl">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Hola, {nombreCorto(alumna)}</p>
              <h1 className="titulo-seccion mt-2">Tu colección</h1>
            </div>
            {/* El resumen se CALCULA de los datos, no se escribe. El día que
                entre el bolso 15, este número cambia solo. */}
            <p className="text-ink-muted text-sm">
              <strong className="text-espresso font-semibold">{bolsos.length} bolsos</strong> ·{" "}
              {totalVideos} videos paso a paso
            </p>
          </header>

          <Catalogo
            bolsos={bolsos}
            continuar={continuarDonde(bolsos)}
            tieneAcceso={alumna.tieneAcceso}
          />
        </div>
      </main>
    </>
  );
}
