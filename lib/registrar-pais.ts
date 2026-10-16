"use server";

import { cookies } from "next/headers";
import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { detectarPais } from "@/lib/pais";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

/** Cuánto vive la cookie de sesión: 30 días. */
const DIAS = 30;
const COOKIE = "mc_sesion";

/**
 * Deja constancia de desde qué país nos visitan, UNA VEZ POR SESIÓN.
 *
 * ⚠️ NO SE GUARDA LA IP. Para saber el país basta el país; almacenar
 * direcciones de gente que a lo mejor ni tiene cuenta sería recoger un dato
 * personal sin motivo, y habría que declararlo en la política de privacidad.
 * Lo que se guarda es un HASH de la IP con una sal del servidor — sirve para
 * contar sin identificar, igual que en `ojo_visitantes`.
 *
 * Se llama desde un componente de cliente para no retrasar el pintado: saber de
 * qué país nos visitan es interesante, pero no tanto como que la página cargue.
 */
export async function registrarPais() {
  const galletas = await cookies();
  const h = await headers();

  let sesionId = galletas.get(COOKIE)?.value;
  const esNueva = !sesionId;
  if (!sesionId) {
    sesionId = randomUUID();
    galletas.set(COOKIE, sesionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: DIAS * 24 * 3600,
      path: "/",
    });
  }

  const { pais, fuente, userAgent } = await detectarPais();

  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "desconocida";
  const huella = createHash("sha256")
    .update(`${process.env.SUPABASE_SECRET_KEY ?? "sin-sal"}:${ip}`)
    .digest("hex");

  // Si tiene cuenta, se enlaza; si no, la fila vive sola con su huella.
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const db = supabaseAdmin();
  await db.from("sesiones_pais").upsert(
    {
      sesion_id: sesionId,
      user_id: user?.id ?? null,
      huella,
      pais,
      fuente,
      user_agent: userAgent?.slice(0, 400) ?? null,
      visto_en: new Date().toISOString(),
    },
    { onConflict: "sesion_id" },
  );

  return { pais, fuente, esNueva };
}
