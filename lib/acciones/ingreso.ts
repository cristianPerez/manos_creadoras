"use server";

import { headers } from "next/headers";
import { activarPagosHuerfanos } from "@/lib/pagos-huerfanos";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Se llama justo ANTES de pedir el código de ingreso (`requestMagicLink`).
 *
 * · Si el correo ya tiene cuenta → no hace nada. A una cuenta que existía
 *   cuando llegó el pago ya la encontró el webhook.
 * · Si es NUEVO → mira si ese correo tiene pagos huérfanos (pagó antes de
 *   crear su cuenta). Si los hay, crea la cuenta, activa la membresía y le
 *   manda la bienvenida (`lib/pagos-huerfanos.ts`). Luego el navegador pide el
 *   código como siempre y entra ya con su plan.
 *
 * ⚠️ NO DEVUELVE NADA, A PROPÓSITO. Ni si la cuenta existía ni si había pago:
 * decirlo permitiría averiguar qué correos son alumnas (anti-enumeración, 26).
 * Y nunca falla hacia fuera: si algo se rompe aquí, el código se pide igual.
 */
export async function prepararIngreso(email: string): Promise<void> {
  try {
    const limpio = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return;

    const db = supabaseAdmin();
    const { data: perfil } = await db.from("profiles").select("id").eq("email", limpio).maybeSingle();
    if (perfil) return;

    /* El origen de esta petición (QA o producción) es a donde apunta el
       enlace del correo de bienvenida, igual que en el webhook. */
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const origen = host ? `${h.get("x-forwarded-proto") ?? "https"}://${host}` : "https://manoscreadoras.co";

    await activarPagosHuerfanos(limpio, origen);
  } catch {
    /* Ver arriba: pedir el código no puede depender de esto. */
  }
}
