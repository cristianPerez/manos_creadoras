import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Guarda (o borra) el permiso de avisos de una alumna.
 *
 * El token se valida EN SERVIDOR igual que en el Ojo Experto: el navegador puede
 * mentir sobre quién es. Y se exige membresía activa — no tiene sentido avisarle
 * de modelos nuevos a alguien que ya no tiene acceso.
 */
const suscripcionSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

async function alumnaDe(req: Request) {
  const db = supabaseAdmin();
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return { error: "no autenticado" as const, status: 401 };

  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return { error: "sesión inválida" as const, status: 401 };

  const { data: puedeEntrar } = await db.rpc("tiene_acceso_de", { uid: data.user.id });
  if (!puedeEntrar) return { error: "sin membresía activa" as const, status: 403 };

  return { db, userId: data.user.id };
}

export async function POST(req: Request) {
  const sesion = await alumnaDe(req);
  if ("error" in sesion) {
    return NextResponse.json({ error: sesion.error }, { status: sesion.status });
  }

  const parsed = suscripcionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "suscripción inválida" }, { status: 400 });
  }
  const { endpoint, keys } = parsed.data;

  // `upsert` sobre el endpoint: si vuelve a permitir desde el mismo dispositivo no
  // se duplica la fila, y si cambió de cuenta el registro pasa a la nueva.
  const { error } = await sesion.db.from("push_subscriptions").upsert(
    {
      endpoint,
      user_id: sesion.userId,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return NextResponse.json({ error: "no pudimos guardar tu permiso" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** Cuando apaga los avisos desde la app. */
export async function DELETE(req: Request) {
  const sesion = await alumnaDe(req);
  if ("error" in sesion) {
    return NextResponse.json({ error: sesion.error }, { status: sesion.status });
  }

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");
  if (!endpoint) return NextResponse.json({ error: "falta el endpoint" }, { status: 400 });

  await sesion.db
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", sesion.userId);

  return NextResponse.json({ ok: true });
}
