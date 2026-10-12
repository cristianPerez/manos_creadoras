"use client";

import { ArrowUp, Camera, Copy, Menu, PenLine, Sparkles, ThumbsDown, ThumbsUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TextoDelOjo } from "@/components/app/TextoDelOjo";
import { EnlacesApp } from "@/components/app/NavegacionApp";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Cupo } from "@/lib/alumna";

type Mensaje = {
  id: string;
  rol: "alumna" | "ojo";
  texto: string;
  fotoUrl?: string | null;
  feedback?: -1 | 1 | null;
};

export type Conversacion = { id: string; titulo: string; cuando: string };

export type BolsoBreve = { slug: string; nombre: string; pasos: string[] };

const SUGERENCIAS = [
  "¿Está pareja mi tensión?",
  "La base se me abomba en el centro",
  "¿Cómo remato el borde de la tapa?",
  "Se me tuerce el asa al unirla",
];

/**
 * El Ojo Experto: la conversación.
 *
 * ⚠️ TODO EL ESTADO VIVE AQUÍ Y NO EN LA URL. Una consulta a medio escribir, una
 * foto ya elegida y una respuesta llegando no sobreviven a una navegación, así
 * que la pantalla no navega: cambia de conversación sin recargar.
 */
export function OjoExperto({
  historial,
  cupo,
  bolsos,
  bolsoInicial,
  pasoInicial,
}: {
  historial: Conversacion[];
  cupo: Cupo | null;
  bolsos: BolsoBreve[];
  bolsoInicial: string | null;
  pasoInicial: number | null;
}) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [foto, setFoto] = useState<{ base64: string; url: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bolso, setBolso] = useState<string | null>(bolsoInicial);
  const [paso, setPaso] = useState<number | null>(pasoInicial);
  const [usado, setUsado] = useState(cupo);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const finRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes.length, enviando]);

  const bolsoElegido = bolsos.find((b) => b.slug === bolso) ?? null;

  async function enviar(preguntaTexto: string) {
    const pregunta = preguntaTexto.trim();
    if (!pregunta || enviando) return;

    setError(null);
    setEnviando(true);
    setTexto("");

    const mia: Mensaje = {
      id: `yo-${Date.now()}`,
      rol: "alumna",
      texto: pregunta,
      fotoUrl: foto?.url ?? null,
    };
    setMensajes((m) => [...m, mia]);

    try {
      /*
        El token va en la cabecera porque la ruta lo valida EN SERVIDOR. No se
        confía en que el navegador diga quién es: se manda su sesión y el
        servidor la comprueba contra Supabase.
      */
      const {
        data: { session },
      } = await supabaseBrowser().auth.getSession();

      const r = await fetch("/api/ojo-experto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          pregunta,
          imagenBase64: foto?.base64,
          bolsoSlug: bolso ?? undefined,
          paso: paso ?? undefined,
        }),
      });

      const datos = await r.json();
      if (!r.ok) {
        setError(datos.error ?? "No pudimos responder. Inténtalo de nuevo.");
        // Se quita la pregunta: dejarla colgada sin respuesta parece que se perdió.
        setMensajes((m) => m.filter((x) => x.id !== mia.id));
        setTexto(pregunta);
        return;
      }

      setMensajes((m) => [
        ...m,
        { id: datos.consulta?.id ?? `ojo-${Date.now()}`, rol: "ojo", texto: datos.respuesta },
      ]);
      if (datos.uso && usado) setUsado({ ...usado, preguntasUsadas: datos.uso.preguntas, fotosUsadas: datos.uso.fotos });
      setFoto(null);
    } catch {
      setError("Se cortó la conexión. Vuelve a intentarlo.");
      setMensajes((m) => m.filter((x) => x.id !== mia.id));
      setTexto(pregunta);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-dvh w-full">
      <PanelHistorial
        historial={historial}
        cupo={usado}
        abierto={panelAbierto}
        cerrar={() => setPanelAbierto(false)}
        nueva={() => {
          setMensajes([]);
          setPanelAbierto(false);
        }}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-line flex h-16 shrink-0 items-center justify-between gap-3 border-b px-5">
          <button
            type="button"
            onClick={() => setPanelAbierto(true)}
            aria-label="Ver mis consultas"
            className="text-espresso flex size-11 items-center justify-center lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="font-display text-espresso truncate text-xl" style={{ fontWeight: 500 }}>
              El Ojo Experto
            </h1>
            <p className="text-ink-muted hidden text-sm sm:block">Tu mentora de bolsillo</p>
          </div>

          <div className="flex items-center gap-2">
            {usado && (
              <span className="text-ink-muted hidden text-xs sm:inline">
                {usado.preguntasUsadas} preguntas · {usado.fotosUsadas} fotos este mes
              </span>
            )}
            <button
              type="button"
              onClick={() => setMensajes([])}
              aria-label="Nueva consulta"
              className="text-espresso flex size-11 items-center justify-center lg:hidden"
            >
              <PenLine size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-8">
          <div className="mx-auto max-w-(--columna-chat)">
            {mensajes.length === 0 ? (
              <Vacio alPulsar={enviar} />
            ) : (
              <div className="flex flex-col gap-8">
                {mensajes.map((m) =>
                  m.rol === "alumna" ? (
                    <MensajeMio key={m.id} mensaje={m} />
                  ) : (
                    <MensajeDelOjo key={m.id} mensaje={m} />
                  ),
                )}
                {enviando && <Pensando />}
              </div>
            )}
            <div ref={finRef} />
          </div>
        </div>

        <div className="border-line shrink-0 border-t px-5 py-4">
          <div className="mx-auto max-w-(--columna-chat)">
            {error && (
              <p role="alert" className="text-gold mb-3 text-sm font-semibold">
                {error}
              </p>
            )}

            <SelectorContexto
              bolsos={bolsos}
              bolso={bolso}
              paso={paso}
              elegir={(b, p) => {
                setBolso(b);
                setPaso(p);
              }}
              nombre={bolsoElegido?.nombre ?? null}
            />

            {foto && (
              <div className="mt-3 flex items-center gap-3">
                <Image
                  src={foto.url}
                  alt="La foto que vas a mandar"
                  width={56}
                  height={56}
                  className="size-14 rounded-xl object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  className="text-ink-muted flex items-center gap-1 text-sm"
                >
                  <X size={14} aria-hidden="true" /> Quitar
                </button>
              </div>
            )}

            <Composer
              texto={texto}
              setTexto={setTexto}
              enviando={enviando}
              onFoto={setFoto}
              onEnviar={() => enviar(texto)}
            />

            <p className="text-ink-muted mt-3 text-center text-xs">
              El Ojo Experto es orientación con inteligencia artificial y puede equivocarse. Tu
              criterio y el método del curso mandan.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Piezas ──────────────────────────────────────────────────────────────── */

function Vacio({ alPulsar }: { alPulsar: (t: string) => void }) {
  return (
    <div className="py-10 text-center">
      <span
        aria-hidden="true"
        className="bg-espresso text-gold-light mx-auto flex size-14 items-center justify-center rounded-full"
      >
        <Sparkles size={22} />
      </span>
      <h2 className="titulo-seccion mt-5">¿Qué se te complica hoy?</h2>
      <p className="text-ink-body mt-3">
        Cuéntame o súbeme una foto de tu tejido y te digo qué ajustar.
      </p>

      <ul className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGERENCIAS.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => alPulsar(s)}
              className="bg-ivory border-line text-ink-body hover:border-gold w-full rounded-[var(--radius-lg)] border p-4 text-left text-sm transition-colors"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MensajeMio({ mensaje }: { mensaje: Mensaje }) {
  return (
    <div className="flex flex-col items-end gap-2">
      {mensaje.fotoUrl && (
        <Image
          src={mensaje.fotoUrl}
          alt="La foto de tu tejido"
          width={220}
          height={220}
          className="max-w-(--foto-mensaje) rounded-[var(--radius-lg)] object-cover"
          unoptimized
        />
      )}
      <p className="bg-sand text-espresso max-w-[85%] rounded-[var(--radius-lg)] px-5 py-3">
        {mensaje.texto}
      </p>
    </div>
  );
}

/**
 * La respuesta NO va en burbuja.
 *
 * Es la diferencia visual entre preguntar y que te expliquen: la burbuja es un
 * mensaje, el texto suelto es una explicación. Ponerle burbuja a las dos haría
 * que la pantalla pareciera un chat de WhatsApp, que es justo lo que no es.
 */
function MensajeDelOjo({ mensaje }: { mensaje: Mensaje }) {
  const [opinion, setOpinion] = useState<-1 | 1 | null>(mensaje.feedback ?? null);
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="flex gap-4">
      <span
        aria-hidden="true"
        className="bg-espresso text-gold-light flex size-9 shrink-0 items-center justify-center rounded-full"
      >
        <Sparkles size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <TextoDelOjo texto={mensaje.texto} />

        <div className="mt-4 flex items-center gap-1">
          <Accion
            etiqueta={copiado ? "Copiado" : "Copiar"}
            onClick={async () => {
              await navigator.clipboard.writeText(mensaje.texto);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1500);
            }}
          >
            <Copy size={15} />
          </Accion>
          <Accion
            etiqueta="Me sirvió"
            activo={opinion === 1}
            onClick={() => setOpinion(opinion === 1 ? null : 1)}
          >
            <ThumbsUp size={15} />
          </Accion>
          <Accion
            etiqueta="No me sirvió"
            activo={opinion === -1}
            onClick={() => setOpinion(opinion === -1 ? null : -1)}
          >
            <ThumbsDown size={15} />
          </Accion>
        </div>
      </div>
    </div>
  );
}

