import { Check, Play } from "lucide-react";
import Link from "next/link";
import type { BolsoConDetalle } from "@/lib/bolsos-logica";

/**
 * La lista de pasos de un bolso.
 *
 * ⚠️ "MATERIALES" VA PRIMERO Y SIN NÚMERO. No es el paso 0 ni el paso 1: es lo
 * que haces ANTES de empezar. Numerarlo correría todos los demás y la alumna
 * que oye "vamos por el paso 3" en la mentoría no encontraría el mismo paso 3.
 *
 * Un paso partido en varios videos se dibuja como UNA fila con sus partes
 * dentro, nunca como dos pasos — para quien teje, la base es una sola cosa
 * aunque el video se cortara por la mitad.
 */
export function PasoAPaso({
  bolso,
  ordenActual,
}: {
  bolso: BolsoConDetalle;
  /** El video que se está viendo, para resaltarlo. 0 es el de materiales. */
  ordenActual?: number;
}) {
  return (
    <ol className="flex flex-col gap-3">
      <li>
        <Fila
          href={`/app/bolsos/${bolso.slug}/0?ver=1`}
          titulo="Materiales"
          pie={bolso.materialesVisto ? "Visto · 1 video" : "1 video"}
          completado={bolso.materialesVisto}
          actual={ordenActual === 0}
        />
      </li>

      {bolso.pasos.map((paso) => {
        const variasPartes = paso.partes.length > 1;
        const aquiDentro = paso.partes.some((p) => p.orden === ordenActual);

        return (
          <li key={paso.numero}>
            <Fila
              href={`/app/bolsos/${bolso.slug}/${paso.partes[0].orden}?ver=1`}
              numero={paso.numero}
              titulo={`${paso.numero}. ${paso.titulo}`}
              pie={
                variasPartes
                  ? `${paso.partes.length} videos${aquiDentro ? " · vas aquí" : ""}`
                  : paso.completado
                    ? "Visto · 1 video"
                    : "1 video"
              }
              completado={paso.completado}
              actual={aquiDentro}
              /* Un paso de un solo video no necesita desplegar nada: la fila ya
                 ES el video. Desplegar "Parte 1 de 1" sería ruido. */
              partes={
                variasPartes ? (
                  <ul className="mt-3 flex flex-col gap-1 pl-14">
                    {paso.partes.map((parte) => (
                      <li key={parte.id}>
                        <Link
                          href={`/app/bolsos/${bolso.slug}/${parte.orden}?ver=1`}
                          className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                            parte.orden === ordenActual ? "bg-sand" : "hover:bg-sand/60"
                          }`}
                        >
                          <span className="text-ink-body flex items-center gap-2">
                            <Play size={11} className="text-gold" aria-hidden="true" />
                            Parte {parte.parte}
                          </span>
                          <span className="text-gold shrink-0 text-xs font-semibold">
                            {parte.vista ? "Visto" : "Seguir"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null
              }
            />
          </li>
        );
      })}
    </ol>
  );
}

function Fila({
  href,
  numero,
  titulo,
  pie,
  completado,
  actual,
  partes,
}: {
  href: string;
  numero?: number;
  titulo: string;
  pie: string;
  completado: boolean;
  actual: boolean;
  partes?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-ivory rounded-[var(--radius-lg)] p-4 transition-colors ${
        actual ? "border-gold border-2" : "border-line border"
      }`}
    >
      <Link href={href} className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            completado ? "bg-gold text-white" : "bg-espresso text-gold-light"
          }`}
        >
          {completado ? <Check size={16} strokeWidth={3} /> : (numero ?? <Play size={14} fill="currentColor" />)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-espresso block font-semibold">{titulo}</span>
          <span className="text-ink-muted block text-sm">{pie}</span>
        </span>
      </Link>
      {partes}
    </div>
  );
}
