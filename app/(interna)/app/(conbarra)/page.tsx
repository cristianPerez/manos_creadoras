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
  /* Sin nombre en el perfil no se usa el correo ("Hola, auditoria-gratis"
     se lee como un error): se saluda sin nombre. */
  const saludo = alumna?.nombre ? `Hola, ${nombreCorto(alumna)}` : alumna ? "Hola de nuevo" : "Acceso de cortesía";
  /* El gratis sale de la BASE, no escrito a mano: el texto decía "Cristal
     Brillante" mientras el regalo era Nácar Soñado. */
  const gratis = bolsos.find((b) => b.gratis) ?? null;
  /* "Continúa donde quedaste" solo si de verdad empezó algo: con 0 vistos
     la tarjeta prometía un avance que no existe. */
  const retomar = alumna ? continuarDonde(bolsos) : null;
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
                {gratis ? `${gratis.nombre} es tuyo sin pagar y sin crear cuenta. ` : ""}Los demás
                puedes verlos por dentro —sus pasos y sus materiales— y tejerlos cuando tengas plan.
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
          continuar={retomar && retomar.vistos > 0 ? retomar : null}
          tieneAcceso={alumna?.tieneAcceso ?? false}
          /* La oferta la ve TODA la que no tiene plan, con cuenta o sin ella. */
          invitada={!alumna?.tieneAcceso}
          enlaces={cobro.url}
        />
      </div>
    </main>
  );
}
