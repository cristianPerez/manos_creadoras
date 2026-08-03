"use client";

import { AlertCircle, Camera, Loader2, Send, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LIMITE_FOTOS, LIMITE_PREGUNTAS } from "@/lib/config";
import type { Consulta, UsoMensual } from "@/lib/ojo-experto";
import { supabaseBrowser } from "@/lib/supabase/client";

const SUGERENCIAS = [
  "¿Por qué se me abomba la base?",
  "¿Qué hilo uso para este modelo?",
  "¿Está pareja mi tensión?",
  "¿Cómo remato el borde?",
];

/** Cuando sube una foto sin escribir nada, esto es lo que le preguntamos por ella. */
const PREGUNTA_POR_DEFECTO = "Revisa mi tejido y dime qué debo ajustar.";

type Estado = "idle" | "enviando" | "respondido" | "error";

export function ConsultaOjoExperto({
  historialInicial,
  usoInicial,
}: {
  historialInicial: Consulta[];
  usoInicial: UsoMensual;
}) {
  const [pregunta, setPregunta] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>("idle");
  const [respuesta, setRespuesta] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [historial, setHistorial] = useState<Consulta[]>(historialInicial);
  const [uso, setUso] = useState<UsoMensual>(usoInicial);
  const fileRef = useRef<HTMLInputElement>(null);

  // Liberar la miniatura al cambiarla: si no, el navegador se queda con la anterior en memoria.
  useEffect(() => {
    return () => {
      if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

  const sinPreguntas = uso.preguntas >= LIMITE_PREGUNTAS;
  const sinFotos = uso.fotos >= LIMITE_FOTOS;
  const sinCupo = foto ? sinFotos : sinPreguntas;
  const hayAlgoQueEnviar = Boolean(foto) || pregunta.trim().length >= 3;
  const bloqueado = estado === "enviando" || !hayAlgoQueEnviar || sinCupo;

  function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir la MISMA foto
    if (!archivo) return;
    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    setFoto(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
    setEstado("idle");
  }

  function quitarFoto() {
    if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
    setFoto(null);
    setVistaPrevia(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (bloqueado) return;

    setEstado("enviando");
    setMensajeError("");

    const textoPregunta = pregunta.trim() || PREGUNTA_POR_DEFECTO;
    const eraFoto = Boolean(foto);

    try {
      const {
        data: { session },
      } = await supabaseBrowser().auth.getSession();
      if (!session) {
        setEstado("error");
        setMensajeError("Tu sesión se cerró. Vuelve a entrar y te respondemos enseguida.");
        return;
      }

      const imagenBase64 = foto ? await aBase64Liviana(foto) : undefined;

      const res = await fetch("/api/ojo-experto", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ pregunta: textoPregunta, imagenBase64 }),
      });

      const datos = (await res.json().catch(() => null)) as {
        respuesta?: string;
        error?: string;
        uso?: UsoMensual;
        consulta?: { id?: string };
      } | null;

      if (!res.ok || !datos?.respuesta) {
        setEstado("error");
        setMensajeError(
          datos?.error ?? "No pudimos conectar con el Ojo Experto. Vuelve a intentar.",
        );
        return;
      }

      setRespuesta(datos.respuesta);
      setEstado("respondido");
      if (datos.uso) setUso(datos.uso);

      // Solo entra al historial lo que la base guardó (una pregunta fuera de tema no).
      if (datos.consulta?.id) {
        setHistorial((h) => [
          {
            id: datos.consulta?.id ?? `nueva-${Date.now()}`,
            tipo: eraFoto ? "foto" : "texto",
            pregunta: textoPregunta,
            respuesta: datos.respuesta ?? "",
            haceDias: 0,
          },
          ...h,
        ]);
      }

      setPregunta("");
      quitarFoto();
    } catch {
      setEstado("error");
      setMensajeError("Se cortó la conexión. Revisa tu internet y vuelve a intentar.");
    }
  }

  return (
    <>
      <section
        aria-label="Nueva consulta"
        className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-[var(--shadow-gold)]"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={elegirFoto}
          className="sr-only"
          aria-label="Foto de tu tejido"
        />

        {vistaPrevia ? (
          <div className="relative overflow-hidden rounded-xl border border-border-default">
            <Image
              src={vistaPrevia}
              alt="La foto de tu tejido que vas a enviar"
              width={720}
              height={480}
              unoptimized
              className="h-40 w-full object-cover"
            />
            <button
              type="button"
              onClick={quitarFoto}
              className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-surface-primary/90 text-text-secondary [touch-action:manipulation]"
              aria-label="Quitar la foto"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={sinFotos}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-tertiary py-6 text-brand-primary disabled:text-text-tertiary [touch-action:manipulation]"
          >
            <Camera size={20} aria-hidden="true" />
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
              {sinFotos ? "Fotos agotadas este mes" : "Subir foto de mi tejido"}
            </span>
          </button>
        )}

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
            maxLength={500}
            placeholder={foto ? "Cuéntame qué te preocupa de esta foto (opcional)…" : "O escríbeme tu duda…"}
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
            disabled={bloqueado}
            className={`mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full font-semibold [touch-action:manipulation] ${
              bloqueado
                ? "border border-border-default bg-surface-tertiary text-text-tertiary"
                : "text-text-inverse"
            }`}
            style={{
              backgroundImage: bloqueado
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
            {foto
              ? `Llegaste a tus ${LIMITE_FOTOS} fotos de este mes. Se renuevan el día 1 — mientras tanto puedes escribirme tus dudas.`
              : `Llegaste a tus ${LIMITE_PREGUNTAS} preguntas de este mes. Se renuevan el día 1 — mientras tanto, tus videos y patrones siguen disponibles.`}
          </p>
        )}

        {estado === "error" && (
          <div className="mt-3 rounded-lg border border-border-default bg-surface-tertiary p-3" role="alert">
            <p className="text-status-error" style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}>
              {mensajeError}
            </p>
            <p className="text-text-secondary mt-1" style={{ fontSize: "var(--text-xs)" }}>
              Tu pregunta no se perdió — sigue escrita arriba.
            </p>
            <button
              type="button"
              onClick={() => setEstado("idle")}
              className="mt-2 text-brand-primary [touch-action:manipulation]"
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
            <p
              className="text-text-secondary mt-2"
              style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
            >
              {respuesta}
            </p>
          </div>
        )}
      </section>

      <section
        aria-label="Tu uso este mes"
        className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm"
      >
        <p className="text-text-secondary" style={{ fontSize: "var(--text-sm)" }}>
          Tu uso este mes
        </p>
        <div className="mt-3 flex gap-6">
          <Medidor label="Preguntas" usadas={uso.preguntas} total={LIMITE_PREGUNTAS} />
          <Medidor label="Fotos" usadas={uso.fotos} total={LIMITE_FOTOS} />
        </div>
        <p className="text-text-tertiary mt-3" style={{ fontSize: "var(--text-xs)" }}>
          Se renueva el 1 de cada mes. Incluido en tu membresía, sin costo extra.
        </p>
      </section>

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
                        ? "hoy"
                        : `hace ${c.haceDias} ${c.haceDias === 1 ? "día" : "días"}`}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
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

/**
 * Achica la foto ANTES de subirla. Una foto de celular pesa 4-8 MB y en datos móviles
 * de LATAM tardaría eternidades (además el servidor la rechaza por tamaño). A 1280px
 * el Ojo Experto ve el tejido perfectamente y sube en un par de segundos.
 */
async function aBase64Liviana(archivo: File): Promise<string> {
  const bitmap = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  const maximo = 1280;
  const escala = Math.min(1, maximo / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("sin canvas");
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  return lienzo.toDataURL("image/jpeg", 0.8).split(",")[1];
}
