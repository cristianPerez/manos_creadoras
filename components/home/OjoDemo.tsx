"use client";

import { ArrowUp, PenLine, Sparkles } from "lucide-react";
import { Entrada } from "@/components/home/Entrada";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TextoDelOjo } from "@/components/app/TextoDelOjo";

const SUGERENCIAS = [
  { q: "¿Qué hilo uso para empezar?", pie: "Para mi primer bolso" },
  { q: "¿Por qué se me abomba la base?", pie: "Sube una foto si puedes" },
  { q: "¿Cuántas cuentas necesito?", pie: "Para Cristal Brillante" },
  { q: "¿Dónde compro los materiales?", pie: "Proveedores" },
];

const LIMITE = 2;

type Mensaje = { id: string; rol: "alumna" | "ojo"; texto: string };

/**
 * El Ojo Experto, de prueba, en el home.
 *
 * ⚠️ EL LÍMITE DE VERDAD ESTÁ EN EL SERVIDOR. Este contador es solo para que la
 * pantalla sepa qué enseñar: quien borre la cookie o abra una pestaña nueva
 * seguirá sin preguntas, porque quien cuenta es la base por huella de IP. Si el
 * tope viviera aquí, vaciar el almacenamiento regalaría consultas infinitas — y
 * cada una cuesta dinero de verdad.
 */
