import type { Metadata } from "next";
import { Catalogo } from "@/components/app/Catalogo";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";
import { alumnaActual, nombreCorto } from "@/lib/alumna";
import { enlacesDeCobro } from "@/lib/checkout";
import { continuarDonde, esLlavero, listarBolsos, ordenCatalogo } from "@/lib/bolsos";
import { precioDesde } from "@/lib/planes";

export const metadata: Metadata = {
  title: "Mis bolsos — Manos Creadoras",
};

export default async function MisBolsos() {
  const [alumna, todos, cobro] = await Promise.all([alumnaActual(), listarBolsos(), enlacesDeCobro()]);
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
  /* La última palabra en cursiva dorada, como los titulares del home. */
  const titulo = alumna ? (
    <>
      Tu <em className="clave">colección</em>
    </>
  ) : (
    <>
      Empieza por el bolso <em className="clave">gratis</em>
    </>
  );

  return (
    <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-310">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <EyebrowLinea>{saludo}</EyebrowLinea>
            <h1 className="titulo-seccion mt-3 text-balance">{titulo}</h1>
            {!alumna && (
              <p className="text-ink-body mt-3 max-w-2xl max-lg:hidden">
                Cristal Brillante es tuyo sin pagar y sin crear cuenta. Los demás puedes verlos por
                dentro —sus pasos y sus materiales— y tejerlos cuando tengas plan.
              </p>
            )}
          </div>
          {/* El resumen se CALCULA de los datos: el día que entre el bolso 15,
              este número cambia solo. */}
          <p className="text-ink-muted text-sm">
            {/* Bolsos y llaveros por separado (2026-10-20): "23 bolsos" contaba
                los 3 llaveros como si fueran bolsos. */}
            <strong className="text-espresso font-semibold">
              {bolsos.filter((b) => !esLlavero(b)).length} bolsos
              {bolsos.some(esLlavero) && ` y ${bolsos.filter(esLlavero).length} llaveros`}
            </strong>{" "}
            ·{" "}
            {totalVideos} videos paso a paso
          </p>
        </header>

        <Catalogo
          desde={precioDesde()}
          bolsos={bolsos}
          continuar={alumna ? continuarDonde(bolsos) : null}
          tieneAcceso={alumna?.tieneAcceso ?? false}
          invitada={!alumna}
          enlaces={cobro.url}
        />
      </div>
    </main>
  );
}
