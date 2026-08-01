"use client";

import { AlertCircle, Camera, Info, Loader2, Send, Sparkles } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Reveal } from "@/components/app/Reveal";
import {
  CONSULTAS,
  LIMITE_FOTOS,
  LIMITE_PREGUNTAS,
  USADAS_FOTOS_INICIAL,
  USADAS_PREGUNTAS_INICIAL,
  type Consulta,
} from "@/lib/demo-data";

const SUGERENCIAS = [
  "¿Por qué se me abomba la base?",
  "¿Qué hilo uso para este modelo?",
  "¿Está pareja mi tensión?",
  "¿Cómo remato el borde?",
];

type Estado = "idle" | "enviando" | "respondido" | "error";

export default function OjoExperto() {
  const [pregunta, setPregunta] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [respuesta, setRespuesta] = useState("");
  const [historial, setHistorial] = useState<Consulta[]>(CONSULTAS);
  const [usadasPreguntas, setUsadasPreguntas] = useState(USADAS_PREGUNTAS_INICIAL);
  const [usadasFotos, setUsadasFotos] = useState(USADAS_FOTOS_INICIAL);
  const fileRef = useRef<HTMLInputElement>(null);

  const sinCupo = usadasPreguntas >= LIMITE_PREGUNTAS;
  const enEspera = estado === "enviando" || !pregunta.trim() || sinCupo;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enEspera) return;
    setEstado("enviando");
    await new Promise((r) => setTimeout(r, 1400));

    const texto =
      "Por lo que me cuentas, lo más probable es que la tensión esté suelta en las primeras vueltas. Aprieta un poco más cada 3-4 cuentas y revisa que el hilo no quede flojo al cambiar de vuelta.";
    setRespuesta(texto);
    setEstado("respondido");
    setUsadasPreguntas((n) => n + 1);
    setHistorial((h) => [
      { id: `nueva-${Date.now()}`, tipo: "texto", pregunta, respuesta: texto, haceDias: 0 },
      ...h,
    ]);
    setPregunta("");
  }

  function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    if (usadasFotos >= LIMITE_FOTOS) return;
    setUsadasFotos((n) => n + 1);
    const texto =
      "Recibí tu foto. El tejido se ve parejo; cuida que la última vuelta quede con la misma tensión para que el borde no se abra al coser el herraje.";
    setRespuesta(texto);
    setEstado("respondido");
    setHistorial((h) => [
      {
        id: `foto-${Date.now()}`,
        tipo: "foto",
        pregunta: "Revisión de mi tejido por foto",
        respuesta: texto,
        haceDias: 0,
      },
      ...h,
    ]);
    e.target.value = "";
  }

  return (
    <>
      <Reveal>
        <header>
          <p className="text-brand-primary" style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}>
            TU MENTORA DE BOLSILLO
          </p>
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            El Ojo Experto
          </h1>
          <p className="text-text-secondary mt-2" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
            Sube una foto de tu tejido o cuéntame qué se te complica — te digo qué ajustar antes de
            que sigas.
          </p>
        </header>
      </Reveal>

      <Reveal delay={0.06}>
        <section
          aria-label="Nueva consulta"
          className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-[var(--shadow-gold)]"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFoto}
            className="sr-only"
            aria-label="Foto de tu tejido"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={usadasFotos >= LIMITE_FOTOS}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-tertiary py-6 text-brand-primary disabled:text-text-tertiary [touch-action:manipulation]"
          >
            <Camera size={20} aria-hidden="true" />
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
              {usadasFotos >= LIMITE_FOTOS ? "Fotos agotadas este mes" : "Subir foto de mi tejido"}
            </span>
          </button>

          <form onSubmit={enviar} className="mt-3">
            <label htmlFor="pregunta" className="sr-only">
              Tu pregunta para el Ojo Experto
            </label>
            <textarea
              id="pregunta"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              disabled={estado === "enviando" || sinCupo}
              rows={3}
              placeholder="O escríbeme tu duda…"
              className="w-full resize-none rounded-lg border border-border-default bg-surface-tertiary px-3 py-2.5 text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-strong disabled:opacity-60"
              style={{ fontSize: "var(--text-base)" }}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPregunta(s)}
                  className="rounded-lg border border-border-default bg-surface-tertiary px-3 py-2 text-text-secondary [touch-action:manipulation]"
                  style={{ fontSize: "var(--text-xs)" }}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={enEspera}
              className={`mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full font-semibold ${
                enEspera
                  ? "border border-border-default bg-surface-tertiary text-text-tertiary"
                  : "text-text-inverse"
              }`}
              style={{
                backgroundImage: enEspera
                  ? undefined
                  : "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
                fontSize: "var(--text-base)",
              }}
            >
              {estado === "enviando" ? (
                <>
                  <Loader2 className="animate-spin" size={18} aria-hidden="true" /> Revisando tu tejido…
                </>
              ) : (
                <>
                  <Send size={17} aria-hidden="true" /> Preguntarle al Ojo Experto
                </>
              )}
            </button>
          </form>

          {sinCupo && (
            <p
              className="mt-3 flex items-start gap-2 text-status-warning"
              style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
              role="status"
            >
              <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              Llegaste a tus {LIMITE_PREGUNTAS} preguntas de este mes. Se renuevan el día 1 — mientras
              tanto, tus videos y patrones siguen disponibles.
            </p>
          )}

          {estado === "error" && (
            <div
              className="mt-3 rounded-lg border border-border-default bg-surface-tertiary p-3"
              role="alert"
            >
              <p className="text-status-error" style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}>
                No pudimos conectar con el Ojo Experto
              </p>
              <p className="text-text-secondary mt-1" style={{ fontSize: "var(--text-xs)" }}>
                Revisa tu conexión y vuelve a intentar — tu pregunta no se perdió.
              </p>
              <button
                type="button"
                onClick={() => setEstado("idle")}
                className="mt-2 text-brand-primary"
                style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}
              >
                Reintentar
              </button>
            </div>
          )}

          {estado === "enviando" && (
            <div className="mt-4 space-y-2" aria-hidden="true">
              <div className="h-3 w-full animate-pulse rounded bg-surface-tertiary" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-surface-tertiary" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-surface-tertiary" />
            </div>
          )}

          {estado === "respondido" && (
            <div className="reveal mt-4 rounded-lg border border-border-default bg-surface-tertiary p-3" role="status">
              <div className="flex items-center gap-2">
                <Sparkles className="text-brand-primary" size={14} aria-hidden="true" />
                <span className="text-brand-primary" style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}>
                  El Ojo Experto
                </span>
              </div>
              <p className="text-text-secondary mt-2" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
                {respuesta}
              </p>
            </div>
          )}
        </section>
      </Reveal>

      <Reveal delay={0.12}>
        <section aria-label="Tu uso este mes" className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm">
          <p className="text-text-secondary" style={{ fontSize: "var(--text-sm)" }}>
            Tu uso este mes
          </p>
          <div className="mt-3 flex gap-6">
            <Medidor label="Preguntas" usadas={usadasPreguntas} total={LIMITE_PREGUNTAS} />
            <Medidor label="Fotos" usadas={usadasFotos} total={LIMITE_FOTOS} />
          </div>
          <p className="text-text-tertiary mt-3" style={{ fontSize: "var(--text-xs)" }}>
            Se renueva el 1 de cada mes. Incluido en tu acceso, sin costo extra.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.18}>
        <section aria-label="Tus consultas anteriores" className="mt-8">
          <h2 className="font-display text-text-primary" style={{ fontSize: "var(--text-lg)" }}>
            Lo que ya preguntaste
          </h2>

          {historial.length === 0 ? (
            <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-border-default bg-surface-primary px-6 py-10 text-center shadow-sm">
              <Sparkles className="text-brand-primary" size={26} aria-hidden="true" />
              <h3 className="font-display text-text-primary" style={{ fontSize: "var(--text-lg)" }}>
                Tu primera consulta te espera
              </h3>
              <p className="text-text-secondary" style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}>
                Prueba con algo simple: &ldquo;¿está pareja mi tensión?&rdquo; y sube una foto de tu
                tejido.
              </p>
            </div>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {historial.map((c) => (
                <li key={c.id} className="rounded-xl border border-border-default bg-surface-primary p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-brand-primary" aria-hidden="true">
                      {c.tipo === "foto" ? <Camera size={14} /> : <Send size={13} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
                        {c.pregunta}
                      </p>
                      <p
                        className="text-text-secondary mt-1 line-clamp-2"
                        style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
                      >
                        {c.respuesta}
                      </p>
                      <p className="text-text-tertiary mt-1.5" style={{ fontSize: "11px" }}>
                        {c.haceDias === 0
                          ? "recién"
                          : `hace ${c.haceDias} ${c.haceDias === 1 ? "día" : "días"}`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>

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

function Medidor({ label, usadas, total }: { label: string; usadas: number; total: number }) {
  const puntos = Math.min(total, 10);
  const llenos = Math.round((usadas / total) * puntos);
  return (
    <div className="flex-1">
      <p className="text-text-primary tabular" style={{ fontSize: "var(--text-lg)", fontWeight: 500 }}>
        {usadas}
        <span className="text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
          {" "}
          / {total}
        </span>
      </p>
      <p className="text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
        {label}
      </p>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {Array.from({ length: puntos }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: i < llenos ? "var(--brand-primary)" : "var(--surface-tertiary)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
