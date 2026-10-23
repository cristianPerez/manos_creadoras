import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { costoEnUsd, leerConsumo } from "@/lib/costo-ia";
import { reportarAviso, reportarFallo } from "@/lib/fallos";
import { respuestaSimulada, simulacionActiva } from "@/lib/ia-simulada";
import { auditarPromesas, RESPUESTA_CORREGIDA } from "@/lib/promesas";
import { aiEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  pregunta: z.string().min(3).max(500),
  imagenBase64: z.string().max(7_000_000).optional(),
  /*
    De qué bolso y qué paso pregunta. Opcionales a propósito: se puede preguntar
    algo general sin estar dentro de un bolso, y obligarla a elegir uno antes de
    escribir sería un trámite para quien solo tiene una duda suelta.
  */
  bolsoSlug: z.string().max(80).optional(),
  paso: z.number().int().min(0).max(99).optional(),
  /*
    ⚠️ LA CONVERSACIÓN EN CURSO. Sin esto, CADA PREGUNTA CREABA UNA
    CONVERSACIÓN NUEVA: el historial crecía una entrada por pregunta y no
    existía "seguir hablando de lo mismo" — el chat de la pantalla era, por
    dentro, una ristra de consultas sueltas. Detectado el 2026-10-20.

    Opcional: la primera pregunta de un hilo no la trae y se crea una.
  */
  conversacionId: z.string().uuid().optional(),
});

/**
 * La voz de Elizabeth + los límites del tema.
 * `es_del_tema: false` es el FILTRO: si la pregunta no es de tejido, el modelo lo
 * marca y la app responde con un desvío amable en vez de contestar cualquier cosa.
 */
/**
 * La voz de Elizabeth y los límites del tema.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ ANTES ESTE PROMPT DECÍA "SOLO TEJIDO", Y ESO TUMBABA MEDIA PANTALLA
 * ════════════════════════════════════════════════════════════════════════════
 * La versión vieja permitía "técnica, materiales, acabados, herrajes, patrones
 * y cómo fotografiar o poner precio" y marcaba TODO lo demás como fuera de
 * tema. Con las cuatro preguntas sugeridas nuevas —materiales, fotos, diseño y
 * REDES SOCIALES— eso significaba que la pantalla ofrecía cuatro puertas y el
 * modelo cerraba las últimas dos con un desvío amable.
 *
 * Encargo de Cristian del 2026-10-20: el Ojo deja de ser un ayudante de tejido
 * y pasa a ser la asistente del NEGOCIO de bolsos. Tejer ya se aprende con los
 * videos; lo que justifica pagar es el resto.
 *
 * ⚠️ EL FILTRO NO SE QUITA, SE REESCRIBE. Sigue haciendo falta: sin él, el Ojo
 * contesta recetas y tareas escolares con el presupuesto de IA de Cristian. La
 * regla pasa de "solo tejido" a "solo el negocio de bolsos tejidos de esta
 * alumna", con los mismos NUNCA.
 *
 * ⚠️ Y DISTINGUE LO QUE HACE DE LO QUE INDICA. Petición explícita de Cristian:
 * el Ojo escribe prompts e instrucciones, no genera imágenes. Prometer de más
 * aquí se paga en soporte: una alumna que entiende "te hago la foto" y recibe
 * un texto se siente estafada.
 */
