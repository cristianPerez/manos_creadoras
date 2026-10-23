"use client";

import {
  Camera,
  Copy,
  ImageIcon,
  History,
  Palette,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PagoConPlan } from "@/components/app/PagoConPlan";
import { TextoDelOjo } from "@/components/app/TextoDelOjo";
import {
  AvatarOjo,
  BurbujaAlumna,
  ComposerOjo,
  Escribiendo,
  IconoCamara,
  claseCamara,
} from "@/components/app/OjoPiezas";
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

type Foto = { base64: string; url: string };

/**
 * Las cuatro puertas de entrada al Ojo Experto (v5, 2026-10-21).
 *
 * ⚠️ TÍTULO CORTO + UNA LÍNEA, NO LA PREGUNTA ENTERA. En la v4 cada tarjeta
 * llevaba la pregunta completa ("¿Cómo puedo crear fotos profesionales de mis
 * bolsos sin tener una buena cámara?") y un número 01-04: cuatro párrafos que
 * leer antes de tocar nada. Ahora se lee el tema de un vistazo y la pregunta
 * larga —`texto`— es la que se manda, igual que antes.
 *
 * ⚠️ LA DE FOTO NO MANDA NADA: abre el selector de foto. Es la función que
 * separa al Ojo de un chat cualquiera, y mandar "¿Está pareja mi tensión?" sin
 * foto —lo que hacía la v4— era pedirle que juzgara un tejido que no veía.
 * La sugerencia de "Redes" se cayó: el diseño pide cuatro.
 */
const SUGERENCIAS = [
  {
    Icono: Camera,
    titulo: "Revisar mi tejido",
    pie: "Tensión, puntos, forma",
    texto: "Revisa mi tejido: ¿cómo va la tensión, los puntos y la forma?",
    conFoto: true,
  },
  {
    Icono: ShoppingBag,
    titulo: "Conseguir materiales",
    pie: "Hilos, herrajes, dónde",
    texto: "¿Dónde consigo los materiales para hacer mis bolsos?",
    conFoto: false,
  },
  {
    Icono: ImageIcon,
    titulo: "Fotos que venden",
    pie: "Con tu celular",
    texto: "¿Cómo puedo crear fotos profesionales de mis bolsos sin tener una buena cámara?",
    conFoto: false,
  },
  {
    Icono: Palette,
    titulo: "Ideas de diseño",
    pie: "Colores y combinaciones",
    texto: "¿Qué combinaciones de colores y diseños originales puedo crear para mi próximo bolso?",
    conFoto: false,
  },
] as const;

/**
 * El Ojo Experto: la conversación.
 *
 * ⚠️ TODO EL ESTADO VIVE AQUÍ Y NO EN LA URL. Una consulta a medio escribir, una
 * foto ya elegida y una respuesta llegando no sobreviven a una navegación, así
 * que la pantalla no navega: cambia de conversación sin recargar.
 *
 * ⚠️ v5 (2026-10-21): YA NO SE ELIGE BOLSO NI PASO. El selector se quitó de la
 * pantalla, pero el estado sigue: si se entra con `?bolso=` o se retoma un hilo
 * que era de un bolso, se manda igual que antes. Sin eso, va vacío — que es lo
 * que la ruta ya recibía cuando la alumna no elegía nada.
 */
