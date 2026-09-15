import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import type { ProveedorVideo, Video } from "@/lib/video";

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
  /** Dónde está alojado el video. `null` mientras la dueña no lo haya subido. */
  video: Video | null;
  /** Destino de las lecciones que no son video: el PDF de patrones, el grupo, etc. */
  recursoUrl: string | null;
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
  /** `null` = nunca compró. La pantalla "Mi cuenta" lo traduce. */
  status: string | null;
  accessUntil: string | null;
  primerPagoEn: string | null;
  /** Misma regla que la función `tiene_acceso_de` de la base. */
  tieneAcceso: boolean;
  /** Días desde su primer pago — para el "Día N en el programa". */
  diasEnPrograma: number | null;
};

export type Curso = {
  /**
   * `null` cuando quien mira NO ha iniciado sesión.
   *
   * Es a propósito que sea nulable en vez de una alumna "vacía": un objeto de
   * mentira con email `""` y `tieneAcceso: false` se cuela por cualquier
   * comprobación distraída, y el día que alguien escriba `alumna.email` en un
   * correo le mandaría un mensaje a la nada. Así el compilador obliga a decidir
   * qué se enseña en cada pantalla cuando no hay nadie detrás.
   */
  alumna: Alumna | null;
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
  video_proveedor: ProveedorVideo | null;
  video_id: string | null;
  recurso_url: string | null;
  orden: number;
};

