"use client";

import { ArrowRight, ArrowUp, Sparkles } from "lucide-react";
import { Entrada } from "@/components/home/Entrada";
import { useEffect, useRef, useState } from "react";
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
 * Lo que el Ojo sabe hacer, en la columna de la izquierda.
 *
 * ⚠️ CADA LÍNEA TIENE QUE SER VERIFICABLE. Las tres de antes no lo eran del
 * todo —"te lleva al paso exacto del video" NO está construido— y Cristian lo
 * notó: «no estoy seguro si el Ojo Experto puede ayudar con eso». Prometer en
 * la landing una función que no existe se descubre a la primera pregunta.
 *
 * Estas tres sí: la foto la analiza el endpoint (`imagenBase64`), los
 * proveedores entran en el área de materiales del prompt —probado el
 * 2026-10-20, contesta con tiendas concretas— y lo de 24/7 es obvio.
 */
const LO_QUE_HACE = [
  "Mándale una foto de tu tejido y te dice cómo vas y qué mejorar.",
  "Pregúntale por proveedores de tu zona, sin ponerte a buscar.",
  "Es tu ayudante 24/7: como preguntarle a Elizabeth a cualquier hora.",
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
    una de las dos gratis en lo mismo.

    Al inicio se enseñan 4; después de la primera, solo 2 — con una pregunta
    restante, cuatro opciones invitan a elegir mal.
  */
  const disponibles = SUGERENCIAS.filter(
    (s) => !mensajes.some((m) => m.rol === "alumna" && m.texto === s.q),
  ).slice(0, usadas === 0 ? 4 : 2);

  const reiniciar = () => {
    setMensajes([]);
    setError(null);
  };

  return (
    /*
      ⚠️ v4: FONDO ESPRESSO SÓLIDO Y NADA DE ALTURA FIJA.
      La versión anterior metía el chat en una caja de 520px con scroll propio
      (`h-130` + `overflow-y-auto`). En un teléfono eso era una ventanita
      dentro de la página: dos scrolls peleando, y la respuesta del Ojo —lo
      único que hay que leer— asomando por una rendija. Ahora la sección crece
      con su contenido y se scrollea la página, como todo lo demás.
    */
    /*
      ⚠️ SIN `mb` DESDE LA V3 (2026-10-20). Antes debajo venía la tarjeta
      "¿Sin preguntas?", que solo tenía padding inferior y hacía falta un
      margen aquí para que no quedara pegada. Ahora debajo va la sección de
      Elizabeth, con su propio fondo arena: el oscuro y el arena se tocan,
      como en la referencia, y un margen dejaría una franja crema entre medias.

      Y el padding vertical baja de 104px a 64 en escritorio (pedido de
      Cristian): con la columna de texto tan alta, 104 arriba y abajo dejaban
      la sección flotando.
    */
    <section id="ojo" className="bg-espresso sobre-oscuro grain-oscuro px-4 py-10 md:px-5 md:py-16">
      <Entrada className="mx-auto max-w-[1240px]">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          {/* ── Columna de la izquierda ─────────────────────────────── */}
          <div className="md:col-span-5">
            <p className="text-gold-light flex items-center gap-2.5 text-xs font-bold tracking-[0.14em] uppercase">
              {/* Cuadrito, no punto: en v4 no hay círculos en el Ojo. */}
              <span aria-hidden="true" className="bg-gold-pale block size-2" />
              {/* ⚠️ "MINI" SE CAYÓ A PROPÓSITO: empequeñecía justo lo que hay
                  que vender. Y el eyebrow deja de decir "gratis" para decir
                  qué se lleva con el plan — la parte gratis ya la dice la
                  bajada y el contador. */}
              Ojo Experto · Ilimitado con tu plan
            </p>

            <h2
              className="font-display mt-4 text-balance text-white"
              style={{ fontWeight: 500, fontSize: "clamp(38px, 4.6vw, 66px)", lineHeight: 1.04 }}
            >
              ¿Te atascaste?{" "}
              <em className="text-gold-pale italic" style={{ fontWeight: 400 }}>
                Pregúntale.
              </em>
            </h2>

            <p className="text-on-dark-muted mt-4 max-w-md text-balance">
              Toca una duda y te responde al instante, sin crear cuenta. Responde con las fichas y
              el método de Elizabeth.
            </p>

            {/* El contador: dos cuadritos y su texto. */}
            <p className="mt-6 flex items-center gap-3 font-semibold text-white">
              <span className="flex gap-1.5" aria-hidden="true">
                {Array.from({ length: LIMITE }).map((_, n) => (
                  <span
                    key={n}
                    className={`block size-2.5 ${
                      n < quedan ? "bg-gold-pale" : "border-on-dark-muted/50 border"
                    }`}
                  />
                ))}
              </span>
              <span>
                {quedan === 0
                  ? "Sin preguntas gratis"
                  : quedan === 1
                    ? "Te queda 1 pregunta"
                    : `${LIMITE} preguntas gratis`}
              </span>
            </p>

            {/* ⚠️ Solo en escritorio: en móvil la tarjeta del chat tiene que
                quedar lo más arriba posible, y esta lista la empujaría fuera
                de la primera pantalla. */}
            <ol className="border-espresso-line mt-10 hidden border-t md:block">
              {LO_QUE_HACE.map((t, i) => (
                <li
                  key={t}
                  className="border-espresso-line text-on-dark-muted flex gap-4 border-b py-4"
                >
                  <span className="text-gold-light shrink-0 text-sm" style={{ fontWeight: 800 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </div>

          {/* ── El panel del chat ───────────────────────────────────── */}
          <div className="md:col-span-7">
            <div className="bg-cream flex flex-col overflow-hidden rounded-[14px] md:min-h-[540px] md:rounded-2xl">
              {/* Cabecera en arena */}
              <div className="bg-sand flex items-center gap-3 px-5 py-4">
                <span
                  aria-hidden="true"
                  className="bg-cacao text-gold-pale flex size-9 shrink-0 items-center justify-center rounded-(--radius-sm)"
                >
                  <Sparkles size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display text-espresso block text-xl" style={{ fontWeight: 500 }}>
                    El Ojo Experto
                  </span>
                  <span className="text-ink-muted block text-sm">Responde al momento</span>
                </span>
                {mensajes.length > 0 && !agotado && (
                  <button
                    type="button"
                    onClick={reiniciar}
                    className="text-cacao shrink-0 text-sm font-semibold max-md:hidden"
                  >
                    Empezar de nuevo
                  </button>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-5 px-4 py-5 md:px-5 md:py-6">
                {mensajes.length === 0 && (
                  <p className="text-ink-body">
                    Hola, soy el Ojo Experto. Elige una duda o escribe la tuya.
                  </p>
                )}

                {mensajes.map((m) =>
                  m.rol === "alumna" ? (
                    /* Pregunta: burbuja cacao, con la esquina de cola en 4px. */
                    <p
                      key={m.id}
                      className="bg-cacao text-cream ml-auto max-w-[85%] rounded-xl rounded-br-[4px] px-4 py-3"
                    >
                      {m.texto}
                    </p>
                  ) : (
                    /* Respuesta: SIN burbuja, con el tile a la izquierda. */
                    <div key={m.id} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-gold-pale text-cacao flex size-7 shrink-0 items-center justify-center rounded-(--radius-sm)"
                      >
                        <Sparkles size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <TextoDelOjo texto={m.texto} />
                      </div>
                    </div>
                  ),
                )}

                {enviando && (
                  <div className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="bg-gold-pale text-cacao flex size-7 shrink-0 items-center justify-center rounded-(--radius-sm)"
                    >
                      <Sparkles size={15} />
                    </span>
                    <div className="flex items-center gap-1.5 pt-2" role="status" aria-label="Escribiendo">
                      {[0, 1, 2].map((n) => (
                        <span
                          key={n}
                          className="bg-cacao/40 size-1.5 animate-bounce"
                          style={{ animationDelay: `${n * 120}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Las sugerencias se van cuando se agota: su sitio lo ocupa
                    la tarjeta de límite. */}
                {!agotado && disponibles.length > 0 && (
                  <div className="mt-1">
                    <p className="text-gold text-xs font-bold tracking-[0.14em] uppercase">
                      {usadas === 0 ? "Elige una duda" : "Te queda 1 pregunta"}
                    </p>
                    <ul className="mt-3 flex flex-col gap-2.5 md:grid md:grid-cols-2">
                      {disponibles.map((s) => (
                        <li key={s.q}>
                          <button
                            type="button"
                            onClick={() => preguntar(s.q)}
                            disabled={enviando}
                            className="bg-sand hover:bg-sand-hover focus-visible:outline-gold flex min-h-[60px] w-full items-center gap-3 rounded-(--radius-md) px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-2 disabled:opacity-50"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="text-espresso block font-semibold text-balance">
                                {s.q}
                              </span>
                              <span className="text-ink-muted mt-1 block text-sm">{s.pie}</span>
                            </span>
                            <ArrowRight size={18} className="text-gold shrink-0" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {agotado && (
                  <div className="bg-gold-pale rounded-xl p-5">
                    <p className="font-display text-espresso text-2xl" style={{ fontWeight: 500 }}>
                      Usaste tus {LIMITE} preguntas gratis
                    </p>
                    {/* ⚠️ Decía "40 preguntas y 8 fotos al mes": los topes de los
                        planes viejos (hoy son 600 y 60, y viven en la base). Sin
                        cifras aquí para que no vuelvan a quedar desfasadas. */}
                    <p className="text-espresso/80 mt-2">
                      Con el plan, el Ojo Experto te responde todo el mes y revisa las fotos
                      de tu tejido.
                    </p>
                    {/* Antes "Crear cuenta gratis" → /entrar. Desde el 2026-10-21
                        lleva a pagar, anual por defecto (pedido de Cristian). */}
                    <div className="mt-5 md:max-w-sm">
                      <PagoConPlan enlaces={enlaces} origen="ojo_agotado" />
                    </div>
                  </div>
                )}

                <div ref={fin} />
              </div>

              {/* El composer desaparece al agotarse: su trabajo lo hace el
                  botón de crear cuenta. */}
              {!agotado && (
                <div className="px-4 pb-4 md:px-5 md:pb-5">
                  {error && (
                    <p role="alert" className="text-gold mb-3 text-center text-sm font-semibold">
                      {error}
                    </p>
                  )}

                  <div className="bg-ivory border-line-strong flex items-end gap-2 rounded-xl border p-2">
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
                      aria-label="Tu pregunta"
                      placeholder="O escribe la tuya…"
                      /* 16px en móvil: por debajo, iOS hace zoom al enfocar. */
                      className="text-espresso placeholder:text-ink-muted max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-base outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => preguntar(texto)}
                      disabled={enviando || texto.trim().length < 3}
                      aria-label="Enviar"
                      className="bg-espresso text-gold-pale flex size-11 shrink-0 items-center justify-center rounded-(--radius-sm) transition-opacity disabled:opacity-40"
                    >
                      <ArrowUp size={19} />
                    </button>
                  </div>

                  {/*
                    ⚠️ AQUÍ DECÍA "puede equivocarse" Y SE CAMBIÓ (pedido de
                    Cristian, 2026-10-20). Era un aviso que sembraba la duda
                    justo donde hay que dar confianza, y además DUPLICADO: el
                    descargo legal vive en los Términos
                    (`components/legal/Terminos.tsx`), que es donde tiene valor.

                    ⚠️ Lo que NO se puede decir es que esté "entrenado con la
                    experiencia de Elizabeth": no lo está — es un modelo
                    general al que se le inyecta la ficha del bolso en cada
                    consulta. Esto de abajo sí es literal.
                  */}
                  <p className="text-ink-muted mt-3 text-center text-xs">
                    Responde con las fichas y el método de Elizabeth.
                  </p>
                </div>
              )}
            </div>

            {/* En móvil, "Empezar de nuevo" va BAJO la tarjeta. Dentro de la
                cabecera competía con el título en 375px. */}
            {mensajes.length > 0 && (
              <button
                type="button"
                onClick={reiniciar}
                className="text-gold-pale mx-auto mt-5 block text-sm font-semibold underline underline-offset-4 md:hidden"
              >
                Empezar de nuevo
              </button>
            )}
          </div>
        </div>
      </Entrada>
    </section>
  );
}