export function OjoExperto({
  historial,
  cupo,
  bolsoInicial,
  pasoInicial,
  mensajesIniciales = [],
  conversacionInicial = null,
  visitante = false,
  enlaces = null,
}: {
  historial: Conversacion[];
  cupo: Cupo | null;
  /** Ya no se pinta (v5); se mantiene para no cambiar las páginas que lo pasan. */
  bolsos: BolsoBreve[];
  bolsoInicial: string | null;
  pasoInicial: number | null;
  /** El hilo ya escrito, cuando se entra por `/app/ojo/<id>`. */
  mensajesIniciales?: Mensaje[];
  /** A qué conversación se sigue escribiendo. `null` = empezar una nueva. */
  conversacionInicial?: string | null;
  /**
   * Sin sesión (2026-10-21, pedido de Cristian): el Ojo se abre igual, con las 2
   * preguntas gratis de visitante que ya daba el home.
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
  const [foto, setFoto] = useState<Foto | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bolso] = useState<string | null>(bolsoInicial);
  const [paso] = useState<number | null>(pasoInicial);
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
  useEffect(() => {
    if (!panelAbierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setPanelAbierto(false);
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [panelAbierto]);

  const finRef = useRef<HTMLDivElement>(null);
  /* Al abrir un hilo, de golpe al final; después, suave. Con "smooth" también
     al abrir, la pantalla arrancaba a media conversación y deslizaba sola. */
  const primeraVez = useRef(true);
  useEffect(() => {
    finRef.current?.scrollIntoView({
      behavior: primeraVez.current ? "auto" : "smooth",
      block: "end",
    });
    primeraVez.current = false;
  }, [mensajes.length, enviando]);

  /* Un solo selector de foto para toda la pantalla: lo abren la cámara de
     cualquiera de los dos composers y la tarjeta "Revisar mi tejido". */
  const inputFoto = useRef<HTMLInputElement>(null);
  const elegirFoto = () => inputFoto.current?.click();

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

  function nueva() {
    setMensajes([]);
    setConversacion(null);
    setPanelAbierto(false);
  }

  const vacio = mensajes.length === 0;
  const conComposer = pidePlan?.motivo !== "agotado";

  const contador = visitante
    ? { etiqueta: "Preguntas gratis", usado: usadasVisitante, total: PREGUNTAS_DE_VISITANTE }
    : usado
      ? { etiqueta: "Preguntas este mes", usado: usado.preguntasUsadas, total: usado.preguntasLimite }
      : null;

  const fotoElegida = foto && <FotoElegida foto={foto} quitar={() => setFoto(null)} />;

  return (
    <div className="alto-ojo flex w-full flex-col overflow-hidden">
      <input
        ref={inputFoto}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          e.target.value = "";
          if (!archivo) return;
          const lector = new FileReader();
          lector.onload = () =>
            setFoto({ base64: String(lector.result), url: URL.createObjectURL(archivo) });
          lector.readAsDataURL(archivo);
        }}
      />

      {/* La cabecera de escritorio ya no es del Ojo: es la global de la app
          (`CabeceraApp`, en el layout), la misma en todas las páginas. */}

      <div className="flex min-h-0 flex-1">
        <PanelHistorial
          historial={historial}
          activa={conversacion}
          contador={contador}
          abierto={panelAbierto}
          cerrar={() => setPanelAbierto(false)}
          nueva={nueva}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* ── Barra de móvil: historial · título · nueva (2026-10-23) ──
              "Historial" con texto y no una hamburguesa: la hamburguesa
              prometía un menú, y la navegación ya está en la barra de abajo.
              Lo que abre es el historial, y así se llama. */}
          <div className="border-line flex h-15 shrink-0 items-center justify-between gap-2 border-b px-3 lg:hidden">
            <button
              type="button"
              onClick={() => setPanelAbierto(true)}
              className="bg-sand text-espresso flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium"
            >
              <History size={18} aria-hidden="true" />
              Historial
            </button>
            <h1
              className="font-display text-espresso min-w-0 truncate text-center"
              style={{ fontSize: 22, fontWeight: 500 }}
            >
              Ojo <em className="clave">Experto</em>
            </h1>
            {/* ⚠️ "+" Y NO EL LÁPIZ DE ANTES: el lápiz se leía como "editar". */}
            <button
              type="button"
              onClick={nueva}
              aria-label="Nueva consulta"
              className="bg-espresso text-cream flex size-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-[0.95]"
            >
              <Plus size={22} aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 lg:px-8">
            <div className="mx-auto flex min-h-full max-w-(--columna-chat) flex-col">
              {vacio ? (
                <Vacio
                  alPulsar={(s) => {
                    if (s.conFoto) {
                      if (!texto.trim()) setTexto(s.texto);
                      elegirFoto();
                    } else {
                      enviar(s.texto);
                    }
                  }}
                  composer={
                    conComposer && (
                      <>
                        {fotoElegida}
                        <ComposerOjo
                          grande
                          camara={<BotonCamara grande alPulsar={elegirFoto} />}
                          placeholder="Pregúntame o sube una foto de tu tejido…"
                          texto={texto}
                          setTexto={setTexto}
                          enviando={enviando}
                          onEnviar={() => enviar(texto)}
                        />
                        <NotaComposer contador={contador} />
                      </>
                    )
                  }
                />
              ) : (
                <div aria-live="polite" className="flex flex-col gap-8 py-6 lg:gap-10 lg:py-10">
                  {/* ⚠️ LA CLAVE LLEVA LA POSICIÓN: la ruta devuelve como id de
                      cada respuesta el del HILO, así que desde la segunda
                      respuesta dos mensajes compartían clave y React mezclaba
                      su estado (copiado, me sirvió). */}
                  {mensajes.map((m, i) =>
                    m.rol === "alumna" ? (
                      <div key={`${m.id}-${i}`} className="reveal">
                        <MensajeMio mensaje={m} />
                      </div>
                    ) : (
                      <div key={`${m.id}-${i}`} className="reveal">
                        <MensajeDelOjo mensaje={m} />
                      </div>
                    ),
                  )}
                  {enviando && <Escribiendo />}
                </div>
              )}
              <div ref={finRef} />
            </div>
          </div>

          <div className="shrink-0 px-4 pt-2 pb-3 lg:px-8 lg:pb-5">
            <div className="mx-auto max-w-(--columna-chat)">
              {error && (
                <p role="alert" className="text-gold mb-3 text-sm font-semibold">
                  {error}
                </p>
              )}

              {pidePlan && enlaces && (
                <div className="bg-sand mb-3 rounded-lg p-5">
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
                  caja de arriba. En escritorio y sin mensajes, el composer va
                  en el centro (dentro de `Vacio`) y este se esconde. */}
              {conComposer && (
                <div className={vacio ? "lg:hidden" : ""}>
                  {fotoElegida}
                  <ComposerOjo
                    camara={<BotonCamara alPulsar={elegirFoto} />}
                    placeholder={vacio ? "Pregunta o sube una foto…" : "Sigue preguntando…"}
                    texto={texto}
                    setTexto={setTexto}
                    enviando={enviando}
                    onEnviar={() => enviar(texto)}
                  />
                  {vacio && <NotaComposer contador={contador} corta />}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Piezas ──────────────────────────────────────────────────────────────── */

/**
 * El estado vacío: la primera impresión del Ojo.
 *
 * ⚠️ v5: CENTRADO Y CON CUATRO BLOQUES, NADA MÁS — ícono, titular, composer y
 * tarjetas. Se fueron el párrafo de explicación, la numeración 01-04 y la
 * tarjeta café de foto: la v4 pedía leer seis bloques antes de escribir.
 * En móvil el composer no va aquí sino anclado abajo, sobre la barra.
 */
function Vacio({
  alPulsar,
  composer,
}: {
  alPulsar: (s: (typeof SUGERENCIAS)[number]) => void;
  composer: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-6 lg:py-10">
      <span
        aria-hidden="true"
        className="reveal bg-espresso text-gold-light mx-auto flex size-13 items-center justify-center rounded-full lg:size-14"
      >
        <Sparkles size={24} />
      </span>

      <h2
        className="reveal font-display text-espresso ojo-titular mt-5 text-center text-balance"
        style={{ fontWeight: 500, ["--reveal-delay" as string]: "60ms" }}
      >
        ¿Qué se te complica{" "}
        <em className="text-gold italic" style={{ fontWeight: 400 }}>
          hoy
        </em>
        ?
      </h2>

      {composer && (
        <div className="reveal mt-7 hidden lg:block" style={{ ["--reveal-delay" as string]: "120ms" }}>
          {composer}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2.5 lg:mt-10 lg:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] lg:gap-3">
        {/* Entrada escalonada: 60ms entre tarjeta y tarjeta. Con movimiento
            reducido, `.reveal` no anima (bloque de `prefers-reduced-motion`). */}
        {SUGERENCIAS.map((s, i) => (
          <button
            key={s.titulo}
            type="button"
            onClick={() => alPulsar(s)}
            style={{ ["--reveal-delay" as string]: `${180 + i * 60}ms` }}
            className="reveal bg-ivory border-line hover:border-line-strong focus-visible:outline-gold flex min-h-30 flex-col justify-between gap-4 rounded-lg border p-4 text-left transition-colors duration-150 focus-visible:outline-2 active:scale-[0.98] lg:min-h-38 lg:p-5"
          >
            <s.Icono size={22} strokeWidth={1.75} className="text-gold" aria-hidden="true" />
            <span>
              <span
                className="text-espresso block leading-snug font-semibold"
                style={{ fontSize: "1rem" }}
              >
                {s.titulo}
              </span>
              <span className="text-ink-muted ojo-nota mt-1 block">{s.pie}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** "Cómo funciona el Ojo · 0 de 2 preguntas gratis", bajo el composer. */
function NotaComposer({
  contador,
  corta = false,
}: {
  contador: { etiqueta: string; usado: number; total: number } | null;
  /** Móvil: "Cómo funciona" a la izquierda y "0 de 2 gratis" a la derecha. */
  corta?: boolean;
}) {
  const cifra = contador && (
    <span className="cifra">
      {contador.usado} de {contador.total}
      {contador.etiqueta === "Preguntas gratis"
        ? corta
          ? " gratis"
          : " preguntas gratis"
        : corta
          ? " este mes"
          : " preguntas este mes"}
    </span>
  );
  return (
    <p
      className={`text-ink-muted ojo-nota mt-2 flex items-center gap-5 ${
        corta ? "justify-between px-2" : "justify-center"
      }`}
    >
      {/* El Ojo explicado con un ejemplo vivo: la sección del home. */}
      <Link href="/#ojo" className="hover:text-espresso underline underline-offset-2">
        {corta ? "Cómo funciona" : "Cómo funciona el Ojo"}
      </Link>
      {cifra}
    </p>
  );
}

function FotoElegida({ foto, quitar }: { foto: Foto; quitar: () => void }) {
  return (
    <div className="mb-2 flex items-center gap-3">
      <Image
        src={foto.url}
        alt="La foto que vas a mandar"
        width={56}
        height={56}
        className="size-14 rounded-md object-cover"
        unoptimized
      />
      <button
        type="button"
        onClick={quitar}
        className="text-ink-muted hover:text-espresso flex h-11 items-center gap-1 text-sm"
      >
        <X size={14} aria-hidden="true" /> Quitar
      </button>
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
          className="max-w-(--foto-mensaje) rounded-lg object-cover"
          unoptimized
        />
      )}
      <BurbujaAlumna className="ojo-cuerpo">{mensaje.texto}</BurbujaAlumna>
    </div>
  );
}

/**
 * La respuesta NO va en burbuja.
 *
 * Es la diferencia visual entre preguntar y que te expliquen: la burbuja es un
 * mensaje, el texto suelto es una explicación.
 *
 * ⚠️ SIN LA ETIQUETA "Vi en tu foto: …" DE LA REFERENCIA: la respuesta de la
 * ruta no dice qué entendió el Ojo de la foto, y inventarla sería mentir sobre
 * lo que miró. Pendiente en ESTADO.md.
 */
function MensajeDelOjo({ mensaje }: { mensaje: Mensaje }) {
  const [opinion, setOpinion] = useState<-1 | 1 | null>(mensaje.feedback ?? null);
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <AvatarOjo />
        <span className="text-espresso text-sm font-semibold">Ojo Experto</span>
      </div>

      <div className="mt-3">
        <TextoDelOjo texto={mensaje.texto} />
      </div>

      {/* -ml-3.5: el ícono de 15px va centrado en un botón de 44, así que sin
          esto arrancaba 14px a la derecha del margen del texto. */}
      <div className="mt-3 -ml-3.5 flex items-center gap-1">
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
  );
}

function Accion({
  children,
  etiqueta,
  activo = false,
  onClick,
}: {
  children: ReactNode;
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
      className={`flex size-11 items-center justify-center rounded-full transition-colors ${
        activo ? "text-gold bg-sand" : "text-ink-muted hover:text-espresso"
      }`}
    >
      {children}
    </button>
  );
}

/** La cámara de la app: abre el selector de foto (uno solo para toda la pantalla). */
function BotonCamara({ alPulsar, grande = false }: { alPulsar: () => void; grande?: boolean }) {
  return (
    <button
      type="button"
      onClick={alPulsar}
      aria-label="Subir una foto de tu tejido"
      className={claseCamara(grande)}
    >
      <IconoCamara />
    </button>
  );
}

/** Para buscar sin que importen las tildes ni las mayúsculas: "tensión" = "TENSION". */
function normalizar(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/**
 * Las consultas: barra lateral marfil en escritorio, cajón en móvil (v5).
 *
 * ⚠️ AQUÍ YA NO VA LA NAVEGACIÓN (Mis bolsos, Directorio…). En escritorio subió
 * a la cabecera y en móvil está en la barra de abajo: repetirla aquí eran dos
 * menús iguales a un dedo de distancia. Tampoco el bloque oscuro de "Tu uso
 * este mes": queda una sola fila con las preguntas, que es lo que se agota.
 */
function PanelHistorial({
  historial,
  activa,
  contador,
  abierto,
  cerrar,
  nueva,
}: {
  historial: Conversacion[];
  activa: string | null;
  contador: { etiqueta: string; usado: number; total: number } | null;
  abierto: boolean;
  cerrar: () => void;
  nueva: () => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const q = normalizar(busqueda.trim());
  /* La búsqueda filtra lo que ya está cargado (las últimas 30): no pide nada
     al servidor. */
  const visibles = q ? historial.filter((c) => normalizar(c.titulo).includes(q)) : historial;

  const grupos: [string, Conversacion[]][] = [
    ["Hoy", visibles.filter((c) => c.cuando === "hoy")],
    ["Esta semana", visibles.filter((c) => c.cuando === "semana")],
    ["Anteriores", visibles.filter((c) => c.cuando === "antes")],
  ];

  const pct = contador && contador.total > 0
    ? Math.min(100, Math.round((contador.usado / contador.total) * 100))
    : 0;

  return (
    <>
      {/* En móvil el panel se abre encima; tocar el fondo lo cierra. */}
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar mis consultas"
          onClick={cerrar}
          className="bg-(--surface-overlay) fixed inset-0 z-(--z-overlay) lg:hidden"
        />
      )}

      <aside
        aria-label="Mis consultas"
        className={`bg-sand border-line flex w-(--barra-lateral-ojo) shrink-0 flex-col gap-3.5 p-5 lg:border-r max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-(--z-modal) max-lg:w-80 max-lg:max-w-[85vw] max-lg:rounded-r-(--radius-cajon) max-lg:transition-[transform,visibility] max-lg:duration-300 max-lg:ease-out ${
          abierto ? "max-lg:translate-x-0" : "max-lg:invisible max-lg:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <p className="font-display text-espresso" style={{ fontSize: 30, fontWeight: 500 }}>
            Tus <em className="clave">consultas</em>
          </p>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="bg-ivory text-espresso flex size-11 items-center justify-center rounded-full"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={nueva}
          className="bg-espresso text-cream flex h-12.5 items-center justify-center gap-2 rounded-full px-4 font-semibold transition-transform duration-150 active:scale-[0.98] lg:h-12"
          style={{ fontSize: "1rem" }}
        >
          <Plus size={18} aria-hidden="true" />
          Nueva consulta
        </button>

        <label className="bg-ivory border-line focus-within:outline-gold flex h-11 items-center gap-3 rounded-full border px-4 focus-within:outline-2">
          <Search size={16} className="text-ink-muted shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar consulta"
            aria-label="Buscar consulta"
            className="text-espresso placeholder:text-ink-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>

        <nav aria-label="Historial de consultas" className="-mx-1 mt-1 min-h-0 flex-1 overflow-y-auto px-1">
          {visibles.length === 0 ? (
            <p className="text-ink-muted px-1 text-sm">
              {q ? "Ninguna consulta con esas palabras." : "Todavía no tienes consultas."}
            </p>
          ) : (
            grupos.map(([titulo, items]) =>
              items.length === 0 ? null : (
                <div key={titulo} className="mb-4">
                  <p className="eyebrow px-3 pb-1.5">{titulo}</p>
                  <ul className="flex flex-col gap-0.5">
                    {items.map((c) => {
                      const esActiva = c.id === activa;
                      return (
                        <li key={c.id}>
                          <Link
                            href={`/app/ojo/${c.id}`}
                            aria-current={esActiva ? "page" : undefined}
                            className={`block truncate rounded-md px-3 py-3 text-sm transition-colors duration-150 ${
                              esActiva
                                ? "bg-ivory text-espresso font-semibold"
                                : "text-ink-body hover:bg-ivory/60 hover:text-espresso"
                            }`}
                          >
                            {c.titulo}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ),
            )
          )}
        </nav>

        {/* El medidor lleva a Mi plan: en móvil "Mi plan" ya no está en la
            barra de abajo, y este es el momento en que interesa. */}
        {contador && (
          <Link
            href="/app/plan"
            className="border-line hover:text-espresso block border-t pt-4 pb-1"
          >
            <span className="flex items-baseline justify-between text-sm">
              <span className="text-ink-body">{contador.etiqueta}</span>
              <span className="text-espresso cifra font-semibold">
                {contador.usado} de {contador.total}
              </span>
            </span>
            <span className="bg-sand-hover mt-2.5 block h-1.5 overflow-hidden rounded-full">
              <span
                className="bg-espresso block h-full rounded-full"
                style={{ width: `${pct}%` }}
              />
            </span>
          </Link>
        )}
      </aside>
    </>
  );
}