function Accion({
  children,
  etiqueta,
  activo = false,
  onClick,
}: {
  children: React.ReactNode;
  etiqueta: string;
  activo?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      aria-pressed={activo}
      title={etiqueta}
      className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
        activo ? "text-gold bg-sand" : "text-ink-muted hover:text-espresso"
      }`}
    >
      {children}
    </button>
  );
}

function Pensando() {
  return (
    <div className="flex gap-4">
      <span
        aria-hidden="true"
        className="bg-espresso text-gold-light flex size-9 shrink-0 items-center justify-center rounded-full"
      >
        <Sparkles size={16} />
      </span>
      {/* Tres puntos y no un texto: "pensando…" se lee una vez y cansa a la
          tercera. El movimiento dice lo mismo sin decir nada. */}
      <div className="flex items-center gap-1.5 pt-3" role="status" aria-label="Escribiendo">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="bg-gold/50 size-2 animate-bounce rounded-full"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function Composer({
  texto,
  setTexto,
  enviando,
  onFoto,
  onEnviar,
}: {
  texto: string;
  setTexto: (t: string) => void;
  enviando: boolean;
  onFoto: (f: { base64: string; url: string } | null) => void;
  onEnviar: () => void;
}) {
  return (
    <div className="bg-ivory border-line mt-3 flex items-end gap-2 rounded-[var(--radius-xl)] border p-2.5">
      <label className="text-ink-muted hover:text-espresso flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors">
        <Camera size={20} aria-hidden="true" />
        <span className="sr-only">Subir una foto de tu tejido</span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (!archivo) return;
            const lector = new FileReader();
            lector.onload = () =>
              onFoto({ base64: String(lector.result), url: URL.createObjectURL(archivo) });
            lector.readAsDataURL(archivo);
          }}
        />
      </label>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          // Enter envía, Mayús+Enter salta de línea: lo que ya hace todo chat.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onEnviar();
          }
        }}
        rows={1}
        placeholder="Pregúntale al Ojo Experto o sube una foto…"
        aria-label="Tu pregunta"
        className="text-espresso placeholder:text-ink-muted max-h-40 min-h-11 flex-1 resize-none bg-transparent py-2.5 outline-none"
        style={{ height: "auto" }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
        }}
      />

      <button
        type="button"
        onClick={onEnviar}
        disabled={enviando || texto.trim().length < 3}
        aria-label="Enviar"
        className="bg-espresso flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}

function SelectorContexto({
  bolsos,
  bolso,
  paso,
  nombre,
  elegir,
}: {
  bolsos: BolsoBreve[];
  bolso: string | null;
  paso: number | null;
  nombre: string | null;
  elegir: (b: string | null, p: number | null) => void;
}) {
  const pasos = bolsos.find((b) => b.slug === bolso)?.pasos ?? [];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="border-line bg-ivory flex h-11 items-center gap-2 rounded-full border px-4">
        <select
          value={bolso ?? ""}
          onChange={(e) => elegir(e.target.value || null, null)}
          aria-label="Sobre qué bolso preguntas"
          className="text-espresso max-w-40 bg-transparent text-sm font-semibold outline-none"
        >
          <option value="">Sin bolso</option>
          {bolsos.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.nombre}
            </option>
          ))}
        </select>

        {pasos.length > 0 && (
          <>
            <span aria-hidden="true" className="text-ink-muted">
              ·
            </span>
            <select
              value={paso ?? ""}
              onChange={(e) => elegir(bolso, e.target.value ? Number(e.target.value) : null)}
              aria-label="En qué paso vas"
              className="text-espresso bg-transparent text-sm font-semibold outline-none"
            >
              <option value="">Paso</option>
              {pasos.map((t, i) => (
                <option key={t} value={i + 1}>
                  Paso {i + 1}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <p className="text-ink-muted text-xs">
        {nombre
          ? "El Ojo Experto usa la ficha de este bolso para responderte."
          : "Elige un bolso y responderá sabiendo sus materiales y sus pasos."}
      </p>
    </div>
  );
}

function PanelHistorial({
  historial,
  cupo,
  abierto,
  cerrar,
  nueva,
}: {
  historial: Conversacion[];
  cupo: Cupo | null;
  abierto: boolean;
  cerrar: () => void;
  nueva: () => void;
}) {
  const grupos: [string, Conversacion[]][] = [
    ["Hoy", historial.filter((c) => c.cuando === "hoy")],
    ["Esta semana", historial.filter((c) => c.cuando === "semana")],
    ["Anteriores", historial.filter((c) => c.cuando === "antes")],
  ];

  return (
    <>
      {/* En móvil el panel se abre encima; la cortina cierra al tocar fuera. */}
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar"
          onClick={cerrar}
          className="bg-espresso/40 fixed inset-0 z-(--z-sticky) lg:hidden"
        />
      )}

      <aside
        className={`bg-sand z-(--z-sticky) flex w-(--barra-lateral-ojo) shrink-0 flex-col p-4 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:transition-transform ${
          abierto ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        }`}
      >
        <Link href="/app" className="mb-5 flex items-center gap-3 px-2">
          <span
            aria-hidden="true"
            className="bg-espresso flex size-9 shrink-0 items-center justify-center rounded-full"
          >
            <span
              className="font-display text-gold-light text-lg italic"
              style={{ fontWeight: 500, lineHeight: 1 }}
            >
              M
            </span>
          </span>
          <span className="font-display text-espresso text-lg" style={{ fontWeight: 500 }}>
            Manos Creadoras
          </span>
        </Link>

        <button
          type="button"
          onClick={nueva}
          className="border-line bg-ivory text-espresso flex h-12 items-center gap-3 rounded-full border px-4 text-sm font-semibold"
        >
          <PenLine size={16} aria-hidden="true" />
          Nueva consulta
        </button>

        {/* La misma navegación que el resto de la app: desde aquí también se
            vuelve a los bolsos sin pasar por el logo. */}
        <div className="mt-5">
          <EnlacesApp />
        </div>

        <nav className="border-line mt-5 flex-1 overflow-y-auto border-t pt-5">
          {historial.length === 0 ? (
            <p className="text-ink-muted px-2 text-sm">
              Aquí van a quedar tus consultas, para que puedas volver a leerlas.
            </p>
          ) : (
            grupos.map(([titulo, items]) =>
              items.length === 0 ? null : (
                <div key={titulo} className="mb-5">
                  <p className="text-ink-muted px-2 text-xs font-semibold">{titulo}</p>
                  <ul className="mt-2 flex flex-col gap-0.5">
                    {items.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/app/ojo/${c.id}`}
                          className="text-ink-body hover:bg-ivory block truncate rounded-lg px-2 py-2 text-sm transition-colors"
                        >
                          {c.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )
          )}
        </nav>

        {cupo && (
          <div className="bg-ivory border-line mt-4 rounded-[var(--radius-lg)] border p-4">
            <p className="text-espresso text-sm font-semibold">Tu uso este mes</p>
            <Medidor etiqueta="Preguntas" usado={cupo.preguntasUsadas} total={cupo.preguntasLimite} />
            <Medidor etiqueta="Fotos" usado={cupo.fotosUsadas} total={cupo.fotosLimite} />
          </div>
        )}
      </aside>
    </>
  );
}

function Medidor({ etiqueta, usado, total }: { etiqueta: string; usado: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((usado / total) * 100)) : 0;
  return (
    <div className="mt-3">
      <div className="text-ink-muted flex justify-between text-xs">
        <span>{etiqueta}</span>
        <span>
          <strong className="text-espresso font-semibold">{usado}</strong> de {total}
        </span>
      </div>
      <div className="bg-line mt-1 h-1.5 overflow-hidden rounded-full">
        <span className="bg-gold block h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