type FilaPerfil = {
  id: string;
  email: string;
  nombre: string | null;
  /** `null` = nunca compró (cuenta gratuita). Ver migración 0012. */
  status: string | null;
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

  /*
    SIN SESIÓN NO SE DEVUELVE `null`: se devuelve el curso que ve un visitante.

    Hasta hoy aquí se cortaba, y la pantalla respondía mandando al login. Eso
    convertía la app en un edificio sin puerta: quien no había comprado no podía
    ver NADA, ni siquiera lo que se le está regalando para que compre.

    No hace falta ninguna consulta especial ni ninguna lista de "qué mostrar":
    se preguntan las mismas tablas de siempre y es la BASE la que entrega solo
    las lecciones libres (política de la 0009). La pantalla no decide qué tapar
    — no puede equivocarse enseñando de más.
  */
  if (!user) return await cargarVisita(supabase);

  const [perfilRes, seccionesRes, leccionesRes, progresoRes, accesoRes] = await Promise.all([
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
      .select(
        "id, seccion_id, numero, titulo, tipo, duracion_seg, video_proveedor, video_id, recurso_url, orden",
      )
      .order("orden")
      .returns<FilaLeccion[]>(),
    supabase.from("user_progress").select("leccion_id").returns<{ leccion_id: string }[]>(),
    /*
      ⚠️ ¿TIENE ACCESO? SE LO PREGUNTAMOS A LA BASE, no lo deducimos aquí.

      Hasta la migración 0008 esta función reconstruía la regla en TypeScript
      —`status === 'active' || past_due || (cancelled && access_until > hoy)`—
      que era una COPIA de la que vive en `tiene_acceso_de`. Dos copias de una
      regla de acceso son dos reglas: el día que una cambie, la pantalla y el
      candado dirán cosas distintas, y el que manda es el candado. Entonces la
      alumna ve el curso y la base le devuelve cero filas, o al revés.

      `tiene_acceso()` sin parámetro solo responde sobre quien llama, así que
      preguntarlo desde la sesión de la alumna no revela nada de nadie.
    */
    supabase.rpc("tiene_acceso"),
  ]);

  /*
    Si la llamada falla (red, base caída), se asume SIN acceso. Es lo contrario
    de lo cómodo: un fallo deja fuera a quien pagó. Pero el otro default abre el
    curso entero cuando la base tose, y de los dos errores ese es el que no se
    puede deshacer. Fallar del lado cerrado — sin defaults fail-open.
  */
  const tieneAcceso = accesoRes.error ? false : accesoRes.data === true;

  const perfil = perfilRes.data;

  /**
   * Sesión válida pero SIN fila en `profiles`. Pasa cuando la cuenta se crea a mano en
   * el panel de Supabase (que solo crea el usuario de auth) o cuando el webhook de
   * Hotmart falla a mitad de camino.
   *
   * ⚠️ POR QUÉ NO DEVOLVEMOS `null` AQUÍ: la pantalla respondía a `null` con
   * `redirect("/login")`, pero el middleware ve que SÍ hay sesión iniciada y rebota al
   * instante a `/cursos` → las dos se reenvían entre sí y el navegador muere con
   * ERR_TOO_MANY_REDIRECTS, sin ningún mensaje. Devolviendo una alumna "sin perfil"
   * (sin acceso) la pantalla se dibuja y le explica qué pasó, con salida a soporte.
   */
  if (!perfil) {
    return {
      alumna: {
        id: user.id,
        nombre: null,
        email: user.email ?? "",
        plan: null,
        status: "sin_perfil",
        accessUntil: null,
        primerPagoEn: null,
        tieneAcceso: false,
        diasEnPrograma: null,
      },
      secciones: [],
      planas: [],
      totalLecciones: 0,
      completadas: 0,
      pct: 0,
      siguiente: null,
    };
  }

  const hechas = new Set((progresoRes.data ?? []).map((p) => p.leccion_id));
  const secciones = armarSecciones(seccionesRes.data ?? [], leccionesRes.data ?? [], hechas);

  const planas = secciones.flatMap((s) => s.lecciones);
  const cuentan = planas.filter((l) => l.cuentaProgreso);
  const completadas = cuentan.filter((l) => l.completada).length;

  return {
    alumna: perfilAAlumna(perfil, tieneAcceso),
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

/**
 * Arma el curso a partir de las filas crudas. Lo usan los DOS caminos —el de la
 * alumna y el del visitante— porque la forma del curso no cambia según quién
 * mire: lo que cambia es cuántas filas entrega la base.
 *
 * `hechas` llega vacío para el visitante: sin cuenta no hay progreso que marcar.
 */
function armarSecciones(
  filasSecciones: FilaSeccion[],
  filasLecciones: FilaLeccion[],
  hechas: Set<string>,
): Seccion[] {
  return filasSecciones.map((s) => {
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
        // La base garantiza que proveedor e ID vienen juntos o no vienen (constraint
        // `lecciones_video_completo`), así que no hay estados a medias que manejar.
        video:
          l.video_proveedor && l.video_id
            ? { proveedor: l.video_proveedor, id: l.video_id }
            : null,
        recursoUrl: l.recurso_url,
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
}

/**
 * El curso que ve alguien que todavía no tiene cuenta.
 *
 * Son las MISMAS dos consultas que hace una alumna. No hay ningún filtro de
 * `es_libre` escrito aquí y eso es deliberado: si la pantalla decidiera qué
 * tapar, un descuido suyo regalaría el curso entero. Quien filtra es la política
 * de la base, y desde aquí no hay forma de pedirle más de lo que da.
 *
 * `alumna: null` es la señal de que no hay nadie detrás. Sin progreso, sin
 * porcentaje y sin "siguiente lección": esas tres cosas necesitan una cuenta
 * donde guardarse, y fingirlas para un visitante sería prometerle que su avance
 * se está registrando cuando se pierde al cerrar la pestaña.
 */
async function cargarVisita(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
): Promise<Curso> {
  const [seccionesRes, leccionesRes] = await Promise.all([
    supabase
      .from("secciones")
      .select("id, numero, titulo, orden, cuenta_progreso")
      .order("orden")
      .returns<FilaSeccion[]>(),
    supabase
      .from("lecciones")
      .select(
        "id, seccion_id, numero, titulo, tipo, duracion_seg, video_proveedor, video_id, recurso_url, orden",
      )
      .order("orden")
      .returns<FilaLeccion[]>(),
  ]);

  const secciones = armarSecciones(
    seccionesRes.data ?? [],
    leccionesRes.data ?? [],
    new Set(),
  );
  const planas = secciones.flatMap((s) => s.lecciones);

  return {
    alumna: null,
    secciones,
    planas,
    totalLecciones: planas.length,
    completadas: 0,
    pct: 0,
    // Para el visitante el "empieza aquí" es la primera lección libre, sin más
    // lógica: no hay nada completado que saltarse.
    siguiente: planas[0] ?? null,
  };
}

function perfilAAlumna(p: FilaPerfil, tieneAcceso: boolean): Alumna {
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
