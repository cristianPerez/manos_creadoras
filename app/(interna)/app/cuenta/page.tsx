import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActivarAvisos } from "@/components/app/ActivarAvisos";
import { BotonCerrarSesion } from "@/components/app/BotonCerrarSesion";
import { BarraLateral } from "@/components/app/NavegacionApp";
import { FormularioAcceso } from "@/components/app/FormularioAcceso";
import { alumnaActual, cupoActual } from "@/lib/alumna";
import { PLANES, precioPorMes } from "@/lib/planes";

export const metadata: Metadata = { title: "Mi cuenta — Manos Creadoras" };

const LEGALES = [
  { href: "/contacto", texto: "Contacto" },
  { href: "/legal/cancelar", texto: "Cómo cancelar" },
  { href: "/legal/reembolso", texto: "Reembolsos" },
  { href: "/legal/terminos", texto: "Términos" },
  { href: "/legal/privacidad", texto: "Privacidad" },
];

export default async function MiCuenta() {
  const alumna = await alumnaActual();

  /* Sin sesión, esta pestaña ES el formulario de entrar. No se rebota a /entrar:
     sacarla de la app justo al tocar una pestaña se siente como un error. */
  if (!alumna) {
    return (
      <>
        <BarraLateral />
        <main className="min-w-0 flex-1 px-5 py-10">
          <div className="mx-auto max-w-md">
            <FormularioAcceso lugar="cuenta" />
          </div>
        </main>
      </>
    );
  }

  const cupo = await cupoActual(alumna.id);
  const plan = PLANES.find((p) => p.id === alumna.plan);
  const precio =
    plan && alumna.ciclo ? precioPorMes(plan.precioMes[alumna.ciclo]) : null;

  return (
    <>
      <BarraLateral />
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Tu cuenta</p>
          <h1 className="titulo-seccion mt-2">Mi cuenta</h1>

          {/* La tarjeta del plan, en oscuro: es lo primero que se busca aquí. */}
          <section
            className="mt-8 rounded-[var(--radius-xl)] p-7 text-white"
            style={{ backgroundImage: "var(--card-destacada)" }}
          >
            <p className="text-gold-light text-xs font-bold tracking-[0.18em] uppercase">
              {alumna.tieneAcceso ? "Membresía activa" : "Plan gratuito"}
            </p>
            <h2 className="font-display mt-2 text-2xl" style={{ fontWeight: 500 }}>
              Plan {plan?.nombre ?? "Aprendiz"}
              {alumna.ciclo ? ` · ${alumna.ciclo}` : ""}
            </h2>
            {/* ⚠️ El precio sale de `lib/planes.ts`. Aquí vivían los precios
                VIEJOS (USD 199/año) mientras la landing ya vendía otra cosa. */}
            {precio && <p className="mt-1 text-white/70">{precio} al mes</p>}
            {alumna.venceEl && (
              <p className="mt-1 text-sm text-white/60">
                {alumna.estado === "cancelada" ? "Tienes acceso hasta el" : "Se renueva el"}{" "}
                {new Date(alumna.venceEl).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {alumna.plan !== "maestra" && (
                <Link
                  href="/#planes"
                  className="text-espresso flex h-12 items-center rounded-full px-6 text-sm font-semibold"
                  style={{ backgroundImage: "var(--boton-dorado)" }}
                >
                  {alumna.tieneAcceso ? "Pasar a Maestra" : "Ver los planes"}
                </Link>
              )}
              {alumna.tieneAcceso && (
                <Link
                  href="/contacto"
                  className="flex h-12 items-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white"
                >
                  Gestionar mi plan
                </Link>
              )}
            </div>
          </section>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Tarjeta titulo="Tus datos">
              <p className="text-ink-body text-sm">{alumna.email}</p>
              {alumna.miembroDesde && (
                <p className="text-ink-muted mt-1 text-sm">
                  Miembro desde el{" "}
                  {new Date(alumna.miembroDesde).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </Tarjeta>

            {cupo && (
              <Tarjeta titulo="Ojo Experto este mes">
                <Barra
                  etiqueta="Preguntas"
                  usado={cupo.preguntasUsadas}
                  total={cupo.preguntasLimite}
                />
                <div className="mt-3">
                  <Barra etiqueta="Fotos" usado={cupo.fotosUsadas} total={cupo.fotosLimite} />
                </div>
              </Tarjeta>
            )}

            <Tarjeta titulo="Avisos de modelos nuevos">
              <ActivarAvisos />
            </Tarjeta>

            <Tarjeta titulo="Ayuda y legal">
              <ul className="flex flex-col">
                {LEGALES.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-ink-body hover:text-espresso flex h-11 items-center text-sm"
                    >
                      {l.texto}
                    </Link>
                  </li>
                ))}
                {/* El Directorio no cabe en la barra de abajo de móvil: su
                    puerta está aquí y en la ficha de cada bolso. */}
                <li className="lg:hidden">
                  <Link
                    href="/app/directorio"
                    className="text-ink-body hover:text-espresso flex h-11 items-center gap-2 text-sm"
                  >
                    Directorio de proveedores
                    <ExternalLink size={13} aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </Tarjeta>
          </div>

          <div className="mt-8">
            <BotonCerrarSesion />
          </div>
        </div>
      </main>
    </>
  );
}

function Tarjeta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="bg-ivory border-line rounded-[var(--radius-lg)] border p-5">
      <h2 className="text-espresso font-semibold">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Barra({ etiqueta, usado, total }: { etiqueta: string; usado: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((usado / total) * 100)) : 0;
  return (
    <div>
      <div className="text-ink-muted flex justify-between text-sm">
        <span>{etiqueta}</span>
        <span>
          <strong className="text-espresso font-semibold">{usado}</strong> de {total}
        </span>
      </div>
      <div
        className="bg-line mt-1.5 h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={usado}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={etiqueta}
      >
        <span className="bg-gold block h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
