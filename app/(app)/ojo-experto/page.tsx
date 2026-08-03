import { Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConsultaOjoExperto } from "@/components/app/ConsultaOjoExperto";
import { Reveal } from "@/components/app/Reveal";
import { cargarOjoExperto } from "@/lib/ojo-experto";

export const metadata: Metadata = { title: "El Ojo Experto — Manos Creadoras" };

export default async function OjoExperto() {
  const estado = await cargarOjoExperto();
  if (!estado) redirect("/login");

  return (
    <>
      <Reveal>
        <header>
          <p
            className="text-brand-primary"
            style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
          >
            TU MENTORA DE BOLSILLO
          </p>
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            El Ojo Experto
          </h1>
          <p
            className="text-text-secondary mt-2"
            style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
          >
            Sube una foto de tu tejido o cuéntame qué se te complica — te digo qué ajustar antes de
            que sigas.
          </p>
        </header>
      </Reveal>

      {estado.tieneAcceso ? (
        <ConsultaOjoExperto historialInicial={estado.historial} usoInicial={estado.uso} />
      ) : (
        <Reveal delay={0.06}>
          <section className="mt-6 rounded-xl border border-border-default bg-surface-primary p-6 text-center shadow-sm">
            <h2 className="font-display font-normal text-text-primary" style={{ fontSize: "var(--text-xl)" }}>
              El Ojo Experto está en pausa
            </h2>
            <p
              className="text-text-secondary mt-2"
              style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
            >
              Vuelve a estar disponible cuando reactives tu membresía. Tus consultas anteriores te
              esperan aquí.
            </p>
            <Link
              href="/contacto"
              className="mt-5 inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold text-text-inverse [touch-action:manipulation]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
                fontSize: "var(--text-sm)",
              }}
            >
              Escribirle a Manos Creadoras
            </Link>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.24}>
        <p
          className="mt-6 flex items-start gap-2 text-text-tertiary"
          style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
        >
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          El Ojo Experto es orientación con inteligencia artificial, no una revisión humana — puede
          equivocarse. Tu criterio y el método del curso mandan.
        </p>
      </Reveal>
    </>
  );
}
