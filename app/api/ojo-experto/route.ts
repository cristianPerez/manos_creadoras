import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { LIMITE_FOTOS, LIMITE_PREGUNTAS } from "@/lib/config";
import { costoEnUsd, leerConsumo } from "@/lib/costo-ia";
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

  // El acceso también se valida en servidor: el cliente puede mentir.
  // Usa la MISMA regla que la base de datos (activa, en gracia, o cancelada con período
  // vigente). `tiene_acceso_de` solo la puede llamar el servidor — desde el navegador está
  // revocada para que nadie pueda averiguar quién tiene membresía activa.
  const { data: puedeEntrar } = await db.rpc("tiene_acceso_de", { uid: userId });
  if (!puedeEntrar) {
    return NextResponse.json({ error: "sin membresía activa" }, { status: 403 });
  }

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

    // Contabilizar uso y gasto (sólo cuando SÍ respondimos)
    const nuevoUso = {
      preguntas: esFoto ? preguntas : preguntas + 1,
      fotos: esFoto ? fotos + 1 : fotos,
    };
    await db
      .from("ai_usage")
      .upsert({ user_id: userId, periodo, ...nuevoUso }, { onConflict: "user_id,periodo" });

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

    const { data: guardada } = await db
      .from("ai_conversations")
      .insert({
        user_id: userId,
        tipo: esFoto ? "foto" : "texto",
        pregunta,
        respuesta,
      })
      .select("id, created_at")
      .single();

    // Devolvemos el uso ya actualizado para que el medidor de la pantalla
    // muestre el número REAL de la base y no una cuenta paralela del navegador.
    return NextResponse.json({
      respuesta,
      uso: nuevoUso,
      consulta: { id: guardada?.id, createdAt: guardada?.created_at },
    });
  } catch {
    return NextResponse.json(
      { error: "No pudimos conectar con el Ojo Experto. Vuelve a intentar." },
      { status: 502 },
    );
  }
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

  if (perfil?.nombre) lineas.push(`- Se llama ${perfil.nombre}.`);
  if (progreso?.length) lineas.push(`- Lleva ${progreso.length} módulos completados.`);
  if (perfil?.notas_tejido) lineas.push(`- Notas de su tejido: ${perfil.notas_tejido}`);

  if (recientes?.length) {
    lineas.push("- Últimas consultas suyas:");
    for (const c of recientes.reverse()) {
      lineas.push(`  · Preguntó: "${c.pregunta}" → le dijiste: "${c.respuesta}"`);
    }
  }

  if (lineas.length === 1) return "";
  return lineas.join("\n");
}
