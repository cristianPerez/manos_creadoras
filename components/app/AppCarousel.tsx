"use client";

import { Pause, Play, PlayCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const frames = [
  {
    label: "Tu primer video, listo para empezar",
    kind: "cursos" as const,
  },
  {
    label: "El Ojo Experto revisando tu tejido",
    kind: "ojo-experto" as const,
  },
  {
    label: "Los modelos que vas a aprender a crear",
    kind: "galeria" as const,
  },
];

export function AppCarousel() {
  const [active, setActive] = useState(1);
  const [holding, setHolding] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const paused = holding || manuallyPaused;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % frames.length), 3200);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="mx-auto w-full max-w-72"
      onPointerDown={() => setHolding(true)}
      onPointerUp={() => setHolding(false)}
      onMouseEnter={() => setHolding(true)}
      onMouseLeave={() => setHolding(false)}
    >
      <div className="relative aspect-[9/17.5] w-full rounded-2xl border-4 border-surface-secondary bg-surface-primary overflow-hidden shadow-lg">
        {frames.map((f, i) => (
          <div
            key={f.kind}
            className="absolute inset-0 flex flex-col transition-opacity duration-300"
            style={{ opacity: i === active ? 1 : 0 }}
            aria-hidden={i !== active}
          >
            <Frame kind={f.kind} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <div className="flex items-center gap-2">
          {frames.map((f, i) => (
            <button
              key={f.label}
              aria-label={`Ver: ${f.label}`}
              onClick={() => setActive(i)}
              className="h-2 w-2 rounded-full origin-left transition-transform duration-200"
              style={{
                transform: i === active ? "scaleX(2.5)" : "scaleX(1)",
                backgroundColor: i === active ? "var(--brand-primary)" : "var(--border-strong)",
              }}
            />
          ))}
        </div>
        <button
          aria-label={manuallyPaused ? "Reanudar el carrusel" : "Pausar el carrusel"}
          onClick={() => setManuallyPaused((p) => !p)}
          className="flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors p-2 -m-2"
        >
          {manuallyPaused ? <Play size={12} /> : <Pause size={12} />}
        </button>
      </div>
      <p className="text-center text-text-tertiary mt-2" style={{ fontSize: "var(--text-xs)" }}>
        {frames[active].label}
      </p>
    </div>
  );
}

function Frame({ kind }: { kind: "cursos" | "ojo-experto" | "galeria" }) {
  if (kind === "cursos") {
    return (
      <div className="flex-1 p-4 flex flex-col">
        <p className="text-text-tertiary" style={{ fontSize: "10px" }}>MIS CURSOS</p>
        <div className="mt-3 rounded-lg bg-surface-tertiary aspect-video flex items-center justify-center border border-border-default shadow-sm">
          <PlayCircle className="text-brand-primary" size={32} strokeWidth={1.5} />
        </div>
        <p className="text-text-primary font-body font-medium mt-2" style={{ fontSize: "12px" }}>
          Módulo 1 · Bases del tejido
        </p>
        <div className="mt-3 space-y-2">
          <div className="h-2 rounded bg-surface-secondary w-full" />
          <div className="h-2 rounded bg-surface-secondary w-4/5" />
        </div>
      </div>
    );
  }
  if (kind === "ojo-experto") {
    return (
      <div className="flex-1 p-4 flex flex-col gap-2">
        <p className="text-text-tertiary" style={{ fontSize: "10px" }}>EL OJO EXPERTO</p>
        <div className="mt-1 rounded-lg overflow-hidden aspect-square relative border border-border-default">
          <Image src="/images/bag-pearl-hobo.png" alt="Ejemplo de tejido en progreso" fill className="object-cover" sizes="280px" />
        </div>
        <div className="rounded-lg bg-surface-secondary p-2 mt-1">
          <p className="text-text-secondary" style={{ fontSize: "10.5px", lineHeight: 1.4 }}>
            &ldquo;Vas muy bien. Aprieta un poco más la tensión en la base para que no se abombe.&rdquo;
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 p-4">
      <p className="text-text-tertiary" style={{ fontSize: "10px" }}>APRENDERÁS A CREARLOS</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg overflow-hidden aspect-square relative border border-border-default">
          <Image src="/images/bag-pink-crystal.png" alt="Bolso Rose Crystal" fill className="object-cover" sizes="140px" />
        </div>
        <div className="rounded-lg overflow-hidden aspect-square relative border border-border-default">
          <Image src="/images/bag-gold-crystal.png" alt="Bolso Gold Crystal" fill className="object-cover" sizes="140px" />
        </div>
      </div>
    </div>
  );
}
