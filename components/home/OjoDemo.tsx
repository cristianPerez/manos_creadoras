"use client";

import { Sparkles } from "lucide-react";
import { Entrada } from "@/components/home/Entrada";
import { useEffect, useRef, useState } from "react";
import {
  AvatarOjo,
  BurbujaAlumna,
  ComposerOjo,
  Escribiendo,
  IconoCamara,
  PildoraSugerencia,
  claseCamara,
} from "@/components/app/OjoPiezas";
import { PagoConPlan } from "@/components/app/PagoConPlan";
import { TextoDelOjo } from "@/components/app/TextoDelOjo";
import type { Frecuencia } from "@/lib/planes";

const SUGERENCIAS = [
  { q: "¿Qué hilo uso para empezar?", pie: "Para mi primer bolso" },
  { q: "¿Por qué se me abomba la base?", pie: "El error más común" },
  { q: "¿Cuántas cuentas necesito?", pie: "Para Cristal Brillante" },
  { q: "¿Dónde compro los materiales?", pie: "Proveedores" },
];

/**
 * La conversación de ejemplo con la que abre la tarjeta (2026-10-22).
 *
 * ⚠️ NO LLAMA A LA API NI GASTA PREGUNTAS: es texto fijo, para que se entienda
 * de un vistazo qué hace el Ojo sin tener que leer un menú de dudas. En cuanto
 * la visitante pregunta algo, desaparece y queda su conversación real.
 *
 * ⚠️ LA RESPUESTA ES PROVISIONAL: la sacó la referencia de diseño y la tiene
 * que validar Elizabeth (pendiente en ESTADO.md).
 */