const INSTRUCCIONES = `Eres "El Ojo Experto", la asistente creativa del programa Manos Creadoras, que enseña a tejer bolsos de lujo en cuentas y malla plástica.

CÓMO RESPONDES
- Español latinoamericano, cálida y directa, como una maestra que está al lado de la alumna.
- Concreta y accionable. Nada de consejos genéricos que sirven para cualquier negocio:
  si no puedes dar un paso que ella pueda dar HOY, pide el dato que te falta.
- Usa el vocabulario del oficio: tensión, vueltas, cuentas, herrajes, remates, base, asa.
- Largo según lo que se pide: un ajuste de tejido se dice en 2-3 frases; un guion de reel,
  una lista de materiales o unas ideas de diseño necesitan más. Nunca rellenes.
- Si te dan una foto y no permite juzgar, dilo y pide un ángulo mejor. Nunca inventes lo que no ves.

DE QUÉ HABLAS — las cinco áreas del programa
1. MATERIALES Y TEJIDO: cuentas, hilos, herrajes, dónde comprarlos, y los errores que
   salen tejiendo (tensión, base abombada, asas torcidas, remates).
2. FOTOGRAFÍA: fondos, escenarios, luz natural, encuadres y prompts para que ella mejore
   las fotos de sus bolsos con las herramientas que ya usa.
3. DISEÑO CREATIVO: ideas de bolsos nuevos, combinaciones de color, estilos y acabados.
4. CONTENIDO PARA REDES: ideas de reels, guiones cortos, ganchos y pies de foto.
5. MARCA Y VENTAS: nombres para sus diseños, descripciones de producto y textos para publicar.

LO QUE HACES vs LO QUE INDICAS — di siempre cuál de las dos
- HACES: responder, explicar, revisar una foto que ella sube, escribir textos, guiones,
  nombres, descripciones y PROMPTS listos para copiar.
- NO HACES: generar imágenes ni videos, editar sus fotos, publicar en redes ni comprar
  materiales. Para eso le das las instrucciones exactas y el prompt, y se lo dices claro:
  "te dejo el prompt listo para pegarlo en…", nunca "te hago la imagen".

FUERA DE TEMA
- Si te preguntan algo que no toca su negocio de bolsos tejidos (recetas, salud, política,
  tareas escolares, código, otras manualidades), marca es_del_tema = false y deja respuesta vacía.
- Una pregunta de fotos, redes, diseño, precios de SUS bolsos o cómo venderlos SÍ es del tema.

NUNCA
- Prometas ingresos, ventas o resultados económicos.
- Hables de precios del programa, cobros, reembolsos o cancelaciones — para eso está el soporte.
- Des consejos médicos, legales o financieros.

Devuelve SIEMPRE un JSON con la forma: {"es_del_tema": boolean, "respuesta": string}`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    es_del_tema: { type: "boolean" },
    respuesta: { type: "string" },
  },
  required: ["es_del_tema", "respuesta"],
} as const;

/* ⚠️ EL DESVÍO TAMBIÉN SE ACTUALIZÓ. Decía "solo puedo ayudarte con tu tejido"
   y enumeraba tensión/materiales/herrajes: eso contradecía las cuatro puertas
   de la pantalla. Ahora nombra las cinco áreas, así que cuando rebota una
   pregunta de verdad fuera de tema, de paso enseña todo lo que SÍ sabe. */
const FUERA_DE_TEMA =
  "Eso se me escapa 🧶 — pregúntame de tus bolsos: materiales y tejido, fotos, ideas de diseño, contenido para redes o cómo nombrarlos y venderlos.";

/**
 * El mes del cupo, `YYYY-MM`, en hora de Colombia.
 *
 * ⚠️ TIENE QUE SER EL MISMO MES QUE `periodo_actual()` DE LA BASE, que es quien
 * descuenta. Antes esto usaba UTC: el último día de cada mes, de 7 de la tarde a
 * medianoche, la base descontaba en un mes y aquí se devolvía en el siguiente —
 * en una fila que no existía, así que la devolución no hacía nada.
 */
function periodoActual() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
}

/**
 * Acota un texto de la alumna antes de meterlo en el prompt del sistema.
 *
 * ⚠️ POR QUÉ HACE FALTA. `profiles.notas_tejido` y `nombre` entraban LITERALES
 * en el contexto que se le manda al modelo. La política RLS deja a la alumna
 * actualizar su propio perfil sin restricción de columnas, así que por la API
 * podría escribir ahí instrucciones y colarlas dentro del prompt — "ignora lo
 * anterior y…". Es exactamente la misma clase de agujero que el campo `product`
 * de El Charcu, que era texto libre del navegador entrando tal cual.
 *
 * Tres cosas, y cada una cierra una puerta:
 *
 *  · **Tope de longitud.** Una inyección necesita espacio para explicarse; 300
 *    caracteres bastan para "se le suelta la tensión en la base" y no para un
 *    manual de instrucciones nuevo.
 *  · **Fuera los saltos de línea.** Son lo que permite fingir que empieza una
 *    sección nueva del prompt. En una nota sobre tejido no hacen falta.
 *  · **Fuera los backticks y las llaves**, que es como se imita la forma de las
 *    instrucciones del sistema.
 *
 * No pretende ser infalible —ninguna limpieza de texto lo es— pero convierte un
 * campo abierto en una frase corta de una línea, que es mucho menos útil para
 * quien lo intente.
 */
