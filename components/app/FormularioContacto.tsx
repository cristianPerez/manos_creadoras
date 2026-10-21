"use client";

import { Check, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { enviarContacto } from "@/app/(publicas)/contacto/acciones";
/*
 * ⚠️ AQUÍ SE ENSEÑA EL PRECIO NORMAL, NO EL DE OFERTA (`false`). Este
 * formulario es de cliente y no ve la cookie que dice si alguien sigue dentro
 * de sus 24 horas. Enseñar el de oferta por defecto prometería un descuento
 * que podría estar caducado; el normal, como mucho, se queda corto — y ese es
 * el error barato de los dos.
 */
import { precioPorMes, type Frecuencia } from "@/lib/planes";

const MOTIVOS = [
  "Quiero unirme a un plan",
  "Dudas del programa",
  "Mi compra o reembolso",
  "Otra cosa",
] as const;

/** Hay un solo plan: lo que se pregunta es cómo quiere pagarlo. */
const CICLOS: { id: Frecuencia; texto: string }[] = [
  { id: "anual", texto: "Anual" },
  { id: "mensual", texto: "Mensual" },
];

export function FormularioContacto() {
  const [motivo, setMotivo] = useState<string>(MOTIVOS[0]);
  const [ciclo, setCiclo] = useState<Frecuencia>("anual");
  const [estado, setEstado] = useState<"listo" | "enviando" | "enviado">("listo");
  const [error, setError] = useState<string | null>(null);

  /* El ciclo solo se pregunta a quien viene a contratar. A los demás les sobra. */
  const preguntarPlan = motivo === MOTIVOS[0];

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (estado === "enviando") return;

    const datos = new FormData(e.currentTarget);
    setEstado("enviando");
    setError(null);

    const r = await enviarContacto({
      nombre: String(datos.get("nombre") ?? ""),
      correo: String(datos.get("correo") ?? ""),
      motivo,
      planInteres: preguntarPlan ? `Curso completo · ${ciclo}` : undefined,
      mensaje: String(datos.get("mensaje") ?? "") || undefined,
    });

    if (r.ok) setEstado("enviado");
    else {
      setEstado("listo");
      setError(r.error);
    }
  }

  if (estado === "enviado") {
    return (
      <div className="bg-sand rounded-[var(--radius-xl)] p-8 text-center">
        <span
          aria-hidden="true"
          className="bg-gold mx-auto flex size-12 items-center justify-center rounded-full text-white"
        >
          <Check size={22} strokeWidth={3} />
        </span>
        <h2 className="font-display text-espresso mt-4 text-2xl" style={{ fontWeight: 500 }}>
          Nos llegó
        </h2>
        <p className="text-ink-body mt-2">
          Te respondemos en 24 a 48 horas hábiles al correo que nos diste. Si era por un plan, te
          mandamos el enlace de pago.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <Campo etiqueta="Tu nombre" nombre="nombre" autoComplete="name" />
      <Campo etiqueta="Tu correo" nombre="correo" tipo="email" autoComplete="email" />

      <fieldset>
        <legend className="text-espresso text-sm font-semibold">¿De qué se trata?</legend>
        <div className="mt-2.5 flex flex-wrap gap-2.5">
          {MOTIVOS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={motivo === m}
              onClick={() => setMotivo(m)}
              className={`flex h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors [touch-action:manipulation] ${
                motivo === m ? "bg-espresso text-white" : "border-line text-ink-body border"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </fieldset>

      {preguntarPlan && (
        <fieldset>
          <legend className="text-espresso text-sm font-semibold">¿Cómo prefieres pagarlo?</legend>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {CICLOS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={ciclo === c.id}
                onClick={() => setCiclo(c.id)}
                className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors [touch-action:manipulation] ${
                  ciclo === c.id ? "bg-espresso text-white" : "border-line text-ink-body border"
                }`}
              >
                {c.texto}
                <span className={ciclo === c.id ? "text-white/60" : "text-ink-muted"}>
                  {precioPorMes(c.id)}/mes
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-espresso text-sm font-semibold">
          Cuéntanos <span className="text-ink-muted font-normal">(opcional)</span>
        </span>
        <textarea
          name="mensaje"
          rows={4}
          className="bg-ivory border-line text-espresso rounded-[var(--radius-lg)] border p-4 outline-none focus-visible:border-(--gold)"
        />
      </label>

      {error && (
        <p role="alert" className="text-gold text-sm font-semibold">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="text-espresso flex h-14 items-center justify-center gap-2 rounded-full font-semibold transition-transform active:scale-[0.98] disabled:opacity-60"
        style={{ backgroundImage: "var(--boton-dorado)" }}
      >
        {estado === "enviando" && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {estado === "enviando" ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}

function Campo({
  etiqueta,
  nombre,
  tipo = "text",
  autoComplete,
}: {
  etiqueta: string;
  nombre: string;
  tipo?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-espresso text-sm font-semibold">{etiqueta}</span>
      <input
        name={nombre}
        type={tipo}
        required
        autoComplete={autoComplete}
        className="bg-ivory border-line text-espresso h-13 rounded-full border px-5 outline-none focus-visible:border-(--gold)"
      />
    </label>
  );
}
