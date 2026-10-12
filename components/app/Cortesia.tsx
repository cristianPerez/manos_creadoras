import { Check, Play } from "lucide-react";
import Link from "next/link";
import { PRECIO_DESDE } from "@/lib/planes";
import type { BolsoConDetalle } from "@/lib/bolsos-logica";

/**
 * Lo que ve quien llega sin cuenta.
 *
 * ⚠️ NO ES UN MURO DE PAGO. Enseña el bolso gratis ENTERO —su video de
 * materiales y sus tres pasos— y se puede tejer sin dar un correo. La oferta
 * está al lado, no delante: quien quiera seguir hasta el bolso terminado la
 * tiene a un clic, y quien solo venía a mirar se lleva algo de verdad.
 *
 * Es la misma decisión de septiembre (los tutoriales de cortesía), pero mejor:
 * antes eran tres lecciones sueltas sacadas de la mitad del temario; ahora es
 * un bolso completo, con principio y final.
 */

const BENEFICIOS = [
  "Los 14 bolsos completos, y uno nuevo cada mes",
  "La ficha de materiales de cada uno, con dónde comprarlos",
  "El Ojo Experto: sube una foto y te dice qué ajustar",
  "La comunidad privada y los retos del mes",
];

export function Cortesia({ bolso }: { bolso: BolsoConDetalle | null }) {
  return (
    <main className="min-w-0 flex-1 px-5 py-10 md:px-10">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-14">
        <div>
          <p className="eyebrow">Acceso de cortesía</p>
          <h1 className="titulo-seccion mt-2 text-balance">Tu primer bolso empieza aquí</h1>
          <p className="text-ink-body mt-4 max-w-lg">
            {bolso
              ? `Te regalamos ${bolso.nombre} completo: los materiales y los ${bolso.pasos.length} pasos, sin pagar y sin crear ninguna cuenta.`
              : "Te regalamos un bolso completo, sin pagar y sin crear ninguna cuenta."}
          </p>

          {bolso ? (
            <ol className="mt-8 flex flex-col gap-3">
              <li>
                <Paso
                  href={`/app/bolsos/${bolso.slug}/0`}
                  titulo="Materiales"
                  pie="Lo que necesitas antes de empezar"
                  destacado
                />
              </li>
              {bolso.pasos.map((paso) => (
                <li key={paso.numero}>
                  <Paso
                    href={`/app/bolsos/${bolso.slug}/${paso.partes[0].orden}`}
                    titulo={`${paso.numero}. ${paso.titulo}`}
                    pie={`${paso.partes.length} video${paso.partes.length > 1 ? "s" : ""}`}
                  />
                </li>
              ))}
            </ol>
          ) : (
            /*
              El bolso gratis no está en la base. No se inventa una lista vacía
              que parezca que la app está rota: se dice lo que pasa y se ofrece
              el único camino que sí funciona.
            */
            <p className="border-line text-ink-body mt-8 rounded-[var(--radius-lg)] border border-dashed p-6 text-sm">
              Estamos preparando el bolso de cortesía. Mientras tanto puedes ver todo lo que incluye
              la membresía.
            </p>
          )}
        </div>

        <aside className="bg-sand h-fit rounded-[var(--radius-xl)] p-7 lg:sticky lg:top-8">
          <h2 className="font-display text-espresso text-2xl text-balance" style={{ fontWeight: 500 }}>
            ¿Y si sigues hasta el bolso terminado?
          </h2>

          <ul className="mt-5 flex flex-col gap-3">
            {BENEFICIOS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <Check size={16} strokeWidth={2.5} className="text-gold mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-ink-body text-sm">{b}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/#planes"
            className="text-espresso mt-7 flex h-14 items-center justify-center rounded-full font-semibold transition-transform active:scale-[0.98]"
            style={{ backgroundImage: "var(--boton-dorado)" }}
          >
            Quiero terminar mi bolso
          </Link>

          {/* El precio sale de `lib/planes.ts`. Escribirlo aquí sería el camino
              más corto a que la landing diga una cifra y esta pantalla otra. */}
          <p className="text-ink-muted mt-3 text-center text-sm">
            Desde {PRECIO_DESDE} al mes con el plan anual
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="bg-ivory text-ink-body rounded-full px-3 py-1.5 text-xs font-semibold">
              Garantía de 7 días
            </span>
            <span className="bg-ivory text-ink-body rounded-full px-3 py-1.5 text-xs font-semibold">
              +1.200 alumnas · 4,9/5
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Paso({
  href,
  titulo,
  pie,
  destacado = false,
}: {
  href: string;
  titulo: string;
  pie: string;
  destacado?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-[var(--radius-lg)] p-4 transition-colors ${
        destacado ? "bg-sand" : "bg-ivory border-line border"
      }`}
    >
      <span
        aria-hidden="true"
        className="bg-espresso text-gold-light flex size-10 shrink-0 items-center justify-center rounded-full"
      >
        <Play size={15} fill="currentColor" />
      </span>
      <span className="min-w-0">
        <span className="text-espresso block font-semibold">{titulo}</span>
        <span className="text-ink-muted block text-sm">{pie}</span>
      </span>
    </Link>
  );
}
