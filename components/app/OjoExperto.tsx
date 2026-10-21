"use client";

import {
  ArrowUp,
  Camera,
  Clapperboard,
  Copy,
  Menu,
  Palette,
  PenLine,
  Plus,
  Spool,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PagoConPlan } from "@/components/app/PagoConPlan";
import { TextoDelOjo } from "@/components/app/TextoDelOjo";
import { EnlacesApp } from "@/components/app/NavegacionApp";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Cupo } from "@/lib/alumna";
import type { Frecuencia } from "@/lib/planes";

/** Las preguntas que el servidor regala sin cuenta (`PREGUNTAS_DE_VISITANTE` en la ruta). */
const PREGUNTAS_DE_VISITANTE = 2;

export type Mensaje = {
  id: string;
  rol: "alumna" | "ojo";
  texto: string;
  fotoUrl?: string | null;
  feedback?: -1 | 1 | null;
};

export type Conversacion = { id: string; titulo: string; cuando: string };

export type BolsoBreve = { slug: string; nombre: string; pasos: string[] };

/**
 * Las cuatro puertas de entrada al Ojo Experto.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ ANTES LAS CUATRO PREGUNTABAN LO MISMO: CÓMO TEJER
 * ════════════════════════════════════════════════════════════════════════════
 * "¿Está pareja mi tensión?", "la base se abomba", "cómo remato el borde",
 * "se me tuerce el asa". Las cuatro del mismo tema, y las cuatro para alguien
 * que ya está tejiendo con un problema delante.
 *
 * Eso enseñaba un ayudante de tejido. Las nuevas enseñan un ayudante de
 * NEGOCIO —materiales, fotos, diseño y redes—, que es lo que de verdad
 * justifica pagar: tejer ya se aprende con los videos. Pedido de Cristian el
 * 2026-10-20.
 *
 * ⚠️ LOS ÍCONOS SON SVG, NO LOS EMOJIS DEL ENCARGO. Cristian los escribió con
 * emoji (🧵 📸 🎨 🎬) y el sentido se respeta, pero el sistema los prohíbe
 * como íconos: cada sistema operativo los dibuja distinto, no heredan el color
 * de la marca y en Android se ven como pegatinas. Mismo significado, con
 * Lucide y en un chip dorado.
 *
 * `texto` es lo que se manda de verdad; `titulo` es solo el gancho que se lee
 * de un vistazo. En un teléfono, cuatro preguntas largas sin titular son un
 * muro de letra pequeña.
 */
const CON_FOTO = {
  q: "¿Está pareja mi tensión?",
  pie: "Sube la foto de tu base y la reviso vuelta por vuelta.",
};

