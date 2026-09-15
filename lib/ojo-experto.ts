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

/**
 * Cuánto puede usar al mes. Lo dice la tabla `cupos` (migración 0012), NO una
 * constante del código: los límites los repetían la API y la pantalla, que es
 * la forma clásica de que dentro de un mes prometan cosas distintas.
 */
export type Cupo = { preguntas: number; fotos: number };

/**
 * Si la consulta a `cupos` falla, se asume el cupo gratuito — el más pequeño.
 * Fallar hacia abajo: en el peor caso alguien que pagó ve menos de lo suyo un
 * momento, en vez de que alguien sin pagar gaste como si tuviera el programa.
 */
const CUPO_DE_RESPALDO: Cupo = { preguntas: 3, fotos: 1 };

export type EstadoOjoExperto = {
  historial: Consulta[];
  uso: UsoMensual;
  /** Tiene el programa completo (no solo cuenta). Decide qué cupo le toca. */
  tieneAcceso: boolean;
  nombre: string | null;
  /**
   * `true` cuando quien mira NO ha iniciado sesión.
   *
   * ⚠️ La pantalla se dibuja IGUAL que para una alumna — mismo chat, mismo
   * medidor, mismo todo. Lo único que cambia es qué pasa al tocar "preguntar".
   * Enseñar una pantalla distinta a quien no tiene cuenta le obliga a imaginarse
   * el producto; enseñarle el producto y pedirle la cuenta en el momento en que
   * lo va a usar le deja verlo primero.
   */
  sinCuenta: boolean;
  cupo: Cupo;
  /**
   * El cupo de quien SÍ tiene el programa. Lo necesita la pantalla para decirle
   * a una cuenta gratuita qué ganaría al comprar — y se lee de la misma tabla
   * en vez de escribir "40" a mano, que es la duplicación que esta migración
   * vino a quitar.
   */
  cupoMiembro: Cupo;
};

function periodoActual() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export const cargarOjoExperto = cache(async (): Promise<EstadoOjoExperto | null> => {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Sin sesión ya NO se devuelve `null`: se devuelve el estado de un visitante,
  // con el cupo que tendría si se registrara. La pantalla es la misma.
  if (!user) return await cargarVisita(supabase);

  const [perfilRes, historialRes, usoRes, accesoRes, cuposRes] = await Promise.all([
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
    // Solo responde sobre quien llama (`auth.uid()` por dentro): no revela nada.
    supabase.rpc("tiene_acceso"),
    // Los cupos no son secretos — la pantalla tiene que poder decir "2 de 3".
    supabase
      .from("cupos")
      .select("publico, preguntas_mes, fotos_mes")
      .returns<{ publico: string; preguntas_mes: number; fotos_mes: number }[]>(),
  ]);

  const perfil = perfilRes.data;

  /**
   * Sesión válida pero SIN fila en `profiles` (cuenta creada a mano en el panel de
   * Supabase, o webhook de Hotmart que falló a mitad).
   *
   * ⚠️ POR QUÉ NO DEVOLVEMOS `null` AQUÍ: la pantalla contestaba a `null` con
   * `redirect("/login")` y el middleware, al ver sesión iniciada, la mandaba de vuelta
   * a `/cursos` → bucle infinito de redirecciones (ERR_TOO_MANY_REDIRECTS) sin ningún
   * mensaje. Devolviendo el estado vacío y sin acceso, la pantalla se dibuja y explica
   * que la membresía está en pausa, con salida a soporte.
   */
  if (!perfil) {
    return {
      historial: [],
      uso: { preguntas: 0, fotos: 0 },
      tieneAcceso: false,
      nombre: null,
      sinCuenta: false,
      cupo: CUPO_DE_RESPALDO,
      cupoMiembro: CUPO_DE_RESPALDO,
    };
  }

  /*
    ⚠️ TERCERA COPIA DE LA REGLA DE ACCESO, ELIMINADA (2026-09-15). Aquí estaba
    otra vez escrita a mano —`status === 'active' || past_due || (cancelled &&
    access_until > hoy)`— igual que en `lib/curso.ts`. Eran tres sitios
    respondiendo a la misma pregunta, y desde la 0008 los tres estaban además
    MAL: el acceso ya no lo dice `profiles.status`, lo dicen las concesiones.
    Esta pantalla llevaba desde entonces enseñando "membresía en pausa" a quien
    sí tenía acceso por regalo.

    Ahora se le pregunta a la base. Sin parámetro: solo responde sobre quien
    llama, así que preguntarlo con la sesión de la alumna no revela nada.
  */
  const tieneAcceso = accesoRes.error ? false : accesoRes.data === true;

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

  // El cupo que le toca según tenga o no el programa. Si la tabla no contesta,
  // el de respaldo — nunca se deja a alguien con "ilimitado" por un fallo.
  const filas = cuposRes.data ?? [];
  const aCupo = (p: string, respaldo: Cupo): Cupo => {
    const f = filas.find((c) => c.publico === p);
    return f ? { preguntas: f.preguntas_mes, fotos: f.fotos_mes } : respaldo;
  };

  return {
    historial,
    uso: usoRes.data ?? { preguntas: 0, fotos: 0 },
    tieneAcceso,
    nombre: perfil.nombre,
    sinCuenta: false,
    cupo: aCupo(tieneAcceso ? "miembro" : "regalo", CUPO_DE_RESPALDO),
    cupoMiembro: aCupo("miembro", CUPO_DE_RESPALDO),
  };
});

/**
 * El Ojo Experto tal como lo ve alguien SIN cuenta.
 *
 * Se le enseña el cupo `regalo` —lo que tendría al registrarse— y no un cero:
 * el medidor diciendo "0 de 3" es parte de lo que le explica qué gana.
 */
async function cargarVisita(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
): Promise<EstadoOjoExperto> {
  const { data } = await supabase
    .from("cupos")
    .select("publico, preguntas_mes, fotos_mes")
    .returns<{ publico: string; preguntas_mes: number; fotos_mes: number }[]>();

  const filas = data ?? [];
  const aCupo = (p: string): Cupo => {
    const f = filas.find((c) => c.publico === p);
    return f ? { preguntas: f.preguntas_mes, fotos: f.fotos_mes } : CUPO_DE_RESPALDO;
  };

  return {
    historial: [],
    uso: { preguntas: 0, fotos: 0 },
    tieneAcceso: false,
    nombre: null,
    sinCuenta: true,
    cupo: aCupo("regalo"),
    cupoMiembro: aCupo("miembro"),
  };
}