export function OjoDemo({ bolsoGratis }: { bolsoGratis: string | null }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [usadas, setUsadas] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [agotado, setAgotado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fin = useRef<HTMLDivElement>(null);

  /*
   * ⚠️ ESTE EFECTO ARRASTRABA LA PÁGINA ENTERA AL CARGAR. Corría al montarse,
   * con el chat todavía vacío, y `scrollIntoView` no mueve solo el contenedor:
   * mueve lo que haga falta para que el elemento se vea, así que el home se
   * iba solo hasta el Ojo Experto nada más abrirlo.
   *
   * Dos arreglos, y los dos hacen falta:
   *   · solo se baja si YA hay mensajes — con el chat vacío no hay nada al
   *     final a lo que bajar;
   *   · `block: "nearest"` mueve el contenedor del chat y NO la ventana.
   */
  useEffect(() => {
    if (mensajes.length === 0) return;
    fin.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [mensajes.length, enviando]);

  const quedan = Math.max(0, LIMITE - usadas);

  async function preguntar(pregunta: string) {
    const q = pregunta.trim();
    if (!q || enviando || agotado) return;

    setError(null);
    setEnviando(true);
    setTexto("");
    const mia: Mensaje = { id: `yo-${Date.now()}`, rol: "alumna", texto: q };
    setMensajes((m) => [...m, mia]);

    try {
      /* Sin cabecera de sesión a propósito: así la ruta sabe que es un visitante
         y aplica el camino con los dos frenos. */
      const r = await fetch("/api/ojo-experto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta: q, bolsoSlug: bolsoGratis ?? undefined }),
      });
      const datos = await r.json();

      if (!r.ok) {
        if (datos.necesitaCuenta) setAgotado(true);
        else setError(datos.error ?? "No pudimos responder. Inténtalo de nuevo.");
        setMensajes((m) => m.filter((x) => x.id !== mia.id));
        if (!datos.necesitaCuenta) setTexto(q);
        return;
      }

      setMensajes((m) => [...m, { id: `ojo-${Date.now()}`, rol: "ojo", texto: datos.respuesta }]);
      setUsadas((n) => n + 1);
    } catch {
      setError("Se cortó la conexión. Vuelve a intentarlo.");
      setMensajes((m) => m.filter((x) => x.id !== mia.id));
      setTexto(q);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="ojo" className="bg-sand/40 px-5 py-10 md:py-12">
      <Entrada className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Ojo Experto</p>
            <h2
              className="font-display text-espresso mt-2 text-balance"
              style={{ fontWeight: 500, fontSize: "clamp(32px, 3.6vw, 46px)", lineHeight: 1.08 }}
            >
              ¿Se te complica algo? Pregúntale gratis.
            </h2>
            <p className="text-ink-body mt-2 max-w-lg">
              Escribe tu duda y te responde al momento. Tienes {LIMITE} preguntas gratis, sin crear
              cuenta.
            </p>
          </div>

          <p className="bg-ivory border-line flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-semibold">
            <span className="flex gap-1" aria-hidden="true">
              {Array.from({ length: LIMITE }).map((_, n) => (
                <span
                  key={n}
                  className={`block size-2 rounded-full ${n < quedan ? "bg-gold" : "bg-line"}`}
                />
              ))}
            </span>
            <span className="text-ink-body">
              {quedan === 0
                ? "Sin preguntas gratis"
                : `${quedan} pregunta${quedan > 1 ? "s" : ""} gratis`}
            </span>
          </p>
        </header>

        <div className="bg-ivory border-line mt-8 flex h-130 flex-col overflow-hidden rounded-(--radius-foto) border max-md:h-120">
          <div className="border-line flex items-center gap-3 border-b px-5 py-4">
            <span
              aria-hidden="true"
              className="bg-espresso text-gold-light flex size-8 shrink-0 items-center justify-center rounded-full"
            >
              <Sparkles size={15} />
            </span>
            <span className="text-espresso flex-1 font-semibold">El Ojo Experto</span>
            {mensajes.length > 0 && !agotado && (
              <button
                type="button"
                onClick={() => setMensajes([])}
                className="text-ink-muted hover:text-espresso flex items-center gap-1.5 text-sm"
              >
                <PenLine size={14} aria-hidden="true" />
                Nueva consulta
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            {mensajes.length === 0 ? (
              <div className="py-6 text-center">
                <h3 className="font-display text-espresso text-2xl" style={{ fontWeight: 500 }}>
                  ¿Qué se te complica hoy?
                </h3>
                <ul className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-3">
                  {SUGERENCIAS.map((s) => (
                    <li key={s.q}>
                      <button
                        type="button"
                        onClick={() => preguntar(s.q)}
                        disabled={agotado}
                        className="border-line hover:border-gold w-full rounded-[var(--radius-lg)] border p-4 text-left transition-colors disabled:opacity-50"
                      >
                        <span className="text-espresso block text-sm font-semibold text-balance">
                          {s.q}
                        </span>
                        <span className="text-ink-muted mt-0.5 block text-xs">{s.pie}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {mensajes.map((m) =>
                  m.rol === "alumna" ? (
                    <p
                      key={m.id}
                      className="bg-sand text-espresso ml-auto max-w-[85%] rounded-[var(--radius-lg)] px-5 py-3"
                    >
                      {m.texto}
                    </p>
                  ) : (
                    <div key={m.id} className="flex gap-3.5">
                      <span
                        aria-hidden="true"
                        className="bg-espresso text-gold-light flex size-8 shrink-0 items-center justify-center rounded-full"
                      >
                        <Sparkles size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <TextoDelOjo texto={m.texto} />
                      </div>
                    </div>
                  ),
                )}

                {enviando && (
                  <div className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="bg-espresso text-gold-light flex size-8 shrink-0 items-center justify-center rounded-full"
                    >
                      <Sparkles size={14} />
                    </span>
                    <div className="flex items-center gap-1.5 pt-3" role="status" aria-label="Escribiendo">
                      {[0, 1, 2].map((n) => (
                        <span
                          key={n}
                          className="bg-gold/50 size-2 animate-bounce rounded-full"
                          style={{ animationDelay: `${n * 120}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {agotado && (
              <div
                className="mt-6 rounded-[var(--radius-lg)] p-6 text-center text-white"
                style={{ backgroundImage: "var(--card-destacada)" }}
              >
                <p className="font-display text-xl" style={{ fontWeight: 500 }}>
                  Usaste tus {LIMITE} preguntas gratis
                </p>
                <p className="mt-1.5 text-sm text-white/70">
                  Con cuenta gratis tienes 3 al mes, y además el bolso completo.
                </p>
                <Link
                  href="/entrar"
                  className="text-espresso mt-5 inline-flex h-12 items-center rounded-full px-6 font-semibold"
                  style={{ backgroundImage: "var(--boton-dorado)" }}
                >
                  Crear cuenta gratis
                </Link>
              </div>
            )}

            <div ref={fin} />
          </div>

          <div className="border-line border-t p-4">
            {error && (
              <p role="alert" className="text-gold mb-3 text-center text-sm font-semibold">
                {error}
              </p>
            )}

            <div className="border-line bg-cream flex items-end gap-2 rounded-[var(--radius-xl)] border p-2.5">
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    preguntar(texto);
                  }
                }}
                rows={1}
                disabled={agotado}
                aria-label="Tu pregunta"
                placeholder={
                  agotado ? "Crea tu cuenta para seguir preguntando" : "Escribe tu duda…"
                }
                className="text-espresso placeholder:text-ink-muted max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 outline-none disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => preguntar(texto)}
                disabled={agotado || enviando || texto.trim().length < 3}
                aria-label="Enviar"
                className="bg-espresso flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
              >
                <ArrowUp size={19} />
              </button>
            </div>

            <p className="text-ink-muted mt-3 text-center text-xs">
              Orientación con inteligencia artificial: puede equivocarse. El método del curso manda.
            </p>
          </div>
        </div>
      </Entrada>
    </section>
  );
}
