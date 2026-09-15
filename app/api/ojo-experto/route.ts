import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { costoEnUsd, leerConsumo } from "@/lib/costo-ia";
import { respuestaSimulada, simulacionActiva } from "@/lib/ia-simulada";
import { auditarPromesas, RESPUESTA_CORREGIDA } from "@/lib/promesas";
import { aiEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  pregunta: z.string().min(3).max(500),
  imagenBase64: z.string().max(7_000_000).optional(),
});

/**
 * La voz de Elizabeth + los límites del tema.
 * `es_del_tema: false` es el FILTRO: si la pregunta no es de tejido, el modelo lo
 * marca y la app responde con un desvío amable en vez de contestar cualquier cosa.
 */
const INSTRUCCIONES = `Eres "El Ojo Experto", la mentora de IA del programa Manos Creadoras, que enseña a tejer bolsos de lujo en cuentas y malla plástica.

CÓMO RESPONDES
- Español latinoamericano, cálida y directa, como una maestra que está al lado de la alumna.
- Máximo 3 frases. Primero qué ves bien, después el ajuste concreto.
- Usa el vocabulario del oficio: tensión, vueltas, cuentas, herrajes, remates, base, asa.
- Si la foto no permite juzgar, dilo y pide un ángulo mejor. Nunca inventes lo que no ves.

DE QUÉ HABLAS
- Solo de tejido de bolsos en cuentas y malla plástica: técnica, materiales, acabados,
  herrajes, patrones, y cómo fotografiar o poner precio a un bolso terminado.
- Si te preguntan de CUALQUIER otro tema (recetas, salud, política, otras manualidades,
  tareas escolares, código), marca es_del_tema = false y deja respuesta vacía.

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

const FUERA_DE_TEMA =
  "Solo puedo ayudarte con tu tejido 🧶 — pregúntame por tensión, materiales, herrajes o acabados y te oriento al instante.";

function periodoActual() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
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

export async function POST(req: Request) {
  const env = aiEnv();
  const db = supabaseAdmin();

  // ── Autorización: token del usuario validado EN SERVIDOR ────
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "no autenticado" }, { status: 401 });

  const { data: userData, error: userErr } = await db.auth.getUser(token);
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "sesión inválida" }, { status: 401 });
  }
  const userId = userData.user.id;

  /*
    ⚠️ AQUÍ HABÍA UN PORTAZO: `if (!tiene_acceso_de) → 403 sin membresía activa`.

    Desde la 0012 el Ojo Experto ya no exige haber comprado: exige TENER CUENTA
    y que te quede cupo. Quien se registró gratis entra con 3 consultas al mes;
    quien tiene el programa, con 40. La puerta no es un sí/no, es un número.

    El cupo lo dice la base (`cupo_de`), no una constante en el código: antes los
    límites vivían en `lib/config.ts` y los repetían la API y la pantalla, que es
    la forma clásica de que dentro de un mes prometan cosas distintas.

    Sigue sin haber forma de entrar sin sesión: el token se valida arriba.
  */
  const { data: cupoFilas } = await db.rpc("cupo_de", { uid: userId });
  const cupo = Array.isArray(cupoFilas) ? cupoFilas[0] : null;

  if (!cupo) {
    // La base no supo decir de qué público es. Fallar cerrado: sin cupo no se
    // gasta IA. Es una situación imposible salvo que falten filas en `cupos`.
    return NextResponse.json(
      { error: "No pudimos verificar tu cupo. Vuelve a intentar." },
      { status: 503 },
    );
  }

  const LIMITE_PREGUNTAS = cupo.preguntas_mes as number;
  const LIMITE_FOTOS = cupo.fotos_mes as number;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "consulta inválida" }, { status: 400 });
  }
  const { pregunta, imagenBase64 } = parsed.data;
  const esFoto = Boolean(imagenBase64);

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
  const { data: publicoRaw } = await db.rpc("publico_de", { uid: userId });
  const publico = publicoRaw === "miembro" ? "miembro" : "regalo";

  const tope =
    publico === "miembro"
      ? (env.AI_DAILY_BUDGET_MIEMBRO_USD ?? env.AI_DAILY_BUDGET_USD)
      : (env.AI_DAILY_BUDGET_REGALO_USD ?? env.AI_DAILY_BUDGET_USD);

  const { data: gastoHoy } = await db.rpc("gasto_ia_de_hoy", { p_publico: publico });

  if (Number(gastoHoy ?? 0) >= tope) {
    return NextResponse.json(
      { error: "El Ojo Experto está descansando. Vuelve a intentar en un rato." },
      { status: 503 },
    );
  }

  // ── Uso justo mensual, contado en servidor ──────────────────
  const periodo = periodoActual();
  const { data: uso } = await db
    .from("ai_usage")
    .select("preguntas, fotos")
    .eq("user_id", userId)
    .eq("periodo", periodo)
    .maybeSingle();

  const preguntas = uso?.preguntas ?? 0;
  const fotos = uso?.fotos ?? 0;

  if (esFoto && fotos >= LIMITE_FOTOS) {
    return NextResponse.json(
      { error: `Llegaste a tus ${LIMITE_FOTOS} fotos de este mes. Se renuevan el día 1.` },
      { status: 429 },
    );
  }
  if (!esFoto && preguntas >= LIMITE_PREGUNTAS) {
    return NextResponse.json(
      { error: `Llegaste a tus ${LIMITE_PREGUNTAS} preguntas de este mes. Se renuevan el día 1.` },
      { status: 429 },
    );
  }

  // ── MEMORIA: su ficha + sus últimas consultas ───────────────
  const contexto = await construirContexto(db, userId);

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
      preguntas,
      fotos,
      periodo,
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

    const { esDelTema, respuesta } = interpretar(result.text ?? "");

    if (!esDelTema || !respuesta.trim()) {
      // No gastamos cupo de la alumna por una pregunta que no contestamos.
      return NextResponse.json({ respuesta: FUERA_DE_TEMA, fueraDeTema: true });
    }

    /*
      El gasto se apunta con lo que Gemini dice que consumió, no con una
      estimación.

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

    return await guardarYResponder(db, {
      userId,
      pregunta,
      respuesta,
      esFoto,
      preguntas,
      fotos,
      periodo,
    });
  } catch {
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
    userId: string;
    pregunta: string;
    respuesta: string;
    esFoto: boolean;
    preguntas: number;
    fotos: number;
    periodo: string;
  },
): Promise<NextResponse> {
  const { userId, pregunta, respuesta, esFoto, preguntas, fotos, periodo } = datos;

  /*
    ── SEGUNDA BARRERA: se revisa la respuesta antes de que la vea nadie ──

    El prompt del sistema ya pide "NUNCA prometas ingresos". Pero un prompt es
    una instrucción, no una barrera: se dobla con una pregunta insistente, y un
    modelo que obedece el 99% de las veces incumple el 1% restante — que con
    volumen es todos los días. Prometer ganancias es publicidad engañosa y
    motivo de que Hotmart tumbe el producto.

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
    console.warn(
      JSON.stringify({
        nivel: "aviso",
        donde: "ojo-experto",
        que: "respuesta con promesa de ingresos, corregida",
        coincidencias: veredicto.coincidencias,
      }),
    );
  }

  // Se guarda la CORREGIDA, no la que traía la promesa: el historial lo vuelve a
  // leer el modelo como contexto, y dejarla ahí sería enseñarle a repetirla.
  const { data: guardada } = await db
    .from("ai_conversations")
    .insert({
      user_id: userId,
      tipo: esFoto ? "foto" : "texto",
      pregunta,
      respuesta: textoFinal,
    })
    .select("id, created_at")
    .single();

  const nuevoUso = {
    preguntas: esFoto ? preguntas : preguntas + 1,
    fotos: esFoto ? fotos + 1 : fotos,
  };
  await db
    .from("ai_usage")
    .upsert({ user_id: userId, periodo, ...nuevoUso }, { onConflict: "user_id,periodo" });

  // Se devuelve el uso ya actualizado para que el medidor de la pantalla muestre
  // el número REAL de la base y no una cuenta paralela del navegador.
  return NextResponse.json({
    respuesta: textoFinal,
    uso: nuevoUso,
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
    db.from("user_progress").select("leccion_id").eq("user_id", userId),
    db
      .from("ai_conversations")
      .select("pregunta, respuesta")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const lineas: string[] = ["CONTEXTO DE ESTA ALUMNA (úsalo, no lo repitas literal):"];

  if (perfil?.nombre) lineas.push(`- Se llama ${limpiar(perfil.nombre, 60)}.`);
  if (progreso?.length) lineas.push(`- Lleva ${progreso.length} módulos completados.`);
  if (perfil?.notas_tejido) {
    lineas.push(`- Notas de su tejido: ${limpiar(perfil.notas_tejido, 300)}`);
  }

  if (recientes?.length) {
    lineas.push("- Últimas consultas suyas:");
    for (const c of recientes.reverse()) {
      lineas.push(`  · Preguntó: "${c.pregunta}" → le dijiste: "${c.respuesta}"`);
    }
  }

  if (lineas.length === 1) return "";
  return lineas.join("\n");
}
