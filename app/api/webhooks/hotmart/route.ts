import { NextResponse } from "next/server";
import { hashPayload, isFresh, verifyHotmart } from "@/lib/hotmart-verify";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Resultado = "applied" | "duplicate" | "illegal" | "unauthorized" | "error";

type Estado =
  | "active"
  | "past_due"
  | "cancelled"
  | "expired"
  | "refunded"
  | "chargeback";

/**
 * Máquina de estados (defensa 4). Los estados terminales NO se reactivan:
 * un PURCHASE_APPROVED tardío no debe devolverle el acceso a quien ya reembolsó.
 */
const TERMINALES = new Set<Estado>(["refunded", "chargeback"]);

/**
 * ⚠️ Los nombres EXACTOS de los eventos se verifican en el panel de Hotmart
 * (Herramientas → Webhook) antes de confiar en esta tabla: el catálogo varía
 * por cuenta y por versión. Estos son los estándar para suscripciones.
 */
const EVENTO_A_ESTADO: Record<string, Estado> = {
  // Cobro exitoso (primero o renovación) → al día
  PURCHASE_APPROVED: "active",
  PURCHASE_COMPLETE: "active",
  // Falló el cobro → gracia: NO se corta el acceso todavía (dunning)
  PURCHASE_DELAYED: "past_due",
  PURCHASE_BILLET_PRINTED: "past_due",
  // Canceló → conserva acceso hasta el fin del período pagado
  SUBSCRIPTION_CANCELLATION: "cancelled",
  // Se agotaron los reintentos / venció → cortado
  PURCHASE_EXPIRED: "expired",
  // Terminales
  PURCHASE_REFUNDED: "refunded",
  PURCHASE_PROTEST: "chargeback",
  PURCHASE_CHARGEBACK: "chargeback",
};

async function registrar(
  db: ReturnType<typeof supabaseAdmin>,
  eventId: string | null,
  type: string | null,
  result: Resultado,
) {
  await db.from("webhook_log").insert({ event_id: eventId, type, result });
}

/** Distingue plan mensual vs anual mirando la recurrencia o el precio del payload. */
function detectarPlan(
  purchase: Record<string, unknown>,
  subscription: Record<string, unknown>,
): "mensual" | "anual" | null {
  const plan = (subscription.plan ?? {}) as Record<string, unknown>;
  const frecuencia = String(
    plan.recurrency_period ?? subscription.recurrency_period ?? "",
  ).toLowerCase();
  if (frecuencia.includes("year") || frecuencia.includes("anual") || frecuencia === "12") {
    return "anual";
  }
  if (frecuencia.includes("month") || frecuencia.includes("mensual") || frecuencia === "1") {
    return "mensual";
  }

  // Sin recurrencia declarada: inferir por el monto cobrado.
  const price = (purchase.price ?? {}) as Record<string, unknown>;
  const valor = typeof price.value === "number" ? price.value : null;
  if (valor === null) return null;
  return valor >= 100 ? "anual" : "mensual";
}

const GRACIA_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Fecha hasta la que sigue teniendo acceso tras cancelar. Si Hotmart no informa
 * el fin del período, damos 30 días — es preferible regalar días a cortarle el
 * acceso a alguien que acaba de pagar (eso genera un reembolso y una mala reseña).
 */
