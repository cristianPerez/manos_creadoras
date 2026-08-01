import { Check, Clock, Lock, Play } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/app/Reveal";
import { VideoLeccion } from "@/components/app/VideoLeccion";
import {
  ALUMNA,
  MODULOS,
  completados,
  moduloActual,
  progresoPct,
  type EstadoModulo,
} from "@/lib/demo-data";

export const metadata: Metadata = { title: "Mis cursos — Manos Creadoras" };

const CHIP: Record<EstadoModulo, { label: string; clase: string }> = {
  completado: { label: "Listo", clase: "bg-status-success/15 text-status-success" },
  "en-curso": { label: "Vas aquí", clase: "bg-brand-primary-soft text-brand-primary" },
  pendiente: { label: "Te espera", clase: "bg-surface-tertiary text-text-tertiary" },
};

export default function Cursos() {
  return (
    <>
      <Reveal>
        <header>
          <p className="text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
            Día {ALUMNA.desdeDias} en el programa
          </p>
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Hola, {ALUMNA.nombre}
          </h1>
        </header>
      </Reveal>

      {/* OBJETO PRINCIPAL — retomar donde quedó */}
      <Reveal delay={0.06}>
        <section
          aria-label="Continuar tu módulo"
          className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-[var(--shadow-gold)]"
        >
          <VideoLeccion videoId={moduloActual.hotmartVideoId} titulo={moduloActual.titulo} />
          <p className="text-brand-primary mt-4" style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}>
            SIGUES AQUÍ
          </p>
          <h2
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-xl)", lineHeight: "var(--leading-snug)" }}
          >
            {moduloActual.numero}. {moduloActual.titulo}
          </h2>
          <p className="text-text-secondary mt-1 flex items-center gap-1.5" style={{ fontSize: "var(--text-sm)" }}>
            <Clock size={13} aria-hidden="true" /> {moduloActual.duracionMin} min
          </p>

          <Link
            href="/cursos"
            className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full font-semibold text-text-inverse"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
              fontSize: "var(--text-base)",
            }}
          >
            <Play size={18} aria-hidden="true" /> Seguir tejiendo
          </Link>
        </section>
      </Reveal>

      {/* PROGRESO — dato agregado, no solo la lista cruda */}
      <Reveal delay={0.12}>
        <section aria-label="Tu avance" className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <p className="text-text-secondary" style={{ fontSize: "var(--text-sm)" }}>
              Tu avance
            </p>
            <p className="font-display text-text-primary tabular" style={{ fontSize: "var(--text-xl)" }}>
              {completados}
              <span className="text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
                {" "}
                de {MODULOS.length} módulos
              </span>
            </p>
          </div>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-tertiary"
            role="progressbar"
            aria-valuenow={progresoPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progresoPct}% del programa completado`}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progresoPct}%`,
                backgroundImage:
                  "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
              }}
            />
          </div>
          <p className="text-text-tertiary mt-2" style={{ fontSize: "var(--text-xs)" }}>
            Te faltan {MODULOS.length - completados} para terminar tu primera colección.
          </p>
        </section>
      </Reveal>

      {/* LISTA DE MÓDULOS */}
      <Reveal delay={0.18}>
        <section aria-label="Todos los módulos" className="mt-8">
          <h2 className="font-display text-text-primary" style={{ fontSize: "var(--text-lg)" }}>
            Todo el programa
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {MODULOS.map((m) => {
              const chip = CHIP[m.estado];
              const bloqueado = m.estado === "pendiente";
              return (
                <li key={m.id}>
                  <Link
                    href="/cursos"
                    className="flex w-full items-center gap-3 rounded-xl border border-border-default bg-surface-primary p-3 text-left shadow-sm [touch-action:manipulation]"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        m.estado === "completado"
                          ? "bg-status-success/15 text-status-success"
                          : m.estado === "en-curso"
                            ? "bg-brand-primary-soft text-brand-primary"
                            : "bg-surface-tertiary text-text-tertiary"
                      }`}
                    >
                      {m.estado === "completado" ? (
                        <Check size={16} strokeWidth={2.5} />
                      ) : bloqueado ? (
                        <Lock size={15} />
                      ) : (
                        <Play size={15} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-text-primary"
                        style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}
                      >
                        {m.numero}. {m.titulo}
                      </span>
                      <span className="mt-0.5 block text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
                        {m.duracionMin} min
                      </span>
                    </span>
                    <span
                      className={`inline-flex w-fit shrink-0 items-center rounded-lg px-2 py-1 ${chip.clase}`}
                      style={{ fontSize: "11px", fontWeight: 500 }}
                    >
                      {chip.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </Reveal>

      <Reveal delay={0.24}>
        <p className="mt-6 text-center text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
          Tu acceso es de por vida — avanzas a tu ritmo, sin fecha de vencimiento.
        </p>
      </Reveal>
    </>
  );
}
