import type { Metadata } from "next";
import { Catalogo } from "@/components/app/Catalogo";
import { alumnaActual, nombreCorto } from "@/lib/alumna";
import { continuarDonde, listarBolsos, ordenCatalogo } from "@/lib/bolsos";

export const metadata: Metadata = {
  title: "Mis bolsos — Manos Creadoras",
};

export default async function MisBolsos() {
  const [alumna, todos] = await Promise.all([alumnaActual(), listarBolsos()]);
  const bolsos = ordenCatalogo(todos);
  const totalVideos = bolsos.reduce((suma, b) => suma + b.videos, 0);

  /*
   * ⚠️ SIN SESIÓN SE VE LA MISMA PANTALLA, NO UNA DISTINTA.
   *
   * Antes había una "Cortesía" aparte: otra pantalla, sin barra lateral, que
   * solo enseñaba el bolso gratis. Era un callejón sin salida —no había cómo
   * volver— y partía la app en dos sitios que había que mantener iguales.
   *
   * Ahora quien llega sin cuenta ve EL CATÁLOGO ENTERO: todos los bolsos, el
   * gratis primero y el resto con candado. Puede mirarlos, leer sus pasos y
   * sus materiales; lo único que no puede es reproducir el video. Enseñar lo
   * que hay dentro es lo que hace que valga la pena pagar — esconderlo solo
   * hace que parezca que hay menos.
   */
  const saludo = alumna ? `Hola, ${nombreCorto(alumna)}` : "Acceso de cortesía";
  const titulo = alumna ? "Tu colección" : "Empieza por el bolso gratis";

  return (
    <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{saludo}</p>
            <h1 className="titulo-seccion mt-2 text-balance">{titulo}</h1>
            {!alumna && (
              <p className="text-ink-body mt-3 max-w-lg">
                Cristal Brillante es tuyo sin pagar y sin crear cuenta. Los demás puedes verlos por
                dentro —sus pasos y sus materiales— y tejerlos cuando tengas plan.
              </p>
            )}
          </div>
          {/* El resumen se CALCULA de los datos: el día que entre el bolso 15,
              este número cambia solo. */}
          <p className="text-ink-muted text-sm">
            <strong className="text-espresso font-semibold">{bolsos.length} bolsos</strong> ·{" "}
            {totalVideos} videos paso a paso
          </p>
        </header>

        <Catalogo
          bolsos={bolsos}
          continuar={alumna ? continuarDonde(bolsos) : null}
          tieneAcceso={alumna?.tieneAcceso ?? false}
          invitada={!alumna}
        />
      </div>
    </main>
  );
}
