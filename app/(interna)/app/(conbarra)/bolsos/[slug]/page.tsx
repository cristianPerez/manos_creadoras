import { ArrowLeft, Play, Sparkles } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaMateriales, TarjetaDirectorio } from "@/components/app/ListaMateriales";
import { PasoAPaso } from "@/components/app/PasoAPaso";
import { alumnaActual } from "@/lib/alumna";
import { esLlavero, medidasEnTexto, medidasOrdenadas, obtenerBolso, siguienteVideo } from "@/lib/bolsos";
import { precioDesde } from "@/lib/planes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bolso = await obtenerBolso(slug);
  return { title: bolso ? `${bolso.nombre} — Manos Creadoras` : "Manos Creadoras" };
}

export default async function Ficha({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [bolso, alumna] = await Promise.all([obtenerBolso(slug), alumnaActual()]);

  if (!bolso) notFound();

  const bloqueado = !bolso.gratis && !alumna?.tieneAcceso;
  const siguiente = siguienteVideo(bolso);
  const medidas = medidasEnTexto(bolso.medidas);

  return (
    <main className="min-w-0 flex-1">
      {/*
        La barra lateral está siempre (la pone el layout), así que esta barra de
        arriba ya no tiene que servir de menú. Se queda porque sigue haciendo
        dos cosas que la lateral no hace: decir DÓNDE estás dentro de la app y
        dar el salto directo al Ojo Experto con el contexto de este bolso.
      */}
      <div className="border-line bg-cream/90 sticky top-0 z-(--z-sticky) border-b backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-5">
          <Link
            href="/app"
            className="text-ink-muted hover:text-espresso flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Mis bolsos
          </Link>
          <Link
            href={`/app/ojo?bolso=${bolso.slug}`}
            className="text-gold flex items-center gap-2 text-sm font-semibold"
          >
            <Sparkles size={16} aria-hidden="true" />
            Ojo Experto
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-8 md:py-10">
        <header className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center">
          <div className="bg-espresso relative aspect-square overflow-hidden rounded-[var(--radius-xl)]">
            {bolso.portadaUrl ? (
              <Image
                src={bolso.portadaUrl}
                alt={`Bolso ${bolso.nombre}, tejido en cuentas`}
                fill
                /* `priority`: es la imagen grande de la primera pantalla de la
                   ficha. Cargarla tarde deja un rectángulo negro justo donde se
                   mira primero. */
                priority
                sizes="(min-width: 768px) 420px, 100vw"
                className="object-cover"
              />
            ) : (
              /* Los cinco bolsos sin foto todavía: la inicial sobre espresso en
                 vez de un rectángulo vacío que parezca que algo falló. */
              <span
                aria-hidden="true"
                className="font-display text-gold/25 absolute inset-0 flex items-center justify-center text-7xl"
                style={{ fontWeight: 500 }}
              >
                {bolso.nombre.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <h1 className="titulo-seccion">{bolso.nombre}</h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>
                {/* Un llavero no tiene pasos (es un solo video): "0 pasos" sobra.
                    Y "1 videos" se lee como un error. */}
                {bolso.pasos.length > 0 &&
                  `${bolso.pasos.length} ${bolso.pasos.length === 1 ? "paso" : "pasos"} · `}
                {bolso.videos} {bolso.videos === 1 ? "video" : "videos"}
              </Chip>
              {medidas && <Chip>{medidas}</Chip>}
              {bolso.gratis && <Chip destacado>Gratis</Chip>}
            </div>

            <div className="mt-5 flex items-center gap-4">
              <span className="bg-line h-1.5 flex-1 overflow-hidden rounded-full">
                <span
                  className="bg-gold block h-full rounded-full"
                  style={{ width: `${Math.round((bolso.vistos / bolso.videos) * 100)}%` }}
                />
              </span>
              <span className="text-ink-muted shrink-0 text-sm">
                {bolso.vistos} de {bolso.videos}
              </span>
            </div>

            {bloqueado ? (
              /*
                Bloqueado: se enseña TODO el índice —cuántos pasos, qué
                materiales, las medidas— y solo se retiene el video. Es lo que
                hace que valga la pena pagar: ya sabes exactamente qué recibes.
              */
              <div className="bg-sand mt-6 rounded-[var(--radius-lg)] p-5">
                <p className="text-espresso font-semibold">
                  Este {esLlavero(bolso) ? "llavero" : "bolso"} viene con el plan
                </p>
                <p className="text-ink-body mt-1 text-sm">
                  {/* ⚠️ Decía "necesitas Creadora o Maestra": planes que no existen
                      desde el 2026-10-13 (hay uno solo). Corregido el 2026-10-20. */}
                  Puedes ver sus pasos y sus materiales. Para los videos necesitas el plan,
                  desde {precioDesde()} al mes.
                </p>
                {/*
                  ⚠️ EL DESTINO DEPENDE DE QUIÉN MIRA, y la diferencia importa.
                  Sin cuenta, lo siguiente es crearla; con cuenta y sin plan, lo
                  siguiente es pagar. Mandar a las dos al mismo sitio obliga a
                  una de ellas a dar un paso que ya dio.
                */}
                <Link
                  href={alumna ? "/app/plan" : "/entrar"}
                  className="text-espresso mt-4 flex h-12 items-center justify-center rounded-full font-semibold"
                  style={{ backgroundImage: "var(--boton-dorado)" }}
                >
                  {alumna ? "Ver los planes" : "Crear mi cuenta gratis"}
                </Link>
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {siguiente ? (
                  <Link
                    href={`/app/bolsos/${bolso.slug}/${siguiente.orden}`}
                    className="text-espresso flex h-13 flex-1 items-center justify-center gap-2 rounded-full px-6 font-semibold"
                    style={{ backgroundImage: "var(--boton-dorado)" }}
                  >
                    <Play size={16} fill="currentColor" aria-hidden="true" />
                    <span className="truncate">Continuar: {siguiente.etiqueta}</span>
                  </Link>
                ) : (
                  <p className="bg-sand text-espresso flex h-13 flex-1 items-center justify-center rounded-full px-6 font-semibold">
                    ¡Bolso terminado!
                  </p>
                )}
                <Link
                  href={`/app/ojo?bolso=${bolso.slug}`}
                  className="border-line text-espresso flex h-13 items-center justify-center rounded-full border px-6 font-semibold"
                >
                  Preguntar sobre este bolso
                </Link>
              </div>
            )}
          </div>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section>
            <h2 className="font-display text-espresso text-2xl" style={{ fontWeight: 500 }}>
              Paso a paso
            </h2>
            <div className="mt-5">
              <PasoAPaso bolso={bolso} />
            </div>
          </section>

          <section>
            <ListaMateriales materiales={bolso.materiales} />
            <TarjetaDirectorio />
            {medidas && (
              <div className="bg-sand mt-5 rounded-[var(--radius-lg)] p-5">
                <h3 className="text-espresso font-semibold">Medidas del bolso terminado</h3>
                <dl className="mt-3 flex flex-wrap gap-6">
                  {medidasOrdenadas(bolso.medidas).map(([clave, valor]) => (
                    <div key={clave}>
                      <dd
                        className="font-display text-espresso text-2xl"
                        style={{ fontWeight: 500 }}
                      >
                        {String(valor).replace(".", ",")}
                      </dd>
                      <dt className="text-ink-muted text-xs">cm de {etiquetaMedida(clave)}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Chip({ children, destacado = false }: { children: React.ReactNode; destacado?: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        destacado ? "bg-gold-light text-espresso" : "bg-sand text-ink-body"
      }`}
    >
      {children}
    </span>
  );
}

/** `alto_con_asa` → "alto con asa". Las claves vienen del JSON y varían por bolso. */
function etiquetaMedida(clave: string): string {
  return clave.replace(/_/g, " ");
}
