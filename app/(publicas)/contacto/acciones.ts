"use server";

import { z } from "zod";
import { AVISOS_INTERNOS, enviarCorreo } from "@/lib/correo";
import { supabaseAdmin } from "@/lib/supabase/admin";

/*
 * A dónde llegan los mensajes de contacto: a Cristian y a Elizabeth
 * (`AVISOS_INTERNOS`, pedido de Cristian del 2026-11-03).
 *
 * ⚠️ ANTES IBAN A `hola@manoscreadoras.co`, un buzón que nadie confirmó que
 * existiera (y hasta el 2026-10-16 ni siquiera era nuestro dominio: decía
 * `.com`). Un "quiero pagar" que cae en un buzón que no se lee es una venta
 * perdida. Los mensajes siguen guardándose primero en `contactos`.
 */

/** Para que un "<" en el mensaje de alguien no rompa el HTML del correo. */
function escapar(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
  const cuerpo = [
    `Nombre: ${v.data.nombre}`,
    `Correo: ${v.data.correo}`,
    `Motivo: ${v.data.motivo}`,
    v.data.planInteres ? `Plan que le interesa: ${v.data.planInteres}` : null,
    "",
    v.data.mensaje ?? "(sin mensaje)",
  ]
    .filter(Boolean)
    .join("\n");

  /*
   * `enviarCorreo` nunca lanza y ya deja su propio aviso si falla, así que el
   * resultado se ignora a conciencia: ver el comentario de arriba.
   */
  await enviarCorreo({
    para: AVISOS_INTERNOS,
    responderA: v.data.correo,
    asunto: `Contacto: ${v.data.motivo} — ${v.data.nombre}`,
    texto: cuerpo,
    html: `<pre style="font:14px/1.6 ui-monospace,monospace;white-space:pre-wrap;">${escapar(cuerpo)}</pre>`,
  });

  return { ok: true };
}
