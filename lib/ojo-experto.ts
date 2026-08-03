import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Historial y uso del mes del Ojo Experto, leídos con la sesión de la alumna.
 * El RLS de `ai_conversations` y `ai_usage` solo devuelve sus propias filas.
 */

export type Consulta = {
  id: string;
  tipo: "foto" | "texto";
  pregunta: string;
  respuesta: string;
  /** Días transcurridos, calculados en el servidor para que no baile al hidratar. */
  haceDias: number;
};

export type UsoMensual = { preguntas: number; fotos: number };

export type EstadoOjoExperto = {
  historial: Consulta[];
  uso: UsoMensual;
  tieneAcceso: boolean;
  nombre: string | null;
};

function periodoActual() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export const cargarOjoExperto = cache(async (): Promise<EstadoOjoExperto | null> => {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [perfilRes, historialRes, usoRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("nombre, status, access_until")
      .eq("id", user.id)
      .maybeSingle<{ nombre: string | null; status: string; access_until: string | null }>(),
    supabase
      .from("ai_conversations")
      .select("id, tipo, pregunta, respuesta, created_at")
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<
        {
          id: string;
          tipo: "foto" | "texto";
          pregunta: string;
          respuesta: string | null;
          created_at: string;
        }[]
      >(),
    supabase
      .from("ai_usage")
      .select("preguntas, fotos")
      .eq("periodo", periodoActual())
      .maybeSingle<UsoMensual>(),
  ]);

  const perfil = perfilRes.data;
  if (!perfil) return null;

  const vigente = perfil.access_until ? new Date(perfil.access_until) > new Date() : false;
  const tieneAcceso =
    perfil.status === "active" ||
    perfil.status === "past_due" ||
    (perfil.status === "cancelled" && vigente);

  const ahora = Date.now();
  const historial: Consulta[] = (historialRes.data ?? [])
    .filter((c) => c.respuesta)
    .map((c) => ({
      id: c.id,
      tipo: c.tipo,
      pregunta: c.pregunta,
      respuesta: c.respuesta ?? "",
      haceDias: Math.floor((ahora - new Date(c.created_at).getTime()) / 86_400_000),
    }));

  return {
    historial,
    uso: usoRes.data ?? { preguntas: 0, fotos: 0 },
    tieneAcceso,
    nombre: perfil.nombre,
  };
});