const EJEMPLO = {
  q: "¿Por qué se me abomba la base?",
  r: "Casi siempre son los aumentos. Si la base **se curva hacia arriba**, te faltan; si **se ondula**, te sobran.",
};

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
export function OjoDemo({
  bolsoGratis,
  enlaces,
}: {
  bolsoGratis: string | null;
  /** Para el botón de pagar que sale al agotar las preguntas gratis. */
  enlaces: Record<Frecuencia, string | null>;
}) {
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

  /*
    ⚠️ LAS SUGERENCIAS YA USADAS DESAPARECEN, y no hace falta estado nuevo: se
    deducen de los mensajes. Repetir una pregunta que acaba de hacerse gasta
    una de las dos gratis en lo mismo. Mientras se ve el ejemplo, tampoco se
    ofrece su pregunta: ya está respondida en pantalla.

    Siempre 2 (versión arena, 2026-10-22): con dos preguntas gratis, cuatro
    opciones invitan a elegir mal.
  */
  const conEjemplo = mensajes.length === 0;
  const disponibles = SUGERENCIAS.filter(
    (s) =>
      !(conEjemplo && s.q === EJEMPLO.q) &&
      !mensajes.some((m) => m.rol === "alumna" && m.texto === s.q),
  ).slice(0, 2);

  const reiniciar = () => {
    setMensajes([]);
    setError(null);
  };

  const etiquetaPlan = (
    <p className="bg-cacao text-gold-pale inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold">
      <Sparkles size={14} aria-hidden="true" />
      Ilimitado con tu plan
    </p>
  );

  return (
    /*
      ⚠️ VERSIÓN ARENA (2026-10-22, `design-ref/home-ojo-claude-code`): fondo
      arena, plano, sin grano ni degradados. Sustituye al bloque espresso de la
      v4. Ojo: debajo va la sección de Elizabeth, que también es arena — los
      dos bloques quedan pegados del mismo color (avisado a Cristian, no se
      cambió la otra sección).
    */
    <section id="ojo" className="bg-sand px-4 py-12 md:px-5 lg:py-22">
      <Entrada className="mx-auto max-w-[1240px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-16">
          {/* ── Columna de texto ───────────────────────────────────── */}
          <div className="flex flex-col gap-4 lg:w-2/5 lg:shrink-0 lg:gap-5">
            <p className="flex items-center gap-3">
              <span aria-hidden="true" className="bg-gold block h-px w-6 lg:w-8" />
              <span className="eyebrow">Pruébalo ahora</span>
            </p>

            <h2
              className="font-display text-espresso demo-ojo-titulo max-lg:text-balance"
              style={{ fontWeight: 500 }}
            >
              ¿Te atascaste? <em className="clave">Pregúntale</em> al Ojo.
            </h2>

            <p className="text-ink-body demo-ojo-bajada max-w-110">
              Tensión, materiales, proveedores y fotos.
              <span className="max-md:hidden"> Si quieres, con una foto de tu tejido.</span>
            </p>

            <div className="max-lg:hidden">{etiquetaPlan}</div>
          </div>

          {/* ── La tarjeta del chat ─────────────────────────────────── */}
          <div className="min-w-0 lg:flex-1">
            <div className="bg-ivory border-line flex flex-col gap-4 rounded-(--radius-demo) border px-4 py-4.5 lg:gap-5 lg:p-7">
              {/* Alto máximo y scroll interno: una respuesta larga no empuja el
                  composer fuera de la vista. */}
              <div className="flex max-h-80 flex-col gap-4 overflow-y-auto lg:max-h-90 lg:gap-5">
                {conEjemplo ? (
                  <>
                    <BurbujaAlumna className="demo-ojo-texto">{EJEMPLO.q}</BurbujaAlumna>
                    <RespuestaDemo texto={EJEMPLO.r} />
                  </>
                ) : (
                  mensajes.map((m) =>
                    m.rol === "alumna" ? (
                      <BurbujaAlumna key={m.id} className="demo-ojo-texto">
                        {m.texto}
                      </BurbujaAlumna>
                    ) : (
                      <RespuestaDemo key={m.id} texto={m.texto} />
                    ),
                  )
                )}

                {enviando && <Escribiendo tamano="grande" />}

                <div ref={fin} />
              </div>

              {/* Fuera del área con scroll: dentro, el botón de pagar quedaba
                  escondido bajo el alto máximo de la conversación. */}
              {agotado && (
                <div className="bg-sand rounded-lg p-5">
                  <p className="font-display text-espresso text-2xl" style={{ fontWeight: 500 }}>
                    Usaste tus {LIMITE} preguntas gratis
                  </p>
                  {/* ⚠️ Sin cifras de topes: viven en la base y cambian. */}
                  <p className="text-ink-body mt-2">
                    Con el plan, el Ojo Experto te responde todo el mes y revisa las fotos
                    de tu tejido.
                  </p>
                  {/* Lleva a pagar, anual por defecto (2026-10-21). */}
                  <div className="mt-5 md:max-w-sm">
                    <PagoConPlan enlaces={enlaces} origen="ojo_agotado" />
                  </div>
                </div>
              )}


              {/* Las dudas sugeridas: en móvil una fila con scroll lateral que
                  llega a los bordes de la tarjeta; en escritorio, sangradas
                  para alinearse con el texto del Ojo (avatar 40 + 14 de hueco). */}
              {!agotado && disponibles.length > 0 && (
                <div className="sin-barra -mx-4 flex gap-2.5 overflow-x-auto px-4 lg:mx-0 lg:ml-13.5 lg:flex-wrap lg:overflow-visible lg:px-0">
                  {disponibles.map((s) => (
                    <PildoraSugerencia key={s.q} onClick={() => preguntar(s.q)} disabled={enviando}>
                      {s.q}
                    </PildoraSugerencia>
                  ))}
                </div>
              )}

              {/* El composer desaparece al agotarse: su trabajo lo hace el
                  botón de pagar. */}
              {!agotado && (
                <div>
                  {error && (
                    <p role="alert" className="text-gold mb-3 text-sm font-semibold">
                      {error}
                    </p>
                  )}
                  <ComposerOjo
                    fondo="cream"
                    texto={texto}
                    setTexto={setTexto}
                    enviando={enviando}
                    onEnviar={() => preguntar(texto)}
                    placeholder="Escribe tu duda…"
                    /* ⚠️ LA DEMO NO SUBE FOTOS (la ruta solo las acepta con
                       plan), así que la cámara no abre nada: lleva al precio,
                       que es donde se consigue. Un ícono que no hiciera nada
                       rompería la confianza en todo lo demás. */
                    camara={
                      <a
                        href="#precio"
                        aria-label="Revisar una foto de tu tejido: viene con el plan"
                        className={claseCamara()}
                      >
                        <IconoCamara />
                      </a>
                    }
                  />
                  {/*
                    ⚠️ Ni "puede equivocarse" (el descargo vive en los Términos)
                    ni "entrenado con Elizabeth" (no lo está: se le inyecta la
                    ficha del bolso). "Con el método de Elizabeth" sí es literal.
                  */}
                  <p className="text-ink-muted ojo-nota mt-3 flex flex-wrap items-center gap-x-1 px-2">
                    <span className="cifra">
                      {quedan === 1 ? "1 pregunta gratis" : `${quedan} preguntas gratis`}, sin crear
                      cuenta
                    </span>
                    <span className="max-lg:hidden">· Con el método de Elizabeth</span>
                    {mensajes.length > 0 && (
                      <button
                        type="button"
                        onClick={reiniciar}
                        className="text-gold ml-auto min-h-11 font-semibold underline underline-offset-4"
                      >
                        Empezar de nuevo
                      </button>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* En móvil, la etiqueta va debajo de la tarjeta. */}
            <div className="mt-6 lg:hidden">{etiquetaPlan}</div>
          </div>
        </div>
      </Entrada>
    </section>
  );
}

/** La respuesta del Ojo: sin burbuja, con el avatar a la izquierda. */
function RespuestaDemo({ texto }: { texto: string }) {
  return (
    <div className="flex gap-3 lg:gap-3.5">
      <AvatarOjo tamano="grande" />
      <div className="min-w-0 flex-1 pt-1">
        <TextoDelOjo texto={texto} variante="demo" />
      </div>
    </div>
  );
}