const SUGERENCIAS = [
  {
    Icono: Spool,
    titulo: "Materiales",
    texto: "¿Dónde consigo los materiales para hacer mis bolsos?",
  },
  {
    Icono: Camera,
    titulo: "Fotos",
    texto: "¿Cómo puedo crear fotos profesionales de mis bolsos sin tener una buena cámara?",
  },
  {
    Icono: Palette,
    titulo: "Diseño",
    texto: "¿Qué combinaciones de colores y diseños originales puedo crear para mi próximo bolso?",
  },
  {
    Icono: Clapperboard,
    titulo: "Redes",
    texto: "¿Cómo puedo convertir las fotos de mis bolsos en videos llamativos para mis redes sociales?",
  },
] as const;

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
  mensajesIniciales = [],
  conversacionInicial = null,
  visitante = false,
  enlaces = null,
}: {
  historial: Conversacion[];
  cupo: Cupo | null;
  bolsos: BolsoBreve[];
  bolsoInicial: string | null;
  pasoInicial: number | null;
  /** El hilo ya escrito, cuando se entra por `/app/ojo/<id>`. */
  mensajesIniciales?: Mensaje[];
  /** A qué conversación se sigue escribiendo. `null` = empezar una nueva. */
  conversacionInicial?: string | null;
  /**
   * Sin sesión (2026-10-21, pedido de Cristian): el Ojo se abre igual, con las 2
   * preguntas gratis de visitante que ya daba el home. Sin historial ni medidor.
   */
  visitante?: boolean;
  /** Para la caja de "pásate al plan" cuando se acaban las preguntas gratis. */
  enlaces?: Record<Frecuencia, string | null> | null;
}) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales);

  /*
    ⚠️ ANTES CADA PREGUNTA ABRÍA UNA CONVERSACIÓN NUEVA, y por eso el
    historial del panel era una ristra de consultas sueltas en vez de hilos.
    Ahora el id del hilo viaja con cada pregunta y vuelve en la respuesta, así
    que la segunda pregunta cae donde la primera. "Nueva consulta" lo borra.
  */
  const [conversacion, setConversacion] = useState<string | null>(conversacionInicial);
  const [texto, setTexto] = useState("");
  const [foto, setFoto] = useState<{ base64: string; url: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bolso, setBolso] = useState<string | null>(bolsoInicial);
  const [paso, setPaso] = useState<number | null>(pasoInicial);
  const [usado, setUsado] = useState(cupo);
  /* Cuántas de las preguntas gratis de visitante lleva. Lo dice el servidor
     en cada respuesta (`uso.preguntas`): el contador vive en la base. */
  const [usadasVisitante, setUsadasVisitante] = useState(0);
  /* Cuando el servidor dice `necesitaPlan`: se acabaron las gratis, o mandó
     una foto sin plan. En vez de un error suelto, se ofrece el plan. */
  const [pidePlan, setPidePlan] = useState<{ motivo: "agotado" | "foto"; mensaje: string } | null>(
    null,
  );
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
        /* ⚠️ SIN SESIÓN NO SE MANDA `Authorization` (2026-10-21). Antes iba
           "Bearer " + vacío; el navegador recorta el espacio, llegaba "Bearer"
           a secas, el servidor lo tomaba por un token roto y respondía "sesión
           inválida" — el Ojo de visitante no podía preguntar nada. */
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          pregunta,
          imagenBase64: foto?.base64,
          bolsoSlug: bolso ?? undefined,
          paso: paso ?? undefined,
          conversacionId: conversacion ?? undefined,
        }),
      });

      const datos = await r.json();
      if (!r.ok) {
        // Se quita la pregunta: dejarla colgada sin respuesta parece que se perdió.
        setMensajes((m) => m.filter((x) => x.id !== mia.id));
        if (datos.necesitaPlan && enlaces) {
          setPidePlan({ motivo: datos.motivo === "foto" ? "foto" : "agotado", mensaje: datos.error });
          // Si ya las gastó en otra visita, el contador lo sabe ahora: 0 de 2.
          if (visitante && datos.motivo === "agotado") setUsadasVisitante(PREGUNTAS_DE_VISITANTE);
          // La foto no se puede mandar sin plan: se quita para poder seguir con texto.
          if (datos.motivo === "foto") {
            setFoto(null);
            setTexto(pregunta);
          }
          return;
        }
        setError(datos.error ?? "No pudimos responder. Inténtalo de nuevo.");
        setTexto(pregunta);
        return;
      }

      setMensajes((m) => [
        ...m,
        { id: datos.consulta?.id ?? `ojo-${Date.now()}`, rol: "ojo", texto: datos.respuesta },
      ]);
      if (datos.conversacionId) setConversacion(datos.conversacionId);
      if (datos.uso && usado) setUsado({ ...usado, preguntasUsadas: datos.uso.preguntas, fotosUsadas: datos.uso.fotos });
      if (visitante && datos.uso) setUsadasVisitante(datos.uso.preguntas);
      setPidePlan(null);
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
        visitante={visitante}
        cupo={usado}
        abierto={panelAbierto}
        cerrar={() => setPanelAbierto(false)}
        nueva={() => {
          setMensajes([]);
          setConversacion(null);
          setPanelAbierto(false);
        }}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* ⚠️ v4: 72px y con el tile. La cabecera vieja era solo texto, así
            que la pantalla arrancaba sin ningún ancla visual — parecía una
            página de documentación, no un asistente. */}
        <header className="border-line flex h-18 shrink-0 items-center justify-between gap-3 border-b px-4 md:px-6">
          <button
            type="button"
            onClick={() => setPanelAbierto(true)}
            aria-label="Ver mis consultas"
            className="text-espresso flex size-11 items-center justify-center lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="bg-cacao text-gold-pale flex size-9 shrink-0 items-center justify-center rounded-(--radius-sm)"
            >
              <Sparkles size={18} />
            </span>
            <span className="min-w-0">
              <h1
                className="font-display text-espresso truncate text-2xl leading-tight"
                style={{ fontWeight: 500 }}
              >
                El Ojo Experto
              </h1>
              <p className="text-ink-muted truncate text-sm">Tu mentora de bolsillo</p>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {usado && (
              <span className="text-ink-muted hidden text-xs sm:inline">
                {usado.preguntasUsadas} preguntas · {usado.fotosUsadas} fotos este mes
              </span>
            )}
            {visitante && (
              <span className="text-ink-muted text-xs">
                {Math.max(0, PREGUNTAS_DE_VISITANTE - usadasVisitante)} de {PREGUNTAS_DE_VISITANTE}{" "}
                preguntas gratis
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setMensajes([]);
                setConversacion(null);
              }}
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

            {pidePlan && enlaces && (
              <div className="bg-sand mb-4 rounded-(--radius-lg) p-5">
                <p className="font-display text-espresso text-xl" style={{ fontWeight: 500 }}>
                  {pidePlan.mensaje}
                </p>
                <p className="text-ink-body mt-1 text-sm">
                  Con el plan, el Ojo Experto te responde todo el mes y revisa las fotos de tu
                  tejido.
                </p>
                <div className="mt-4">
                  <PagoConPlan enlaces={enlaces} origen="ojo_agotado" />
                </div>
              </div>
            )}

            {/* Agotadas las gratis, el composer sobra: su trabajo lo hace la
                caja de arriba. Si solo fue la foto, se sigue escribiendo. */}
            {pidePlan?.motivo !== "agotado" && (
            <>
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
            </>
            )}

            {/* ⚠️ Ver el mismo cambio en `OjoDemo`: fuera el "puede
                equivocarse" —el descargo legal vive en los Términos— y nada de
                decir que está "entrenado con" Elizabeth, porque no lo está. */}
            <p className="text-ink-muted mt-3 text-center text-xs">
              Responde con las fichas y el método de Elizabeth.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Piezas ──────────────────────────────────────────────────────────────── */