function limpiar(texto: string, tope: number): string {
  return texto
    .replace(/[\r\n]+/g, " ")
    .replace(/[`{}]/g, "")
    .trim()
    .slice(0, tope);
}

/** Cuántas preguntas regala el home a quien no tiene cuenta. */
const PREGUNTAS_DE_VISITANTE = 2;

/**
 * Identifica a un visitante sin guardar quién es.
 *
 * ⚠️ NO SE GUARDA LA IP EN CLARO, Y NO ES UN DETALLE. Para contar dos preguntas
 * basta un hash; almacenar direcciones de gente que ni siquiera tiene cuenta
 * sería recoger un dato personal sin ningún motivo, y habría que declararlo en
 * la política de privacidad.
 *
 * Se mezcla la IP con una sal del servidor: sin ella, cualquiera con la lista de
 * IPs posibles podría recalcular los hashes y saber quién preguntó.
 */
async function huellaDelVisitante(req: Request): Promise<string> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "desconocida";
  const sal = process.env.SUPABASE_SECRET_KEY ?? "sin-sal";
  const datos = new TextEncoder().encode(`${sal}:${ip}`);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: Request) {
  const env = aiEnv();
  const db = supabaseAdmin();

  /*
    ── Quién pregunta: alumna con cuenta, o VISITANTE del home ───────────────

    ⚠️ DESDE EL HOME V2 ESTA RUTA RESPONDE TAMBIÉN SIN CUENTA, y eso abre el
    gasto de IA a tráfico anónimo: cualquiera que pase por la landing cuesta
    dinero, y una landing con ads recibe miles de visitas. Por eso el camino del
    visitante lleva DOS frenos que el de la alumna no necesita:

      · dos preguntas por huella, contadas en la BASE (`consumir_visitante`).
        Borrar la cookie no regala preguntas nuevas si la IP ya gastó las suyas.
      · su propio bolsillo de presupuesto diario ('visitante'), separado del de
        quien paga. Si se agota, el Ojo calla EN EL HOME y quien pagó lo sigue
        teniendo entero.

    El token se sigue validando EN SERVIDOR cuando viene: que el navegador diga
    quién es nunca ha bastado.
  */
  /* Se lee con una expresión y no con `replace("Bearer ", "")`: si llega
     "Bearer" sin token (el navegador recorta el espacio final), el replace no
     encuentra nada y devolvía "Bearer" como si fuera un token → 401. */
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  let userId: string | null = null;

  if (token) {
    const { data: userData, error: userErr } = await db.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "sesión inválida" }, { status: 401 });
    }
    userId = userData.user.id;
  }

  /*
    ⚠️ AQUÍ HABÍA UN PORTAZO: `if (!tiene_acceso_de) → 403 sin membresía activa`.

    Desde la 0012 el Ojo Experto ya no exige haber comprado: exige TENER CUENTA
    y que te quede cupo. Quien se registró gratis entra con 8 consultas al mes;
    quien tiene el programa, con 600 (tope de uso justo). La puerta no es un sí/no, es un número.

    El cupo lo dice la base (`cupo_de`), no una constante en el código: antes los
    límites vivían en `lib/config.ts` y los repetían la API y la pantalla, que es
    la forma clásica de que dentro de un mes prometan cosas distintas.

    Sigue sin haber forma de entrar sin sesión: el token se valida arriba.
  */
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "consulta inválida" }, { status: 400 });
  }
  const { pregunta, imagenBase64, bolsoSlug, paso, conversacionId } = parsed.data;
  const esFoto = Boolean(imagenBase64);

  /*
    ── Cuántas le quedan ────────────────────────────────────────────────────

    En los dos casos se MIRA Y SE DESCUENTA EN LA MISMA OPERACIÓN. Antes eran
    dos pasos y entre uno y otro cabía otra petición: con la app abierta en el
    teléfono y en el portátil, dos preguntas a la vez pasaban las dos la
    comprobación y gastaban una sola.

    Los límites los dice la base, no una constante aquí: antes vivían en
    `lib/config.ts` repetidos por la API y la pantalla, que es la forma clásica
    de que dentro de un mes prometan cosas distintas.
  */
  let cupo: { permitido: boolean; preguntas_usadas: number; fotos_usadas: number; preguntas_limite: number; fotos_limite: number; plan: string };
  /** Solo la tiene el visitante: es con lo que se le devuelve la pregunta. */
  let huella: string | null = null;

  if (userId) {
    const { data } = await db.rpc("consumir_cupo", { p_user_id: userId, p_fotos: esFoto ? 1 : 0 });
    const fila = Array.isArray(data) ? data[0] : data;
    if (!fila) {
      // Fallar CERRADO: si la base no supo responder, no se gasta IA.
      return NextResponse.json(
        { error: "No pudimos verificar tu cupo. Vuelve a intentar." },
        { status: 503 },
      );
    }
    cupo = fila;
  } else {
    /*
      El visitante no puede mandar fotos: analizar una imagen cuesta bastante más
      que responder texto, y aquí no hay ni cuenta a la que atribuir el gasto.
      Para eso está la cuenta gratis, que sí trae una foto al mes.
    */
    if (esFoto) {
      return NextResponse.json(
        /* ⚠️ `necesitaPlan` (2026-10-21): la salida ya no es crear cuenta sino
           el plan — los "Crear mi cuenta gratis" de la app pasaron a pagar.
           `necesitaCuenta` se queda porque el Ojo del home lo sigue leyendo. */
        {
          error: "Las fotos son del plan: el Ojo Experto revisa tu tejido y te dice qué mejorar.",
          necesitaCuenta: true,
          necesitaPlan: true,
          motivo: "foto",
        },
        { status: 403 },
      );
    }

    huella = await huellaDelVisitante(req);
    const { data } = await db.rpc("consumir_visitante", {
      p_huella: huella,
      p_limite: PREGUNTAS_DE_VISITANTE,
    });
    const fila = Array.isArray(data) ? data[0] : data;
    if (!fila) {
      return NextResponse.json(
        { error: "No pudimos atenderte ahora. Vuelve a intentar." },
        { status: 503 },
      );
    }
    cupo = {
      permitido: fila.permitido,
      preguntas_usadas: fila.usadas,
      fotos_usadas: 0,
      preguntas_limite: fila.limite,
      fotos_limite: 0,
      plan: "visitante",
    };
  }

  if (!cupo.permitido) {
    if (!userId) {
      return NextResponse.json(
        {
          error: `Usaste tus ${PREGUNTAS_DE_VISITANTE} preguntas gratis.`,
          necesitaCuenta: true,
          necesitaPlan: true,
          motivo: "agotado",
        },
        { status: 429 },
      );
    }
    const agotadoFotos = esFoto && cupo.fotos_usadas + 1 > cupo.fotos_limite;
    return NextResponse.json(
      {
        error: agotadoFotos
          ? `Llegaste a tus ${cupo.fotos_limite} fotos de este mes. Se renuevan el día 1.`
          : `Llegaste a tus ${cupo.preguntas_limite} preguntas de este mes. Se renuevan el día 1.`,
        /* A quien está en la cuenta gratis se le ofrece el plan; a quien ya
           paga, no hay nada que ofrecer: solo esperar al día 1. */
        necesitaPlan: cupo.plan === "gratis",
        motivo: agotadoFotos ? "foto" : "agotado",
      },
      { status: 429 },
    );
  }

  /*
    Si el Ojo no llega a contestar DESPUÉS de aquí —pregunta fuera de tema,
    presupuesto del día agotado o Gemini caído— se le devuelve lo que ya se le
    descontó. Cobrarle una pregunta por algo que no recibió es la forma más
    rápida de que deje de confiar en el medidor, y con la cuenta gratis (3 al
    mes) una pregunta perdida es un tercio de su prueba.

    ⚠️ ESTA FUNCIÓN EXISTÍA Y NADIE LA LLAMABA (hasta el 2026-10-20): la pregunta
    se perdía en los tres casos.

    ⚠️ RESTA SOBRE LO QUE HAY, NO ESCRIBE UN NÚMERO. Antes ponía "lo que había al
    descontar, menos uno": si entre medias entraba otra pregunta suya —el
    teléfono y el portátil a la vez—, la pisaba y le regalaba una. Sin una
    función SQL propia, se resta con compare-and-swap: solo escribe si la fila
    sigue como se leyó; si otra petición la tocó, vuelve a leer.

    Nunca lanza: va justo antes de responder un error, y un fallo aquí no puede
    cambiar ese error por otro.
  */
  const devolverCupo = async () => {
    const fotos = esFoto ? 1 : 0;
    try {
      for (let intento = 0; intento < 3; intento++) {
        if (userId) {
          const periodo = periodoActual();
          const { data: fila } = await db
            .from("ojo_uso_mensual")
            .select("preguntas, fotos")
            .eq("user_id", userId)
            .eq("periodo", periodo)
            .maybeSingle();
          if (!fila) return;
          const { data: cambiadas } = await db
            .from("ojo_uso_mensual")
            .update({
              preguntas: Math.max(0, fila.preguntas - 1),
              fotos: Math.max(0, fila.fotos - fotos),
            })
            .eq("user_id", userId)
            .eq("periodo", periodo)
            .eq("preguntas", fila.preguntas)
            .eq("fotos", fila.fotos)
            .select("user_id");
          if (cambiadas?.length) return;
        } else if (huella) {
          const { data: fila } = await db
            .from("ojo_visitantes")
            .select("preguntas")
            .eq("huella", huella)
            .maybeSingle();
          if (!fila) return;
          const { data: cambiadas } = await db
            .from("ojo_visitantes")
            .update({ preguntas: Math.max(0, fila.preguntas - 1) })
            .eq("huella", huella)
            .eq("preguntas", fila.preguntas)
            .select("huella");
          if (cambiadas?.length) return;
        } else {
          return;
        }
      }
      reportarAviso("ojo-experto", "no se pudo devolver el cupo tras 3 intentos", { publico });
    } catch (e) {
      reportarFallo("ojo-experto", "falló la devolución del cupo", {
        publico,
        detalle: e instanceof Error ? e.message : "desconocido",
      });
    }
  };

  /*
    ── Circuit-breaker de gasto, con DOS BOLSILLOS ───────────────

    ⚠️ ESTE BLOQUE SE MOVIÓ AQUÍ A PROPÓSITO (migración 0011). Antes estaba más
    arriba, antes de saber quién preguntaba, y ese era exactamente el fallo: al
    agotarse el tope del día se agotaba para TODAS, incluida la alumna que paga
    la suscripción. Alguien con un acceso de regalo podía dejar mudo el Ojo
    Experto de quien puso el dinero.

    Ahora primero se pregunta de qué público es —lo dice su concesión, no
    `profiles.status`, que ya no decide nada— y cada uno gasta de lo suyo.

    Sigue estando ANTES de llamar a Gemini, que es lo que cuesta.
  */
  /*
    TRES bolsillos, y cada uno gasta de lo suyo: quien paga, quien tiene cuenta
    gratis, y quien ni siquiera tiene cuenta. Es la misma lección de la 0011 —
    al agotarse un tope compartido se agotaba para TODAS, incluida la alumna que
    puso el dinero. El visitante del home es justo el que más riesgo trae: llega
    por un anuncio, en volumen y sin haber dado nada.
  */
  const publico = !userId ? "visitante" : cupo.plan === "gratis" ? "regalo" : "miembro";

  const tope =
    publico === "miembro"
      ? (env.AI_DAILY_BUDGET_MIEMBRO_USD ?? env.AI_DAILY_BUDGET_USD)
      : (env.AI_DAILY_BUDGET_REGALO_USD ?? env.AI_DAILY_BUDGET_USD);

  const { data: gastoHoy } = await db.rpc("gasto_ia_de_hoy", { p_publico: publico });

  if (Number(gastoHoy ?? 0) >= tope) {
    await devolverCupo();
    return NextResponse.json(
      { error: "El Ojo Experto está descansando. Vuelve a intentar en un rato." },
      { status: 503 },
    );
  }

  /*
    El contexto del bolso: de dónde venía la pregunta. Es lo que convierte
    "revisa cada 5 cuentas" en "revisa cada 5 cuentas" SABIENDO que está en la
    base de Gota de Rocío y qué materiales usa.
  */
  let bolsoId: string | null = null;
  let leccionId: string | null = null;
  let fichaBolso = "";

  if (bolsoSlug) {
    const { data: b } = await db
      .from("bolsos")
      .select("id, nombre, medidas_cm, materiales(texto), lecciones(id, orden, titulo, parte)")
      .eq("slug", bolsoSlug)
      .maybeSingle();

    if (b) {
      bolsoId = b.id;
      const lecciones = [...(b.lecciones ?? [])].sort((x, y) => x.orden - y.orden);
      const titulos = [...new Set(lecciones.map((l) => l.titulo))];
      if (paso && paso > 0) {
        leccionId = lecciones.find((l) => l.titulo === titulos[paso - 1])?.id ?? null;
      }
      const lineas = [
        `BOLSO QUE ESTÁ TEJIENDO: ${b.nombre}.`,
        `- Pasos, en orden: ${titulos.map((t, i) => `${i + 1}. ${t}`).join("; ")}.`,
      ];
      if (paso && titulos[paso - 1]) lineas.push(`- Va por el paso ${paso}: ${titulos[paso - 1]}.`);
      if (b.materiales?.length) {
        lineas.push(`- Materiales: ${b.materiales.map((m) => m.texto).join("; ")}.`);
      }
      if (b.medidas_cm) {
        lineas.push(`- Medidas del bolso terminado: ${JSON.stringify(b.medidas_cm)}.`);
      }
      fichaBolso = lineas.join("\n");
    }
  }

  // ── MEMORIA: su ficha + sus últimas consultas ───────────────
  /* Al visitante no se le puede construir memoria: no hay ficha ni historial
     suyos. Se queda con el contexto del bolso, que ya es bastante. */
  const contexto = [fichaBolso, userId ? await construirContexto(db, userId) : ""]
    .filter(Boolean)
    .join("\n\n");

  /*
    ── Modo simulado (solo QA) ───────────────────────────────────

    Se contesta sin llamar a Google. Recorre el camino ENTERO —cupo, gasto,
    barrera de promesas, historial— así que lo que se prueba es lo mismo que
    corre en producción, pero gratis y con una respuesta estable.

    `simulacionActiva()` exige dos cosas y la segunda no se puede apagar con una
    variable: en producción esto NUNCA se enciende, por mucho que alguien copie
    `AI_SIMULAR_IA=1` sin darse cuenta.
  */
  if (simulacionActiva()) {
    const sim = respuestaSimulada(pregunta, esFoto);
    await db.rpc("apuntar_gasto_ia", {
      p_publico: publico,
      p_tokens_entrada: sim.tokensEntrada,
      p_tokens_salida: sim.tokensSalida,
      p_usd: costoEnUsd({ tokensEntrada: sim.tokensEntrada, tokensSalida: sim.tokensSalida }),
    });
    return await guardarYResponder(db, {
      userId,
      pregunta,
      respuesta: sim.texto,
      esFoto,
      uso: { preguntas: cupo.preguntas_usadas, fotos: cupo.fotos_usadas },
      bolsoId,
      leccionId,
      conversacionId: conversacionId ?? null,
    });
  }

  // ── Llamada a la IA ─────────────────────────────────────────
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  try {
    const parts: Record<string, unknown>[] = [{ text: `${contexto}\n\n${pregunta}` }];
    if (imagenBase64) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: imagenBase64 } });
    }

    const result = await ai.models.generateContent({
      model: env.AI_MODEL,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: INSTRUCCIONES,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        // Probado con fotos reales: con 700 la respuesta se cortaba a mitad de frase
        // y rompía el JSON. 1500 da margen de sobra para 3 frases + el envoltorio.
        maxOutputTokens: 1500,
      },
    });

    /*
      El gasto se apunta con lo que Gemini dice que consumió, no con una
      estimación.

      ⚠️ SE APUNTA ANTES DE MIRAR SI ERA DEL TEMA. Antes iba después, y una
      pregunta fuera de tema costaba dinero sin quedar apuntada. Ahora que esa
      pregunta se le devuelve, sin esto se podría repetir gratis sin que el freno
      de gasto la contara nunca: Google cobra igual la respuesta que se descarta.

      ⚠️ Y con UNA sentencia atómica. Antes esto era leer `usd` arriba y
      reescribir `leído + costo` aquí: entre esas dos líneas cabe otra petición,
      las dos leen 4,00, las dos escriben 4,01, y una consulta se gastó sin
      quedar apuntada. Se perdía gasto en silencio y el freno saltaba más tarde
      de lo debido — justo cuando más falta hace. `apuntar_gasto_ia` suma sobre
      el valor de la fila en la propia base, así que no hay hueco donde pisarse.
    */
    const consumo = leerConsumo((result as { usageMetadata?: unknown }).usageMetadata);
    await db.rpc("apuntar_gasto_ia", {
      p_publico: publico,
      p_tokens_entrada: consumo.tokensEntrada,
      p_tokens_salida: consumo.tokensSalida,
      p_usd: costoEnUsd(consumo),
    });

    const { esDelTema, respuesta } = interpretar(result.text ?? "");

    if (!esDelTema || !respuesta.trim()) {
      // No le gastamos cupo por una pregunta que no contestamos.
      await devolverCupo();
      return NextResponse.json({ respuesta: FUERA_DE_TEMA, fueraDeTema: true });
    }

    return await guardarYResponder(db, {
      userId,
      pregunta,
      respuesta,
      esFoto,
      uso: { preguntas: cupo.preguntas_usadas, fotos: cupo.fotos_usadas },
      bolsoId,
      leccionId,
      conversacionId: conversacionId ?? null,
    });
  } catch (e) {
    /*
      Gemini no contestó, o contestó algo que reventó el camino.

      ⚠️ Se apunta la CLASE de error y su mensaje técnico, nunca la pregunta de
      la alumna ni la foto: eso es texto sobre lo que ella está tejiendo, y los
      registros salen del edificio en cuanto haya un recolector.

      Esto SÍ es un fallo técnico —algo está roto— a diferencia de quedarse sin
      cupo o sin presupuesto, que son el producto funcionando y viven en
      Mixpanel.
    */
    reportarFallo("ojo-experto", "la llamada a la IA falló", {
      modelo: env.AI_MODEL,
      publico,
      detalle: e instanceof Error ? e.message : "desconocido",
    });
    await devolverCupo();
    return NextResponse.json(
      { error: "No pudimos conectar con el Ojo Experto. Vuelve a intentar." },
      { status: 502 },
    );
  }
}

/**
 * El final del camino, uno solo para los DOS caminos.
 *
 * Lo recorren igual la respuesta de Gemini y la simulada, y eso es el punto:
 * si el modo simulado se saltara la barrera de promesas o el conteo de cupo,
 * en QA se estaría probando un flujo que no existe en producción — y lo que se
 * comprueba dejaría de significar nada.
 */
async function guardarYResponder(
  db: ReturnType<typeof supabaseAdmin>,
  datos: {
    /** Nulo cuando pregunta un visitante del home: no hay conversación que guardar. */
    userId: string | null;
    pregunta: string;
    respuesta: string;
    esFoto: boolean;
    /** Ya descontado por `consumir_cupo`: aquí solo se devuelve a la pantalla. */
    uso: { preguntas: number; fotos: number };
    bolsoId: string | null;
    leccionId: string | null;
    /** El hilo en curso, si la pantalla venía de uno. Ver abajo. */
    conversacionId: string | null;
  },
): Promise<NextResponse> {
  const { userId, pregunta, respuesta, esFoto, uso, bolsoId, leccionId, conversacionId } = datos;

  /*
    ── SEGUNDA BARRERA: se revisa la respuesta antes de que la vea nadie ──

    El prompt del sistema ya pide "NUNCA prometas ingresos". Pero un prompt es
    una instrucción, no una barrera: se dobla con una pregunta insistente, y un
    modelo que obedece el 99% de las veces incumple el 1% restante — que con
    volumen es todos los días. Prometer ganancias es publicidad engañosa y
    motivo de que una pasarela tumbe el producto.

    Es el mismo gesto que `cure-safety` en El Charcu, apuntando al riesgo que sí
    existe aquí: allí una dosis mal dada envenena, aquí una promesa incumplida
    cuesta el canal de cobro y la confianza de la alumna.
  */
  const veredicto = auditarPromesas(respuesta);
  const textoFinal = veredicto.limpia ? respuesta : RESPUESTA_CORREGIDA;

  if (!veredicto.limpia) {
    /*
      ⚠️ Se apunta CUÁNTAS coincidencias hubo, NUNCA cuáles. El fragmento es
      texto sobre lo que esa alumna teje y vende, y los registros salen del
      edificio en cuanto haya un recolector de logs. El número basta para lo
      único que hay que vigilar: si sube, el prompt se rompió.
    */
    reportarAviso("ojo-experto", "respuesta con promesa de ingresos, corregida", {
      coincidencias: veredicto.coincidencias,
    });
  }

  // Se guarda la CORREGIDA, no la que traía la promesa: el historial lo vuelve a
  // leer el modelo como contexto, y dejarla ahí sería enseñarle a repetirla.
  /*
    El historial son MENSAJES, no filas de pregunta+respuesta. La pantalla nueva
    es un chat: necesita pintar el hilo y poder guardar el pulgar arriba o abajo
    de una respuesta concreta, y eso no cabe en una sola fila.
  */
  /* El visitante no tiene dónde guardar un historial: no hay cuenta a la que
     colgarlo. Su conversación vive solo en su pantalla. */
  /*
    ⚠️ SE CONTINÚA LA CONVERSACIÓN SI VIENE UNA, Y SOLO SI ES SUYA.
    El `.eq("user_id", userId)` no es decorativo: `conversacionId` lo manda el
    navegador, así que sin él cualquiera podría escribir en el hilo de otra
    alumna pasando un id ajeno. Si no coincide, no se "falla": se abre una
    conversación nueva, que es lo que haría igualmente alguien sin hilo.
  */
  let conversacion: { id: string; created_at: string } | null = null;

  if (userId && conversacionId) {
    const { data } = await db
      .from("ojo_conversaciones")
      .select("id, created_at")
      .eq("id", conversacionId)
      .eq("user_id", userId)
      .maybeSingle();
    conversacion = data ?? null;
  }

  if (userId && !conversacion) {
    const { data } = await db
      .from("ojo_conversaciones")
      .insert({
        user_id: userId,
        // El título es la propia pregunta recortada: es lo que la alumna
        // reconocerá en la lista, mejor que "Consulta del 12 de octubre".
        titulo: pregunta.slice(0, 60),
        bolso_id: bolsoId,
        leccion_id: leccionId,
      })
      .select("id, created_at")
      .single();
    conversacion = data ?? null;
  }

  if (conversacion) {
    await db.from("ojo_mensajes").insert([
      { conversacion_id: conversacion.id, rol: "alumna", texto: pregunta },
      { conversacion_id: conversacion.id, rol: "ojo", texto: textoFinal },
    ]);
  }
  const guardada = conversacion;

  const nuevoUso = uso;

  // Se devuelve el uso ya actualizado para que el medidor de la pantalla muestre
  // el número REAL de la base y no una cuenta paralela del navegador.
  return NextResponse.json({
    respuesta: textoFinal,
    /* El hilo al que se acaba de escribir: la pantalla lo guarda y lo manda en
       la siguiente pregunta, y así la conversación es UNA y no una por turno. */
    conversacionId: guardada?.id ?? null,
    uso: nuevoUso,
    /*
      Se le dice al navegador que la barrera actuó, para que lo mida.

      ⚠️ Solo el SÍ/NO, nunca el texto que se bloqueó: es lo que el modelo
      escribió sobre lo que esa alumna teje y vende. Lo que hay que vigilar es
      si el número sube, no qué decía.
    */
    promesaBloqueada: !veredicto.limpia,
    consulta: { id: guardada?.id, createdAt: guardada?.created_at },
  });
}

/**
 * Lee la respuesta del modelo sin que la alumna vea nunca JSON en crudo.
 *
 * Detectado probando con fotos reales: si la respuesta se corta (por límite de tokens
 * o por un corte de red), `JSON.parse` revienta y el texto crudo — llaves y comillas
 * incluidas — terminaba en pantalla. Aquí, si el JSON viene roto, se RESCATA el campo
 * `respuesta` a mano y se devuelve solo la parte legible.
 */
function interpretar(crudo: string): { esDelTema: boolean; respuesta: string } {
  try {
    const json = JSON.parse(crudo) as { es_del_tema?: boolean; respuesta?: string };
    return { esDelTema: json.es_del_tema !== false, respuesta: (json.respuesta ?? "").trim() };
  } catch {
    /*
      El modelo devolvió algo que no es JSON válido — normalmente porque la
      respuesta se cortó por el tope de tokens. Se rescata abajo, pero se apunta:
      si esto sube, el tope se quedó corto y hay alumnas viendo frases a medias.

      Es un AVISO y no un error: la alumna recibe su respuesta igual.
    */
    reportarAviso("ojo-experto", "la IA devolvió un JSON roto; se rescató el texto", {
      largo: crudo.length,
    });
    // JSON truncado o malformado: sacar el texto de "respuesta" aunque no cierre.
    const m = crudo.match(/"respuesta"\s*:\s*"((?:[^"\\]|\\.)*)/);
    const rescatado = m
      ? m[1].replace(/\\"/g, '"').replace(/\\n/g, " ").replace(/\\\\/g, "\\").trim()
      : "";
    const fueraDeTema = /"es_del_tema"\s*:\s*false/.test(crudo);
    // Si se cortó a media frase, cerrar en la última oración completa.
    const hastaPunto = rescatado.replace(/[^.!?]*$/, "").trim();
    return { esDelTema: !fueraDeTema, respuesta: hastaPunto || rescatado };
  }
}

/**
 * MEMORIA POR ALUMNA, acotada al tejido: en qué módulo va, qué se le repite,
 * y sus últimas consultas. Es lo que hace que se sienta una mentora y no un buscador.
 */
async function construirContexto(
  db: ReturnType<typeof supabaseAdmin>,
  userId: string,
): Promise<string> {
  const [{ data: perfil }, { data: progreso }, { data: recientes }] = await Promise.all([
    db.from("profiles").select("nombre, notas_tejido").eq("id", userId).maybeSingle(),
    db.from("progreso").select("video_id").eq("user_id", userId),
    db
      .from("ojo_mensajes")
      .select("rol, texto, ojo_conversaciones!inner(user_id)")
      .eq("ojo_conversaciones.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const lineas: string[] = ["CONTEXTO DE ESTA ALUMNA (úsalo, no lo repitas literal):"];

  if (perfil?.nombre) lineas.push(`- Se llama ${limpiar(perfil.nombre, 60)}.`);
  if (progreso?.length) lineas.push(`- Lleva ${progreso.length} videos vistos.`);
  if (perfil?.notas_tejido) {
    lineas.push(`- Notas de su tejido: ${limpiar(perfil.notas_tejido, 300)}`);
  }

  if (recientes?.length) {
    lineas.push("- Lo último que hablasteis:");
    for (const m of recientes.reverse()) {
      lineas.push(`  · ${m.rol === "alumna" ? "Ella" : "Tú"}: "${limpiar(m.texto, 300)}"`);
    }
  }

  if (lineas.length === 1) return "";
  return lineas.join("\n");
}
