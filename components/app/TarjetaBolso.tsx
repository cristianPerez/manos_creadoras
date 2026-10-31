import Image from "next/image";
import Link from "next/link";
import { estadoDe, medidasEnTexto, type Bolso } from "@/lib/bolsos-logica";

/**
 * Una tarjeta del catálogo.
 *
 * `bloqueado` NO se calcula aquí: se lo pasa el catálogo, que es quien sabe el
 * plan de quien mira. Si lo decidiera la tarjeta, esta regla de negocio
 * quedaría repartida en catorce sitios de la pantalla.
 */
export function TarjetaBolso({ bolso, bloqueado }: { bolso: Bolso; bloqueado: boolean }) {
  const estado = estadoDe(bolso);
  const medidas = medidasEnTexto(bolso.medidas);
  const avance = bolso.videos > 0 ? Math.round((bolso.vistos / bolso.videos) * 100) : 0;

  return (
    <Link
      href={`/app/bolsos/${bolso.slug}`}
      className="group block focus-visible:outline-none"
      aria-label={`${bolso.nombre}${bloqueado ? " — necesita un plan de pago" : ""}`}
    >
      {/* Foto 4:5 (app interna, 2026-10-23): los bolsos son verticales y en
          cuadrado se cortaba el asa. */}
      <div className="bg-espresso relative aspect-[4/5] overflow-hidden rounded-lg">
        {bolso.portadaUrl ? (
          <Image
            src={bolso.portadaUrl}
            alt={`Bolso ${bolso.nombre}`}
            fill
            sizes="(min-width: 1024px) 280px, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          /*
            Sin foto todavía: en vez de un hueco gris se pinta la inicial del
            bolso sobre espresso. Las 14 fotos están pendientes y una rejilla de
            rectángulos vacíos haría parecer que la app está rota.
          */
          <span
            aria-hidden="true"
            className="font-display text-gold/25 absolute inset-0 flex items-center justify-center text-6xl"
            style={{ fontWeight: 500 }}
          >
            {bolso.nombre.charAt(0)}
          </span>
        )}

        <Etiqueta estado={estado} gratis={bolso.gratis} bloqueado={bloqueado} />
      </div>

      <h3
        className="font-display text-espresso mt-3 truncate"
        style={{ fontWeight: 500, fontSize: 21, lineHeight: 1.2 }}
      >
        {bolso.nombre}
      </h3>

      <p className="text-ink-muted mt-0.5 text-xs">
        {bolso.videos} videos
        {/* Las medidas solo si existen: siete bolsos aún no las tienen, y un
            " · " suelto al final se lee como un error. */}
        {medidas ? ` · ${medidas}` : ""}
      </p>

      {/* La barra solo aparece si hay algo que enseñar. A cero, trece barras
          vacías en la rejilla son trece recordatorios de que no has hecho nada. */}
      {avance > 0 && (
        <div
          className="bg-sand-hover mt-2 h-1 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={avance}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${bolso.vistos} de ${bolso.videos} videos`}
        >
          <span className="bg-cacao block h-full rounded-full" style={{ width: `${avance}%` }} />
        </div>
      )}
    </Link>
  );
}

function Etiqueta({
  estado,
  gratis,
  bloqueado,
}: {
  estado: ReturnType<typeof estadoDe>;
  gratis: boolean;
  bloqueado: boolean;
}) {
  /* Planos (2026-10-23): sin el vidrio desenfocado del "Con plan". */
  const base =
    "absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase";

  if (bloqueado) {
    return <span className={`${base} bg-espresso text-gold-pale`}>Con plan</span>;
  }
  if (gratis) return <span className={`${base} bg-gold-pale text-espresso`}>Gratis</span>;
  if (estado === "terminado")
    return <span className={`${base} bg-gold-pale text-espresso`}>Terminado</span>;
  if (estado === "en-curso")
    return <span className={`${base} bg-ivory text-espresso`}>En curso</span>;
  return null;
}