/**
 * El estado vacío: la primera impresión del Ojo.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ v4: ALINEADO A LA IZQUIERDA, NO CENTRADO
 * ════════════════════════════════════════════════════════════════════════════
 * Centrado parecía una pantalla de error ("no hay nada aquí"). Alineado a la
 * izquierda, con el titular grande arriba, se lee como el comienzo de una
 * conversación — que es lo que es.
 *
 * ⚠️ Y LA PRIMERA TARJETA ES DISTINTA A PROPÓSITO: la de foto es la función
 * que de verdad separa al Ojo de un chat cualquiera, y la única que la alumna
 * no adivina sola. En cacao y a doble alto, es lo primero que mira.
 */
function Vacio({ alPulsar }: { alPulsar: (t: string) => void }) {
  return (
    <div className="py-6 md:py-10">
      <span
        aria-hidden="true"
        className="bg-espresso text-gold-pale flex size-13 items-center justify-center rounded-(--radius-sm)"
      >
        <Sparkles size={26} />
      </span>

      <h2
        className="font-display text-espresso mt-6 text-balance"
        style={{ fontWeight: 500, fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.05 }}
      >
        ¿Qué se te complica{" "}
        <em className="text-gold italic" style={{ fontWeight: 400 }}>
          hoy
        </em>
        ?
      </h2>
      <p className="text-ink-body mt-3 text-balance">
        Mándame una foto de tu tejido y te digo cómo vas, o pregúntame lo que sea de tus bolsos:
        materiales, proveedores, fotos y cómo venderlos.
      </p>

      {/*
        ⚠️ UNA COLUMNA EN MÓVIL PARA LA DESTACADA Y DOS PARA EL RESTO. A 375px
        las preguntas largas en dos columnas se parten en seis líneas de letra
        diminuta; la destacada necesita el ancho entero porque lleva descripción.
      */}
      <div className="mt-8 grid gap-3 md:grid-cols-[1.3fr_1fr_1fr]">
        <button
          type="button"
          onClick={() => alPulsar(CON_FOTO.q)}
          className="bg-cacao focus-visible:outline-gold-pale flex flex-col justify-end rounded-xl p-5 text-left transition-colors duration-150 focus-visible:outline-2 md:row-span-2 md:min-h-[320px]"
        >
          <span className="bg-gold-pale text-espresso mb-auto flex w-max items-center gap-2 rounded-(--radius-sm) px-3 py-1.5 text-sm font-semibold">
            <Camera size={15} aria-hidden="true" />
            Con foto
          </span>
          <span className="font-display text-cream mt-6 block text-2xl" style={{ fontWeight: 500 }}>
            {CON_FOTO.q}
          </span>
          <span className="text-cream/75 mt-1.5 block text-sm text-pretty">{CON_FOTO.pie}</span>
        </button>

        {/* ⚠️ MANDA LA PREGUNTA, NO EL ÁREA. La versión anterior ponía
            "MATERIALES" en grande y la pregunta debajo en gris: se leía como
            un índice de categorías, y lo que hace tocar es ver escrita la duda
            que una tiene. El área queda de pie, que es su papel. */}
        {SUGERENCIAS.map(({ titulo, texto }, i) => (
          <button
            key={titulo}
            type="button"
            onClick={() => alPulsar(texto)}
            className="bg-sand hover:bg-sand-hover focus-visible:outline-gold flex flex-col rounded-xl p-5 text-left transition-colors duration-150 focus-visible:outline-2"
          >
            <span className="text-cacao text-sm" style={{ fontWeight: 800 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-espresso mt-3 block font-semibold text-balance">{texto}</span>
            <span className="text-ink-muted mt-1.5 block text-sm">{titulo}</span>
          </button>
        ))}
      </div>
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
          /* v4: radio 10 y sin sombra. */
          className="max-w-(--foto-mensaje) rounded-[10px] object-cover"
          unoptimized
        />
      )}
      {/*
        ⚠️ v4: BURBUJA CACAO, NO ARENA. Con arena la pregunta y las tarjetas
        de sugerencia eran del mismo color y el hilo se leía como una lista de
        bloques sueltos. El cacao separa "lo que yo dije" de todo lo demás.
        La esquina de la cola va a 4px: es lo que la ancla a quien habla.
      */}
      <p className="bg-cacao text-cream max-w-[85%] rounded-xl rounded-br-[4px] px-4 py-3">
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
      {/* v4: tile cuadrado `--gold-pale` con el ícono en `--cacao`. */}
      <span
        aria-hidden="true"
        className="bg-gold-pale text-cacao flex size-7 shrink-0 items-center justify-center rounded-(--radius-sm)"
      >
        <Sparkles size={15} />
      </span>

      <div className="min-w-0 flex-1">
        {/* La etiqueta solo cuando hubo foto: decir "diagnóstico de tu foto"
            sobre una pregunta escrita sería mentir sobre lo que miró. */}
        {mensaje.fotoUrl && (
          <p className="bg-sand text-cacao mb-3 inline-block rounded-[4px] px-2.5 py-1 text-xs font-bold tracking-[0.12em] uppercase">
            Diagnóstico de tu foto
          </p>
        )}
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
        className="bg-gold-pale text-cacao flex size-7 shrink-0 items-center justify-center rounded-(--radius-sm)"
      >
        <Sparkles size={16} />
      </span>
      {/* Tres puntos y no un texto: "pensando…" se lee una vez y cansa a la
          tercera. El movimiento dice lo mismo sin decir nada. */}
      <div className="flex items-center gap-1.5 pt-3" role="status" aria-label="Escribiendo">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            /* Cuadritos: en v4 no hay puntos redondos en el Ojo. */
            className="bg-cacao/40 size-1.5 animate-bounce"
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
    /* v4: marfil con borde `--line-strong` y radio 12. `--line` se perdía
       sobre marfil y el campo parecía flotar sin contorno. */
    <div className="bg-ivory border-line-strong mt-3 flex items-end gap-2 rounded-xl border p-2">
      <label className="text-ink-muted hover:text-espresso flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-(--radius-sm) transition-colors duration-150">
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
        /* v4: cuadrado de 44px con radio 8 y la flecha en `--gold-pale`. */
        className="bg-espresso text-gold-pale flex size-11 shrink-0 items-center justify-center rounded-(--radius-sm) transition-opacity disabled:opacity-40"
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
      {/* v4: chip arena con radio 6, no píldora con borde. */}
      <div className="bg-sand flex h-11 items-center gap-2 rounded-[6px] px-3">
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
  visitante = false,
  cupo,
  abierto,
  cerrar,
  nueva,
}: {
  historial: Conversacion[];
  visitante?: boolean;
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
        /* ⚠️ v4: ESPRESSO, NO ARENA. Con arena el panel y el chat eran dos
           tonos del mismo beige y la pantalla no tenía estructura: todo
           flotaba. En oscuro, el chat queda claramente en primer plano. */
        className={`bg-espresso z-(--z-sticky) flex w-(--barra-lateral-ojo) shrink-0 flex-col p-4 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:transition-transform ${
          abierto ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        }`}
      >
        <Link href="/app" className="mb-5 flex items-center gap-3 px-2">
          <span className="font-display text-xl text-white" style={{ fontWeight: 500 }}>
            Manos <em className="text-gold-pale italic">Creadoras</em>
          </span>
        </Link>

        <button
          type="button"
          onClick={nueva}
          className="bg-gold-pale text-espresso flex h-11 items-center justify-center gap-2 rounded-(--radius-sm) px-4 text-sm"
          style={{ fontWeight: 800 }}
        >
          <Plus size={16} aria-hidden="true" />
          Nueva consulta
        </button>

        {/* La misma navegación que el resto de la app: desde aquí también se
            vuelve a los bolsos sin pasar por el logo. */}
        <div className="mt-5">
          <EnlacesApp />
        </div>

        <nav className="border-espresso-line mt-5 flex-1 overflow-y-auto border-t pt-5">
          {historial.length === 0 ? (
            <p className="text-on-dark-muted px-2 text-sm">
              {visitante
                ? "Con el plan, tus consultas se guardan aquí para que puedas volver a leerlas."
                : "Aquí van a quedar tus consultas, para que puedas volver a leerlas."}
            </p>
          ) : (
            grupos.map(([titulo, items]) =>
              items.length === 0 ? null : (
                <div key={titulo} className="mb-5">
                  <p className="text-gold-light px-2 text-xs font-bold tracking-[0.14em] uppercase">
                    {titulo}
                  </p>
                  <ul className="mt-2 flex flex-col gap-0.5">
                    {items.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/app/ojo/${c.id}`}
                          className="text-on-dark-muted hover:bg-espresso-2 block truncate rounded-(--radius-sm) px-2 py-2 text-sm transition-colors duration-150"
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
          <div className="bg-espresso-2 mt-4 rounded-[10px] p-4">
            <p className="text-gold-pale text-sm font-semibold">Tu uso este mes</p>
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
      <div className="text-on-dark-muted flex justify-between text-xs">
        <span>{etiqueta}</span>
        <span>
          <strong className="font-semibold text-white">{usado}</strong> de {total}
        </span>
      </div>
      {/* ⚠️ v4: BARRA RECTA, NO REDONDEADA. A 4px de alto, un radio completo
          convierte la barra en una pastilla y el relleno pequeño desaparece. */}
      <div className="bg-espresso mt-1.5 h-1 overflow-hidden">
        <span className="bg-gold-pale block h-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
