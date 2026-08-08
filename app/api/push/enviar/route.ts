import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import webpush from "web-push";
import { z } from "zod";
import { pushEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Manda un aviso a todas las alumnas suscritas.
 *
 * Es la única puerta de envío y no la protege una sesión sino un secreto: lo usa
 * la dueña desde `npm run push:enviar`, no el navegador. Compara en tiempo
 * constante para no filtrar el secreto midiendo cuánto tarda en responder.
 */
const cuerpoSchema = z.object({
  titulo: z.string().min(1).max(80),
  cuerpo: z.string().min(1).max(200),
  url: z.string().max(300).optional(),
});

function secretoValido(recibido: string | null, esperado: string): boolean {
  if (!recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

type FilaSuscripcion = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function POST(req: Request) {
  const env = pushEnv();

  if (!secretoValido(req.headers.get("x-push-secret"), env.PUSH_ADMIN_SECRET)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const parsed = cuerpoSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "aviso inválido" }, { status: 400 });
  }

  webpush.setVapidDetails(env.VAPID_SUBJECT, env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

  const db = supabaseAdmin();
  const { data: suscripciones } = await db
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .returns<FilaSuscripcion[]>();

  if (!suscripciones?.length) {
    return NextResponse.json({ ok: true, enviados: 0, fallidos: 0, limpiados: 0 });
  }

  const carga = JSON.stringify(parsed.data);
  const caducados: string[] = [];
  let enviados = 0;
  let fallidos = 0;

  // En serie a propósito: son pocos cientos y así no se dispara un pico de red.
  for (const s of suscripciones) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        carga,
      );
      enviados++;
    } catch (e) {
      // 404/410 = la alumna desinstaló la app o revocó el permiso: esa suscripción
      // ya no sirve y hay que borrarla, o la tabla se llena de basura para siempre.
      const codigo = (e as { statusCode?: number }).statusCode;
      if (codigo === 404 || codigo === 410) caducados.push(s.endpoint);
      else fallidos++;
    }
  }

  if (caducados.length) {
    await db.from("push_subscriptions").delete().in("endpoint", caducados);
  }

  return NextResponse.json({
    ok: true,
    enviados,
    fallidos,
    limpiados: caducados.length,
  });
}