function fechaFinPeriodo(
  subscription: Record<string, unknown>,
  purchase: Record<string, unknown>,
): string {
  const candidatos = [
    subscription.date_next_charge,
    subscription.end_accession_date,
    (purchase.recurrence ?? {}) &&
      (purchase.recurrence as Record<string, unknown>)?.date_next_charge,
  ];
  for (const c of candidatos) {
    if (typeof c === "number" && Number.isFinite(c)) return new Date(c).toISOString();
    if (typeof c === "string") {
      const d = new Date(c);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
  }
  return new Date(Date.now() + GRACIA_MS).toISOString();
}

export async function POST(req: Request) {
  // Cuerpo CRUDO primero: re-serializar cambia bytes y rompe cualquier verificación de firma.
  const raw = await req.text();
  const db = supabaseAdmin();

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    await registrar(db, null, null, "error");
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const data = (payload.data ?? {}) as Record<string, unknown>;
  const eventType = String(payload.event ?? "");
  const eventId = String(payload.id ?? payload.event_id ?? "") || null;

  // ── Defensa 1: AUTENTICIDAD ─────────────────────────────────
  const hottok =
    req.headers.get("x-hotmart-hottok") ??
    (typeof payload.hottok === "string" ? payload.hottok : null);

  if (!verifyHotmart(hottok)) {
    await registrar(db, eventId, eventType, "unauthorized");
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  // ── Defensa 2: FRESCURA ─────────────────────────────────────
  const ts = typeof payload.creation_date === "number" ? payload.creation_date : undefined;
  if (!isFresh(ts)) {
    await registrar(db, eventId, eventType, "illegal");
    return NextResponse.json({ error: "evento vencido" }, { status: 409 });
  }

  if (!eventId) {
    await registrar(db, null, eventType, "error");
    return NextResponse.json({ error: "evento sin id" }, { status: 400 });
  }

  // ── Defensa 3: IDEMPOTENCIA (Hotmart REENVÍA) ───────────────
  const { error: dupErr } = await db.from("processed_events").insert({
    event_id: eventId,
    event_type: eventType,
    payload_hash: hashPayload(raw),
  });
  if (dupErr) {
    // PK duplicada = ya lo procesamos. Devolver 200 para que Hotmart deje de reintentar.
    await registrar(db, eventId, eventType, "duplicate");
    return NextResponse.json({ ok: true, deduped: true });
  }

  // ── Defensa 4: AUTORIZACIÓN / máquina de estados ────────────
  const nuevoEstado = EVENTO_A_ESTADO[eventType];
  if (!nuevoEstado) {
    // Evento legítimo pero que no cambia el acceso (ej. PURCHASE_BILLET_PRINTED)
    await registrar(db, eventId, eventType, "applied");
    return NextResponse.json({ ok: true, ignored: eventType });
  }

  const buyer = (data.buyer ?? {}) as Record<string, unknown>;
  const email = typeof buyer.email === "string" ? buyer.email.toLowerCase().trim() : "";
  const nombre = typeof buyer.name === "string" ? buyer.name : null;
  const purchase = (data.purchase ?? {}) as Record<string, unknown>;
  const txId = typeof purchase.transaction === "string" ? purchase.transaction : null;

  // Datos de suscripción (el código de suscripción persiste entre renovaciones)
  const subscription = (data.subscription ?? {}) as Record<string, unknown>;
  const subCode =
    typeof subscription.subscriber_code === "string"
      ? subscription.subscriber_code
      : typeof subscription.code === "string"
        ? subscription.code
        : null;

  const plan = detectarPlan(purchase, subscription);

  /**
   * Hasta cuándo puede entrar. Al CANCELAR, Hotmart informa la fecha de fin del
   * período ya pagado; si no viene, damos 30 días de gracia en vez de cortar en
   * seco a alguien que acaba de pagar el mes. Se corrige en el siguiente evento.
   */
  const finDePeriodo = fechaFinPeriodo(subscription, purchase);

  if (!email) {
    await registrar(db, eventId, eventType, "error");
    return NextResponse.json({ error: "compra sin email" }, { status: 400 });
  }

  try {
    const { data: existente } = await db
      .from("profiles")
      .select("id, status, first_paid_at")
      .eq("email", email)
      .maybeSingle();

    if (existente) {
      // No resucitar un estado terminal con un evento de compra tardío.
      if (TERMINALES.has(existente.status as Estado) && nuevoEstado === "active") {
        await registrar(db, eventId, eventType, "illegal");
        return NextResponse.json({ ok: true, ignored: "estado terminal" });
      }

      const cambios: Record<string, unknown> = {
        status: nuevoEstado,
        ...(txId ? { hotmart_tx: txId } : {}),
        ...(subCode ? { hotmart_sub: subCode } : {}),
        ...(plan ? { plan } : {}),
      };

      if (nuevoEstado === "active") {
        // Renovación al día: se recupera el acceso pleno.
        cambios.access_until = null;
        if (!existente.first_paid_at) cambios.first_paid_at = new Date().toISOString();
      } else if (nuevoEstado === "cancelled") {
        // Canceló: NO se corta ya — conserva hasta el fin del período que pagó.
        cambios.access_until = finDePeriodo;
      } else if (nuevoEstado === "expired" || TERMINALES.has(nuevoEstado)) {
        // Cortado ya.
        cambios.access_until = new Date().toISOString();
      }

      await db.from("profiles").update(cambios).eq("id", existente.id);
    } else {
      if (nuevoEstado !== "active") {
        // Una cancelación/reembolso de alguien que no existe: nada que cortar.
        await registrar(db, eventId, eventType, "applied");
        return NextResponse.json({ ok: true, ignored: "sin perfil" });
      }
      // Crear la cuenta passwordless: entra por magic link, sin contraseña.
      const { data: creado, error: authErr } = await db.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (authErr || !creado.user) throw authErr ?? new Error("no se pudo crear el usuario");

      await db.from("profiles").insert({
        id: creado.user.id,
        email,
        nombre,
        status: "active",
        plan,
        hotmart_tx: txId,
        hotmart_sub: subCode,
        first_paid_at: new Date().toISOString(),
      });
    }

    await registrar(db, eventId, eventType, "applied");
    return NextResponse.json({ ok: true });
  } catch {
    // CRÍTICO: soltar la marca de idempotencia. Si la dejamos, el reintento de Hotmart se
    // descarta como duplicado y una alumna que YA PAGÓ nunca recibiría su acceso.
    await db.from("processed_events").delete().eq("event_id", eventId);
    await registrar(db, eventId, eventType, "error");
    // 500 para que Hotmart reintente.
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
