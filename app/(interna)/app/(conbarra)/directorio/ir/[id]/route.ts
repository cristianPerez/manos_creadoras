import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * El salto a Temu: `/app/directorio/ir/<producto>`.
 *
 * ⚠️ ES EL ÚNICO SITIO DE DONDE SALE UNA URL DE COMPRA (0041). La pantalla
 * nunca la recibe: si la tuviera en el HTML y solo escondiera el botón, el muro
 * de la membresía sería decorativo. Aquí `abrir_enlace_directorio()`
 * comprueba el derecho (el producto `gratis` lo abre cualquiera; el resto,
 * solo con membresía, 0042) y solo entonces se redirige.
 *
 * Sin derecho no hay error: se vuelve al directorio con `?bloqueado=` y la
 * pantalla abre el aviso que explica qué hacer. Pasa cuando se
 * llega desde la ficha de un bolso, o si alguien escribe la ruta a mano; desde
 * el directorio el aviso sale antes de navegar.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const volver = (motivo: string) =>
    NextResponse.redirect(
      new URL(`/app/directorio?${motivo}=${encodeURIComponent(id)}`, req.nextUrl.origin),
    );

  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("abrir_enlace_directorio", { p_item: id }).maybeSingle();
  const r = data as { estado: string; url: string | null } | null;

  if (error || !r) return volver("bloqueado");
  if (r.estado === "ok" && r.url) return NextResponse.redirect(r.url);
  if (r.estado === "sin-enlace") return volver("sin-enlace");
  return volver("bloqueado");
}
