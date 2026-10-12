"use server";

import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

const esquema = z.object({
  nombre: z.string().min(2).max(80),
  correo: z.string().email().max(120),
  motivo: z.string().min(2).max(60),
  planInteres: z.string().max(30).optional(),
  mensaje: z.string().max(1200).optional(),
});

export type ResultadoContacto = { ok: true } | { ok: false; error: string };

/**
 * Recibe el formulario de contacto.
 *
 * ⚠️ PRIMERO SE GUARDA, DESPUÉS SE ENVÍA. Si Resend falla, está caído o el
 * correo acaba en spam, el mensaje de alguien que quería PAGAR no se puede
 * perder. La fila en `contactos` es la red de seguridad; el correo es la
 * comodidad.
 */
export async function enviarContacto(datos: unknown): Promise<ResultadoContacto> {
  const v = esquema.safeParse(datos);
  if (!v.success) return { ok: false, error: "Revisa los datos e inténtalo otra vez." };

  const db = supabaseAdmin();
  const { error } = await db.from("contactos").insert({
    nombre: v.data.nombre,
    correo: v.data.correo,
    motivo: v.data.motivo,
    plan_interes: v.data.planInteres ?? null,
    mensaje: v.data.mensaje ?? null,
  });

  if (error) return { ok: false, error: "No pudimos guardar tu mensaje. Inténtalo de nuevo." };

  /*
    El correo va en segundo lugar y su fallo NO se le cuenta a la alumna: su
    mensaje ya está guardado, así que decirle "algo salió mal" la haría escribir
    otra vez para nada.
  */
  const clave = process.env.RESEND_API_KEY;
  const desde = process.env.RESEND_FROM;
  if (clave && desde) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: desde,
          to: "hola@manoscreadoras.com",
          reply_to: v.data.correo,
          subject: `Contacto: ${v.data.motivo} — ${v.data.nombre}`,
          text: [
            `Nombre: ${v.data.nombre}`,
            `Correo: ${v.data.correo}`,
            `Motivo: ${v.data.motivo}`,
            v.data.planInteres ? `Plan que le interesa: ${v.data.planInteres}` : null,
            "",
            v.data.mensaje ?? "(sin mensaje)",
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });
    } catch {
      // Silencio a propósito: ver el comentario de arriba.
    }
  }

  return { ok: true };
}
