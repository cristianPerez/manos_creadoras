import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Lectura del curso REAL desde Supabase (reemplaza a lib/demo-data.ts).
 *
 * Todo pasa por el cliente con la sesión de la alumna, así que el RLS de la base
 * decide qué ve: las tablas `secciones`/`lecciones` solo se leen si `tiene_acceso()`,
 * y `user_progress` solo devuelve las filas propias. Si alguien perdiera la membresía,
 * la base devuelve cero filas aunque el código pidiera todo.
 */

export type TipoLeccion = "video" | "pdf" | "enlace" | "texto";

export type Leccion = {
  id: string;
  seccionId: string;
  numero: number;
  titulo: string;
  tipo: TipoLeccion;
  duracionSeg: number | null;
  hotmartId: string | null;
  completada: boolean;
  /** Si su sección cuenta para el % de avance (la de bienvenida no). */
  cuentaProgreso: boolean;
};

export type Seccion = {
  id: string;
  numero: number;
  titulo: string;
  cuentaProgreso: boolean;
  lecciones: Leccion[];
  completadas: number;
};

export type Alumna = {
  id: string;
  nombre: string | null;
  email: string;
  plan: "mensual" | "anual" | null;
  status: string;
  accessUntil: string | null;
  primerPagoEn: string | null;
  /** Misma regla que la función `tiene_acceso_de` de la base. */
  tieneAcceso: boolean;
  /** Días desde su primer pago — para el "Día N en el programa". */
  diasEnPrograma: number | null;
};

export type Curso = {
  alumna: Alumna;
  secciones: Seccion[];
  /** Lecciones que cuentan para el avance (excluye bienvenida y recursos). */
  totalLecciones: number;
  completadas: number;
  pct: number;
  /** Primera lección sin terminar — el "sigues aquí" de la portada. */
  siguiente: Leccion | null;
  /** Todas las lecciones en orden de curso, plano. */
  planas: Leccion[];
};

type FilaSeccion = {
  id: string;
  numero: number;
  titulo: string;
  orden: number;
  cuenta_progreso: boolean;
};

type FilaLeccion = {
  id: string;
  seccion_id: string;
  numero: number;
  titulo: string;
  tipo: TipoLeccion;
  duracion_seg: number | null;
  hotmart_id: string | null;
  orden: number;
};

type FilaPerfil = {
  id: string;
  email: string;
  nombre: string | null;
  status: string;
  plan: "mensual" | "anual" | null;
  access_until: string | null;
  first_paid_at: string | null;
};

/**
 * `cache` de React: si dos partes de la misma pantalla piden el curso, la base
 * se consulta UNA vez por request.
 */
export const cargarCurso = cache(async (): Promise<Curso | null> => {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [perfilRes, seccionesRes, leccionesRes, progresoRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, nombre, status, plan, access_until, first_paid_at")
      .eq("id", user.id)
      .maybeSingle<FilaPerfil>(),
    supabase
      .from("secciones")
      .select("id, numero, titulo, orden, cuenta_progreso")
      .order("orden")
      .returns<FilaSeccion[]>(),
    supabase
      .from("lecciones")
      .select("id, seccion_id, numero, titulo, tipo, duracion_seg, hotmart_id, orden")
      .order("orden")
      .returns<FilaLeccion[]>(),
    supabase.from("user_progress").select("leccion_id").returns<{ leccion_id: string }[]>(),
  ]);

  const perfil = perfilRes.data;
  if (!perfil) return null;

  const hechas = new Set((progresoRes.data ?? []).map((p) => p.leccion_id));
  const filasSecciones = seccionesRes.data ?? [];
  const filasLecciones = leccionesRes.data ?? [];

  const secciones: Seccion[] = filasSecciones.map((s) => {
    const lecciones: Leccion[] = filasLecciones
      .filter((l) => l.seccion_id === s.id)
      .sort((a, b) => a.orden - b.orden)
      .map((l) => ({
        id: l.id,
        seccionId: l.seccion_id,
        numero: l.numero,
        titulo: l.titulo,
        tipo: l.tipo,
        duracionSeg: l.duracion_seg,
        hotmartId: l.hotmart_id,
        completada: hechas.has(l.id),
        cuentaProgreso: s.cuenta_progreso,
      }));

    return {
      id: s.id,
      numero: s.numero,
      titulo: s.titulo,
      cuentaProgreso: s.cuenta_progreso,
      lecciones,
      completadas: lecciones.filter((l) => l.completada).length,
    };
  });

  const planas = secciones.flatMap((s) => s.lecciones);
  const cuentan = planas.filter((l) => l.cuentaProgreso);
  const completadas = cuentan.filter((l) => l.completada).length;

  return {
    alumna: perfilAAlumna(perfil),
    secciones,
    planas,
    totalLecciones: cuentan.length,
    completadas,
    pct: cuentan.length ? Math.round((completadas / cuentan.length) * 100) : 0,
    // El héroe apunta al próximo TUTORIAL, no a la bienvenida: la sección de recursos
    // ya está a la vista en la lista y el protagonista de la pantalla es tejer.
    siguiente: cuentan.find((l) => !l.completada) ?? null,
  };
});

function perfilAAlumna(p: FilaPerfil): Alumna {
  const vigente = p.access_until ? new Date(p.access_until) > new Date() : false;
  const tieneAcceso =
    p.status === "active" || p.status === "past_due" || (p.status === "cancelled" && vigente);

  let diasEnPrograma: number | null = null;
  if (p.first_paid_at) {
    const ms = Date.now() - new Date(p.first_paid_at).getTime();
    diasEnPrograma = Math.max(1, Math.floor(ms / 86_400_000) + 1);
  }

  return {
    id: p.id,
    nombre: p.nombre,
    email: p.email,
    plan: p.plan,
    status: p.status,
    accessUntil: p.access_until,
    primerPagoEn: p.first_paid_at,
    tieneAcceso,
    diasEnPrograma,
  };
}

/** "42 min" · "1 h 12 min" · null cuando la lección no es video. */
export function formatearDuracion(seg: number | null): string | null {
  if (!seg) return null;
  const min = Math.round(seg / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto ? `${h} h ${resto} min` : `${h} h`;
}

/** Cómo se llama cada tipo de contenido en la voz de la app. */
export const ETIQUETA_TIPO: Record<TipoLeccion, string> = {
  video: "Tutorial en video",
  pdf: "Patrones en PDF",
  enlace: "Enlace",
  texto: "Lectura",
};

/** Primer nombre, para saludar sin sonar a formulario. */
export function primerNombre(alumna: Alumna): string {
  const n = alumna.nombre?.trim();
  if (n) return n.split(/\s+/)[0];
  return alumna.email.split("@")[0];
}
