import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  OjoExperto,
  type BolsoBreve,
  type Conversacion,
  type Mensaje,
} from "@/components/app/OjoExperto";
import { alumnaActual, cupoActual, iniciales } from "@/lib/alumna";
import { agruparEnPasos, listarBolsos } from "@/lib/bolsos";
import { enlacesDeCobro } from "@/lib/checkout";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "El Ojo Experto — Manos Creadoras" };

/**
 * Una conversación del Ojo Experto, retomada.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ ESTA RUTA NO EXISTÍA Y EL PANEL YA ENLAZABA A ELLA
 * ════════════════════════════════════════════════════════════════════════════
 * El menú lateral lista las conversaciones pasadas y cada una apunta a
 * `/app/ojo/<id>`. Como solo había `app/(interna)/app/ojo/page.tsx`, **todas
 * daban 404**: el historial se veía y no se podía abrir. Detectado el
 * 2026-10-20 leyendo el código, no reportado — lo que significa que nadie
 * había llegado a pulsarlas, o que quien lo hizo pensó que la app estaba rota.
 *
 * ⚠️ Y NO BASTABA CON CREAR LA PÁGINA: hasta hoy cada pregunta abría una
 * conversación NUEVA, así que no había hilos que retomar, solo consultas
 * sueltas. El endpoint ahora acepta `conversacionId` y escribe en el hilo que
 * se le diga; esta página es la que se lo pasa.
 */
function cuando(fecha: string): Conversacion["cuando"] {
  const dias = (Date.now() - new Date(fecha).getTime()) / 86_400_000;
  if (dias < 1) return "hoy";
  return dias < 7 ? "semana" : "antes";
}

export default async function PaginaConversacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const alumna = await alumnaActual();

  /* Sin cuenta no hay historial que abrir: se manda a la pantalla que pide
     entrar, en vez de enseñar un 404 que parece que la app se rompió. */
  if (!alumna) redirect("/app/ojo");

  const supabase = await supabaseServer();

  /*
    ⚠️ EL RLS YA FILTRA POR ALUMNA, pero el `notFound()` importa igual: sin él,
    pedir el id de otra devolvería una conversación vacía —sin mensajes— que se
    lee como "aquí no escribiste nada" en vez de "esto no es tuyo".
  */
  const [{ data: conversacion }, { data: filas }, cupo, bolsos, { data: lista }] =
    await Promise.all([
      supabase.from("ojo_conversaciones").select("id, titulo, bolso_id").eq("id", id).maybeSingle(),
      supabase
        .from("ojo_mensajes")
        .select("id, rol, texto, feedback")
        .eq("conversacion_id", id)
        .order("created_at", { ascending: true }),
      cupoActual(alumna.id),
      listarBolsos(),
      supabase
        .from("ojo_conversaciones")
        .select("id, titulo, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

  if (!conversacion) notFound();

  const mensajes: Mensaje[] = (filas ?? []).map((m) => ({
    id: m.id,
    rol: m.rol === "alumna" ? "alumna" : "ojo",
    texto: m.texto,
    feedback: (m.feedback as -1 | 1 | null) ?? null,
  }));

  const historial: Conversacion[] = (lista ?? []).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    cuando: cuando(c.created_at),
  }));

  const breves: BolsoBreve[] = bolsos.map((b) => ({
    slug: b.slug,
    nombre: b.nombre,
    pasos: agruparEnPasos(b.lecciones).map((p) => p.titulo),
  }));

  /* El bolso del que iba el hilo vuelve solo: retomar una conversación sobre
     Gota de Rocío y que el Ojo lo haya olvidado es empezar de cero. */
  const bolsoDelHilo = bolsos.find((b) => b.id === conversacion.bolso_id)?.slug ?? null;

  return (
    <OjoExperto
      iniciales={iniciales(alumna)}
      historial={historial}
      cupo={cupo}
      bolsos={breves}
      bolsoInicial={bolsoDelHilo}
      pasoInicial={null}
      mensajesIniciales={mensajes}
      conversacionInicial={conversacion.id}
      enlaces={(await enlacesDeCobro()).url}
    />
  );
}
